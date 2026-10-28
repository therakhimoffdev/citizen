const Employee = require('../models/employee');
const Department = require('../models/department');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Get all employees of organization (or all for Super Admin)
exports.getEmployees = async (req, res) => {
  try {
    let query = {};
    const globalRoles = ['Super Admin', 'Agency Admin', 'Agency Inspector'];
    if (!globalRoles.includes(req.userRole)) {
      const orgId = req.user?.organization?._id || req.user?.organization;
      if (orgId) {
        query.organization = orgId;
      } else {
        query.organization = new mongoose.Types.ObjectId();
      }
    }
    
    const employees = await Employee.find(query)
      .populate('organization department')
      .select('-password');
      
    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    logger.error(`getEmployees error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const { username, password, fullName, role, departmentId } = req.body;
    
    if (!username || !password || !fullName || !role || !departmentId) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }
    
    const existing = await Employee.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    let organizationId = req.user.organization?._id || req.user.organization;
    const globalRoles = ['Super Admin', 'Agency Admin'];
    if (globalRoles.includes(req.userRole) && req.body.organizationId) {
      organizationId = req.body.organizationId;
    }
    
    const employee = await Employee.create({
      username,
      password: hashedPassword,
      fullName,
      role: role || 'Agent',
      organization: organizationId,
      department: departmentId
    });
    
    res.status(201).json({ 
      success: true, 
      data: {
        _id: employee._id,
        username: employee.username,
        fullName: employee.fullName,
        role: employee.role,
        organization: employee.organization,
        department: employee.department
      } 
    });
  } catch (error) {
    logger.error(`createEmployee error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    // Ensure they belong to same organization unless global admin
    const globalRoles = ['Super Admin', 'Agency Admin'];
    if (!globalRoles.includes(req.userRole)) {
      const userOrgId = (req.user?.organization?._id || req.user?.organization || '').toString();
      const empOrgId = (employee.organization?._id || employee.organization || '').toString();
      if (!userOrgId || userOrgId !== empOrgId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    logger.error(`deleteEmployee error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
