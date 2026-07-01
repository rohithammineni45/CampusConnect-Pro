const Fee = require('../models/Fee');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('crypto');

// @desc  Get fee for a student
const getStudentFee = async (req, res) => {
  try {
    const fee = await Fee.findOne({ studentId: req.params.studentId }).populate('studentId', 'fullName rollNumber department');
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Assign fee (Admin)
const assignFee = async (req, res) => {
  try {
    const { studentId, totalFee, dueDate, academicYear } = req.body;
    let fee = await Fee.findOne({ studentId });
    if (fee) {
      fee.totalFee = totalFee; fee.pendingAmount = totalFee - fee.paidAmount;
      fee.dueDate = dueDate; fee.academicYear = academicYear;
      await fee.save();
    } else {
      fee = await Fee.create({ studentId, totalFee, pendingAmount: totalFee, dueDate, academicYear });
    }
    res.json(fee);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Pay fee (Student simulation)
const payFee = async (req, res) => {
  try {
    const { amount, method } = req.body;
    const fee = await Fee.findOne({ studentId: req.params.studentId });
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });

    const payAmt = Number(amount);
    if (payAmt > fee.pendingAmount) return res.status(400).json({ message: 'Amount exceeds pending fee' });

    fee.paidAmount += payAmt;
    fee.pendingAmount -= payAmt;
    fee.paymentHistory.push({ amount: payAmt, method: method || 'Online', transactionId: `TXN${Date.now()}`, status: 'Success' });
    fee.status = fee.pendingAmount === 0 ? 'paid' : 'partial';
    await fee.save();

    await Notification.create({
      recipientId: req.params.studentId, recipientType: 'student',
      title: 'Payment Successful', message: `Your payment of ₹${payAmt} has been received successfully.`, type: 'fee'
    });

    res.json({ message: 'Payment successful', fee });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Get all fees (Admin)
const getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find().populate('studentId', 'fullName rollNumber department year email');
    res.json(fees);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Verify payment (Admin)
const verifyPayment = async (req, res) => {
  try {
    const { feeId, historyId, status } = req.body;
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    const payment = fee.paymentHistory.id(historyId);
    if (payment) { payment.status = status; await fee.save(); }
    res.json({ message: 'Payment status updated', fee });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc  Fee analytics
const getFeeAnalytics = async (req, res) => {
  try {
    const fees = await Fee.find();
    const totalAssigned = fees.reduce((sum, f) => sum + f.totalFee, 0);
    const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalPending = fees.reduce((sum, f) => sum + f.pendingAmount, 0);
    const statusCount = { paid: 0, partial: 0, pending: 0 };
    fees.forEach(f => statusCount[f.status]++);
    res.json({ totalAssigned, totalCollected, totalPending, statusCount, totalStudents: fees.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getStudentFee, assignFee, payFee, getAllFees, verifyPayment, getFeeAnalytics };
