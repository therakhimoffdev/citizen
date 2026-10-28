const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/pending-reviews', protect, authorize('Super Admin', 'Agency Admin', 'Agency Inspector'), agencyController.getPendingReviews);
router.post('/review/:id', protect, authorize('Super Admin', 'Agency Admin', 'Agency Inspector'), agencyController.reviewExecution);
router.get('/objections', protect, authorize('Super Admin', 'Agency Admin', 'Agency Inspector'), agencyController.getObjections);
router.post('/objection/:id/resolve', protect, authorize('Super Admin', 'Agency Admin', 'Agency Inspector'), agencyController.resolveObjection);

module.exports = router;
