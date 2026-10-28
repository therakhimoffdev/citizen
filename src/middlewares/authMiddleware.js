const jwt = require('jsonwebtoken');
const Citizen = require('../models/citizen');
const Employee = require('../models/employee');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_national_appeals_system_2026');
      
      // Determine if token is for Citizen or Employee
      if (decoded.role === 'Citizen') {
        req.user = await Citizen.findById(decoded.id);
        req.userRole = 'Citizen';
      } else {
        req.user = await Employee.findById(decoded.id).populate('organization department');
        req.userRole = decoded.role; // e.g. Agent, Moderator, Admin
      }
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      
      next();
    } catch (error) {
      logger.error(`Auth Middleware error: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.userRole} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
