const asyncHandler = require('../utils/asyncHandler');
const appointmentService = require('../services/appointmentService');

exports.getAppointments = asyncHandler(async (req, res) => {
  res.json(await appointmentService.listAppointments());
});

exports.createAppointment = asyncHandler(async (req, res) => {
  res.status(201).json(await appointmentService.createAppointment(req.body));
});

exports.updateAppointment = asyncHandler(async (req, res) => {
  res.json(await appointmentService.updateAppointment(req.params.id, req.body));
});

exports.deleteAppointment = asyncHandler(async (req, res) => {
  await appointmentService.deleteAppointment(req.params.id);
  res.json({ message: 'Appointment deleted' });
});

exports.getStats = asyncHandler(async (req, res) => {
  res.json(await appointmentService.getStats());
});