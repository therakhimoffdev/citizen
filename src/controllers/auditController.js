const AuditLog = require('../models/auditLog');
const logger = require('../utils/logger');

// Get paginated audit logs (Admin & Inspector & Auditor)
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [
        { action: regex },
        { actorName: regex },
        { appealNumber: regex }
      ];
    }

    if (req.query.role) {
      query.actorRole = req.query.role;
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (error) {
    logger.error(`getAuditLogs error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get audit logs for a specific appeal
exports.getAppealAuditLogs = async (req, res) => {
  try {
    const { appealNumber } = req.params;
    const logs = await AuditLog.find({
      $or: [
        { appealNumber },
        { appealId: req.params.appealId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error(`getAppealAuditLogs error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
