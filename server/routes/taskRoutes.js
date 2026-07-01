const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, studentOnly } = require('../middleware/authMiddleware');

router.get('/', protect, studentOnly, getTasks);
router.post('/', protect, studentOnly, createTask);
router.put('/:id', protect, studentOnly, updateTask);
router.delete('/:id', protect, studentOnly, deleteTask);

module.exports = router;
