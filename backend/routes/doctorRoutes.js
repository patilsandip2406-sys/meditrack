const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { createDoctorSchema, updateDoctorSchema } = require('../validators/doctorValidator');
const { getDoctors, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');

router.get('/', authenticate, getDoctors);
router.post('/', authenticate, authorize('admin'), validate(createDoctorSchema), createDoctor);
router.put('/:id', authenticate, authorize('admin'), validate(updateDoctorSchema), updateDoctor);
router.delete('/:id', authenticate, authorize('admin'), deleteDoctor);

module.exports = router;