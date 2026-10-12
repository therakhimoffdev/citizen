const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    uz: { type: String, required: true },
    ru: { type: String, required: true },
    en: { type: String, required: true }
  },
  code: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Organization', organizationSchema);
