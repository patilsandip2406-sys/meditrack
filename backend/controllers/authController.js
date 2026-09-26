const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

exports.register = asyncHandler(async (req, res) => {
  res.status(201).json(await authService.register(req.body));
});

exports.login = asyncHandler(async (req, res) => {
  res.json(await authService.login(req.body));
});