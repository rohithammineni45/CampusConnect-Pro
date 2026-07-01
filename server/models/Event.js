const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String },
  venue: { type: String, required: true },
  capacity: { type: Number, required: true },
  registeredCount: { type: Number, default: 0 },
  bannerImage: { type: String, default: '' },
  category: { type: String, default: 'General' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
