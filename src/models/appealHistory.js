const mongoose = require('mongoose');

const appealHistorySchema = new mongoose.Schema({
  appeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appeal',
    required: true
  },
  status: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true // e.g. "Status Changed", "Objection Submitted", "Rating Submitted", "Employee Assigned"
  },
  comment: {
    type: String,
    default: ''
  },
  performedBy: {
    role: {
      type: String,
      enum: ['Citizen', 'Employee', 'System'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'performedBy.roleRef'
    },
    roleRef: {
      type: String,
      enum: ['Citizen', 'Employee']
    },
    name: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AppealHistory', appealHistorySchema);
