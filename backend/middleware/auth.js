const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

exports.authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'No token provided'));
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

exports.authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission for this action'));
  }
  next();
};