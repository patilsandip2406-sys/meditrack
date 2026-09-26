const Joi = require('joi');

exports.createAppointmentSchema = Joi.object({
  patient: Joi.number().integer().positive().required(),
  doctor: Joi.number().integer().positive().required(),
  date: Joi.date().required(),
  reason: Joi.string().required(),
  notes: Joi.string().allow('').optional()
});

exports.updateAppointmentSchema = Joi.object({
  date: Joi.date().optional(),
  reason: Joi.string().optional(),
  status: Joi.string().valid('Scheduled', 'Completed', 'Cancelled').optional(),
  notes: Joi.string().allow('').optional()
});