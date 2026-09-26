const asyncHandler = require('../utils/asyncHandler');
const doctorService = require('../services/doctorService');
const { collectionLinks, addResourceLinks } = require('../utils/listQuery');

const withDoctorLinks = (doctor) => ({
  ...doctor,
  _links: {
    self: { href: `/api/v1/doctors/${doctor.id}` },
    update: { href: `/api/v1/doctors/${doctor.id}`, method: 'PUT' },
    delete: { href: `/api/v1/doctors/${doctor.id}`, method: 'DELETE' }
  }
});

exports.getDoctors = asyncHandler(async (req, res) => {
  const result = await doctorService.listDoctors(req.query);
  if (!req.baseUrl.startsWith('/api/v1')) return res.json(result.doctors);
  res.json({
    data: addResourceLinks('doctors', result.doctors),
    pagination: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
    links: collectionLinks(req, result.page, result.pages)
  });
});

exports.createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);
  res.status(201).json(req.baseUrl.startsWith('/api/v1') ? withDoctorLinks(doctor) : doctor);
});

exports.updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  res.json(req.baseUrl.startsWith('/api/v1') ? withDoctorLinks(doctor) : doctor);
});

exports.deleteDoctor = asyncHandler(async (req, res) => {
  await doctorService.deleteDoctor(req.params.id);
  res.json({ message: 'Doctor deleted' });
});