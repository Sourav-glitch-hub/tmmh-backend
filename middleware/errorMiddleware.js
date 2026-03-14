// ============================================================
// middleware/errorMiddleware.js
// Centralized error handling — catches all errors passed via next(err)
// ============================================================

/**
 * 404 Handler — catches requests to undefined routes.
 * Place AFTER all route definitions.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global Error Handler — handles all errors passed via next(err).
 *
 * Handles common error types:
 *  - Mongoose CastError         → 400 (bad ObjectId)
 *  - Mongoose ValidationError   → 400 (schema validation failed)
 *  - Mongoose Duplicate Key     → 409 (unique constraint violated)
 *  - JWT errors                 → 401
 *  - Multer errors              → 400
 *  - Generic errors             → 500
 *
 * In production, internal error details are hidden from the response.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // ── Mongoose: Invalid ObjectId (e.g. /api/repairs/not-an-id) ───────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID format: '${err.value}'`;
  }

  // ── Mongoose: Schema Validation Error ───────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── MongoDB: Duplicate Key Error (e.g. duplicate email) ─────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue)[0];
    const duplicateValue = err.keyValue[duplicateField];
    message = `'${duplicateValue}' is already registered for field '${duplicateField}'.`;
  }

  // ── JWT: Malformed token ─────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }

  // ── JWT: Expired token ───────────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please log in again.";
  }

  // ── Multer: File size exceeded ───────────────────────────────────────────
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large. Maximum allowed size is 5MB.";
  }

  // ── Multer: Unexpected field name ────────────────────────────────────────
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = `Unexpected file field: '${err.field}'. Use the correct field name.`;
  }

  // ── Log all 500-level errors to console (use a logger in production) ─────
  if (statusCode >= 500) {
    console.error("🔴 INTERNAL ERROR:", {
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      path: req.originalUrl,
      method: req.method,
    });
  }

  // ── Build and send error response ────────────────────────────────────────
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };