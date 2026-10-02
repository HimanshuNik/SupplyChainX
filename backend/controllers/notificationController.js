const { dbStore } = require('../utils/dbStore');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const list = dbStore.collection('notifications').find().sort({ createdAt: -1 });
    const unreadCount = list.filter(n => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      notifications: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = dbStore.collection('notifications').findByIdAndUpdate(id, { isRead: true });

    res.json({ success: true, notification: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error marking notification as read' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const list = dbStore.collection('notifications').find().toArray();
    list.forEach(n => {
      dbStore.collection('notifications').findByIdAndUpdate(n._id, { isRead: true });
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
