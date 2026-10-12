const mongoose = require('mongoose');

const appealMessageSchema = new mongoose.Schema({
  appeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appeal',
    required: true
  },
  sender: {
    role: {
      type: String,
      enum: ['Citizen', 'Employee'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'sender.roleRef',
      required: true
    },
    roleRef: {
      type: String,
      enum: ['Citizen', 'Employee'],
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  text: {
    type: String,
    default: ''
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('AppealMessage', appealMessageSchema);
