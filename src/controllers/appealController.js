const path = require('path');
const fs = require('fs');
const Appeal = require('../models/appeal');
const Organization = require('../models/organization');
const Department = require('../models/department');
const AppealHistory = require('../models/appealHistory');
const AuditLog = require('../models/auditLog');
const Citizen = require('../models/citizen');
const Attachment = require('../models/attachment');
const { createStatusNotification } = require('../helpers/notificationHelper');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');
const bot = require('../bot/bot');

// Tashkilot ijroni yuklaganda fuqaroga batafsil xabar va ijro fayllarini (rasm/PDF) yuborish
const sendExecutionReportToCitizen = async (appeal) => {
  try {
    const citizen = await Citizen.findById(appeal.citizen);
    if (!citizen || !citizen.telegramId) return;

    const org = await Organization.findById(appeal.organization);
    const lang = citizen.language || 'uz';
    const orgName = org ? (org.name[lang] || org.name.uz) : '';
    const submittedAt = appeal.executionReport?.submittedAt || new Date();
    const dateStr = new Date(submittedAt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ');

    const texts = {
      uz:
        `✅ <b>Murojaatingiz bo'yicha ijro yakunlandi!</b>\n\n` +
        `🔢 Murojaat raqami: <code>${appeal.appealNumber}</code>\n` +
        (orgName ? `🏢 Tashkilot: ${orgName}\n` : '') +
        (appeal.subject ? `📝 Mavzu: ${appeal.subject}\n` : '') +
        `📅 Ijro yakunlangan sana: ${dateStr}\n\n` +
        `📄 <b>Ijro hisoboti:</b>\n${appeal.executionReport?.text || ''}\n\n` +
        `ℹ️ <i>Ijro natijasi Agentlik nazorati tomonidan tekshirilgach, uni baholashingiz yoki e'tiroz bildirishingiz mumkin bo'ladi.</i>`,
      ru:
        `✅ <b>Исполнение по вашему обращению завершено!</b>\n\n` +
        `🔢 Номер обращения: <code>${appeal.appealNumber}</code>\n` +
        (orgName ? `🏢 Организация: ${orgName}\n` : '') +
        (appeal.subject ? `📝 Тема: ${appeal.subject}\n` : '') +
        `📅 Дата завершения: ${dateStr}\n\n` +
        `📄 <b>Отчет об исполнении:</b>\n${appeal.executionReport?.text || ''}\n\n` +
        `ℹ️ <i>После проверки результата Инспекцией Агентства вы сможете оценить его или подать возражение.</i>`
    };

    await bot.telegram.sendMessage(citizen.telegramId, texts[lang] || texts.uz, { parse_mode: 'HTML' });

    // Ijro fayllarini yuborish (rasm -> photo, pdf/hujjat -> document)
    const attachmentIds = appeal.executionReport?.attachments || [];
    if (attachmentIds.length) {
      const attachments = await Attachment.find({ _id: { $in: attachmentIds } });
      const uploadRoot = path.resolve(process.env.UPLOAD_PATH || 'uploads');

      for (const att of attachments) {
        try {
          const filePath = path.join(uploadRoot, path.basename(att.fileUrl));
          if (!fs.existsSync(filePath)) {
            logger.warn(`Execution attachment file not found on disk: ${filePath}`);
            continue;
          }
          const caption = lang === 'ru'
            ? `📎 Файл исполнения — ${appeal.appealNumber}`
            : `📎 Ijro fayli — ${appeal.appealNumber}`;

          if (att.fileType === 'photo') {
            await bot.telegram.sendPhoto(citizen.telegramId, { source: filePath }, { caption });
          } else if (att.fileType === 'video') {
            await bot.telegram.sendVideo(citizen.telegramId, { source: filePath }, { caption });
          } else {
            await bot.telegram.sendDocument(
              citizen.telegramId,
              { source: filePath, filename: att.fileName || path.basename(att.fileUrl) },
              { caption }
            );
          }
        } catch (fileErr) {
          logger.warn(`Failed to send execution attachment ${att._id}: ${fileErr.message}`);
        }
      }
    }

    logger.info(`Execution report sent to citizen ${citizen.telegramId} for appeal ${appeal.appealNumber}`);
  } catch (err) {
    logger.warn(`Failed to send execution report to citizen: ${err.message}`);
  }
};

// Get all organizations (with departments populated)
exports.getOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find();
    const result = [];
    
    for (const org of orgs) {
      const deps = await Department.find({ organization: org._id });
      result.push({
        _id: org._id,
        name: org.name,
        code: org.code,
        departments: deps
      });
    }
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error(`getOrganizations error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new appeal
exports.createAppeal = async (req, res) => {
  try {
    const { organizationId, departmentId, category, subject, description, attachments, location } = req.body;
    
    if (!organizationId || !description) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }
    
    // Check if duplicate appeal is sent by this citizen in the last 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const existingAppeal = await Appeal.findOne({
      citizen: req.user._id,
      description,
      createdAt: { $gte: twoMinutesAgo }
    });
    
    if (existingAppeal) {
      return res.status(400).json({ success: false, message: 'Duplicate appeal detected. Please wait before resubmitting.' });
    }

    const appeal = await Appeal.create({
      citizen: req.user._id,
      organization: organizationId,
      department: departmentId,
      category,
      subject,
      description,
      attachments: attachments || [],
      location: location || undefined,
      status: 'Received'
    });

    await AppealHistory.create({
      appeal: appeal._id,
      status: 'Received',
      action: 'Murojaat yaratildi',
      comment: 'Murojaat fuqaro tomonidan yaratildi.',
      performedBy: {
        role: 'Citizen',
        id: req.user._id,
        roleRef: 'Citizen',
        name: `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.telegramId
      }
    });

    await logAudit({
      action: 'APPEAL_CREATED',
      actorName: `${req.user.firstName} ${req.user.lastName}`.trim() || 'Citizen',
      actorRole: 'Citizen',
      actorId: req.user._id,
      appealId: appeal._id,
      appealNumber: appeal.appealNumber,
      newState: 'Received',
      details: { channel: 'Telegram Bot' }
    });

    logger.info(`Appeal created successfully: ${appeal.appealNumber}`);
    
    res.status(201).json({ success: true, data: appeal });
  } catch (error) {
    logger.error(`createAppeal error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error creating appeal' });
  }
};

// Get citizen's own appeals
exports.getMyAppeals = async (req, res) => {
  try {
    const appeals = await Appeal.find({ citizen: req.user._id })
      .populate('organization department')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, count: appeals.length, data: appeals });
  } catch (error) {
    logger.error(`getMyAppeals error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get appeal by ID
exports.getAppealById = async (req, res) => {
  try {
    let appeal;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      appeal = await Appeal.findById(req.params.id)
        .populate('citizen organization department assignedEmployee attachments executionReport.attachments objection.attachments');
    } else {
      appeal = await Appeal.findOne({ appealNumber: req.params.id })
        .populate('citizen organization department assignedEmployee attachments executionReport.attachments objection.attachments');
    }
      
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }
    
    // Check access
    if (req.userRole === 'Citizen' && appeal.citizen._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const history = await AppealHistory.find({ appeal: appeal._id }).sort({ createdAt: 1 });
    
    res.status(200).json({ success: true, data: appeal, history });
  } catch (error) {
    logger.error(`getAppealById error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Search appeal by Appeal Number (public / citizen authenticated)
exports.searchAppeal = async (req, res) => {
  try {
    const { appealNumber } = req.query;
    if (!appealNumber) {
      return res.status(400).json({ success: false, message: 'Appeal number is required' });
    }
    
    const appeal = await Appeal.findOne({ appealNumber: appealNumber.trim() })
      .populate('organization department assignedEmployee');
      
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }
    
    const history = await AppealHistory.find({ appeal: appeal._id }).sort({ createdAt: 1 });
    
    res.status(200).json({ success: true, data: appeal, history });
  } catch (error) {
    logger.error(`searchAppeal error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update status (Employee only)
exports.updateAppealStatus = async (req, res) => {
  try {
    const { status, comment, employeeId, departmentId, priority, reportText, reportAttachments } = req.body;
    const appeal = await Appeal.findById(req.params.id);
    
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }
    
    const prevStatus = appeal.status;
    let targetStatus = status;
    if (targetStatus === 'Working') {
      targetStatus = 'In Progress';
    }

    if (targetStatus) {
      appeal.status = targetStatus;
    }
    
    if (employeeId) {
      appeal.assignedEmployee = employeeId;
      if (appeal.status === 'Received') {
        appeal.status = 'Assigned';
      }
    }
    
    if (departmentId) {
      appeal.department = departmentId;
    }
    
    if (priority) {
      appeal.priority = priority;
    }
    
    let executionSubmitted = false;
    if ((targetStatus === 'Completed' || targetStatus === 'Execution Submitted') && reportText) {
      appeal.executionReport = {
        text: reportText,
        attachments: reportAttachments || [],
        submittedAt: new Date()
      };
      appeal.status = 'Execution Submitted'; // Sent for Agency Review
      executionSubmitted = true;
    }

    await appeal.save();

    await AppealHistory.create({
      appeal: appeal._id,
      status: appeal.status,
      action: executionSubmitted ? 'Ijro hisoboti yuklandi' : 'Holat yangilandi',
      comment: comment || `Holat o'zgartirildi: ${prevStatus} → ${appeal.status}`,
      performedBy: {
        role: 'Employee',
        id: req.user._id,
        roleRef: 'Employee',
        name: req.user.fullName
      }
    });

    await logAudit({
      action: `Status updated to ${appeal.status}`,
      actorName: req.user.fullName,
      actorRole: req.user.role || 'Employee',
      actorId: req.user._id,
      appealId: appeal._id,
      appealNumber: appeal.appealNumber,
      prevState: prevStatus,
      newState: appeal.status,
      details: { comment, employeeId, departmentId }
    });
    
    // Trigger notification: execution submit bo'lsa — batafsil xabar + fayllar, aks holda oddiy bildirishnoma
    if (executionSubmitted) {
      await sendExecutionReportToCitizen(appeal);
    } else {
      await createStatusNotification(appeal, targetStatus || appeal.status);
    }
    
    logger.info(`Appeal ${appeal.appealNumber} updated by employee ${req.user.username} to ${status}`);
    
    res.status(200).json({ success: true, data: appeal });
  } catch (error) {
    logger.error(`updateAppealStatus error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Submit rating (Citizen only, status must be Completed)
exports.submitRating = async (req, res) => {
  try {
    const { score, problemSolved, employeeBehavior, responseQuality, speed, comment } = req.body;
    const appeal = await Appeal.findById(req.params.id);
    
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }
    
    if (appeal.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    if (appeal.status !== 'Completed' && appeal.status !== 'Closed') {
      return res.status(400).json({ success: false, message: 'Appeal must be Completed to submit rating' });
    }
    
    appeal.rating = {
      score,
      problemSolved,
      employeeBehavior,
      responseQuality,
      speed,
      comment: comment || ''
    };
    appeal.status = 'Closed'; // Auto-close appeal upon rating
    
    await appeal.save();
    
    await AppealHistory.create({
      appeal: appeal._id,
      status: 'Closed',
      action: 'Baho qoldirildi',
      comment: `Fuqaro ijroni baholadi: ${score}/5`,
      performedBy: {
        role: 'Citizen',
        id: req.user._id,
        roleRef: 'Citizen',
        name: `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.telegramId
      }
    });
    
    logger.info(`Citizen rated appeal ${appeal.appealNumber}: score ${score}`);
    
    res.status(200).json({ success: true, data: appeal });
  } catch (error) {
    logger.error(`submitRating error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error submitting rating' });
  }
};

// Submit Objection (Citizen only, status must be Completed)
exports.submitObjection = async (req, res) => {
  try {
    const { reason, attachments } = req.body;
    const appeal = await Appeal.findById(req.params.id);
    
    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }
    
    if (appeal.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    if (appeal.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Objection can only be submitted for Completed appeals' });
    }
    
    appeal.objection = {
      reason,
      attachments: attachments || [],
      status: 'Under Review',
      submittedAt: new Date()
    };
    appeal.status = 'In Progress'; // Move back to In Progress / Under Review status
    
    await appeal.save();
    
    await AppealHistory.create({
      appeal: appeal._id,
      status: 'In Progress',
      action: 'Objection Submitted',
      comment: `Objection reason: ${reason}`,
      performedBy: {
        role: 'Citizen',
        id: req.user._id,
        roleRef: 'Citizen',
        name: `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.telegramId
      }
    });
    
    // Create notifications for citizen
    await createStatusNotification(appeal, 'Under Review');
    
    logger.info(`Citizen submitted objection for ${appeal.appealNumber}`);
    
    res.status(200).json({ success: true, data: appeal });
  } catch (error) {
    logger.error(`submitObjection error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error submitting objection' });
  }
};

// Get all appeals for Employee/Agent/Moderator/Admin
exports.getEmployeeAppeals = async (req, res) => {
  try {
    let query = {};
    
    // Role based restrictions
    const globalRoles = ['Super Admin', 'Agency Admin', 'Agency Inspector', 'Auditor', 'Analyst', 'Admin'];
    if (globalRoles.includes(req.userRole)) {
      // Global roles can see all appeals across organizations
    } else if (req.user && req.user.organization) {
      // Organization scoped roles see appeals of their organization
      const orgId = req.user.organization._id || req.user.organization;
      query.organization = orgId;
    }
    
    // Apply filters from query params
    if (req.query.status) {
      if (req.query.status === 'Working') {
        query.status = { $in: ['Assigned', 'In Progress', 'Waiting Agency Review'] };
      } else {
        query.status = req.query.status;
      }
    }
    if (req.query.department) {
      if (req.query.department.match(/^[0-9a-fA-F]{24}$/)) {
        query.department = req.query.department;
      } else {
        const dep = await Department.findOne({
          $or: [
            { 'name.uz': req.query.department },
            { 'name.ru': req.query.department },
            { 'name.en': req.query.department }
          ]
        });
        if (dep) {
          query.department = dep._id;
        } else {
          // Fallback, if department not found, don't match any.
          query.department = new mongoose.Types.ObjectId();
        }
      }
    }
    if (req.query.assignedEmployee) {
      if (req.query.assignedEmployee.match(/^[0-9a-fA-F]{24}$/)) {
        query.assignedEmployee = req.query.assignedEmployee;
      }
    }
    
    const appeals = await Appeal.find(query)
      .populate('citizen')
      .populate('organization')
      .populate('department')
      .populate('assignedEmployee')
      .populate('attachments')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, count: appeals.length, data: appeals });
  } catch (error) {
    logger.error(`getEmployeeAppeals error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Submit Objection (Citizen action)
exports.submitObjection = async (req, res) => {
  try {
    const { reason, attachments } = req.body;
    const appeal = await Appeal.findById(req.params.id);

    if (!appeal) {
      return res.status(404).json({ success: false, message: 'Appeal not found' });
    }

    const prevStatus = appeal.status;
    appeal.status = 'Objection';
    appeal.objection = {
      reason: reason || 'Citizen expressed dissatisfaction with the execution result.',
      attachments: attachments || [],
      status: 'Under Review',
      submittedAt: new Date()
    };

    await appeal.save();

    await AppealHistory.create({
      appeal: appeal._id,
      status: 'Objection',
      action: 'Citizen Filed Objection',
      comment: reason || 'Citizen filed objection to resolution',
      performedBy: {
        role: 'Citizen',
        id: appeal.citizen,
        name: 'Citizen'
      }
    });

    await logAudit({
      action: 'Citizen Filed Objection',
      actorName: 'Citizen',
      actorRole: 'Citizen',
      appealId: appeal._id,
      appealNumber: appeal.appealNumber,
      prevState: prevStatus,
      newState: 'Objection',
      details: { reason }
    });

    res.status(200).json({ success: true, data: appeal });
  } catch (error) {
    logger.error(`submitObjection error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

