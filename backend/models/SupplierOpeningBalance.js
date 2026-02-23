const mongoose = require('mongoose');

const supplierOpeningBalanceSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: false
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
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

// Indexes for performance
supplierOpeningBalanceSchema.index({ society: 1, supplier: 1 });
supplierOpeningBalanceSchema.index({ society: 1, date: 1 });
supplierOpeningBalanceSchema.index({ supplier: 1, date: 1 });

module.exports = mongoose.model('SupplierOpeningBalance', supplierOpeningBalanceSchema);
