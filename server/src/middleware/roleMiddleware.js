/**
 * Authorization middleware factory.
 * Checks if the authenticated user's role is among the allowed roles.
 * @param  {...string} roles - Allowed roles (e.g. 'ADMIN', 'STAFF')
 * @returns {Function} Express middleware
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Not authenticated.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
}

export const authorizeRoles = authorize;

