// // ============================================================
// // routes/repairRoutes.js
// // Repair request routes — public submission + admin management
// // ============================================================

// const express = require("express");
// const { body, param } = require("express-validator");
// const {
//   createRepairRequest,
//   getRepairStatus,
//   getAllRepairs,
//   getRepairById,
//   updateRepairStatus,
//   deleteRepair,
//   getRepairStats,
// } = require("../controllers/repairController");
// const { protect } = require("../middleware/authMiddleware");
// const { authorize } = require("../middleware/roleMiddleware");

// const router = express.Router();

// // ─── Validation Rules ────────────────────────────────────────────────────────

// const PROBLEM_TYPES = [
//   "screen", "battery", "charging", "software", "camera", "speaker", "other",
// ];

// const REPAIR_STATUSES = ["Received", "Checking", "Repairing", "Completed"];

// const createRepairValidation = [
//   body("customerName")
//     .trim()
//     .notEmpty().withMessage("Customer name is required.")
//     .isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters."),

//   body("phoneNumber")
//     .trim()
//     .notEmpty().withMessage("Phone number is required.")
//     .matches(/^[+]?[\d\s\-().]{7,15}$/).withMessage("Please provide a valid phone number."),

//   body("deviceBrand")
//     .trim()
//     .notEmpty().withMessage("Device brand is required.")
//     .isLength({ max: 50 }).withMessage("Device brand cannot exceed 50 characters."),

//   body("deviceModel")
//     .trim()
//     .notEmpty().withMessage("Device model is required.")
//     .isLength({ max: 80 }).withMessage("Device model cannot exceed 80 characters."),

//   body("problemType")
//     .trim()
//     .notEmpty().withMessage("Problem type is required.")
//     .isIn(PROBLEM_TYPES).withMessage(`Problem type must be one of: ${PROBLEM_TYPES.join(", ")}.`),

//   body("problemDescription")
//     .trim()
//     .notEmpty().withMessage("Problem description is required.")
//     .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10 and 1000 characters."),
// ];

// const updateStatusValidation = [
//   body("status")
//     .notEmpty().withMessage("Status is required.")
//     .isIn(REPAIR_STATUSES).withMessage(`Status must be one of: ${REPAIR_STATUSES.join(", ")}.`),
//   body("adminNotes")
//     .optional()
//     .isLength({ max: 500 }).withMessage("Admin notes cannot exceed 500 characters."),
// ];

// // ─── PUBLIC Routes ───────────────────────────────────────────────────────────

// // POST /api/repairs  →  Submit a new repair request
// // multer runs inside the controller to allow validation after file parse
// // router.post("/", createRepairValidation, createRepairRequest);
// router.post('/', createRepairRequest)

// // GET /api/repairs/:repairId  →  Check status by repairId (e.g. R1001)
// router.get("/:repairId", getRepairStatus);

// // ─── ADMIN Routes (all protected) ────────────────────────────────────────────

// // GET /api/admin/repairs/stats  →  Dashboard stats (must be before /:id)
// router.get(
//   "/admin/stats",
//   protect,
//   authorize("admin"),
//   getRepairStats
// );

// // GET /api/admin/repairs  →  List all repairs (paginated, filterable)
// router.get(
//   "/admin/all",
//   protect,
//   authorize("admin"),
//   getAllRepairs
// );

// // GET /api/admin/repairs/:id  →  Get single repair by MongoDB _id
// router.get(
//   "/admin/:id",
//   protect,
//   authorize("admin"),
//   getRepairById
// );

// // PATCH /api/admin/repairs/:id/status  →  Update repair status
// router.patch(
//   "/admin/:id/status",
//   protect,
//   authorize("admin"),
//   updateStatusValidation,
//   updateRepairStatus
// );

// // DELETE /api/admin/repairs/:id  →  Delete a repair record
// router.delete(
//   "/admin/:id",
//   protect,
//   authorize("admin"),
//   deleteRepair
// );

// module.exports = router;

// ============================================================
// routes/repairRoutes.js
// Repair request routes — public submission + admin management
// ============================================================

const express = require("express");
const { body, param } = require("express-validator");
const {
  createRepairRequest,
  getRepairStatus,
  getAllRepairs,
  getRepairById,
  updateRepairStatus,
  deleteRepair,
  getRepairStats,
} = require("../controllers/repairController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// ─── Validation Rules ────────────────────────────────────────────────────────

const PROBLEM_TYPES = [
  "screen", "battery", "charging", "software", "camera", "speaker", "other",
];

const REPAIR_STATUSES = ["Received", "Checking", "Repairing", "Completed"];

const createRepairValidation = [
  body("customerName")
    .trim()
    .notEmpty().withMessage("Customer name is required.")
    .isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters."),

  body("phoneNumber")
    .trim()
    .notEmpty().withMessage("Phone number is required.")
    .matches(/^[+]?[\d\s\-().]{7,15}$/).withMessage("Please provide a valid phone number."),

  body("deviceBrand")
    .trim()
    .notEmpty().withMessage("Device brand is required.")
    .isLength({ max: 50 }).withMessage("Device brand cannot exceed 50 characters."),

  body("deviceModel")
    .trim()
    .notEmpty().withMessage("Device model is required.")
    .isLength({ max: 80 }).withMessage("Device model cannot exceed 80 characters."),

  body("problemType")
    .trim()
    .notEmpty().withMessage("Problem type is required.")
    .isIn(PROBLEM_TYPES).withMessage(`Problem type must be one of: ${PROBLEM_TYPES.join(", ")}.`),

  body("problemDescription")
    .trim()
    .notEmpty().withMessage("Problem description is required.")
    .isLength({ min: 10, max: 1000 }).withMessage("Description must be between 10 and 1000 characters."),
];

const updateStatusValidation = [
  body("status")
    .notEmpty().withMessage("Status is required.")
    .isIn(REPAIR_STATUSES).withMessage(`Status must be one of: ${REPAIR_STATUSES.join(", ")}.`),
  body("adminNotes")
    .optional()
    .isLength({ max: 500 }).withMessage("Admin notes cannot exceed 500 characters."),
];

// ─── PUBLIC Routes ───────────────────────────────────────────────────────────

// POST /api/repairs  →  Submit a new repair request
// multer runs inside the controller to allow validation after file parse
router.post("/", createRepairRequest); // validation runs inside controller AFTER multer parses body

// GET /api/repairs/:repairId  →  Check status by repairId (e.g. R1001)
router.get("/:repairId", getRepairStatus);

// ─── ADMIN Routes (all protected) ────────────────────────────────────────────

// GET /api/admin/repairs/stats  →  Dashboard stats (must be before /:id)
router.get(
  "/admin/stats",
  protect,
  authorize("admin"),
  getRepairStats
);

// GET /api/admin/repairs  →  List all repairs (paginated, filterable)
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllRepairs
);

// GET /api/admin/repairs/:id  →  Get single repair by MongoDB _id
router.get(
  "/admin/:id",
  protect,
  authorize("admin"),
  getRepairById
);

// PATCH /api/admin/repairs/:id/status  →  Update repair status
router.patch(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  updateStatusValidation,
  updateRepairStatus
);

// DELETE /api/admin/repairs/:id  →  Delete a repair record
router.delete(
  "/admin/:id",
  protect,
  authorize("admin"),
  deleteRepair
);

module.exports = router;