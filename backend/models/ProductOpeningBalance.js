const mongoose = require('mongoose');

const productOpeningBalanceSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreInformation',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  bulkPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  bulkQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  extended: {
    type: Number,
    default: 0,
    min: 0
  },
  fraction: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  financialPeriod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialPeriod',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
productOpeningBalanceSchema.index({ society: 1, store: 1, product: 1 });
productOpeningBalanceSchema.index({ society: 1, financialPeriod: 1 });
productOpeningBalanceSchema.index({ society: 1, date: 1 });

// Virtual for total value
productOpeningBalanceSchema.virtual('totalValue').get(function() {
  return (this.price * this.quantity) + (this.bulkPrice * this.bulkQuantity);
});

// Ensure virtual fields are serialized
productOpeningBalanceSchema.set('toJSON', { virtuals: true });
productOpeningBalanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ProductOpeningBalance', productOpeningBalanceSchema);
