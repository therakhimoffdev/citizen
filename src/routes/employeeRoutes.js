const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('Super Admin', 'Agency Admin', 'Agency Inspector', 'Organization Admin', 'Leader', 'Operator', 'Agent', 'Moderator', 'Admin'), employeeController.getEmployees);
router.post('/', protect, authorize('Super Admin', 'Agency Admin', 'Organization Admin', 'Moderator', 'Admin'), employeeController.createEmployee);
router.delete('/:id', protect, authorize('Super Admin', 'Agency Admin', 'Organization Admin', 'Moderator', 'Admin'), employeeController.deleteEmployee);

module.exports = router;
