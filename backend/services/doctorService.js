const doctorRepo = require('../repositories/doctorRepository');
const ApiError = require('../utils/ApiError');
const { parseListQuery } = require('../utils/listQuery');

const doctorFields = {
  id: 'number', name: 'string', specialization: 'string', email: 'string', phone: 'string',
  availableDays: 'array', createdAt: 'date', updatedAt: 'date'
};

exports.listDoctors = async (query) => {
  const options = parseListQuery(query, {
    fields: doctorFields,
    searchFields: ['name', 'specialization'],
    defaultSort: 'name'
  });
  const [doctors, total] = await Promise.all([
    doctorRepo.findAll(options),
    doctorRepo.count(options.where)
  ]);
  return { doctors, total, page: options.page, limit: options.limit, pages: Math.ceil(total / options.limit) };
};
exports.createDoctor = (data) => doctorRepo.create(data);

exports.updateDoctor = async (id, data) => {
  const doctor = await doctorRepo.updateById(id, data);
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  return doctor;
};

exports.deleteDoctor = async (id) => {
  const doctor = await doctorRepo.deleteById(id);
  if (!doctor) throw new ApiError(404, 'Doctor not found');
};