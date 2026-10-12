const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/upload', protect, fileController.uploadMiddleware, fileController.uploadFile);

module.exports = router;
