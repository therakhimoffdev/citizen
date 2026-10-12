const AuditLog = require('../models/auditLog');
const logger = require('./logger');

/**
 * Record an immutable audit log entry
 */
exports.logAudit = async ({
  action,
  actorName,
  actorRole = 'System',
  actorId = '',
  appealId = null,
  appealNumber = '',
  prevState = '',
  newState = '',
  details = {},
  ipAddress = '127.0.0.1'
}) => {
  try {
    await AuditLog.create({
      action,
      actorName: actorName || 'System',
      actorRole,
      actorId: actorId ? String(actorId) : '',
      appealId,
      appealNumber,
      prevState,
      newState,
      details,
      ipAddress
    });
  } catch (err) {
    logger.error(`AuditLog creation failed: ${err.message}`);
  }
};
