const asyncHandler = require('../utils/asyncHandler');
const doctorService = require('../services/doctorService');

exports.getDoctors = asyncHandler(async (req, res) => {
  res.json(await doctorService.listDoctors());
});

exports.createDoctor = asyncHandler(async (req, res) => {
  res.status(201).json(await doctorService.createDoctor(req.body));
});

exports.updateDoctor = asyncHandler(async (req, res) => {
  res.json(await doctorService.updateDoctor(req.params.id, req.body));
});

exports.deleteDoctor = asyncHandler(async (req, res) => {
  await doctorService.deleteDoctor(req.params.id);
  res.json({ message: 'Doctor deleted' });
});