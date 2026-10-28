const express = require('express');
const router = express.Router();
const appealController = require('../controllers/appealController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/organizations', protect, appealController.getOrganizations);
router.post('/', protect, authorize('Citizen'), appealController.createAppeal);
router.get('/', protect, authorize('Citizen'), appealController.getMyAppeals);
router.get('/employee', protect, appealController.getEmployeeAppeals);
router.get('/search', protect, appealController.searchAppeal);
router.get('/:id', protect, appealController.getAppealById);
router.put('/:id/status', protect, appealController.updateAppealStatus);
router.post('/:id/rate', protect, appealController.submitRating);
router.post('/:id/objection', protect, appealController.submitObjection);
router.post('/:id/object', protect, appealController.submitObjection);

module.exports = router;
