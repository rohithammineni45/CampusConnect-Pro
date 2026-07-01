const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, loginAdmin } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

router.post('/student/register', upload.single('profilePhoto'), registerStudent);
router.post('/student/login', loginStudent);
router.post('/admin/login', loginAdmin);

module.exports = router;
