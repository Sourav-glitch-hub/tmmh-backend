// // ============================================================
// // utils/uploadConfig.js
// // Multer configuration for handling file uploads
// // ============================================================

// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // ─── Ensure upload directories exist ────────────────────────────────────────
// const UPLOAD_DIRS = {
//   repairs: path.join(__dirname, "../uploads/repairs"),
//   products: path.join(__dirname, "../uploads/products"),
// };

// Object.values(UPLOAD_DIRS).forEach((dir) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// });

// // ─── File filter: only allow images ─────────────────────────────────────────
// const imageFileFilter = (req, file, cb) => {
//   const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
//   const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;

//   const isValidMime = allowedMimeTypes.includes(file.mimetype);
//   const isValidExt = allowedExtensions.test(file.originalname);

//   if (isValidMime && isValidExt) {
//     cb(null, true);
//   } else {
//     cb(
//       new multer.MulterError(
//         "LIMIT_UNEXPECTED_FILE",
//         "Only .jpg, .jpeg, .png, and .webp images are allowed."
//       ),
//       false
//     );
//   }
// };

// // ─── Storage engine factory ──────────────────────────────────────────────────
// const createStorage = (subfolder) =>
//   multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, UPLOAD_DIRS[subfolder]);
//     },
//     filename: (req, file, cb) => {
//       // Format: timestamp-randomhex.ext  (e.g. 1717000000000-a3f2c1.jpg)
//       const uniqueSuffix = `${Date.now()}-${Math.random()
//         .toString(16)
//         .slice(2, 8)}`;
//       const ext = path.extname(file.originalname).toLowerCase();
//       cb(null, `${uniqueSuffix}${ext}`);
//     },
//   });

// // ─── Multer instances ────────────────────────────────────────────────────────

// /** Upload for repair request device image (optional, single file) */
// const uploadRepairImage = multer({
//   storage: createStorage("repairs"),
//   fileFilter: imageFileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
// }).single("image"); // field name in form-data must be "image"

// /** Upload for product catalog image (required, single file) */
// const uploadProductImage = multer({
//   storage: createStorage("products"),
//   fileFilter: imageFileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
// }).single("image");

// /**
//  * Wraps a multer upload function in a Promise so it can be used
//  * inside async/await controller functions with proper error propagation.
//  *
//  * @param {Function} uploadFn - multer upload middleware
//  * @param {Request}  req
//  * @param {Response} res
//  * @returns {Promise<void>}
//  */
// const handleUpload = (uploadFn, req, res) =>
//   new Promise((resolve, reject) => {
//     uploadFn(req, res, (err) => {
//       if (err) return reject(err);
//       resolve();
//     });
//   });

// /**
//  * Returns the public URL path for a stored file,
//  * or null if no file was uploaded.
//  *
//  * @param {string} subfolder - "repairs" or "products"
//  * @param {string} filename  - multer-generated filename
//  * @returns {string|null}
//  */
// const getFileUrl = (subfolder, filename) => {
//   if (!filename) return null;
//   return `/uploads/${subfolder}/${filename}`;
// };

// module.exports = {
//   uploadRepairImage,
//   uploadProductImage,
//   handleUpload,
//   getFileUrl,
// };

// ============================================================
// utils/uploadConfig.js
// Multer config — works locally and on Vercel (read-only fs)
// ============================================================

const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// ── Only create upload dirs in local development ─────────────
if (process.env.NODE_ENV !== "production") {
  const dirs = [
    path.join(__dirname, "../uploads/repairs"),
    path.join(__dirname, "../uploads/products"),
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

// ── File filter: images only ──────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png and .webp images are allowed."), false);
  }
};

// ── Storage: disk in dev, memory in production ────────────────
const createStorage = (subfolder) => {
  if (process.env.NODE_ENV === "production") {
    // Vercel has read-only filesystem — use memory storage
    return multer.memoryStorage();
  }
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, `../uploads/${subfolder}`));
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      const ext    = path.extname(file.originalname).toLowerCase();
      cb(null, `${unique}${ext}`);
    },
  });
};

// ── Multer instances ──────────────────────────────────────────
const uploadRepairImage = multer({
  storage:    createStorage("repairs"),
  fileFilter: imageFileFilter,
  limits:     { fileSize: 5 * 1024 * 1024 },
}).single("image");

const uploadProductImage = multer({
  storage:    createStorage("products"),
  fileFilter: imageFileFilter,
  limits:     { fileSize: 5 * 1024 * 1024 },
}).single("image");

// ── Promise wrapper ───────────────────────────────────────────
const handleUpload = (uploadFn, req, res) =>
  new Promise((resolve, reject) => {
    uploadFn(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

// ── Get file URL ──────────────────────────────────────────────
const getFileUrl = (subfolder, filename) => {
  if (!filename) return null;
  if (process.env.NODE_ENV === "production") {
    // On Vercel, files are in memory — return null for now
    // To persist images use Cloudinary (separate setup)
    return null;
  }
  return `/uploads/${subfolder}/${filename}`;
};

module.exports = {
  uploadRepairImage,
  uploadProductImage,
  handleUpload,
  getFileUrl,
};