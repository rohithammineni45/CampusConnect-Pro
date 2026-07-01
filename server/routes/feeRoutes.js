const express = require('express');
const router = express.Router();
const { getStudentFee, assignFee, payFee, getAllFees, verifyPayment, getFeeAnalytics } = require('../controllers/feeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/analytics', protect, adminOnly, getFeeAnalytics);
router.get('/', protect, adminOnly, getAllFees);
router.post('/assign', protect, adminOnly, assignFee);
router.post('/verify', protect, adminOnly, verifyPayment);
router.get('/student/:studentId', protect, getStudentFee);
router.post('/pay/:studentId', protect, payFee);

module.exports = router;
