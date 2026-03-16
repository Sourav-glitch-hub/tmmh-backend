// ============================================================
// utils/uploadConfig.js
// Multer config — disk in dev, Cloudinary in production
// ============================================================

const multer        = require("multer");
const path          = require("path");
const fs            = require("fs");
const cloudinary    = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ── Configure Cloudinary ──────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── File filter: images only ──────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png and .webp images are allowed."), false);
  }
};

// ── Storage: Cloudinary in production, disk in dev ────────────
const createStorage = (subfolder) => {
  if (process.env.NODE_ENV === "production") {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `tmmh/${subfolder}`,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
    });
  }

  // Local disk storage for development
  const dir = path.join(__dirname, `../uploads/${subfolder}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
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
// In production: Cloudinary returns full URL in req.file.path
// In development: build local path
const getFileUrl = (subfolder, filename) => {
  if (!filename) return null;
  if (process.env.NODE_ENV === "production") {
    return null; // not used in production — Cloudinary URL is in req.file.path
  }
  return `/uploads/${subfolder}/${filename}`;
};

module.exports = {
  uploadRepairImage,
  uploadProductImage,
  handleUpload,
  getFileUrl,
  cloudinary,
};
