const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  score: { type: Number, min: 1, max: 5 },
  problemSolved: { type: Boolean },
  employeeBehavior: { type: Number, min: 1, max: 5 },
  responseQuality: { type: Number, min: 1, max: 5 },
  speed: { type: Number, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, { _id: false });

const objectionSchema = new mongoose.Schema({
  reason: { type: String, required: true },
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
  status: {
    type: String,
    enum: ['Under Review', 'Approved', 'Rejected'],
    default: 'Under Review'
  },
  response: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const appealSchema = new mongoose.Schema({
  appealNumber: {
    type: String,
    unique: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false
  },
  category: {
    type: String,
    required: false
  },
  subject: {
    type: String,
    required: false,
    maxlength: 150
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  status: {
    type: String,
    enum: [
      'Received',
      'Accepted',
      'Assigned',
      'In Progress',
      'Waiting for Execution',
      'Execution Submitted',
      'Waiting Agency Review',
      'Agency Review',
      'Approved',
      'Completed',
      'Returned',
      'Rejected',
      'Objection',
      'Closed'
    ],
    default: 'Received'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  deadline: {
    type: Date
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  rating: {
    type: ratingSchema,
    default: null
  },
  objection: {
    type: objectionSchema,
    default: null
  },
  executionReport: {
    text: { type: String },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
    submittedAt: { type: Date }
  },
  agencyReview: {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    result: { type: String, enum: ['Approved', 'Returned'] },
    feedbackText: { type: String, default: '' },
    reviewedAt: { type: Date }
  },
  escalation: {
    level: { type: String, enum: ['District', 'Regional', 'Ministry', 'Agency'], default: 'District' },
    escalatedAt: { type: Date },
    breachNoticeSent: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Auto-generate unique appeal number pre-save (format: APL-2026-000001)
appealSchema.pre('save', async function(next) {
  if (!this.appealNumber) {
    const year = new Date().getFullYear();
    // Count documents created this year to increment the counter
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfYear, $lte: endOfYear }
    });
    
    const sequence = String(count + 1).padStart(6, '0');
    this.appealNumber = `APL-${year}-${sequence}`;
  }
  if (!this.deadline) {
    this.deadline = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // Default 15 days deadline
  }
  next();
});

module.exports = mongoose.model('Appeal', appealSchema);
