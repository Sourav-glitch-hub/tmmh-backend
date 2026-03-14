// // ============================================================
// // routes/productRoutes.js
// // Product/accessories catalog routes
// // ============================================================

// const express = require("express");
// const { body } = require("express-validator");
// const {
//   createProduct,
//   getAllProducts,
//   getProductById,
//   updateProduct,
//   deleteProduct,
//   toggleAvailability,
// } = require("../controllers/productController");
// const { protect } = require("../middleware/authMiddleware");
// const { authorize } = require("../middleware/roleMiddleware");

// const router = express.Router();

// // ─── Validation Rules ────────────────────────────────────────────────────────

// const PRODUCT_CATEGORIES = [
//   "cover", "charger", "powerbank", "earphone", "tempered glass",
// ];

// const createProductValidation = [
//   body("name")
//     .trim()
//     .notEmpty().withMessage("Product name is required.")
//     .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),

//   body("category")
//     .trim()
//     .notEmpty().withMessage("Category is required.")
//     .isIn(PRODUCT_CATEGORIES).withMessage(`Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`),

//   body("description")
//     .trim()
//     .notEmpty().withMessage("Description is required.")
//     .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10 and 1000 characters."),

//   body("available")
//     .optional()
//     .isBoolean().withMessage("Available must be a boolean value (true or false)."),
// ];

// const updateProductValidation = [
//   body("name")
//     .optional()
//     .trim()
//     .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),

//   body("category")
//     .optional()
//     .trim()
//     .isIn(PRODUCT_CATEGORIES).withMessage(`Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`),

//   body("description")
//     .optional()
//     .trim()
//     .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10 and 1000 characters."),

//   body("available")
//     .optional()
//     .isBoolean().withMessage("Available must be a boolean value."),
// ];

// // ─── PUBLIC Routes ────────────────────────────────────────────────────────────

// // GET /api/products  →  Browse catalog (optional filters: ?available=true&category=cover)
// router.get("/", getAllProducts);

// // GET /api/products/:id  →  Single product details
// router.get("/:id", getProductById);

// // ─── ADMIN Routes ─────────────────────────────────────────────────────────────

// // POST /api/products  →  Add product (with image upload)
// router.post(
//   "/",
//   protect,
//   authorize("admin"),
//   createProductValidation,
//   createProduct
// );

// // PUT /api/products/:id  →  Update product (optional new image)
// router.put(
//   "/:id",
//   protect,
//   authorize("admin"),
//   updateProductValidation,
//   updateProduct
// );

// // PATCH /api/products/:id/availability  →  Quick toggle
// router.patch(
//   "/:id/availability",
//   protect,
//   authorize("admin"),
//   toggleAvailability
// );

// // DELETE /api/products/:id  →  Remove product
// router.delete(
//   "/:id",
//   protect,
//   authorize("admin"),
//   deleteProduct
// );

// module.exports = router;

// ============================================================
// routes/productRoutes.js
// Product/accessories catalog routes
// ============================================================

const express = require("express");
const { body } = require("express-validator");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleAvailability,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// ─── Validation Rules ────────────────────────────────────────────────────────

const PRODUCT_CATEGORIES = [
  "cover", "charger", "powerbank", "earphone", "tempered glass",
];

const createProductValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required.")
    .isIn(PRODUCT_CATEGORIES).withMessage(`Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required.")
    .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10 and 1000 characters."),

  body("available")
    .optional()
    .isBoolean().withMessage("Available must be a boolean value (true or false)."),
];

const updateProductValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),

  body("category")
    .optional()
    .trim()
    .isIn(PRODUCT_CATEGORIES).withMessage(`Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10 and 1000 characters."),

  body("available")
    .optional()
    .isBoolean().withMessage("Available must be a boolean value."),
];

// ─── PUBLIC Routes ────────────────────────────────────────────────────────────

// GET /api/products  →  Browse catalog (optional filters: ?available=true&category=cover)
router.get("/", getAllProducts);

// GET /api/products/:id  →  Single product details
router.get("/:id", getProductById);

// ─── ADMIN Routes ─────────────────────────────────────────────────────────────

// POST /api/products  →  Add product (with image upload)
router.post(
  "/",
  protect,
  authorize("admin"),
  createProduct
);

// PUT /api/products/:id  →  Update product (optional new image)
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateProduct
);

// PATCH /api/products/:id/availability  →  Quick toggle
router.patch(
  "/:id/availability",
  protect,
  authorize("admin"),
  toggleAvailability
);

// DELETE /api/products/:id  →  Remove product
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteProduct
);

module.exports = router;