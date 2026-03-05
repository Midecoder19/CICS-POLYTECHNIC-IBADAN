const mongoose = require('mongoose');
const StockReceipt = require('../models/StockReceipt');
const Society = require('../models/Society');
const Supplier = require('../models/Supplier');
const FinancialPeriod = require('../models/FinancialPeriod');

// @desc    Get all stock receipts
// @route   GET /api/common/stock-receipts
// @access  Private (Admin/Staff)
const getStockReceipts = async (req, res) => {
  try {
    const {
      society,
      supplier,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const query = { isActive: true };

    if (society) {
      query.society = society;
    }

    if (supplier) {
      query.supplier = supplier;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.receiptDate = {};
      if (startDate) {
        query.receiptDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.receiptDate.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const receipts = await StockReceipt.find(query)
      .populate('society', 'code name')
      .populate('supplier', 'code name')
      .populate('financialPeriod', 'periodNumber description')
      .populate('createdBy', 'username firstName lastName')
      .sort({ receiptDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockReceipt.countDocuments(query);

    res.json({
      success: true,
      count: receipts.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: receipts
    });
  } catch (error) {
    console.error('Get stock receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stock receipts'
    });
  }
};

// @desc    Get single stock receipt
// @route   GET /api/common/stock-receipts/:id
// @access  Private (Admin/Staff)
const getStockReceipt = async (req, res) => {
  try {
    const receipt = await StockReceipt.findById(req.params.id)
      .populate('society', 'code name')
      .populate('supplier', 'code name')
      .populate('financialPeriod', 'periodNumber description startDate endDate')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Stock receipt not found'
      });
    }

    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Get stock receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stock receipt'
    });
  }
};

// @desc    Create stock receipt
// @route   POST /api/common/stock-receipts
// @access  Private (Admin/Staff)
const createStockReceipt = async (req, res) => {
  try {
    const receiptData = { ...req.body };

    // Always generate a fresh receipt number to avoid race conditions
    // The frontend may send a receiptNumber, but we should generate our own
    receiptData.receiptNumber = await StockReceipt.generateReceiptNumber(new Date(receiptData.receiptDate));

    // Validate supplier if provided
    if (receiptData.supplier) {
      const supplier = await Supplier.findById(receiptData.supplier);
      if (!supplier) {
        return res.status(400).json({
          success: false,
          message: 'Invalid supplier'
        });
      }
      // Set supplier details
      receiptData.supplierCode = supplier.code;
      receiptData.supplierName = supplier.name;
    } else {
      // If no supplier selected, clear supplier fields
      receiptData.supplier = null;
      receiptData.supplierCode = '';
      receiptData.supplierName = '';
    }

    // Validate financial period if provided
    if (receiptData.financialPeriod) {
      const period = await FinancialPeriod.findById(receiptData.financialPeriod);
      if (!period) {
        return res.status(400).json({
          success: false,
          message: 'Invalid financial period'
        });
      }
    }

    // Calculate extended amounts for items
    if (receiptData.items && receiptData.items.length > 0) {
      receiptData.items = receiptData.items.map(item => ({
        ...item,
        extendedAmount: item.quantity * item.unitPrice
      }));
    }

    // Create the receipt
    const receipt = await StockReceipt.create({
      ...receiptData,
      createdBy: req.user.userId || req.user._id,
      updatedBy: req.user.userId || req.user._id
    });

    // Update stock balances immediately
    try {
      await receipt.updateStockBalances();
    } catch (balanceError) {
      console.error('Error updating stock balances:', balanceError);
    }

    const populatedReceipt = await StockReceipt.findById(receipt._id)
      .populate('society', 'code name')
      .populate('supplier', 'code name')
      .populate('financialPeriod', 'periodNumber description')
      .populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Stock receipt created successfully',
      data: populatedReceipt
    });
  } catch (error) {
    console.error('Create stock receipt error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Receipt number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating stock receipt'
    });
  }
};

// @desc    Update stock receipt
// @route   PUT /api/common/stock-receipts/:id
// @access  Private (Admin/Staff)
const updateStockReceipt = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Prevent changing receiptNumber during update to avoid duplicate errors
    delete updateData.receiptNumber;

    // Validate supplier if being changed
    if (updateData.supplier) {
      const supplier = await Supplier.findById(updateData.supplier);
      if (!supplier) {
        return res.status(400).json({
          success: false,
          message: 'Invalid supplier'
        });
      }
      updateData.supplierCode = supplier.code;
      updateData.supplierName = supplier.name;
    } else if (updateData.supplier === null || updateData.supplier === '') {
      // Allow clearing supplier
      updateData.supplier = null;
      updateData.supplierCode = '';
      updateData.supplierName = '';
    }

    // Recalculate extended amounts if items are updated
    if (updateData.items && updateData.items.length > 0) {
      updateData.items = updateData.items.map(item => ({
        ...item,
        extendedAmount: item.quantity * item.unitPrice
      }));
    }

    const receipt = await StockReceipt.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        updatedBy: req.user.userId || req.user._id
      },
      { new: true, runValidators: true }
    )
      .populate('society', 'code name')
      .populate('supplier', 'code name')
      .populate('financialPeriod', 'periodNumber description')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Stock receipt not found'
      });
    }

    // Update stock balances immediately after update
    await receipt.updateStockBalances();

    res.json({
      success: true,
      message: 'Stock receipt updated successfully',
      data: receipt
    });
  } catch (error) {
    console.error('Update stock receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating stock receipt'
    });
  }
};

// @desc    Delete stock receipt
// @route   DELETE /api/common/stock-receipts/:id
// @access  Private (Admin/Staff)
const deleteStockReceipt = async (req, res) => {
  try {
    const receipt = await StockReceipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Stock receipt not found'
      });
    }

    // Reverse stock balances before marking as inactive
    await receipt.reverseStockBalances();

    receipt.isActive = false;
    receipt.updatedBy = req.user.userId || req.user._id;
    await receipt.save();

    res.json({
      success: true,
      message: 'Stock receipt deleted successfully'
    });
  } catch (error) {
    console.error('Delete stock receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting stock receipt'
    });
  }
};

// @desc    Approve stock receipt and update stock balances
// @route   PUT /api/common/stock-receipts/:id/approve
// @access  Private (Admin/Staff)
const approveStockReceipt = async (req, res) => {
  try {
    const receipt = await StockReceipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Stock receipt not found'
      });
    }

    if (receipt.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Stock receipt is already approved'
      });
    }

    // Update status and update stock balances using TWS logic
    receipt.status = 'approved';
    receipt.updatedBy = req.user.userId || req.user._id;

    await receipt.updateStockBalances();

    const updatedReceipt = await StockReceipt.findById(receipt._id)
      .populate('society', 'code name')
      .populate('supplier', 'code name')
      .populate('financialPeriod', 'periodNumber description')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Stock receipt approved and stock balances updated successfully',
      data: updatedReceipt
    });
  } catch (error) {
    console.error('Approve stock receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving stock receipt'
    });
  }
};

// @desc    Get stock receipt summary
// @route   GET /api/common/stock-receipts/summary
// @access  Private (Admin/Staff)
const getStockReceiptSummary = async (req, res) => {
  try {
    const { society, startDate, endDate } = req.query;

    const matchStage = { isActive: true };

    if (society) {
      matchStage.society = mongoose.Types.ObjectId(society);
    }

    if (startDate || endDate) {
      matchStage.receiptDate = {};
      if (startDate) {
        matchStage.receiptDate.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.receiptDate.$lte = new Date(endDate);
      }
    }

    const summary = await StockReceipt.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            society: '$society',
            status: '$status',
            month: { $month: '$receiptDate' },
            year: { $year: '$receiptDate' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalItems: { $sum: { $size: '$items' } }
        }
      },
      {
        $lookup: {
          from: 'societies',
          localField: '_id.society',
          foreignField: '_id',
          as: 'society'
        }
      },
      {
        $unwind: '$society'
      },
      {
        $project: {
          society: { code: '$society.code', name: '$society.name' },
          status: '$_id.status',
          period: {
            month: '$_id.month',
            year: '$_id.year'
          },
          count: 1,
          totalAmount: 1,
          totalItems: 1
        }
      },
      { $sort: { 'period.year': -1, 'period.month': -1 } }
    ]);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get stock receipt summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stock receipt summary'
    });
  }
};

// @desc    Get next SRV number
// @route   GET /api/common/stock-receipts/next-srvno
// @access  Private (Admin/Staff)
const getNextSrvNo = async (req, res) => {
  try {
    const { receiptDate } = req.query;
    const date = receiptDate ? new Date(receiptDate) : new Date();
    
    // Generate next SRV number
    const srvNo = await StockReceipt.generateReceiptNumber(date);

    res.json({
      success: true,
      data: {
        srvNo: srvNo,
        receiptDate: date.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Get next SRV number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating SRV number'
    });
  }
};

// @desc    Get latest receipt price and stock balance for a product
// @route   GET /api/common/stock-receipts/latest-price/:productId
// @access  Private (Admin/Staff)
const getLatestReceiptPrice = async (req, res) => {
  try {
    const { productId } = req.params;
    const { society } = req.query;

    if (!society) {
      return res.json({
        success: true,
        data: {
          unitPrice: 0,
          stockBalance: 0,
          lastReceiptDate: null,
          receiptNumber: null
        }
      });
    }

    const productObjId = new mongoose.Types.ObjectId(productId);
    const societyObjId = new mongoose.Types.ObjectId(society);

    const receipt = await StockReceipt.findOne({
      society: societyObjId,
      isActive: true,
      'items.product': productObjId
    })
    .sort({ receiptDate: -1, createdAt: -1 })
    .select('items receiptDate receiptNumber');

    if (!receipt) {
      return res.json({
        success: true,
        data: {
          unitPrice: 0,
          stockBalance: 0,
          lastReceiptDate: null,
          receiptNumber: null
        }
      });
    }

    // Get the specific item from the receipt
    const item = receipt.items.find(i => 
      i.product && i.product.toString() === productId
    );

    // Calculate stock balance from Stock Receipts - Stock Sales
    const StockSales = require('../models/StockSales');
    
    // Get all receipts for this product
    const receipts = await StockReceipt.find({
      society: societyObjId,
      isActive: true,
      'items.product': productObjId
    }).select('items');
    
    // Get all sales for this product
    const sales = await StockSales.find({
      society: societyObjId,
      isActive: true,
      'items.product': productObjId
    }).select('items');
    
    // Calculate total quantity from receipts
    let totalReceiptQty = 0;
    receipts.forEach(r => {
      r.items.forEach(i => {
        if (i.product && i.product.toString() === productId) {
          totalReceiptQty += i.quantity || 0;
        }
      });
    });
    
    // Calculate total quantity from sales
    let totalSalesQty = 0;
    sales.forEach(s => {
      s.items.forEach(i => {
        if (i.product && i.product.toString() === productId) {
          totalSalesQty += i.quantity || 0;
        }
      });
    });
    
    const calculatedStockBalance = totalReceiptQty - totalSalesQty;

    res.json({
      success: true,
      data: {
        unitPrice: item ? item.unitPrice : 0,
        stockBalance: calculatedStockBalance,
        lastReceiptDate: receipt.receiptDate,
        receiptNumber: receipt.receiptNumber
      }
    });
  } catch (error) {
    console.error('Get latest receipt price error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching latest receipt price'
    });
  }
};

module.exports = {
  getStockReceipts,
  getStockReceipt,
  createStockReceipt,
  updateStockReceipt,
  deleteStockReceipt,
  approveStockReceipt,
  getStockReceiptSummary,
  getNextSrvNo,
  getLatestReceiptPrice
};
