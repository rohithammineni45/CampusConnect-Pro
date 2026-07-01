const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, createBroadcast } = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);
router.post('/broadcast', protect, adminOnly, createBroadcast);

module.exports = router;
