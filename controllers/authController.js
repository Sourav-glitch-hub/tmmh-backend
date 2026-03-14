// ============================================================
// controllers/authController.js
// Handles user registration (admin seeding) and login
// ============================================================

const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// ─── Helper: Generate JWT token ─────────────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role }, // Payload
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ─── Helper: Send consistent auth response ──────────────────────────────────
const sendAuthResponse = (res, statusCode, user) => {
  const token = generateToken(user._id, user.role);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

// ============================================================
// @desc    Admin Login
// @route   POST /api/auth/login
// @access  Public
// ============================================================
const login = async (req, res, next) => {
  try {
    // ── Validate input ───────────────────────────────────────────────────
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // ── Find user by email (include password for comparison) ─────────────
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Compare password ─────────────────────────────────────────────────
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Respond with token ───────────────────────────────────────────────
    sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Register a new user (admin creates customer accounts, or admin seeds)
// @route   POST /api/auth/register
// @access  Private (admin only) — or Public for initial seed
// ============================================================
const register = async (req, res, next) => {
  try {
    // ── Validate input ───────────────────────────────────────────────────
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, password, role } = req.body;

    // ── Check for duplicate email ─────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ── Create user (password hashed in pre-save hook) ────────────────────
    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    sendAuthResponse(res, 201, user);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Get currently authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
// ============================================================
const getMe = async (req, res, next) => {
  try {
    // req.user is already set by the protect middleware (no password)
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getMe };