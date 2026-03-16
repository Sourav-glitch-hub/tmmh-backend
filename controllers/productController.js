// ============================================================
// controllers/productController.js
// CRUD operations for accessories/product catalog
// ============================================================

const { validationResult } = require("express-validator");
const Product = require("../models/Product");
const {
  uploadProductImage,
  handleUpload,
  getFileUrl,
} = require("../utils/uploadConfig");

// ============================================================
// @desc    Add a new product to the catalog
// @route   POST /api/products
// @access  Private (admin only)
// ============================================================
const createProduct = async (req, res, next) => {
  try {
    await handleUpload(uploadProductImage, req, res);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, category, description, available, imageUrl } = req.body;

    // uploaded file → Cloudinary, else use pasted URL
    const imagePath = req.file
      ? await getFileUrl("products", req)
      : (imageUrl && imageUrl.startsWith("http") ? imageUrl : null);

    const product = await Product.create({
      name,
      category,
      description,
      image: imagePath,
      available: available !== undefined ? available === "true" || available === true : true,
    });

    res.status(201).json({
      success: true,
      message: "Product added to catalog successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Get all products (with optional filtering)
// @route   GET /api/products
// @access  Public
// ============================================================
const getAllProducts = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.available !== undefined) {
      filter.available = req.query.available === "true";
    }

    if (req.query.category) {
      const validCategories = Product.schema.path("category").enumValues;
      if (validCategories.includes(req.query.category)) {
        filter.category = req.query.category;
      }
    }

    if (req.query.search) {
      filter.name = new RegExp(req.query.search, "i");
    }

    const products = await Product.find(filter)
      .sort({ category: 1, name: 1 })
      .lean();

    const grouped = products.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      total: products.length,
      data: products,
      grouped,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
// ============================================================
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (admin only)
// ============================================================
const updateProduct = async (req, res, next) => {
  try {
    await handleUpload(uploadProductImage, req, res);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const { name, category, description, available, imageUrl } = req.body;
    if (name !== undefined)        product.name        = name;
    if (category !== undefined)    product.category    = category;
    if (description !== undefined) product.description = description;
    if (available !== undefined) {
      product.available = available === "true" || available === true;
    }

    // uploaded file → Cloudinary, else pasted URL, else keep existing
    if (req.file) {
      product.image = await getFileUrl("products", req);
    } else if (imageUrl && imageUrl.startsWith("http")) {
      product.image = imageUrl;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (admin only)
// ============================================================
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' has been deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Toggle product availability
// @route   PATCH /api/products/:id/availability
// @access  Private (admin only)
// ============================================================
const toggleAvailability = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    product.available = !product.available;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product is now ${product.available ? "available" : "unavailable"}.`,
      data: { id: product._id, available: product.available },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleAvailability,
};
