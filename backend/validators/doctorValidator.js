const Joi = require('joi');

exports.createDoctorSchema = Joi.object({
  name: Joi.string().min(2).required(),
  specialization: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  availableDays: Joi.array().items(Joi.string()).optional()
});

exports.updateDoctorSchema = exports.createDoctorSchema.fork(
  ['name', 'specialization', 'email'],
  (schema) => schema.optional()
);