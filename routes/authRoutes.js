// ============================================================
// routes/authRoutes.js
// Authentication routes: login, register, profile
// ============================================================

const express = require("express");
const { body } = require("express-validator");
const { login, register, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// ─── Validation Rules ────────────────────────────────────────────────────────

const loginValidation = [
  body("email")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

const registerValidation = [
  body("name")
    .trim().notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters."),
  body("email")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number."),
  body("role")
    .optional()
    .isIn(["admin", "customer"]).withMessage("Role must be 'admin' or 'customer'."),
];

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters."),
  body("email")
    .optional()
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("newPassword")
    .optional()
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and a number."),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/auth/login  →  Public
router.post("/login", loginValidation, login);

// POST /api/auth/register  →  Admin only
router.post("/register", protect, authorize("admin"), registerValidation, register);

// GET /api/auth/me  →  Any authenticated user
router.get("/me", protect, getMe);

// PUT /api/auth/profile  →  Any authenticated user (change name/email/password)
router.put("/profile", protect, updateProfileValidation, updateProfile);

module.exports = router;
