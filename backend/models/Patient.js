const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String },
  phone: { type: String, required: true },
  address: { type: String },
  medicalHistory: [{ type: String }]
}, { timestamps: true });

// Index: name search is the most common query on this collection
patientSchema.index({ name: 'text' });

module.exports = mongoose.model('Patient', patientSchema);