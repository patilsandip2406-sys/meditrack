const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { createAppointmentSchema, updateAppointmentSchema } = require('../validators/appointmentValidator');
const {
  getAppointments, createAppointment, updateAppointment, deleteAppointment, getStats
} = require('../controllers/appointmentController');

router.get('/', authenticate, getAppointments);
router.get('/stats', authenticate, authorize('admin'), getStats);
router.post('/', authenticate, authorize('admin', 'receptionist'), validate(createAppointmentSchema), createAppointment);
router.put('/:id', authenticate, authorize('admin', 'doctor', 'receptionist'), validate(updateAppointmentSchema), updateAppointment);
router.delete('/:id', authenticate, authorize('admin'), deleteAppointment);

module.exports = router;