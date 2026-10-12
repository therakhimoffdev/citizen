const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileId: {
    type: String, // Telegram file_id
    default: ''
  },
  fileType: {
    type: String,
    enum: ['photo', 'video', 'document', 'audio', 'voice'],
    required: true
  },
  fileUrl: {
    type: String, // URL/Path to access the file
    required: true
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attachment', attachmentSchema);
