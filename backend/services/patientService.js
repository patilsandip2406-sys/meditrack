const patientRepo = require('../repositories/patientRepository');
const ApiError = require('../utils/ApiError');

exports.listPatients = async ({ page = 1, limit = 20, search }) => {
  const skip = (page - 1) * limit;
  const [patients, total] = await Promise.all([
    patientRepo.findAll({ skip, limit: Number(limit), search }),
    patientRepo.count(search)
  ]);
  return { patients, total, page: Number(page), pages: Math.ceil(total / limit) };
};

exports.getPatient = async (id) => {
  const patient = await patientRepo.findById(id);
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

exports.createPatient = (data) => patientRepo.create(data);

exports.updatePatient = async (id, data) => {
  const patient = await patientRepo.updateById(id, data);
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

exports.deletePatient = async (id) => {
  const patient = await patientRepo.deleteById(id);
  if (!patient) throw new ApiError(404, 'Patient not found');
};