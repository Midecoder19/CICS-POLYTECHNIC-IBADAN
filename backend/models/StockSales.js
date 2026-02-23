const mongoose = require('mongoose');

const stockSalesItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  productCode: {
    type: String,
    required: [true, 'Product code is required'],
    trim: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  extendedAmount: {
    type: Number,
    default: 0
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  remarks: {
    type: String,
    trim: true
  }
}, { _id: false });

const stockSalesSchema = new mongoose.Schema({
  sivNo: {
    type: String,
    required: [true, 'SIV No is required'],
    unique: true,
    trim: true
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: [true, 'Society is required']
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreInformation',
    required: [true, 'Store is required']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  financialPeriod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialPeriod'
  },
  memberNo: {
    type: String,
    trim: true,
    maxlength: [50, 'Member No cannot exceed 50 characters']
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  discountRate: {
    type: Number,
    min: [0, 'Discount rate cannot be negative'],
    max: [100, 'Discount rate cannot exceed 100%'],
    default: 0
  },
  vatRate: {
    type: Number,
    min: [0, 'VAT rate cannot be negative'],
    max: [100, 'VAT rate cannot exceed 100%'],
    default: 0
  },
  discountAmount: {
    type: Number,
    min: [0, 'Discount amount cannot be negative'],
    default: 0
  },
  vatAmount: {
    type: Number,
    min: [0, 'VAT amount cannot be negative'],
    default: 0
  },
  items: [stockSalesItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  totalQuantity: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  remarks: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
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
stockSalesSchema.index({ society: 1, issueDate: -1 });
stockSalesSchema.index({ status: 1, issueDate: -1 });
stockSalesSchema.index({ financialPeriod: 1 });
stockSalesSchema.index({ isActive: 1, createdAt: -1 });

// Pre-save middleware to calculate totals
stockSalesSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate extended amounts for items
    this.items = this.items.map(item => ({
      ...item,
      extendedAmount: item.quantity * item.unitPrice
    }));

    // Calculate totals
    this.totalAmount = this.items.reduce((sum, item) => sum + (item.extendedAmount || 0), 0);
    this.totalQuantity = this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Calculate VAT and discount amounts
    const subtotal = this.totalAmount;
    this.discountAmount = (subtotal * this.discountRate) / 100;
    this.vatAmount = ((subtotal - this.discountAmount) * this.vatRate) / 100;
  }

  // Set updatedBy if modified
  if (this.isModified() && this._updatedBy) {
    this.updatedBy = this._updatedBy;
  }

  next();
});

// Virtual for total items count
stockSalesSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Ensure virtual fields are serialized
stockSalesSchema.set('toJSON', { virtuals: true });
stockSalesSchema.set('toObject', { virtuals: true });

// Static method to generate SIV No
stockSalesSchema.statics.generateSivNo = async function(societyCode, issueDate) {
  const date = new Date(issueDate);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  // Find the last sale for this society and month
  const lastSale = await this.findOne({
    sivNo: new RegExp(`^${societyCode}${year}${month}`),
    isActive: true
  })
  .sort({ sivNo: -1 })
  .select('sivNo');

  let sequence = 1;
  if (lastSale) {
    const lastSequence = parseInt(lastSale.sivNo.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${societyCode}${year}${month}${sequence.toString().padStart(4, '0')}`;
};

// Method to update stock balances (TWS logic)
stockSalesSchema.methods.updateStockBalances = async function() {
  const StockBalance = mongoose.model('StockBalance');

  for (const item of this.items) {
    // Find stock balance record
    let stockBalance = await StockBalance.findOne({
      society: this.society,
      product: item.product,
      isActive: true
    });

    if (stockBalance) {
      // Update balance using TWS logic (subtract quantity for sales)
      stockBalance.quantityOnHand -= item.quantity;
      stockBalance.lastSaleDate = this.issueDate;
      stockBalance.lastSaleQuantity = item.quantity;

      await stockBalance.save();
    }
  }
};

// Method to reverse stock balances (for rejection/cancellation)
stockSalesSchema.methods.reverseStockBalances = async function() {
  const StockBalance = mongoose.model('StockBalance');

  for (const item of this.items) {
    const stockBalance = await StockBalance.findOne({
      society: this.society,
      product: item.product,
      isActive: true
    });

    if (stockBalance) {
      stockBalance.quantityOnHand += item.quantity;
      await stockBalance.save();
    }
  }
};

module.exports = mongoose.model('StockSales', stockSalesSchema);
