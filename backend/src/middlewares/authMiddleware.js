const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const authHeader = String(req.headers.authorization || "").trim();
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized. Missing Bearer token.",
        data: null,
        success: false,
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized. Invalid token.",
        data: null,
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.sub) {
      return res.status(401).json({
        message: "Unauthorized. Invalid token payload.",
        data: null,
        success: false,
      });
    }

    const user = await User.findById(decoded.sub).select("_id fullName email isVerified");
    if (!user || !user.isVerified) {
      return res.status(401).json({
        message: "Unauthorized. User not found.",
        data: null,
        success: false,
      });
    }

    req.user = {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({
      message: "Unauthorized. Token expired or invalid.",
      data: null,
      success: false,
    });
  }
}

module.exports = { protect };
