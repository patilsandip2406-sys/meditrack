const doctorRepo = require('../repositories/doctorRepository');
const ApiError = require('../utils/ApiError');

exports.listDoctors = () => doctorRepo.findAll();
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