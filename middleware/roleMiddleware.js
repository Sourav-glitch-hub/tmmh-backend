// ============================================================
// middleware/roleMiddleware.js
// Role-based access control (RBAC) — restricts routes by role
// ============================================================

/**
 * Middleware factory: restrict access to specific roles.
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize('admin'), handler)
 *   router.get('/both',       protect, authorize('admin', 'customer'), handler)
 *
 * MUST be used after `protect` middleware (which sets req.user).
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'customer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before authorization.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`,
      });
    }

    next();
  };
};

module.exports = { authorize };