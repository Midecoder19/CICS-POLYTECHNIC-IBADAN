const mongoose = require('mongoose');

const essentialCommoditySchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: false
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['FOOD', 'MEDICINE', 'HOUSEHOLD', 'OTHER'],
    default: 'OTHER'
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  minimumStock: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumStock: {
    type: Number,
    default: 0,
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  glAccount: {
    code: {
      type: String,
      trim: true,
      maxlength: 20
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
essentialCommoditySchema.index({ society: 1, code: 1 });
essentialCommoditySchema.index({ society: 1, name: 1 });
essentialCommoditySchema.index({ society: 1, category: 1 });

// Virtual for current stock (calculated field)
essentialCommoditySchema.virtual('currentStock').get(function() {
  // This would be calculated from stock transactions
  return 0;
});

module.exports = mongoose.model('EssentialCommodity', essentialCommoditySchema);
