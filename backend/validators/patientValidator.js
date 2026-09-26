const Joi = require('joi');

exports.createPatientSchema = Joi.object({
  name: Joi.string().min(2).required(),
  dob: Joi.date().required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  bloodGroup: Joi.string().optional(),
  phone: Joi.string().min(7).required(),
  address: Joi.string().allow('').optional(),
  medicalHistory: Joi.array().items(Joi.string()).optional()
});

exports.updatePatientSchema = exports.createPatientSchema.fork(
  ['name', 'dob', 'gender', 'phone'],
  (schema) => schema.optional()
);