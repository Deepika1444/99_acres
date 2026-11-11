import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputBase,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { setAuthSession } from "../utils/authStorage";

export default function AuthDialog({
  open,
  onClose,
  width = 465,
  onAuthSuccess,
}) {
  const [step, setStep] = useState("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agentType, setAgentType] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [createPassword, setCreatePassword] = useState("");
  const [confirmCreatePassword, setConfirmCreatePassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmCreatePassword, setShowConfirmCreatePassword] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [agentTypeError, setAgentTypeError] = useState("");
  const [createPasswordError, setCreatePasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [registrationId, setRegistrationId] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpInfoMessage, setOtpInfoMessage] = useState("");
  const otpInputRefs = useRef([]);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const isGmailEmail = (value) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(String(value || "").trim());
  const isTenDigitPhone = (value) => String(value || "").replace(/\D/g, "").length === 10;
  const isStrongPassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(String(value || ""));

  const resetForOpen = () => {
    setStep("default");
    setIsSubmitting(false);
    setGeneralError("");
    setEmailError("");
    setPassword("");
    setShowPassword(false);
    setFullName("");
    setPhoneNumber("");
    setAgentType("");
    setIsTermsAccepted(false);
    setShowTermsError(false);
    setCreatePassword("");
    setConfirmCreatePassword("");
    setShowCreatePassword(false);
    setShowConfirmCreatePassword(false);
    setFullNameError("");
    setPhoneError("");
    setAgentTypeError("");
    setCreatePasswordError("");
    setConfirmPasswordError("");
    setRegistrationId("");
    setOtpDigits(["", "", "", ""]);
    setOtpInfoMessage("");
  };

  useEffect(() => {
    if (open) resetForOpen();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (step !== "loginSuccess" && step !== "accountCreated") return;
    const timer = setTimeout(() => {
      onAuthSuccess?.();
      onClose?.();
    }, 1200);
    return () => clearTimeout(timer);
  }, [open, step, onAuthSuccess, onClose]);

  const callAuthApi = async (path, payload) => {       
    const response = await fetch(`${apiBaseUrl}${path}`, {      //http://localhost:5000/api/auth/register/check-email
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  };

  const requestCreateAccount = async () => {
    const emailValue = String(email || "").trim();
    if (!isGmailEmail(emailValue)) {
      setEmailError("Email must be a valid @gmail.com address");
      return;
    }
    try {
      setIsSubmitting(true);
      setEmailError("");
      setGeneralError("");
      const result = await callAuthApi("/api/auth/register/check-email", { email: emailValue });
      if (!result.ok) {
        setEmailError(result.data?.message || "Unable to validate email.");
        return;
      }
      setStep("createAccount");
    } catch (_error) {
      setEmailError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setGeneralError("Please enter email/username and password.");
      return;
    }
    try {
      setIsSubmitting(true);
      setGeneralError("");
      const result = await callAuthApi("/api/auth/login", {
        identifier: email.trim(),
        password,
      });
      if (!result.ok) {
        setGeneralError(result.data?.message || "Invalid credentials");
        return;
      }
      if (result.data?.data?.token || result.data?.data?.user) {
        setAuthSession({
          token: result.data?.data?.token,
          user: result.data?.data?.user,
        });
        window.dispatchEvent(new Event("auth-changed"));
      }
      setStep("loginSuccess");
    } catch (_error) {
      setGeneralError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    let hasError = false;
    if (!fullName.trim()) {
      setFullNameError("Full name is required");
      hasError = true;
    } else setFullNameError("");

    if (!isTenDigitPhone(phoneNumber)) {
      setPhoneError("Phone number must contain exactly 10 digits");
      hasError = true;
    } else setPhoneError("");

    if (!isStrongPassword(createPassword)) {
      setCreatePasswordError("Use 8+ chars with uppercase, lowercase, number, and special character");
      hasError = true;
    } else setCreatePasswordError("");

    if (!confirmCreatePassword.trim()) {
      setConfirmPasswordError("Confirm password is required");
      hasError = true;
    } else if (createPassword !== confirmCreatePassword) {
      setConfirmPasswordError("Password and confirm password do not match");
      hasError = true;
    } else setConfirmPasswordError("");

    if (!agentType.trim()) {
      setAgentTypeError("Please select Yes or No");
      hasError = true;
    } else setAgentTypeError("");

    if (!isTermsAccepted) {
      setShowTermsError(true);
      hasError = true;
    } else setShowTermsError(false);

    if (hasError) return;

    try {
      setIsSubmitting(true);
      setGeneralError("");
      const result = await callAuthApi("/api/auth/register/request-otp", {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        agentType: agentType.trim(),
        password: createPassword,
        confirmPassword: confirmCreatePassword,
      });
      if (!result.ok) {
        setGeneralError(result.data?.message || "Unable to create account right now.");
        return;
      }
      const nextRegistrationId = String(result.data?.data?.registrationId || "").trim();
      if (!nextRegistrationId) {
        setGeneralError("Registration started but registration ID is missing.");
        return;
      }
      setRegistrationId(nextRegistrationId);
      setOtpInfoMessage(
        result.data?.data?.otpCode
          ? `OTP sent to your email: ${result.data.data.otpCode}`
          : "OTP sent to your email."
      );
      setOtpDigits(["", "", "", ""]);
      setStep("verifyEmailOtp");
    } catch (_error) {
      setGeneralError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digits = String(value || "").replace(/\D/g, "");
    const next = [...otpDigits];
    if (!digits) {
      next[index] = "";
      setOtpDigits(next);
      return;
    }
    const nextDigits = digits.slice(0, otpDigits.length - index).split("");
    nextDigits.forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    setOtpDigits(next);
    const nextFocusIndex = Math.min(index + nextDigits.length, otpDigits.length - 1);
    otpInputRefs.current[nextFocusIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    if (otpDigits.some((digit) => !digit)) return;
    if (!registrationId) {
      setGeneralError("Registration session expired. Please create account again.");
      return;
    }
    try {
      setIsSubmitting(true);
      setGeneralError("");
      const result = await callAuthApi("/api/auth/register/verify-otp", {
        registrationId,
        otp: otpDigits.join(""),
      });
      if (!result.ok) {
        setGeneralError(result.data?.message || "OTP verification failed.");
        return;
      }
      if (result.data?.data?.token || result.data?.data?.user) {
        setAuthSession({
          token: result.data?.data?.token,
          user: result.data?.data?.user,
        });
        window.dispatchEvent(new Event("auth-changed"));
      }
      setStep("accountCreated");
    } catch (_error) {
      setGeneralError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          width,
          maxWidth: "calc(100% - 32px)",
        },
      }}
    >
      {step === "default" && (
        <DialogContent sx={{ px: 2.4, pt: 1.8, pb: 2.1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 17.5, fontWeight: 800, color: "#102747" }}>Login / Register</Typography>
            <IconButton onClick={onClose} sx={{ color: "#3a4f6e", mr: -0.6 }}>
              <CloseRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>

          <Typography sx={{ mt: -0.2, fontSize: 14, color: "#5c6f89" }}>Please enter your Email ID</Typography>
          <Typography sx={{ mt: 2.3, fontSize: 15, color: "#4d607b", fontWeight: 700 }}>Email ID</Typography>
          <InputBase
            fullWidth
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) setEmailError("");
            }}
            placeholder="Enter your email id"
            sx={{
              mt: 0.7,
              height: 42,
              border: "1px solid #c7d2e0",
              borderRadius: "2px",
              px: 1.2,
              fontSize: 14,
              color: "#102747",
            }}
          />
          {emailError && (
            <Typography sx={{ mt: 0.7, color: "#d3313f", fontSize: 12.5 }}>{emailError}</Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={requestCreateAccount}
            disabled={!String(email || "").trim() || isSubmitting}
            sx={{
              mt: 11.2,
              height: 42,
              textTransform: "none",
              fontSize: 15,
              fontWeight: 700,
              bgcolor: String(email || "").trim() ? "#63a5df" : "#8cb9e1",
              boxShadow: "none",
            }}
          >
            Continue
          </Button>

          <Typography sx={{ mt: 1.4, fontSize: 15, color: "#5c6f89", textAlign: "center" }}>Or</Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setStep("password")}
            sx={{
              mt: 1.2,
              height: 42,
              borderColor: "#b9c6d7",
              color: "#2f4667",
              textTransform: "none",
              fontSize: 15,
              fontWeight: 700,
              borderRadius: "2px",
            }}
          >
            Already have an account? Click here
          </Button>
          <Typography sx={{ mt: 1.25, fontSize: 12.5, color: "#6d7f98" }}>
            By clicking you agree to Terms and Conditions
          </Typography>
        </DialogContent>
      )}

      {step === "password" && (
        <DialogContent sx={{ px: 2.4, pt: 1.8, pb: 2.1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <IconButton onClick={() => setStep("default")} sx={{ color: "#374d6f", ml: -1 }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
            <IconButton onClick={onClose} sx={{ color: "#3a4f6e", mr: -0.6 }}>
              <CloseRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
          <Typography sx={{ fontSize: 17.5, fontWeight: 800, color: "#102747" }}>Welcome Back</Typography>
          <InputBase
            fullWidth
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email or Username"
            sx={{ mt: 1.2, height: 42, border: "1px solid #c7d2e0", borderRadius: "2px", px: 1.2 }}
          />
          <Box sx={{ mt: 1.1, height: 42, border: "1px solid #c7d2e0", borderRadius: "2px", px: 1.1, display: "flex", alignItems: "center" }}>
            <InputBase
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              fullWidth
            />
            <IconButton onClick={() => setShowPassword((prev) => !prev)} sx={{ p: 0.2, color: "#94a2b6" }}>
              {showPassword ? <VisibilityOutlinedIcon sx={{ fontSize: 20 }} /> : <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>
          {generalError && (
            <Box sx={{ mt: 0.7, display: "flex", alignItems: "center", gap: 0.5 }}>
              <ErrorRoundedIcon sx={{ color: "#d3313f", fontSize: 14 }} />
              <Typography sx={{ color: "#d3313f", fontSize: 12.5 }}>{generalError}</Typography>
            </Box>
          )}
          <Button fullWidth variant="contained" onClick={handleLogin} disabled={isSubmitting} sx={{ mt: 2, height: 42, textTransform: "none", fontWeight: 700, bgcolor: "#0f7ad7", boxShadow: "none" }}>
            {isSubmitting ? "Please wait..." : "Continue"}
          </Button>
        </DialogContent>
      )}

      {step === "createAccount" && (
        <DialogContent sx={{ px: 2.4, pt: 1.8, pb: 2.1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <IconButton onClick={() => setStep("default")} sx={{ color: "#374d6f", ml: -1 }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
            <IconButton onClick={onClose} sx={{ color: "#3a4f6e", mr: -0.6 }}>
              <CloseRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
          <Typography sx={{ fontSize: 17.5, fontWeight: 800, color: "#102747" }}>Create Account</Typography>

          <InputBase fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" sx={{ mt: 1.2, height: 42, border: "1px solid #c7d2e0", borderRadius: "2px", px: 1.2 }} />
          <InputBase fullWidth value={email} readOnly sx={{ mt: 1.0, height: 42, border: "1px solid #d3d9e4", borderRadius: "2px", px: 1.2, bgcolor: "#eef2f7" }} />
          <InputBase fullWidth value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Phone Number" sx={{ mt: 1.0, height: 42, border: "1px solid #c7d2e0", borderRadius: "2px", px: 1.2 }} />

          <Box sx={{ mt: 1.0, height: 42, border: "1px solid #c7d2e0", borderRadius: "2px", px: 1.1, display: "flex", alignItems: "center" }}>
            <InputBase type={showCreatePassword ? "text" : "password"} value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="Password" fullWidth />
            <IconButton onClick={() => setShowCreatePassword((prev) => !prev)} sx={{ p: 0.2, color: "#94a2b6" }}>
              {showCreatePassword ? <VisibilityOutlinedIcon sx={{ fontSize: 20 }} /> : <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>
          <Box sx={{ mt: 1.0, height: 42, border: "1px solid #c7d2e0", borderRadius: "2px", px: 1.1, display: "flex", alignItems: "center" }}>
            <InputBase type={showConfirmCreatePassword ? "text" : "password"} value={confirmCreatePassword} onChange={(e) => setConfirmCreatePassword(e.target.value)} placeholder="Confirm Password" fullWidth />
            <IconButton onClick={() => setShowConfirmCreatePassword((prev) => !prev)} sx={{ p: 0.2, color: "#94a2b6" }}>
              {showConfirmCreatePassword ? <VisibilityOutlinedIcon sx={{ fontSize: 20 }} /> : <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>

          <Typography sx={{ mt: 1.4, color: "#132643", fontWeight: 700, fontSize: 14.5 }}>Are you a Real Estate Agent?</Typography>
          <Box sx={{ mt: 0.8, display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={() => setAgentType("yes")} sx={{ minWidth: 72, borderColor: agentType === "yes" ? "#0f7ad7" : "#d3d9e4", textTransform: "none" }}>Yes</Button>
            <Button variant="outlined" onClick={() => setAgentType("no")} sx={{ minWidth: 72, borderColor: agentType === "no" ? "#0f7ad7" : "#d3d9e4", textTransform: "none" }}>No</Button>
          </Box>
          <Box sx={{ mt: 1.2, display: "flex", alignItems: "center", gap: 0.8 }}>
            <Box component="input" type="checkbox" checked={isTermsAccepted} onChange={(e) => setIsTermsAccepted(e.target.checked)} sx={{ width: 14, height: 14, m: 0 }} />
            <Typography sx={{ fontSize: 11, color: "#5d6f88" }}>I agree to Terms & Conditions and Privacy Policy</Typography>
          </Box>

          {(generalError || fullNameError || phoneError || agentTypeError || createPasswordError || confirmPasswordError || showTermsError) && (
            <Typography sx={{ mt: 0.8, color: "#d3313f", fontSize: 12 }}>
              {generalError || fullNameError || phoneError || agentTypeError || createPasswordError || confirmPasswordError || (showTermsError ? "This is required for creating an account" : "")}
            </Typography>
          )}

          <Button fullWidth variant="contained" onClick={handleCreateAccount} disabled={isSubmitting} sx={{ mt: 1.5, height: 42, textTransform: "none", fontWeight: 700, bgcolor: "#0f7ad7", boxShadow: "none" }}>
            {isSubmitting ? "Please wait..." : "Create Account"}
          </Button>
        </DialogContent>
      )}

      {step === "verifyEmailOtp" && (
        <DialogContent sx={{ px: 2.4, pt: 1.8, pb: 2.1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <IconButton onClick={() => setStep("createAccount")} sx={{ color: "#374d6f", ml: -1 }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
            <IconButton onClick={onClose} sx={{ color: "#3a4f6e", mr: -0.6 }}>
              <CloseRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
          <Typography sx={{ fontSize: 17.5, fontWeight: 800, color: "#102747" }}>Verify your email</Typography>
          <Typography sx={{ mt: 0.6, color: "#5d708a", fontSize: 12 }}>{otpInfoMessage || "OTP sent to your email."}</Typography>
          <Typography sx={{ mt: 1.8, color: "#1f3558", fontSize: 14.5, fontWeight: 700 }}>Enter your 4 digit OTP</Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 1.1 }}>
            {otpDigits.map((digit, index) => (
              <InputBase
                key={`otp-${index}`}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                inputRef={(element) => {
                  otpInputRefs.current[index] = element;
                }}
                inputProps={{ maxLength: 1, inputMode: "numeric" }}
                sx={{
                  width: 44,
                  height: 44,
                  border: "1px solid #d3d9e4",
                  borderRadius: "2px",
                  "& .MuiInputBase-input": { textAlign: "center", p: 0, fontSize: 19 },
                }}
              />
            ))}
          </Box>
          {generalError && (
            <Typography sx={{ mt: 0.8, color: "#d3313f", fontSize: 12 }}>{generalError}</Typography>
          )}
          <Button fullWidth variant="contained" onClick={handleVerifyOtp} disabled={isSubmitting || otpDigits.some((d) => !d)} sx={{ mt: 1.8, height: 42, textTransform: "none", fontWeight: 700, bgcolor: "#0f7ad7", boxShadow: "none" }}>
            {isSubmitting ? "Please wait..." : "Verify & Continue"}
          </Button>
        </DialogContent>
      )}

      {(step === "accountCreated" || step === "loginSuccess") && (
        <DialogContent sx={{ px: 2.4, pt: 2.4, pb: 2.4, minHeight: 170 }}>
          <Box sx={{ mt: 1.2, border: "1px solid #b7e7c6", bgcolor: "#f3fff7", borderRadius: "10px", minHeight: 88, px: 1.7, py: 1.5, display: "flex", alignItems: "center", gap: 1.1 }}>
            <CheckCircleRoundedIcon sx={{ color: "#1ea74c", fontSize: 29 }} />
            <Box>
              <Typography sx={{ color: "#1f2f49", fontSize: 17, fontWeight: 700 }}>
                {step === "accountCreated" ? "Account created successfully" : "Login successful"}
              </Typography>
              <Typography sx={{ color: "#476285", fontSize: 12.5, mt: 0.1 }}>
                You can now continue posting your property.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      )}
    </Dialog>
  );
}
