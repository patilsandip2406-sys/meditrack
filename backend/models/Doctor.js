const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  availableDays: [{ type: String }]
}, { timestamps: true });

// Index: speeds up filtering/searching doctors by specialization
doctorSchema.index({ specialization: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);