const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  registeredAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
