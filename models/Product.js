// ============================================================
// models/Product.js
// Schema for accessories catalog (no price — shop owner preference)
// ============================================================

const mongoose = require("mongoose");

// ─── Enum: Product categories ────────────────────────────────────────────────
const PRODUCT_CATEGORIES = [
  "cover",
  "charger",
  "powerbank",
  "earphone",
  "tempered glass",
];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: PRODUCT_CATEGORIES,
        message: `Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}`,
      },
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    // Image path stored via multer upload
    image: {
      type: String,
      default: null,
    },

    // Toggle visibility of product on customer-facing catalog
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for faster catalog queries ────────────────────────────────────────
productSchema.index({ category: 1, available: 1 });

// ─── Export constants for reuse in validators ────────────────────────────────
productSchema.statics.PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;

module.exports = mongoose.model("Product", productSchema);