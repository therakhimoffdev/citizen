const AppealMessage = require('../models/appealMessage');
const Appeal = require('../models/appeal');
const Notification = require('../models/notification');
const Citizen = require('../models/citizen');
const logger = require('../utils/logger');
const bot = require('../bot/bot');

exports.sendMessage = async (req, res) => {
  try {
    const { appealId, text, attachments, isInternal } = req.body;
    
    if (!appealId || (!text && (!attachments || attachments.length === 0))) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    
    const appeal = await Appeal.findById(appealId);
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }
    
    // Ensure permission
    if (req.userRole === 'Citizen') {
      if (appeal.citizen.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else {
      const globalRoles = ['Super Admin', 'Agency Admin', 'Agency Inspector'];
      if (!globalRoles.includes(req.userRole)) {
        const userOrgId = (req.user?.organization?._id || req.user?.organization || '').toString();
        const appealOrgId = (appeal.organization?._id || appeal.organization || '').toString();
        if (!userOrgId || userOrgId !== appealOrgId) {
          return res.status(403).json({
            success: false,
            message: 'Ruxsat etilmagan: Bu murojaat boshqa tashkilotga tegishli / Access denied: Appeal belongs to another organization'
          });
        }
      }
    }
    
    const senderName = req.userRole === 'Citizen' 
      ? `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.telegramId
      : req.user.fullName;
      
    const message = await AppealMessage.create({
      appeal: appealId,
      sender: {
        role: req.userRole === 'Citizen' ? 'Citizen' : 'Employee',
        id: req.user._id,
        roleRef: req.userRole === 'Citizen' ? 'Citizen' : 'Employee',
        name: senderName
      },
      text: text || '',
      isInternal: req.userRole !== 'Citizen' ? Boolean(isInternal) : false,
      attachments: attachments || []
    });
    
    // Create notification and send direct Telegram message to citizen (if public comment)
    if (req.userRole !== 'Citizen' && !isInternal) {
      const citizen = await Citizen.findById(appeal.citizen);
      if (citizen && citizen.telegramId) {
        try {
          const notifyText = `💬 <b>Murojaatingiz bo'yicha javob xabari:</b>\n\n` +
            `🔢 Murojaat kodi: <code>${appeal.appealNumber}</code>\n` +
            `👤 Xodim: <b>${senderName}</b>\n\n` +
            `✉️ <b>Xabar:</b>\n${text || ''}`;
          await bot.telegram.sendMessage(citizen.telegramId, notifyText, { parse_mode: 'HTML' });
        } catch (botErr) {
          logger.warn(`Failed to send telegram msg to citizen: ${botErr.message}`);
        }
      }

      if (citizen && citizen.notificationEnabled) {
        await Notification.create({
          citizen: citizen._id,
          appeal: appeal._id,
          type: 'MessageReceived',
          message: {
            uz: `Sizning ${appeal.appealNumber} raqamli murojaatingiz bo'yicha yangi xabar keldi.`,
            ru: `Новое сообщение по вашему обращению ${appeal.appealNumber}.`,
            en: `New message received on your appeal ${appeal.appealNumber}.`
          }
        });
      }
    }
    
    logger.info(`Message sent on appeal ${appeal.appealNumber} by ${req.userRole}`);
    
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    logger.error(`sendMessage error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { appealId } = req.params;
    
    const appeal = await Appeal.findById(appealId);
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }
    
    if (req.userRole === 'Citizen') {
      if (appeal.citizen.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else {
      const globalRoles = ['Super Admin', 'Agency Admin', 'Agency Inspector'];
      if (!globalRoles.includes(req.userRole)) {
        const userOrgId = (req.user?.organization?._id || req.user?.organization || '').toString();
        const appealOrgId = (appeal.organization?._id || appeal.organization || '').toString();
        if (!userOrgId || userOrgId !== appealOrgId) {
          return res.status(403).json({
            success: false,
            message: 'Ruxsat etilmagan: Bu murojaat boshqa tashkilotga tegishli / Access denied: Appeal belongs to another organization'
          });
        }
      }
    }
    
    let query = { appeal: appealId };
    
    // If citizen, filter out internal messages
    if (req.userRole === 'Citizen') {
      query.isInternal = { $ne: true };
    }
    
    const messages = await AppealMessage.find(query)
      .populate('attachments')
      .sort({ createdAt: 1 });
      
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    logger.error(`getMessages error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
