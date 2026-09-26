const asyncHandler = require('../utils/asyncHandler');
const patientService = require('../services/patientService');

exports.getPatients = asyncHandler(async (req, res) => {
  const result = await patientService.listPatients(req.query); // ?page=&limit=&search=
  res.json(result);
});

exports.getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatient(req.params.id);
  res.json(patient);
});

exports.createPatient = asyncHandler(async (req, res) => {
  const patient = await patientService.createPatient(req.body);
  res.status(201).json(patient);
});

exports.updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.updatePatient(req.params.id, req.body);
  res.json(patient);
});

exports.deletePatient = asyncHandler(async (req, res) => {
  await patientService.deletePatient(req.params.id);
  res.json({ message: 'Patient deleted' });
});