const mongoose = require('mongoose');

const stockReceiptItemSchema = new mongoose.Schema({
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

const stockReceiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: [true, 'Receipt number is required'],
    unique: true,
    trim: true
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: [true, 'Society is required']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false
  },
  supplierCode: {
    type: String,
    trim: true
  },
  supplierName: {
    type: String,
    trim: true
  },
  receiptDate: {
    type: Date,
    required: [true, 'Receipt date is required'],
    default: Date.now
  },
  financialPeriod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialPeriod'
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  invoiceDate: {
    type: Date
  },
  deliveryNote: {
    type: String,
    trim: true
  },
  items: [stockReceiptItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  totalQuantity: {
    type: Number,
    default: 0
  },
  stockBalance: {
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
// Note: receiptNumber has unique: true in schema which creates index automatically
stockReceiptSchema.index({ society: 1, receiptDate: -1 });
stockReceiptSchema.index({ supplier: 1, receiptDate: -1 });
stockReceiptSchema.index({ status: 1, receiptDate: -1 });
stockReceiptSchema.index({ financialPeriod: 1 });
stockReceiptSchema.index({ isActive: 1, createdAt: -1 });

// Pre-save middleware to calculate totals
stockReceiptSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => sum + (item.extendedAmount || 0), 0);
    this.totalQuantity = this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
  next();
});

// Static method to generate receipt number in format 26MMXXX (last 2 digits of year + month + 3-digit sequence)
// Example: 2601001 (26 = 2026, 01 = January, 001 = sequence)
stockReceiptSchema.statics.generateReceiptNumber = async function(receiptDate) {
  const date = new Date(receiptDate);
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year (26)
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so add 1
  
  // Find the highest receipt number with the current year-month prefix
  const regex = new RegExp(`^${year}${month}`);
  let lastReceipt = await this.findOne({
    receiptNumber: regex,
    isActive: true
  })
  .sort({ receiptNumber: -1 })
  .select('receiptNumber');

  // If no receipt found with current prefix, check if there are any with previous months
  // that we need to skip over
  let sequence = 1;
  if (lastReceipt) {
    // Extract the numeric portion after the prefix (first 4 characters: YYMM)
    const numericPart = lastReceipt.receiptNumber.substring(4);
    sequence = parseInt(numericPart, 10) + 1;
  }

  // Generate the new receipt number
  let newReceiptNumber = `${year}${month}${sequence.toString().padStart(3, '0')}`;

  // Check if this number already exists and find the next available one
  let existingReceipt = await this.findOne({
    receiptNumber: newReceiptNumber,
    isActive: true
  });

  while (existingReceipt) {
    sequence++;
    newReceiptNumber = `${year}${month}${sequence.toString().padStart(3, '0')}`;
    existingReceipt = await this.findOne({
      receiptNumber: newReceiptNumber,
      isActive: true
    });
  }

  // Format: YY + MM + 3-digit sequence (e.g., 2601001)
  return newReceiptNumber;
};

// Method to update stock balances (TWS logic)
stockReceiptSchema.methods.updateStockBalances = async function() {
  const StockBalance = mongoose.model('StockBalance');

  console.log('Updating stock balances for receipt:', this.receiptNumber);
  console.log('Society:', this.society);
  console.log('Items:', this.items.length);

  for (const item of this.items) {
    console.log('Processing item:', item.productCode, 'quantity:', item.quantity);
    
    // Find or create stock balance record
    let stockBalance = await StockBalance.findOne({
      society: this.society,
      product: item.product,
      isActive: true
    });

    if (!stockBalance) {
      console.log('Creating new stock balance for product:', item.productCode);
      stockBalance = new StockBalance({
        society: this.society,
        product: item.product,
        productCode: item.productCode,
        productName: item.productName,
        unit: item.unit,
        quantityOnHand: 0,
        lastReceiptDate: this.receiptDate,
        lastReceiptQuantity: item.quantity
      });
    }

    // Update balance using TWS logic (postedxx = "NO" means not posted yet)
    const previousQty = stockBalance.quantityOnHand;
    stockBalance.quantityOnHand += item.quantity;
    stockBalance.lastReceiptDate = this.receiptDate;
    stockBalance.lastReceiptQuantity = item.quantity;

    await stockBalance.save();
    console.log('Stock balance updated:', item.productCode, 'from', previousQty, 'to', stockBalance.quantityOnHand);
  }
};

// Method to reverse stock balances (for rejection/cancellation)
stockReceiptSchema.methods.reverseStockBalances = async function() {
  const StockBalance = mongoose.model('StockBalance');

  for (const item of this.items) {
    const stockBalance = await StockBalance.findOne({
      society: this.society,
      product: item.product,
      isActive: true
    });

    if (stockBalance) {
      stockBalance.quantityOnHand -= item.quantity;
      await stockBalance.save();
    }
  }
};

module.exports = mongoose.model('StockReceipt', stockReceiptSchema);
