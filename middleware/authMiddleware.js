// ============================================================
// middleware/authMiddleware.js
// JWT authentication middleware — protects private routes
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifies the JWT token from the Authorization header.
 * Attaches the authenticated user object to req.user.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  // ── 1. Extract token from Authorization header ──────────────────────────
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  // ── 2. Verify token signature and expiry ────────────────────────────────
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
    });
  }

  // ── 3. Fetch user from DB (ensures user still exists / not deleted) ─────
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User belonging to this token no longer exists.",
    });
  }

  // ── 4. Attach user to request for downstream use ────────────────────────
  req.user = user;
  next();
};

module.exports = { protect };