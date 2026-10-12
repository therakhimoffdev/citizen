const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, messageController.sendMessage);
router.get('/appeal/:appealId', protect, messageController.getMessages);

module.exports = router;
