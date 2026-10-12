const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true
  },
  appeal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appeal'
  },
  type: {
    type: String,
    enum: ['Accepted', 'Assigned', 'StatusChanged', 'MessageReceived', 'Completed', 'Returned', 'ObjectionProcessed'],
    required: true
  },
  message: {
    uz: { type: String, required: true },
    ru: { type: String, required: true },
    en: { type: String, required: true }
  },
  isSent: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
