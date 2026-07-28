const { sendError } = require('../utils/apiResponse');

/**
 * Authorize one or more roles
 * Usage: authorize('Admin') or authorize('Admin', 'Manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Not authenticated.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

module.exports = { authorize };
