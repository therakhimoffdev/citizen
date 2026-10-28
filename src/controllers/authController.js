const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Citizen = require('../models/citizen');
const Employee = require('../models/employee');
const AuditLog = require('../models/auditLog');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/auditLogger');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Citizen authentication via Telegram info
exports.telegramAuth = async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, language } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ success: false, message: 'telegramId is required' });
    }
    
    let citizen = await Citizen.findOne({ telegramId });
    let isNew = false;
    
    if (!citizen) {
      isNew = true;
      citizen = await Citizen.create({
        telegramId,
        username: username || '',
        firstName: firstName || '',
        lastName: lastName || '',
        language: language || 'uz'
      });
      
      logger.info(`New citizen registered: ${telegramId} (${firstName} ${lastName})`);
      
      await logAudit({
        action: 'CITIZEN_REGISTERED',
        actorName: `${firstName} ${lastName}`.trim() || 'Citizen',
        actorRole: 'Citizen',
        actorId: citizen._id,
        details: { firstName, lastName, username }
      });
    } else {
      // Update profile details if they changed
      let updated = false;
      if (username && citizen.username !== username) { citizen.username = username; updated = true; }
      if (firstName && citizen.firstName !== firstName) { citizen.firstName = firstName; updated = true; }
      if (lastName && citizen.lastName !== lastName) { citizen.lastName = lastName; updated = true; }
      
      if (updated) {
        await citizen.save();
      }
    }
    
    const token = generateToken(citizen._id, 'Citizen');
    
    res.status(200).json({
      success: true,
      token,
      citizen,
      isNew
    });
  } catch (error) {
    logger.error(`telegramAuth error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error during auth' });
  }
};

// Employee credentials login
exports.employeeLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    
    const employee = await Employee.findOne({ username }).populate('organization department');
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(employee._id, employee.role);
    
    logger.info(`Employee logged in: ${username}`);
    
    await logAudit({
      action: 'EMPLOYEE_LOGIN',
      actorName: employee.fullName,
      actorRole: employee.role,
      actorId: employee._id,
      details: { role: employee.role }
    });
    
    res.status(200).json({
      success: true,
      token,
      employee: {
        id: employee._id,
        username: employee.username,
        fullName: employee.fullName,
        role: employee.role,
        organization: employee.organization,
        department: employee.department
      }
    });
  } catch (error) {
    logger.error(`employeeLogin error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
