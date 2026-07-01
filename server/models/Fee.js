const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  amount: Number,
  date: { type: Date, default: Date.now },
  method: { type: String, default: 'Online' },
  transactionId: String,
  status: { type: String, default: 'Success' },
});

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
  totalFee: { type: Number, required: true, default: 0 },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
  academicYear: { type: String },
  paymentHistory: [paymentHistorySchema],
  status: { type: String, enum: ['paid', 'partial', 'pending'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
