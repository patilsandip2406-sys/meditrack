const asyncHandler = require('../utils/asyncHandler');
const appointmentService = require('../services/appointmentService');
const { collectionLinks, addResourceLinks } = require('../utils/listQuery');

const withAppointmentLinks = (appointment) => ({
  ...appointment,
  _links: {
    self: { href: `/api/v1/appointments/${appointment.id}` },
    update: { href: `/api/v1/appointments/${appointment.id}`, method: 'PUT' },
    delete: { href: `/api/v1/appointments/${appointment.id}`, method: 'DELETE' }
  }
});

exports.getAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.listAppointments(req.query);
  if (!req.baseUrl.startsWith('/api/v1')) return res.json(result.appointments);
  res.json({
    data: addResourceLinks('appointments', result.appointments),
    pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    links: collectionLinks(req, result.page, result.pages)
  });
});

exports.createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.body);
  res.status(201).json(req.baseUrl.startsWith('/api/v1') ? withAppointmentLinks(appointment) : appointment);
});

exports.updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
  res.json(req.baseUrl.startsWith('/api/v1') ? withAppointmentLinks(appointment) : appointment);
});

exports.deleteAppointment = asyncHandler(async (req, res) => {
  await appointmentService.deleteAppointment(req.params.id);
  res.json({ message: 'Appointment deleted' });
});

exports.getStats = asyncHandler(async (req, res) => {
  res.json(await appointmentService.getStats());
});