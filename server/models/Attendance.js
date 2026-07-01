const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  month: { type: Number },
  year: { type: Number },
}, { timestamps: true });

attendanceSchema.pre('save', function (next) {
  this.month = this.date.getMonth() + 1;
  this.year = this.date.getFullYear();
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
