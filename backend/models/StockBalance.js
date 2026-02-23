const mongoose = require('mongoose');

const stockBalanceSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: [true, 'Society is required']
  },
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
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  quantityOnHand: {
    type: Number,
    default: 0,
    min: [0, 'Quantity on hand cannot be negative']
  },
  lastReceiptDate: {
    type: Date
  },
  lastReceiptQuantity: {
    type: Number,
    default: 0
  },
  lastIssueDate: {
    type: Date
  },
  lastIssueQuantity: {
    type: Number,
    default: 0
  },
  reorderPoint: {
    type: Number,
    default: 0
  },
  minimumStock: {
    type: Number,
    default: 0
  },
  maximumStock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
stockBalanceSchema.index({ society: 1, product: 1 }, { unique: true });
stockBalanceSchema.index({ society: 1, productCode: 1 });
stockBalanceSchema.index({ society: 1, quantityOnHand: -1 });
stockBalanceSchema.index({ isActive: 1 });

// Method to get total stock balance for a society
stockBalanceSchema.statics.getTotalStockBalance = async function(societyId) {
  const result = await this.aggregate([
    {
      $match: {
        society: new mongoose.Types.ObjectId(societyId),
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$quantityOnHand' }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalQuantity : 0;
};

// Method to get stock balance for a specific product
stockBalanceSchema.statics.getProductStockBalance = async function(societyId, productId) {
  const stockBalance = await this.findOne({
    society: societyId,
    product: productId,
    isActive: true
  });

  return stockBalance ? stockBalance.quantityOnHand : 0;
};

module.exports = mongoose.model('StockBalance', stockBalanceSchema);
