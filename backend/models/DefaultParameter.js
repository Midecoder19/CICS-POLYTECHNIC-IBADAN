const mongoose = require('mongoose');

const defaultParameterSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: [true, 'Society is required']
  },
  organization: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    trim: true
  },
  store: {
    type: String,
    trim: true
  },
  date: {
    type: Date
  },
  bank: {
    type: String,
    trim: true
  },
  financialPeriodStart: {
    type: Date
  },
  financialPeriodEnd: {
    type: Date
  },
  cashAccount: {
    type: String,
    trim: true
  },
  bankAccount: {
    type: String,
    trim: true
  },
  payComponents: {
    type: String,
    trim: true
  },
  glBank: {
    type: String,
    trim: true
  },
  savings: {
    type: String,
    trim: true
  },
  creditorAccount: {
    type: String,
    trim: true
  },
  debtorAccount: {
    type: String,
    trim: true
  },
  processingPriority: {
    type: String,
    trim: true
  },
  appStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
defaultParameterSchema.index({ society: 1 }, { unique: true });
defaultParameterSchema.index({ isActive: 1 });

module.exports = mongoose.model('DefaultParameter', defaultParameterSchema);
