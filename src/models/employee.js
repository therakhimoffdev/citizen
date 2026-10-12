const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: [
      'Super Admin',
      'Agency Admin',
      'Agency Inspector',
      'Organization Admin',
      'Leader',
      'Operator',
      'Agent',
      'Auditor',
      'Analyst',
      'Admin',
      'Moderator'
    ],
    default: 'Agent'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
