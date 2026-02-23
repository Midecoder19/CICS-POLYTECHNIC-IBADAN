const mongoose = require('mongoose');

const storeInformationSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: false
  },
  storeCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20,
    match: /^[A-Z0-9]+$/
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  glAccount: {
    code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  glStockAdj: {
    code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
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

// Index for efficient queries
storeInformationSchema.index({ society: 1, isActive: 1 });
storeInformationSchema.index({ 'glAccount.code': 1 });
storeInformationSchema.index({ 'glStockAdj.code': 1 });

module.exports = mongoose.model('StoreInformation', storeInformationSchema);