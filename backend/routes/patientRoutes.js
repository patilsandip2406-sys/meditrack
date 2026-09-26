const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { createPatientSchema, updatePatientSchema } = require('../validators/patientValidator');
const {
  getPatients, getPatientById, createPatient, updatePatient, deletePatient
} = require('../controllers/patientController');

router.get('/', authenticate, getPatients);
router.get('/:id', authenticate, getPatientById);
router.post('/', authenticate, authorize('admin', 'receptionist'), validate(createPatientSchema), createPatient);
router.put('/:id', authenticate, authorize('admin', 'receptionist'), validate(updatePatientSchema), updatePatient);
router.delete('/:id', authenticate, authorize('admin'), deletePatient);

module.exports = router;