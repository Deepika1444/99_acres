const authService = require("../services/authService");

function sendStandardResponse(res, result) {
  const status = Number(result?.status) || 500;
  const body = result?.body && typeof result.body === "object" ? result.body : {};
  const success = status >= 200 && status < 300;
  const message = body.message || (success ? "Success" : "Request failed");

  const { message: _ignoredMessage, ...rest } = body;
  const hasData = Object.keys(rest).length > 0;

  return res.status(status).json({
    message,
    data: hasData ? rest : null,
    success,
  });
}

async function checkEmail(req, res) {
  try {
    const result = await authService.checkEmail(req.body || {});
    return sendStandardResponse(res, result);
  } catch (_error) {
    return res.status(500).json({
      message: "Internal server error",
      data: null,
      success: false,
    });
  }
}

async function requestRegisterOtp(req, res) {
  try {
    const result = await authService.requestRegisterOtp(req.body || {});
    return sendStandardResponse(res, result);
  } catch (_error) {
    return res.status(500).json({
      message: "Internal server error",
      data: null,
      success: false,
    });
  }
}

async function verifyRegisterOtp(req, res) {
  try {
    const result = await authService.verifyRegisterOtp(req.body || {});
    return sendStandardResponse(res, result);
  } catch (_error) {
    return res.status(500).json({
      message: "Internal server error",
      data: null,
      success: false,
    });
  }
}

async function requestRegisterEmailLink(req, res) {
  try {
    const result = await authService.requestRegisterEmailLink(req.body || {});
    return sendStandardResponse(res, result);
  } catch (_error) {
    return res.status(500).json({
      message: "Internal server error",
      data: null,
      success: false,
    });
  }
}

async function verifyRegisterEmailLink(req, res) {
  try {
    const result = await authService.verifyRegisterEmailLink(req.body || {});
    return sendStandardResponse(res, result);
  } catch (_error) {
    return res.status(500).json({
      message: "Internal server error",
      data: null,
      success: false,
    });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body || {});
    return sendStandardResponse(res, result);
  } catch (_error) {
    return res.status(500).json({
      message: "Internal server error",
      data: null,
      success: false,
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const result = await authService.forgotPassword(req.body || {});
    return sendStandardResponse(res, result);
  } catch (_error) {
    return res.status(500).json({
      message: "Internal server error",
      data: null,
      success: false,
    });
  }
}

async function resetPassword(req, res) {
  try {
    const result = await authService.resetPassword(req.body || {});
    return sendStandardResponse(res, result);
  } catch (_error) {
    return res.status(500).json({
      message: "Internal server error",
      data: null,
      success: false,
    });
  }
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
