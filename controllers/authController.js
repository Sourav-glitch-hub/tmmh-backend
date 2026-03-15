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
    { id: userId, role },
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    sendAuthResponse(res, 200, user);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private (admin only)
// ============================================================
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({ name, email, password, role: role || "customer" });
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
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Change password (and optionally name/email)
// @route   PUT /api/auth/profile
// @access  Private
// ============================================================
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Fetch user with password for verification
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    // ── Update name if provided ───────────────────────────────────────────
    if (name && name.trim()) user.name = name.trim();

    // ── Update email if provided ──────────────────────────────────────────
    if (email && email.trim()) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (emailExists) {
        return res.status(409).json({ success: false, message: "Email already in use." });
      }
      user.email = email.toLowerCase().trim();
    }

    // ── Update password if provided ───────────────────────────────────────
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password.",
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      user.password = newPassword; // pre-save hook hashes it automatically
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getMe, updateProfile };
