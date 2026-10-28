const Notification = require('../models/notification');
const Appeal = require('../models/appeal');
const logger = require('../utils/logger');

exports.getNotifications = async (req, res) => {
  try {
    let notifications = [];

    if (req.userRole === 'Citizen') {
      notifications = await Notification.find({ citizen: req.user._id })
        .populate('appeal')
        .sort({ createdAt: -1 })
        .limit(20);
        
      // Mark them as read
      await Notification.updateMany(
        { citizen: req.user._id, isRead: false },
        { $set: { isRead: true } }
      );
    } else {
      // Employee notifications (based on appeals of their organization or assigned to them)
      const globalRoles = ['Super Admin', 'Agency Admin', 'Agency Inspector'];
      let appealQuery = {};
      if (!globalRoles.includes(req.userRole)) {
        const orgId = req.user?.organization?._id || req.user?.organization;
        if (orgId) {
          appealQuery.organization = orgId;
        }
      }

      const relevantAppeals = await Appeal.find(appealQuery)
        .select('_id')
        .sort({ updatedAt: -1 })
        .limit(50);
      const appealIds = relevantAppeals.map(a => a._id);

      notifications = await Notification.find({ appeal: { $in: appealIds } })
        .populate('appeal citizen')
        .sort({ createdAt: -1 })
        .limit(20);
    }
    
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    logger.error(`getNotifications error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
