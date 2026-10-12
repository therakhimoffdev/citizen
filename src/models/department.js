const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  name: {
    uz: { type: String, required: true },
    ru: { type: String, required: true },
    en: { type: String, required: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
