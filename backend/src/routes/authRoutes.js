const express = require("express");
const {
  checkEmail,
  requestRegisterOtp,
  verifyRegisterOtp,
  requestRegisterEmailLink,
  verifyRegisterEmailLink,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register/check-email", checkEmail);
router.post("/register/request-otp", requestRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);
router.post("/register/request-email-link", requestRegisterEmailLink);
router.post("/register/verify-email-link", verifyRegisterEmailLink);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
