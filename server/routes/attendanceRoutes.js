const express = require('express');
const router = express.Router();
const { addAttendance, addBulkAttendance, getStudentAttendance, getAllAttendance, updateAttendance, deleteAttendance, getAttendanceAnalytics } = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/analytics', protect, adminOnly, getAttendanceAnalytics);
router.get('/', protect, adminOnly, getAllAttendance);
router.post('/', protect, adminOnly, addAttendance);
router.post('/bulk', protect, adminOnly, addBulkAttendance);
router.get('/student/:studentId', protect, getStudentAttendance);
router.put('/:id', protect, adminOnly, updateAttendance);
router.delete('/:id', protect, adminOnly, deleteAttendance);

module.exports = router;
