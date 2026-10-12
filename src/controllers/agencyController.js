const Appeal = require('../models/appeal');
const AppealHistory = require('../models/appealHistory');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');
const bot = require('../bot/bot');

// Get all appeals awaiting Agency Review
exports.getPendingReviews = async (req, res) => {
  try {
    const query = {
      status: { $in: ['Execution Submitted', 'Agency Review', 'Waiting Agency Review'] }
    };
    
    const appeals = await Appeal.find(query)
      .populate('citizen organization department assignedEmployee attachments executionReport.attachments')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: appeals.length, data: appeals });
  } catch (error) {
    logger.error(`getPendingReviews error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Review appeal execution (Agency Inspector action)
exports.reviewExecution = async (req, res) => {
  try {
    const { action, feedbackText } = req.body; // action: 'Approved' | 'Returned'
    const appeal = await Appeal.findById(req.params.id)
      .populate('citizen organization department assignedEmployee');

    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }

    const prevStatus = appeal.status;
    
    if (action === 'Approved') {
      appeal.status = 'Approved';
      appeal.agencyReview = {
        reviewer: req.user._id,
        result: 'Approved',
        feedbackText: feedbackText || 'Execution verified and approved by Agency Inspectorate',
        reviewedAt: new Date()
      };
      
      // Auto transition to Completed so Citizen receives final notification
      appeal.status = 'Completed';

      await appeal.save();

      // Log Appeal History
      await AppealHistory.create({
        appeal: appeal._id,
        status: 'Approved',
        action: 'Agency Approved Execution',
        comment: feedbackText || 'Agency Inspectorate verified and approved execution report',
        performedBy: {
          role: 'Employee',
          id: req.user._id,
          name: `${req.user.fullName} (Agency Inspector)`
        }
      });

      // Log Audit Log
      await logAudit({
        action: 'Agency Inspector Approved Execution',
        actorName: req.user.fullName,
        actorRole: req.user.role || 'Agency Inspector',
        actorId: req.user._id,
        appealId: appeal._id,
        appealNumber: appeal.appealNumber,
        prevState: prevStatus,
        newState: 'Approved',
        details: { feedbackText }
      });

      // Send notification to Citizen on Telegram
      if (appeal.citizen && appeal.citizen.telegramId) {
        try {
          const textMsg = `✅ <b>Murojaatingiz bo'yicha ijro tasdiqlandi!</b>\n\n` +
            `Murojaat kodi: <code>${appeal.appealNumber}</code>\n` +
            `Ijro hisoboti Agentlik Nazorati tomonidan tekshirildi va tasdiqlandi.\n\n` +
            `<i>Javobingiz va bajarilgan ish sifatini baholashingiz yoki e'tiroz bildirishingiz mumkin.</i>`;
          
          await bot.telegram.sendMessage(appeal.citizen.telegramId, textMsg, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '⭐️ Baholash', callback_data: `rate_${appeal._id}` },
                  { text: '❌ E\'tiroz bildirish', callback_data: `object_${appeal._id}` }
                ]
              ]
            }
          });
        } catch (botErr) {
          logger.warn(`Failed to notify citizen on Telegram: ${botErr.message}`);
        }
      }

    } else if (action === 'Returned') {
      appeal.status = 'Returned';
      appeal.agencyReview = {
        reviewer: req.user._id,
        result: 'Returned',
        feedbackText: feedbackText || 'Returned for revision due to incomplete execution evidence',
        reviewedAt: new Date()
      };

      await appeal.save();

      // Log Appeal History
      await AppealHistory.create({
        appeal: appeal._id,
        status: 'Returned',
        action: 'Agency Returned for Revision',
        comment: `Returned to organization: ${feedbackText || 'Incomplete execution evidence'}`,
        performedBy: {
          role: 'Employee',
          id: req.user._id,
          name: `${req.user.fullName} (Agency Inspector)`
        }
      });

      // Log Audit Log
      await logAudit({
        action: 'Agency Inspector Returned Execution',
        actorName: req.user.fullName,
        actorRole: req.user.role || 'Agency Inspector',
        actorId: req.user._id,
        appealId: appeal._id,
        appealNumber: appeal.appealNumber,
        prevState: prevStatus,
        newState: 'Returned',
        details: { feedbackText }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid review action' });
    }

    res.status(200).json({ success: true, data: appeal });
  } catch (error) {
    logger.error(`reviewExecution error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all Citizen Objections
exports.getObjections = async (req, res) => {
  try {
    const appeals = await Appeal.find({ status: 'Objection' })
      .populate('citizen organization department assignedEmployee attachments objection.attachments')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: appeals.length, data: appeals });
  } catch (error) {
    logger.error(`getObjections error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Resolve Objection (Agency action)
exports.resolveObjection = async (req, res) => {
  try {
    const { action, comment } = req.body; // action: 'Reopen' | 'Close'
    const appeal = await Appeal.findById(req.params.id);

    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }

    const prevStatus = appeal.status;

    if (action === 'Reopen') {
      appeal.status = 'In Progress';
      if (appeal.objection) {
        appeal.objection.status = 'Approved';
        appeal.objection.response = comment || 'Objection accepted by Agency. Re-opened for execution.';
      }
    } else {
      appeal.status = 'Closed';
      if (appeal.objection) {
        appeal.objection.status = 'Rejected';
        appeal.objection.response = comment || 'Objection reviewed by Agency and rejected as ungrounded.';
      }
    }

    await appeal.save();

    await logAudit({
      action: `Agency Resolved Objection (${action})`,
      actorName: req.user.fullName,
      actorRole: req.user.role || 'Agency Inspector',
      actorId: req.user._id,
      appealId: appeal._id,
      appealNumber: appeal.appealNumber,
      prevState: prevStatus,
      newState: appeal.status,
      details: { comment }
    });

    res.status(200).json({ success: true, data: appeal });
  } catch (error) {
    logger.error(`resolveObjection error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
