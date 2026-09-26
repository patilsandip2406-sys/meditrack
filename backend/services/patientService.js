const patientRepo = require('../repositories/patientRepository');
const ApiError = require('../utils/ApiError');
const { parseListQuery } = require('../utils/listQuery');

const patientFields = {
  id: 'number', name: 'string', dob: 'date', gender: 'string', bloodGroup: 'string',
  phone: 'string', address: 'string', medicalHistory: 'array', createdAt: 'date', updatedAt: 'date'
};

exports.listPatients = async (query) => {
  const options = parseListQuery(query, {
    fields: patientFields,
    searchFields: ['name', 'phone', 'bloodGroup'],
    defaultSort: '-createdAt'
  });
  const [patients, total] = await Promise.all([
    patientRepo.findAll(options),
    patientRepo.count(options.where)
  ]);
  return { patients, total, page: options.page, limit: options.limit, pages: Math.ceil(total / options.limit) };
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