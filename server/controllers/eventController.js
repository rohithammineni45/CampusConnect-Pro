const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Notification = require('../models/Notification');

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, capacity, category } = req.body;
    const bannerImage = req.file ? `/uploads/${req.file.filename}` : '';
    const event = await Event.create({ title, description, date, time, venue, capacity: Number(capacity), category, bannerImage, createdBy: req.user._id });
    res.status(201).json(event);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateEvent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.bannerImage = `/uploads/${req.file.filename}`;
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    await EventRegistration.deleteMany({ eventId: req.params.id });
    res.json({ message: 'Event deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.registeredCount >= event.capacity) return res.status(400).json({ message: 'Event is at full capacity' });
    const existing = await EventRegistration.findOne({ eventId, studentId });
    if (existing) return res.status(400).json({ message: 'Already registered for this event' });
    const registration = await EventRegistration.create({ eventId, studentId });
    event.registeredCount++;
    await event.save();
    res.status(201).json({ message: 'Registration submitted! Awaiting admin approval.', registration });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const cancelRegistration = async (req, res) => {
  try {
    const reg = await EventRegistration.findOne({ eventId: req.params.eventId, studentId: req.user._id });
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    if (reg.status === 'approved') return res.status(400).json({ message: 'Cannot cancel an approved registration' });
    await EventRegistration.findByIdAndDelete(reg._id);
    await Event.findByIdAndUpdate(req.params.eventId, { $inc: { registeredCount: -1 } });
    res.json({ message: 'Registration cancelled' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyRegistrations = async (req, res) => {
  try {
    const regs = await EventRegistration.find({ studentId: req.user._id }).populate('eventId').sort({ registeredAt: -1 });
    res.json(regs);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllRegistrations = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const regs = await EventRegistration.find(filter)
      .populate('eventId', 'title date venue')
      .populate('studentId', 'fullName rollNumber department email')
      .sort({ registeredAt: -1 });
    res.json(regs);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const reg = await EventRegistration.findById(req.params.id).populate('studentId', 'fullName').populate('eventId', 'title');
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    reg.status = status; reg.adminNote = adminNote || '';
    if (status === 'approved') reg.approvedAt = new Date();
    await reg.save();
    const message = status === 'approved'
      ? `Your registration for "${reg.eventId.title}" has been approved!`
      : `Your registration for "${reg.eventId.title}" was rejected. ${adminNote || ''}`;
    await Notification.create({ recipientId: reg.studentId._id, recipientType: 'student', title: `Event Registration ${status}`, message, type: 'approval' });
    res.json({ message: `Registration ${status}`, registration: reg });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getEventAnalytics = async (req, res) => {
  try {
    const events = await Event.find();
    const regs = await EventRegistration.find();
    const statusCount = { pending: 0, approved: 0, rejected: 0 };
    regs.forEach(r => statusCount[r.status]++);
    const eventParticipation = events.map(e => ({
      title: e.title, capacity: e.capacity, registered: e.registeredCount,
      approved: regs.filter(r => r.eventId.toString() === e._id.toString() && r.status === 'approved').length
    }));
    res.json({ totalEvents: events.length, totalRegistrations: regs.length, statusCount, eventParticipation });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAllEvents, getAllEventsAdmin, createEvent, updateEvent, deleteEvent, registerForEvent, cancelRegistration, getMyRegistrations, getAllRegistrations, updateRegistrationStatus, getEventAnalytics };
