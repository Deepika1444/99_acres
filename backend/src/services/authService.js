const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const User = require("../models/User");
const {
  sendOtpEmail,
  sendForgotPasswordEmail,
  sendRegisterVerificationLinkEmail,
} = require("../utils/emailSender");
const {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  sanitizePhone,
  isStrongPassword,
} = require("../utils/validators");

const otpExpiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const otpDebug = String(process.env.OTP_DEBUG || "true").toLowerCase() === "true";

function buildUserResponse(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    agentType: user.agentType,
    username: user.username || null,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

function createOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function createAuthToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function extractToken(rawValue) {
  const input = String(rawValue || "").trim();
  if (!input) return "";

  // Accept plain JWT token directly.
  if (!input.includes("token=") && !input.startsWith("http://") && !input.startsWith("https://")) {
    return input;
  }

  // Accept payload like "token=eyJ..."
  if (input.startsWith("token=")) {
    return decodeURIComponent(input.slice("token=".length)).trim();
  }

  // Accept full URL like ".../reset-password?token=eyJ..."
  try {
    const parsedUrl = new URL(input);
    const queryToken = parsedUrl.searchParams.get("token");
    return decodeURIComponent(String(queryToken || "")).trim();
  } catch (_error) {
    return input;
  }
}

function extractResetToken(rawValue) {
  return extractToken(rawValue);
}

function extractRegisterVerifyToken(rawValue) {
  return extractToken(rawValue);
}

async function completeRegistration(user) {
  if (!user.username) {
    user.username = await generateUniqueUsername(user.fullName || user.email);
  }

  user.isVerified = true;
  user.otpCode = null;
  user.otpExpiresAt = null;
  user.registrationId = null;
  await user.save();

  return user;
}

async function generateUniqueUsername(seedValue) {
  const cleanedSeed = String(seedValue || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const base = cleanedSeed || "user";
  let candidate = base;
  let counter = 0;

  while (true) {
    const exists = await User.findOne({ username: candidate }).lean();
    if (!exists) {
      return candidate;
    }

    counter += 1;
    candidate = `${base}${counter}`;
  }
}

async function checkEmail(payload) {
  const email = normalizeEmail(payload.email);

  if (!isValidEmail(email)) {
    return { status: 400, body: { message: "Email must be a valid @gmail.com address" } };
  }

  const existingUser = await User.findOne({ email, isVerified: true }).lean();
  if (existingUser) {
    return { status: 409, body: { message: "An account already exists for this email" } };
  }

  return {
    status: 200,
    body: {
      message: "Email is available. Continue with account details.",
      email,
    },
  };
}

async function requestRegisterOtp(payload) {
  const fullName = String(payload.fullName || "").trim();
  const email = normalizeEmail(payload.email);
  const phoneNumber = sanitizePhone(payload.phoneNumber);
  const agentType = String(payload.agentType || "").trim().toLowerCase();
  const password = String(payload.password || "").trim();
  const confirmPassword = String(payload.confirmPassword || "").trim();

  if (!fullName) {
    return { status: 400, body: { message: "fullName is required" } };
  }

  if (!isValidEmail(email)) {
    return { status: 400, body: { message: "Email must be a valid @gmail.com address" } };
  }

  if (!isValidPhone(phoneNumber)) {
    return { status: 400, body: { message: "phoneNumber must contain exactly 10 digits" } };
  }

  if (!["yes", "no"].includes(agentType)) {
    return { status: 400, body: { message: "agentType must be 'yes' or 'no'" } };
  }

  if (!password || !confirmPassword) {
    return { status: 400, body: { message: "password and confirmPassword are required" } };
  }

  if (password !== confirmPassword) {
    return { status: 400, body: { message: "Password and confirm password do not match" } };
  }

  if (!isStrongPassword(password)) {
    return {
      status: 400,
      body: {
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      },
    };
  }

  const existingVerifiedUser = await User.findOne({ email, isVerified: true }).lean();
  if (existingVerifiedUser) {
    return { status: 409, body: { message: "An account already exists for this email" } };
  }

  const otpCode = createOtp();
  const registrationId = randomUUID();
  const expiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
  const passwordHash = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        fullName,
        email,
        phoneNumber,
        agentType,
        passwordHash,
        registrationId,
        otpCode,
        otpExpiresAt: expiresAt,
        isVerified: false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const mailResult = await sendOtpEmail({
    to: email,
    otpCode,
    expiryMinutes: otpExpiryMinutes,
    fullName,
  });
  if (!mailResult.ok && !otpDebug) {
    return {
      status: 500,
      body: { message: `Failed to send OTP email: ${mailResult.reason}` },
    };
  }

  const responseBody = {
    message: mailResult.ok
      ? "OTP sent successfully. Please check your email."
      : "OTP generated (email send skipped in debug mode)",
    registrationId,
    expiresAt: expiresAt.toISOString(),
  };

  if (otpDebug && !mailResult.ok) {
    responseBody.otpCode = otpCode;
    responseBody.emailWarning = mailResult.reason;
  }

  return {
    status: 200,
    body: responseBody,
  };
}

async function verifyRegisterOtp(payload) {
  const registrationId = String(payload.registrationId || "").trim();
  const otp = String(payload.otp || "").trim();

  if (!registrationId || !otp) {
    return { status: 400, body: { message: "registrationId and otp are required" } };
  }

  const user = await User.findOne({ registrationId, isVerified: false });
  if (!user) {
    return { status: 400, body: { message: "Invalid registrationId" } };
  }

  if (!user.otpExpiresAt || Date.now() > user.otpExpiresAt.getTime()) {
    return { status: 400, body: { message: "OTP expired. Please request a new OTP." } };
  }

  if (user.otpCode !== otp) {
    return { status: 400, body: { message: "OTP is not correct, please try again" } };
  }

  await completeRegistration(user);

  return {
    status: 200,
    body: {
      message: "Account created successfully",
      token: createAuthToken(user),
      user: buildUserResponse(user),
    },
  };
}

async function requestRegisterEmailLink(payload) {
  const registrationId = String(payload.registrationId || "").trim();
  const email = normalizeEmail(payload.email);
  if (!registrationId) {
    return { status: 400, body: { message: "registrationId is required" } };
  }

  const user = await User.findOne({ registrationId, isVerified: false });
  if (!user) {
    return { status: 400, body: { message: "Invalid registration session. Please create account again." } };
  }

  if (email && user.email !== email) {
    return { status: 400, body: { message: "Email does not match the current registration session." } };
  }

  const token = jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      type: "register_email_verify",
      rid: user.registrationId,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REGISTER_VERIFY_LINK_EXPIRES_IN || "30m" }
  );

  const baseUrl = String(process.env.FRONTEND_BASE_URL || "http://localhost:5173").replace(/\/+$/, "");
  const verifyUrl = `${baseUrl}/?verifyEmailToken=${encodeURIComponent(token)}`;

  const mailResult = await sendRegisterVerificationLinkEmail({
    to: user.email,
    fullName: user.fullName,
    verifyUrl,
  });

  if (!mailResult.ok) {
    return {
      status: 500,
      body: { message: `Failed to send verification link email: ${mailResult.reason}` },
    };
  }

  return {
    status: 200,
    body: { message: "Verification link sent to your email." },
  };
}

async function verifyRegisterEmailLink(payload) {
  const token = extractRegisterVerifyToken(payload.token);
  if (!token) {
    return { status: 400, body: { message: "token is required" } };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return { status: 400, body: { message: "Verification link is invalid or expired" } };
  }

  if (decoded.type !== "register_email_verify" || !decoded.sub) {
    return { status: 400, body: { message: "Verification link is invalid or expired" } };
  }

  const user = await User.findOne({ _id: decoded.sub, email: decoded.email });
  if (!user) {
    return { status: 404, body: { message: "Registration not found" } };
  }

  if (user.isVerified) {
    return {
      status: 200,
      body: { message: "Account already verified", user: buildUserResponse(user) },
    };
  }

  if (!user.registrationId || String(user.registrationId) !== String(decoded.rid || "")) {
    return { status: 400, body: { message: "Verification link is invalid or expired" } };
  }

  await completeRegistration(user);

  return {
    status: 200,
    body: {
      message: "Account created successfully",
      token: createAuthToken(user),
      user: buildUserResponse(user),
    },
  };
}

async function login(payload) {
  const identifier = String(
    payload.identifier || payload.email || payload.emailId || payload.username || ""
  ).trim();
  const password = String(payload.password || "");

  if (!identifier || !password) {
    return { status: 400, body: { message: "identifier and password are required" } };
  }

  const query = isValidEmail(identifier)
    ? { email: normalizeEmail(identifier), isVerified: true }
    : { username: normalizeUsername(identifier), isVerified: true };

  let user = await User.findOne(query);
  if (!user && !isValidEmail(identifier)) {
    user = await User.findOne({
      fullName: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      isVerified: true,
    });
  }
  if (!user) {
    return { status: 404, body: { message: "Email or username is not matched" } };
  }

  if (!user.passwordHash) {
    return {
      status: 400,
      body: {
        message: "Password not found for this account. Please complete registration again.",
      },
    };
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return { status: 401, body: { message: "Password is not correct, please try again" } };
  }

  return {
    status: 200,
    body: {
      message: "Login successful",
      token: createAuthToken(user),
      user: buildUserResponse(user),
    },
  };
}

async function forgotPassword(payload) {
  const identifier = String(payload.identifier || payload.email || payload.username || "").trim();
  if (!identifier) {
    return { status: 400, body: { message: "Email or username is required" } };
  }

  const query = isValidEmail(identifier)
    ? { email: normalizeEmail(identifier), isVerified: true }
    : { username: normalizeUsername(identifier), isVerified: true };

  let user = await User.findOne(query);
  if (!user && !isValidEmail(identifier)) {
    user = await User.findOne({
      fullName: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      isVerified: true,
    });
  }

  if (!user) {
    return {
      status: 200,
      body: { message: "If this account exists, a password reset link will be sent to your email." },
    };
  }

  const token = jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      type: "password_reset",
      rtv: Number(user.resetTokenVersion || 0),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.RESET_TOKEN_EXPIRES_IN || "72h" }
  );

  const baseUrl = String(process.env.FRONTEND_BASE_URL || "http://localhost:5173").replace(/\/+$/, "");
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const mailResult = await sendForgotPasswordEmail({
    to: user.email,
    fullName: user.fullName,
    resetUrl,
  });

  if (!mailResult.ok) {
    return {
      status: 500,
      body: { message: `Failed to send reset email: ${mailResult.reason}` },
    };
  }

  return {
    status: 200,
    body: { message: "If this account exists, a password reset link will be sent to your email." },
  };
}

async function resetPassword(payload) {
  const token = extractResetToken(payload.token);
  const newPassword = String(payload.newPassword || "").trim();
  const confirmPassword = String(payload.confirmPassword || "").trim();

  if (!token || !newPassword || !confirmPassword) {
    return { status: 400, body: { message: "token, newPassword and confirmPassword are required" } };
  }

  if (newPassword !== confirmPassword) {
    return { status: 400, body: { message: "New password and confirm password do not match" } };
  }

  if (!isStrongPassword(newPassword)) {
    return {
      status: 400,
      body: {
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      },
    };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return { status: 400, body: { message: "Reset link is invalid or expired" } };
  }

  if (decoded.type !== "password_reset" || !decoded.sub) {
    return { status: 400, body: { message: "Reset link is invalid or expired" } };
  }

  const user = await User.findOne({ _id: decoded.sub, email: decoded.email, isVerified: true });
  if (!user) {
    return { status: 404, body: { message: "Account not found" } };
  }

  if (Number(decoded.rtv) !== Number(user.resetTokenVersion || 0)) {
    return { status: 400, body: { message: "Reset link is invalid or expired" } };
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetTokenVersion = Number(user.resetTokenVersion || 0) + 1;
  await user.save();

  return {
    status: 200,
    body: { message: "Password reset successful. Please login with your new password." },
  };
}

module.exports = {
  checkEmail,
  requestRegisterOtp,
  verifyRegisterOtp,
  requestRegisterEmailLink,
  verifyRegisterEmailLink,
  login,
  forgotPassword,
  resetPassword,
};
