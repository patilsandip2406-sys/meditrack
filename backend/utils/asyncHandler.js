// Wraps async route handlers so any thrown error/rejected promise
// is automatically forwarded to next() -> errorHandler.js.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;