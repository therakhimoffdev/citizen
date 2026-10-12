const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('Agent', 'Moderator', 'Admin'), employeeController.getEmployees);
router.post('/', protect, authorize('Moderator', 'Admin'), employeeController.createEmployee);
router.delete('/:id', protect, authorize('Moderator', 'Admin'), employeeController.deleteEmployee);

module.exports = router;
