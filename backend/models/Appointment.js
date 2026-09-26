const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  notes: { type: String }
}, { timestamps: true });

// Compound index: fast lookups of "this doctor's appointments on this date"
// -- also the exact shape used by the double-booking check in the service layer.
appointmentSchema.index({ doctor: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);