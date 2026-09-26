const express = require('express');
const Joi = require('joi');
const prisma = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { createPatientSchema } = require('../validators/patientValidator');
const { createDoctorSchema } = require('../validators/doctorValidator');

const router = express.Router();
const resources = {
  patients: { model: prisma.patient, schema: createPatientSchema, defaults: { medicalHistory: [] } },
  doctors: { model: prisma.doctor, schema: createDoctorSchema, defaults: { availableDays: [] } }
};
const importSchema = Joi.object({
  records: Joi.array().items(Joi.object()).min(1).max(500).required()
}).required();

router.get('/:resource/export', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) throw new ApiError(404, 'Bulk export is supported for patients and doctors');

  const records = await resource.model.findMany({ orderBy: { id: 'asc' }, take: 5000 });
  res.json({
    resource: req.params.resource,
    exportedAt: new Date().toISOString(),
    truncated: records.length === 5000,
    count: records.length,
    records,
    _links: { self: { href: `/api/v1/bulk/${req.params.resource}/export` } }
  });
}));

router.post('/:resource/import', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) throw new ApiError(404, 'Bulk import is supported for patients and doctors');

  const { error, value } = importSchema.validate(req.body, { abortEarly: false });
  if (error) throw new ApiError(400, error.details.map((detail) => detail.message).join('; '));

  const records = value.records.map((record, index) => {
    const result = resource.schema.validate(record, { abortEarly: false, stripUnknown: true });
    if (result.error) {
      throw new ApiError(400, `Record ${index + 1}: ${result.error.details.map((detail) => detail.message).join('; ')}`);
    }
    return { ...resource.defaults, ...result.value };
  });

  const result = await resource.model.createMany({ data: records });
  res.status(201).json({
    resource: req.params.resource,
    imported: result.count,
    _links: { export: { href: `/api/v1/bulk/${req.params.resource}/export` } }
  });
}));

module.exports = router;
