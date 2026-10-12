const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/pending-reviews', protect, agencyController.getPendingReviews);
router.post('/review/:id', protect, agencyController.reviewExecution);
router.get('/objections', protect, agencyController.getObjections);
router.post('/objection/:id/resolve', protect, agencyController.resolveObjection);

module.exports = router;
