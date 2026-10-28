const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('Super Admin', 'Agency Admin', 'Agency Inspector'), auditController.getAuditLogs);
router.get('/appeal/:appealNumber', protect, auditController.getAppealAuditLogs);

module.exports = router;
