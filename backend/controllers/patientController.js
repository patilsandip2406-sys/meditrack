const asyncHandler = require('../utils/asyncHandler');
const patientService = require('../services/patientService');
const { collectionLinks, addResourceLinks } = require('../utils/listQuery');

const withPatientLinks = (patient) => ({
  ...patient,
  _links: {
    self: { href: `/api/v1/patients/${patient.id}` },
    update: { href: `/api/v1/patients/${patient.id}`, method: 'PUT' },
    delete: { href: `/api/v1/patients/${patient.id}`, method: 'DELETE' }
  }
});

exports.getPatients = asyncHandler(async (req, res) => {
  const result = await patientService.listPatients(req.query);
  if (!req.baseUrl.startsWith('/api/v1')) return res.json(result);
  res.json({
    data: addResourceLinks('patients', result.patients),
    pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    links: collectionLinks(req, result.page, result.pages)
  });
});

exports.getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatient(req.params.id);
  res.json(req.baseUrl.startsWith('/api/v1') ? withPatientLinks(patient) : patient);
});

exports.createPatient = asyncHandler(async (req, res) => {
  const patient = await patientService.createPatient(req.body);
  res.status(201).json(req.baseUrl.startsWith('/api/v1') ? withPatientLinks(patient) : patient);
});

exports.updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.updatePatient(req.params.id, req.body);
  res.json(req.baseUrl.startsWith('/api/v1') ? withPatientLinks(patient) : patient);
});

exports.deletePatient = asyncHandler(async (req, res) => {
  await patientService.deletePatient(req.params.id);
  res.json({ message: 'Patient deleted' });
});