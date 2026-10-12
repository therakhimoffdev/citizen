const Notification = require('../models/notification');
const logger = require('../utils/logger');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ citizen: req.user._id })
      .populate('appeal')
      .sort({ createdAt: -1 })
      .limit(15);
      
    // Mark them as read
    await Notification.updateMany(
      { citizen: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    logger.error(`getNotifications error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
