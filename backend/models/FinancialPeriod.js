const mongoose = require('mongoose');

const financialPeriodSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  periodNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 24
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure dates don't overlap
financialPeriodSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

// Index for efficient queries
financialPeriodSchema.index({ society: 1, isActive: 1 });
financialPeriodSchema.index({ society: 1, year: 1 });
financialPeriodSchema.index({ society: 1, isCurrent: 1 });
financialPeriodSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('FinancialPeriod', financialPeriodSchema);