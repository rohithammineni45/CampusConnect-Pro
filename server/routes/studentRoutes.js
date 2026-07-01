const express = require('express');
const router = express.Router();
const { getAllStudents, getStudentById, updateStudent, changePassword, deleteStudent, toggleSuspend, addStudent, getDashboardStats } = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/', protect, adminOnly, getAllStudents);
router.post('/', protect, adminOnly, upload.single('profilePhoto'), addStudent);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, upload.single('profilePhoto'), updateStudent);
router.put('/:id/change-password', protect, changePassword);
router.delete('/:id', protect, adminOnly, deleteStudent);
router.put('/:id/toggle-suspend', protect, adminOnly, toggleSuspend);

module.exports = router;
