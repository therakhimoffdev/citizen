const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  appeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appeal',
    required: true
  },
  status: {
    type: String,
    required: true
  },
  changedBy: {
    role: { type: String, enum: ['Citizen', 'Employee', 'System'], required: true },
    id: { type: mongoose.Schema.Types.ObjectId }
  },
  comment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StatusHistory', statusHistorySchema);
