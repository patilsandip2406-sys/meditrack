const appointmentRepo = require('../repositories/appointmentRepository');
const ApiError = require('../utils/ApiError');
const { parseListQuery } = require('../utils/listQuery');

const appointmentFields = {
  id: 'number', patientId: 'number', doctorId: 'number', date: 'date', reason: 'string',
  status: 'string', notes: 'string', createdAt: 'date', updatedAt: 'date'
};

exports.listAppointments = async (query) => {
  const options = parseListQuery(query, {
    fields: appointmentFields,
    searchFields: ['reason', 'status'],
    defaultSort: 'date'
  });
  const [appointments, total] = await Promise.all([
    appointmentRepo.findAll(options),
    appointmentRepo.count(options.where)
  ]);
  return { appointments, total, page: options.page, limit: options.limit, pages: Math.ceil(total / options.limit) };
};

exports.createAppointment = async (data) => {
  // Business rule: a doctor cannot have two active appointments
  // at the exact same date/time.
  const conflict = await appointmentRepo.findConflict(data.doctor, data.date);
  if (conflict) throw new ApiError(409, 'This doctor already has an appointment at that time');
  return appointmentRepo.create(data);
};

exports.updateAppointment = async (id, data) => {
  const appt = await appointmentRepo.updateById(id, data);
  if (!appt) throw new ApiError(404, 'Appointment not found');
  return appt;
};

exports.deleteAppointment = async (id) => {
  const appt = await appointmentRepo.deleteById(id);
  if (!appt) throw new ApiError(404, 'Appointment not found');
};

exports.getStats = () => appointmentRepo.getStatsByDoctor();