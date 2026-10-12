const Citizen = require('../models/citizen');
const AuditLog = require('../models/auditLog');
const logger = require('../utils/logger');

exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      profile: req.user
    });
  } catch (error) {
    logger.error(`getProfile error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { language, phone, notificationEnabled } = req.body;
    
    const citizen = await Citizen.findById(req.user._id);
    
    if (language) citizen.language = language;
    if (phone !== undefined) citizen.phone = phone;
    if (notificationEnabled !== undefined) citizen.notificationEnabled = notificationEnabled;
    
    await citizen.save();
    
    logger.info(`Citizen profile updated: ${citizen.telegramId}`);
    
    res.status(200).json({
      success: true,
      profile: citizen
    });
  } catch (error) {
    logger.error(`updateProfile error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Log the request, but do soft deletion / process delete request
    await AuditLog.create({
      action: 'DELETE_ACCOUNT_REQUEST',
      actor: `Citizen: ${req.user.telegramId}`,
      details: { citizenId: req.user._id }
    });
    
    // In real app, flag it or delete it. Let's flag it.
    logger.warn(`Citizen request to delete account: ${req.user.telegramId}`);
    
    res.status(200).json({
      success: true,
      message: 'Account deletion request received and is being processed by administration.'
    });
  } catch (error) {
    logger.error(`deleteAccount error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
