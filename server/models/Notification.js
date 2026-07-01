const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  recipientType: { type: String, enum: ['student', 'admin', 'all'], default: 'student' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['event', 'fee', 'attendance', 'announcement', 'approval'], default: 'announcement' },
  isRead: { type: Boolean, default: false },
  link: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
