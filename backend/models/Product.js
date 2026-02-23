const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
    enum: ['FOOD', 'BEVERAGE', 'HOUSEHOLD', 'PERSONAL_CARE', 'OTHER'],
    default: 'OTHER'
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  hsnCode: {
    type: String,
    trim: true
  },
  gstRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  purchasePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  sellingPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  mrp: {
    type: Number,
    default: 0,
    min: 0
  },
  bulkPrice: {
    type: Number,
    default: 0,
    min: 0
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
  openingStock: {
    type: Number,
    default: 0,
    min: 0
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreInformation'
  },
  glAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DefaultParameter'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEssential: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date
  },
  batchNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
productSchema.index({ society: 1, code: 1 });
productSchema.index({ society: 1, name: 1 });
productSchema.index({ society: 1, category: 1 });
productSchema.index({ society: 1, supplier: 1 });
productSchema.index({ society: 1, store: 1 });
productSchema.index({ society: 1, barcode: 1 });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.purchasePrice === 0) return 0;
  return ((this.sellingPrice - this.purchasePrice) / this.purchasePrice) * 100;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'OUT_OF_STOCK';
  if (this.currentStock <= this.reorderPoint) return 'LOW_STOCK';
  if (this.currentStock >= this.maximumStock) return 'OVER_STOCK';
  return 'IN_STOCK';
});

module.exports = mongoose.model('Product', productSchema);
