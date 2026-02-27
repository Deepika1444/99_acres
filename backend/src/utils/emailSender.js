const nodemailer = require("nodemailer");

function parseSecureFlag(value) {
  return String(value || "true").toLowerCase() === "true";
}

function normalizeEnvValue(value) {
  return String(value || "").trim();
}

function normalizeSmtpPassword(value) {
  return normalizeEnvValue(value).replace(/\s+/g, "");
}

function getTransportConfig() {
  return {
    host: normalizeEnvValue(process.env.SMTP_HOST),
    port: Number(process.env.SMTP_PORT || 465),
    secure: parseSecureFlag(process.env.SMTP_SECURE),
    auth: {
      user: normalizeEnvValue(process.env.SMTP_USER),
      pass: normalizeSmtpPassword(process.env.SMTP_PASS),
    },
  };
}

function isSmtpConfigured() {
  return Boolean(
    normalizeEnvValue(process.env.SMTP_HOST) &&
      normalizeEnvValue(process.env.SMTP_PORT) &&
      normalizeEnvValue(process.env.SMTP_USER) &&
      normalizeSmtpPassword(process.env.SMTP_PASS) &&
      normalizeEnvValue(process.env.SMTP_FROM)
  );
}

async function sendOtpEmail({ to, otpCode, expiryMinutes, fullName }) {
  if (!isSmtpConfigured()) {
    return { ok: false, reason: "SMTP is not configured" };
  }

  try {
    const transporter = nodemailer.createTransport(getTransportConfig());
    const projectName = "99acres";
    const supportEmail = normalizeEnvValue(process.env.SMTP_FROM) || "support@finalproject-realestate.com";
    const safeName = normalizeEnvValue(fullName) || "Customer";

    await transporter.sendMail({
      from: normalizeEnvValue(process.env.SMTP_FROM),
      to,
      subject: "Email Verification Code",
      text:
        `Dear ${safeName},\n\n` +
        `Thank you for registering with ${projectName}.\n\n` +
        `Please use the One-Time Password (OTP) below to complete your verification process:\n\n` +
        `${otpCode}\n\n` +
        `This code is valid for ${expiryMinutes} minutes.\n\n` +
        `For security reasons, please do not share this code with anyone.\n` +
        `If you did not initiate this request, please contact our support team immediately.\n\n` +
        `Sincerely,\n` +
        `${projectName}\n` +
        `Customer Support Team\n` +
        `${supportEmail}`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.5;">` +
        `<p style="margin:0 0 12px;">Dear ${safeName},</p>` +
        `<p style="margin:0 0 12px;">Thank you for registering with <b>${projectName}</b>.</p>` +
        `<p style="margin:0 0 14px;">Please use the One-Time Password (OTP) below to complete your verification process:</p>` +
        `<div style="font-size:32px;font-weight:700;letter-spacing:6px;background:#f3f4f6;padding:10px 14px;display:inline-block;border-radius:6px;">${otpCode}</div>` +
        `<p style="margin:14px 0 0;">This code is valid for <b>${expiryMinutes} minutes</b>.</p>` +
        `<p style="margin:14px 0 0;">For security reasons, please do not share this code with anyone.<br/>If you did not initiate this request, please contact our support team immediately.</p>` +
        `<p style="margin:18px 0 0;">Sincerely,<br/><b>${projectName}</b><br/>Customer Support Team<br/>${supportEmail}</p>` +
        `</div>`,
    });

    return { ok: true };
  } catch (error) {
    if (String(error && error.message).includes("BadCredentials")) {
      return {
        ok: false,
        reason: "SMTP auth failed. Use Gmail App Password (16 chars) in SMTP_PASS and keep SMTP_USER/SMTP_FROM same.",
      };
    }

    return { ok: false, reason: error.message };
  }
}

async function sendForgotPasswordEmail({ to, fullName, resetUrl }) {
  if (!isSmtpConfigured()) {
    return { ok: false, reason: "SMTP is not configured" };
  }

  try {
    const transporter = nodemailer.createTransport(getTransportConfig());
    const projectName = "99acres";
    const supportEmail = normalizeEnvValue(process.env.SMTP_FROM) || "feedback@99acres.com";
    const safeName = normalizeEnvValue(fullName) || "Customer";

    await transporter.sendMail({
      from: normalizeEnvValue(process.env.SMTP_FROM),
      to,
      subject: "Create a New Password",
      text:
        `Dear ${safeName},\n\n` +
        `Click on the link below to create a new password for your ${projectName}.com account.\n\n` +
        `${resetUrl}\n\n` +
        `The link is valid for a one-time use. It will expire after 72 hours.\n\n` +
        `Thanks and Regards,\n${projectName}.com Team\n${supportEmail}`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.5;">` +
        `<p style="margin:0 0 12px;">Dear ${safeName},</p>` +
        `<div style="border:1px solid #d7dde6;background:#fafafa;border-radius:6px;padding:16px;">` +
        `<p style="margin:0 0 14px;">Click on the button below to create a new password for your ${projectName}.com account.</p>` +
        `<a href="${resetUrl}" style="display:inline-block;background:#f5c842;color:#232323;padding:9px 14px;text-decoration:none;border-radius:3px;font-weight:700;">Create a New Password</a>` +
        `<p style="margin:14px 0 0;color:#4e5f75;">The link is valid for a one-time use. It will expire after 72 hours.</p>` +
        `<p style="margin:12px 0 0;color:#4e5f75;">If clicking the link doesn't work, copy this URL into your browser:</p>` +
        `<p style="margin:6px 0 0;word-break:break-all;"><a href="${resetUrl}">${resetUrl}</a></p>` +
        `</div>` +
        `<p style="margin:14px 0 0;color:#4e5f75;">Thanks and Regards<br/>${projectName}.com Team</p>` +
        `</div>`,
    });

    return { ok: true };
  } catch (error) {
    if (String(error && error.message).includes("BadCredentials")) {
      return {
        ok: false,
        reason: "SMTP auth failed. Use Gmail App Password (16 chars) in SMTP_PASS and keep SMTP_USER/SMTP_FROM same.",
      };
    }

    return { ok: false, reason: error.message };
  }
}

async function sendRegisterVerificationLinkEmail({ to, fullName, verifyUrl }) {
  if (!isSmtpConfigured()) {
    return { ok: false, reason: "SMTP is not configured" };
  }

  try {
    const transporter = nodemailer.createTransport(getTransportConfig());
    const projectName = "99acres";
    const supportEmail = normalizeEnvValue(process.env.SMTP_FROM) || "feedback@99acres.com";
    const safeName = normalizeEnvValue(fullName) || "Customer";

    await transporter.sendMail({
      from: normalizeEnvValue(process.env.SMTP_FROM),
      to,
      subject: "Verify your email address",
      text:
        `Dear ${safeName},\n\n` +
        `Click on the link below to verify your ${projectName} account:\n\n` +
        `${verifyUrl}\n\n` +
        `If you did not request this, please ignore this email.\n\n` +
        `Thanks and Regards,\n${projectName}.com Team\n${supportEmail}`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.5;">` +
        `<p style="margin:0 0 12px;">Dear ${safeName},</p>` +
        `<div style="border:1px solid #d7dde6;background:#fafafa;border-radius:6px;padding:16px;">` +
        `<p style="margin:0 0 14px;">Click on the button below to verify your ${projectName}.com account.</p>` +
        `<a href="${verifyUrl}" style="display:inline-block;background:#0f74cf;color:#ffffff;padding:9px 14px;text-decoration:none;border-radius:3px;font-weight:700;">Verify Email</a>` +
        `<p style="margin:12px 0 0;color:#4e5f75;">If clicking the button doesn't work, copy this URL into your browser:</p>` +
        `<p style="margin:6px 0 0;word-break:break-all;"><a href="${verifyUrl}">${verifyUrl}</a></p>` +
        `</div>` +
        `<p style="margin:14px 0 0;color:#4e5f75;">Thanks and Regards<br/>${projectName}.com Team</p>` +
        `</div>`,
    });

    return { ok: true };
  } catch (error) {
    if (String(error && error.message).includes("BadCredentials")) {
      return {
        ok: false,
        reason: "SMTP auth failed. Use Gmail App Password (16 chars) in SMTP_PASS and keep SMTP_USER/SMTP_FROM same.",
      };
    }

    return { ok: false, reason: error.message };
  }
}

module.exports = {
  sendOtpEmail,
  sendForgotPasswordEmail,
  sendRegisterVerificationLinkEmail,
  isSmtpConfigured,
};
