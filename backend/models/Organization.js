const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Organization code is required'],
    trim: true,
    uppercase: true,
    minlength: [2, 'Organization code must be at least 2 characters long'],
    maxlength: [10, 'Organization code cannot exceed 10 characters']
  },
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [255, 'Description cannot exceed 255 characters']
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

// Indexes
organizationSchema.index({ code: 1, society: 1 }, { unique: true });
organizationSchema.index({ name: 1 });
organizationSchema.index({ society: 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ createdAt: -1 });
organizationSchema.index({ updatedAt: -1 });

// Pre-save middleware to set updatedBy
organizationSchema.pre('save', function(next) {
  if (this.isModified() && this._updatedBy) {
    this.updatedBy = this._updatedBy;
  }
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
