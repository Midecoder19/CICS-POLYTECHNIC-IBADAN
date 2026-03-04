const mongoose = require('mongoose');
const StockSales = require('../models/StockSales');
const Society = require('../models/Society');
const FinancialPeriod = require('../models/FinancialPeriod');

// @desc    Get all stock sales
// @route   GET /api/stock/sales
// @access  Private (Admin/Staff)
const getStockSales = async (req, res) => {
  try {
    const {
      society,
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

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) {
        query.issueDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.issueDate.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const stockSales = await StockSales.find(query)
      .populate('society', 'code name')
      .populate('financialPeriod', 'periodNumber description')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('approvedBy', 'username firstName lastName')
      .populate('rejectedBy', 'username firstName lastName')
      .sort({ issueDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockSales.countDocuments(query);

    res.json({
      success: true,
      count: stockSales.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: stockSales
    });
  } catch (error) {
    console.error('Get stock sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stock sales'
    });
  }
};

// @desc    Get single stock sale
// @route   GET /api/stock/sales/:id
// @access  Private (Admin/Staff)
const getStockSale = async (req, res) => {
  try {
    const stockSale = await StockSales.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!stockSale) {
      return res.status(404).json({
        success: false,
        message: 'Stock sale not found'
      });
    }

    res.json({
      success: true,
      data: stockSale
    });
  } catch (error) {
    console.error('Get stock sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stock sale'
    });
  }
};

// @desc    Get stock sale by SIV No
// @route   GET /api/stock/sales/siv/:sivNo
// @access  Private (Admin/Staff)
const getStockSaleBySivNo = async (req, res) => {
  try {
    const stockSale = await StockSales.findOne({
      sivNo: req.params.sivNo,
      isActive: true
    })
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!stockSale) {
      return res.status(404).json({
        success: false,
        message: 'Stock sale not found'
      });
    }

    res.json({
      success: true,
      data: stockSale
    });
  } catch (error) {
    console.error('Get stock sale by SIV No error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stock sale'
    });
  }
};

// @desc    Create new stock sale
// @route   POST /api/stock/sales
// @access  Private (Admin/Staff)
const createStockSale = async (req, res) => {
  try {
    const saleData = { ...req.body };

    // Generate SIV No if not provided
    if (!saleData.sivNo) {
      const society = await Society.findById(saleData.society);
      if (!society) {
        return res.status(400).json({
          success: false,
          message: 'Invalid society'
        });
      }
      saleData.sivNo = await StockSales.generateSivNo(society.code, new Date(saleData.issueDate));
    }

    // Validate financial period if provided
    if (saleData.financialPeriod) {
      const period = await FinancialPeriod.findById(saleData.financialPeriod);
      if (!period) {
        return res.status(400).json({
          success: false,
          message: 'Invalid financial period'
        });
      }
    }

    // Calculate extended amounts for items
    if (saleData.items && saleData.items.length > 0) {
      saleData.items = saleData.items.map(item => ({
        ...item,
        extendedAmount: item.quantity * item.unitPrice
      }));
    }

    const stockSale = await StockSales.create({
      ...saleData,
      createdBy: req.user.userId || req.user._id,
      updatedBy: req.user.userId || req.user._id,
      status: 'approved' // Auto-approve - stock is updated immediately
    });

    // Auto-update stock balances when sale is created
    await stockSale.updateStockBalances();

    const populatedSale = await StockSales.findById(stockSale._id)
      .populate('society', 'code name')
      .populate('financialPeriod', 'periodNumber description')
      .populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Stock sale created successfully',
      data: populatedSale
    });
  } catch (error) {
    console.error('Create stock sale error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SIV No already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating stock sale'
    });
  }
};

// @desc    Update stock sale
// @route   PUT /api/stock/sales/:id
// @access  Private (Admin/Staff)
const updateStockSale = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const stockSale = await StockSales.findById(req.params.id);

    if (!stockSale) {
      return res.status(404).json({
        success: false,
        message: 'Stock sale not found'
      });
    }

    // Check if SIV No is being changed and if it conflicts
    if (updateData.sivNo && updateData.sivNo.trim() !== stockSale.sivNo) {
      const existingSale = await StockSales.findOne({
        sivNo: updateData.sivNo.trim(),
        isActive: true,
        _id: { $ne: req.params.id }
      });

      if (existingSale) {
        return res.status(400).json({
          success: false,
          message: 'SIV No already exists'
        });
      }
    }

    // Recalculate extended amounts if items are updated
    if (updateData.items && updateData.items.length > 0) {
      updateData.items = updateData.items.map(item => ({
        ...item,
        extendedAmount: item.quantity * item.unitPrice
      }));
    }

    // Update fields
    Object.assign(stockSale, updateData, {
      updatedBy: req.user.userId || req.user._id
    });

    await stockSale.save();

    // Update stock balances after sale update
    await stockSale.updateStockBalances();

    const updatedSale = await StockSales.findById(req.params.id)
      .populate('society', 'code name')
      .populate('financialPeriod', 'periodNumber description')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Stock sale updated successfully',
      data: updatedSale
    });
  } catch (error) {
    console.error('Update stock sale error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SIV No already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating stock sale'
    });
  }
};

// @desc    Delete stock sale (soft delete)
// @route   DELETE /api/stock/sales/:id
// @access  Private (Admin)
const deleteStockSale = async (req, res) => {
  try {
    const stockSale = await StockSales.findById(req.params.id);

    if (!stockSale) {
      return res.status(404).json({
        success: false,
        message: 'Stock sale not found'
      });
    }

    // Reverse stock balances before marking as inactive
    await stockSale.reverseStockBalances();

    stockSale.isActive = false;
    stockSale._updatedBy = req.user._id;
    await stockSale.save();

    res.json({
      success: true,
      message: 'Sale deleted successfully and stock restored'
    });
  } catch (error) {
    console.error('Delete stock sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting stock sale'
    });
  }
};

// @desc    Search stock sales
// @route   GET /api/stock/sales/search/:query
// @access  Private (Admin/Staff)
const searchStockSales = async (req, res) => {
  try {
    const query = req.params.query;
    const stockSales = await StockSales.find({
      isActive: true,
      $or: [
        { sivNo: { $regex: query, $options: 'i' } },
        { store: { $regex: query, $options: 'i' } },
        { memberNo: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('createdBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: stockSales.length,
      data: stockSales
    });
  } catch (error) {
    console.error('Search stock sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching stock sales'
    });
  }
};

// Post stock sale (mark as completed and generate receipt)
// NOTE: This functionality is disabled - stock is updated on save directly
const postStockSale = async (req, res) => {
  try {
    res.status(400).json({
      success: false,
      message: 'Post functionality has been removed. Stock is updated automatically on save.'
    });
  } catch (error) {
    console.error('Post stock sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while posting stock sale'
    });
  }
};

// Approve stock sale - REMOVED
// Stock is now updated automatically when sale is created/updated

// Reject stock sale - REMOVED

// @desc    Get stock sales summary
// @route   GET /api/stock/sales/summary
// @access  Private (Admin/Staff)
const getStockSalesSummary = async (req, res) => {
  try {
    const { society, startDate, endDate } = req.query;

    const matchStage = { isActive: true };

    if (society) {
      matchStage.society = mongoose.Types.ObjectId(society);
    }

    if (startDate || endDate) {
      matchStage.issueDate = {};
      if (startDate) {
        matchStage.issueDate.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.issueDate.$lte = new Date(endDate);
      }
    }

    const summary = await StockSales.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            society: '$society',
            status: '$status',
            month: { $month: '$issueDate' },
            year: { $year: '$issueDate' }
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
    console.error('Get stock sales summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stock sales summary'
    });
  }
};

module.exports = {
  getStockSales,
  getStockSale,
  getStockSaleBySivNo,
  createStockSale,
  updateStockSale,
  deleteStockSale,
  searchStockSales
};
