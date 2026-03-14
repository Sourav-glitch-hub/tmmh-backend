// ============================================================
// controllers/repairController.js
// Handles repair request creation, status lookup, and admin management
// ============================================================

const { validationResult } = require("express-validator");
const RepairRequest = require("../models/RepairRequest");
const generateRepairId = require("../utils/generateRepairId");
const {
  uploadRepairImage,
  handleUpload,
  getFileUrl,
} = require("../utils/uploadConfig");

// ============================================================
// @desc    Submit a new repair request (customer-facing)
// @route   POST /api/repairs
// @access  Public
// ============================================================
const createRepairRequest = async (req, res, next) => {
  try {
    // ── Handle optional image upload FIRST (multer populates req.body) ───
    await handleUpload(uploadRepairImage, req, res);

    // ── Validate input fields ─────────────────────────────────────────────
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      customerName,
      phoneNumber,
      deviceBrand,
      deviceModel,
      problemType,
      problemDescription,
    } = req.body;

    // ── Generate unique repair ID ─────────────────────────────────────────
    const repairId = await generateRepairId();

    // ── Build image path if file was uploaded ─────────────────────────────
    const imagePath = req.file
      ? getFileUrl("repairs", req.file.filename)
      : null;

    // ── Create and save the repair request ───────────────────────────────
    const repairRequest = await RepairRequest.create({
      repairId,
      customerName,
      phoneNumber,
      deviceBrand,
      deviceModel,
      problemType,
      problemDescription,
      image: imagePath,
      status: "Received",
      // If the request comes from an authenticated customer, link them
      customer: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: "Repair request submitted successfully.",
      data: {
        repairId: repairRequest.repairId,
        customerName: repairRequest.customerName,
        deviceBrand: repairRequest.deviceBrand,
        deviceModel: repairRequest.deviceModel,
        problemType: repairRequest.problemType,
        status: repairRequest.status,
        createdAt: repairRequest.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Get repair status by repairId (customer-facing)
// @route   GET /api/repairs/:repairId
// @access  Public
// ============================================================
const getRepairStatus = async (req, res, next) => {
  try {
    const { repairId } = req.params;

    // Validate format (must start with R followed by digits)
    if (!/^R\d+$/i.test(repairId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid repair ID format. Expected format: R1001",
      });
    }

    const repairRequest = await RepairRequest.findOne({
      repairId: repairId.toUpperCase(),
    }).select(
      "repairId customerName deviceBrand deviceModel problemType status createdAt updatedAt"
    );

    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: `No repair request found with ID '${repairId.toUpperCase()}'.`,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        repairId: repairRequest.repairId,
        customerName: repairRequest.customerName,
        deviceBrand: repairRequest.deviceBrand,
        deviceModel: repairRequest.deviceModel,
        problemType: repairRequest.problemType,
        status: repairRequest.status,
        submittedAt: repairRequest.createdAt,
        lastUpdated: repairRequest.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Get all repair requests (admin dashboard)
// @route   GET /api/admin/repairs
// @access  Private (admin only)
// ============================================================
const getAllRepairs = async (req, res, next) => {
  try {
    // ── Pagination ────────────────────────────────────────────────────────
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // ── Filtering ─────────────────────────────────────────────────────────
    const filter = {};

    if (req.query.status) {
      const validStatuses = RepairRequest.schema.path("status").enumValues;
      if (validStatuses.includes(req.query.status)) {
        filter.status = req.query.status;
      }
    }

    if (req.query.problemType) {
      const validTypes = RepairRequest.schema.path("problemType").enumValues;
      if (validTypes.includes(req.query.problemType)) {
        filter.problemType = req.query.problemType;
      }
    }

    // Search by repairId, customerName, or phoneNumber
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [
        { repairId: searchRegex },
        { customerName: searchRegex },
        { phoneNumber: searchRegex },
        { deviceBrand: searchRegex },
      ];
    }

    // ── Query ─────────────────────────────────────────────────────────────
    const [repairs, total] = await Promise.all([
      RepairRequest.find(filter)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .lean(),
      RepairRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Get a single repair request by MongoDB _id (admin)
// @route   GET /api/admin/repairs/:id
// @access  Private (admin only)
// ============================================================
const getRepairById = async (req, res, next) => {
  try {
    const repair = await RepairRequest.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair request not found.",
      });
    }

    res.status(200).json({ success: true, data: repair });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Update repair status (admin)
// @route   PATCH /api/admin/repairs/:id/status
// @access  Private (admin only)
// ============================================================
const updateRepairStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { status, adminNotes } = req.body;

    // ── Find and update the request ───────────────────────────────────────
    const repair = await RepairRequest.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair request not found.",
      });
    }

    const previousStatus = repair.status;

    // Apply updates
    repair.status = status;
    if (adminNotes !== undefined) {
      repair.adminNotes = adminNotes;
    }

    await repair.save(); // Triggers updatedAt via timestamps

    res.status(200).json({
      success: true,
      message: `Status updated from '${previousStatus}' to '${status}'.`,
      data: {
        repairId: repair.repairId,
        previousStatus,
        currentStatus: repair.status,
        updatedAt: repair.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Delete a repair request (admin)
// @route   DELETE /api/admin/repairs/:id
// @access  Private (admin only)
// ============================================================
const deleteRepair = async (req, res, next) => {
  try {
    const repair = await RepairRequest.findByIdAndDelete(req.params.id);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: "Repair request not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Repair request '${repair.repairId}' has been deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Get dashboard stats (admin)
// @route   GET /api/admin/repairs/stats
// @access  Private (admin only)
// ============================================================
const getRepairStats = async (req, res, next) => {
  try {
    const stats = await RepairRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert array to readable object: { Received: 5, Repairing: 3, ... }
    const statusCounts = stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const total = await RepairRequest.countDocuments();

    // Most reported problem types
    const problemStats = await RepairRequest.aggregate([
      { $group: { _id: "$problemType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: {
          Received: statusCounts["Received"] || 0,
          Checking: statusCounts["Checking"] || 0,
          Repairing: statusCounts["Repairing"] || 0,
          Completed: statusCounts["Completed"] || 0,
        },
        byProblemType: problemStats.map((p) => ({
          type: p._id,
          count: p.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRepairRequest,
  getRepairStatus,
  getAllRepairs,
  getRepairById,
  updateRepairStatus,
  deleteRepair,
  getRepairStats,
};