const express = require('express');
const router = express.Router();
const { getAllEvents, getAllEventsAdmin, createEvent, updateEvent, deleteEvent, registerForEvent, cancelRegistration, getMyRegistrations, getAllRegistrations, updateRegistrationStatus, getEventAnalytics } = require('../controllers/eventController');
const { protect, adminOnly, studentOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/analytics', protect, adminOnly, getEventAnalytics);
router.get('/admin/all', protect, adminOnly, getAllEventsAdmin);
router.get('/registrations', protect, adminOnly, getAllRegistrations);
router.put('/registrations/:id', protect, adminOnly, updateRegistrationStatus);
router.get('/my-registrations', protect, studentOnly, getMyRegistrations);
router.get('/', protect, getAllEvents);
router.post('/', protect, adminOnly, upload.single('bannerImage'), createEvent);
router.put('/:id', protect, adminOnly, upload.single('bannerImage'), updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);
router.post('/:eventId/register', protect, studentOnly, registerForEvent);
router.delete('/:eventId/cancel', protect, studentOnly, cancelRegistration);

module.exports = router;
