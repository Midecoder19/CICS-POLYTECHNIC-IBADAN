const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Society code is required'],
    trim: true,
    uppercase: true,
    minlength: [2, 'Society code must be at least 2 characters long'],
    maxlength: [10, 'Society code cannot exceed 10 characters']
  },
  name: {
    type: String,
    required: [true, 'Society name is required'],
    trim: true,
    maxlength: [100, 'Society name cannot exceed 100 characters']
  },
  street: {
    type: String,
    trim: true,
    maxlength: [100, 'Street address cannot exceed 100 characters']
  },
  town: {
    type: String,
    trim: true,
    maxlength: [50, 'Town cannot exceed 50 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters'],
    default: 'Nigeria'
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.*/, 'Website must be a valid URL']
  },
  bank: {
    type: String,
    trim: true,
    maxlength: [100, 'Bank name cannot exceed 100 characters']
  },
  bankTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Bank title cannot exceed 100 characters']
  },
  smtpPassword: {
    type: String,
    trim: true,
    maxlength: [100, 'SMTP password cannot exceed 100 characters']
  },
  logo: {
    type: String, // Base64 encoded image or URL
    trim: true
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

// Indexes for better performance
societySchema.index({ name: 1 });
societySchema.index({ isActive: 1 });
societySchema.index({ code: 1, isActive: 1 }, { unique: true });

// Pre-save middleware to set updatedBy
societySchema.pre('save', function(next) {
  if (this.isModified() && this._updatedBy) {
    this.updatedBy = this._updatedBy;
  }
  next();
});

module.exports = mongoose.model('Society', societySchema);