const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipientId: req.user._id }, { recipientType: 'all' }]
    }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createBroadcast = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notification = await Notification.create({ recipientId: req.user._id, recipientType: 'all', title, message, type });
    res.status(201).json(notification);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createBroadcast };
