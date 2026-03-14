// ============================================================
// routes/authRoutes.js
// Authentication routes: login, register, profile
// ============================================================

const express = require("express");
const { body } = require("express-validator");
const { login, register, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// ─── Validation Rules ────────────────────────────────────────────────────────

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
];

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters."),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number."
    ),
  body("role")
    .optional()
    .isIn(["admin", "customer"])
    .withMessage("Role must be 'admin' or 'customer'."),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/auth/login  →  Public
router.post("/login", loginValidation, login);

// POST /api/auth/register  →  Admin only (to create other admin or customer accounts)
// NOTE: The very first admin can be seeded via seed.js
router.post(
  "/register",
  protect,
  authorize("admin"),
  registerValidation,
  register
);

// GET /api/auth/me  →  Any authenticated user
router.get("/me", protect, getMe);

module.exports = router;