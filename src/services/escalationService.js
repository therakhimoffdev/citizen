const Appeal = require('../models/appeal');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');

/**
 * Periodically check appeals breaching SLA deadline (15 days)
 * and update their escalation level automatically.
 */
exports.checkEscalations = async () => {
  try {
    const now = new Date();
    // Find active non-completed appeals where deadline < now
    const overdueAppeals = await Appeal.find({
      status: { $nin: ['Completed', 'Closed', 'Rejected'] },
      deadline: { $lt: now },
      'escalation.breachNoticeSent': { $ne: true }
    });

    for (const appeal of overdueAppeals) {
      appeal.escalation = {
        level: 'Agency', // Escalated directly to Agency Oversight
        escalatedAt: now,
        breachNoticeSent: true
      };
      await appeal.save();

      await logAudit({
        action: 'SLA Deadline Breached — Escalated to Agency',
        actorName: 'Escalation Engine',
        actorRole: 'System',
        appealId: appeal._id,
        appealNumber: appeal.appealNumber,
        prevState: appeal.status,
        newState: appeal.status,
        details: { deadline: appeal.deadline }
      });
    }

    if (overdueAppeals.length > 0) {
      logger.info(`Escalation Engine: Escalated ${overdueAppeals.length} overdue appeals to Agency Inspectorate.`);
    }
  } catch (err) {
    logger.error(`checkEscalations error: ${err.message}`);
  }
};
