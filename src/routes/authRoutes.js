const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/telegram', authController.telegramAuth);
router.post('/employee/login', authController.employeeLogin);

module.exports = router;
