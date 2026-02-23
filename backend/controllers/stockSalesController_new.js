const mongoose = require('mongoose');
const StockSales = require('../models/StockSales');
const Society = require('../models/Society');
const FinancialPeriod = require('../models/FinancialPeriod');
const StoreInformation = require('../models/StoreInformation');
const Product = require('../models/Product');

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
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

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
    const {
      store,
      sivNo,
      issueDate,
      memberNo,
      fullName,
      discountRate,
      vatRate,
      discountAmount,
      stockBalance,
      minimumLevel,
      status,
      items,
      totals
    } = req.body;

    const stockSale = await StockSales.findById(req.params.id);

    if (!stockSale) {
      return res.status(404).json({
        success: false,
        message: 'Stock sale not found'
      });
    }

    // Check if SIV No is being changed and if it conflicts
    if (sivNo && sivNo.trim() !== stockSale.sivNo) {
      const existingSale = await StockSales.findOne({
        sivNo: sivNo.trim(),
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

    stockSale._updatedBy = req.user._id;

    stockSale.store = store || stockSale.store;
    stockSale.sivNo = sivNo ? sivNo.trim() : stockSale.sivNo;
    stockSale.issueDate = issueDate || stockSale.issueDate;
    stockSale.memberNo = memberNo !== undefined ? memberNo : stockSale.memberNo;
    stockSale.fullName = fullName !== undefined ? fullName : stockSale.fullName;
    stockSale.discountRate = discountRate !== undefined ? discountRate : stockSale.discountRate;
    stockSale.vatRate = vatRate !== undefined ? vatRate : stockSale.vatRate;
    stockSale.discountAmount = discountAmount !== undefined ? discountAmount : stockSale.discountAmount;
    stockSale.stockBalance = stockBalance !== undefined ? stockBalance : stockSale.stockBalance;
    stockSale.minimumLevel = minimumLevel !== undefined ? minimumLevel : stockSale.minimumLevel;
    stockSale.status = status || stockSale.status;
    stockSale.items = items || stockSale.items;
    stockSale.totals = totals || stockSale.totals;

    await stockSale.save();

    const updatedSale = await StockSales.findById(req.params.id)
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

    stockSale.isActive = false;
    stockSale._updatedBy = req.user._id;
    await stockSale.save();

    res.json({
      success: true,
      message: 'Stock sale deleted successfully'
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

// @desc    Post stock sale (mark as completed and generate receipt)
// @route   PUT /api/stock/sales/:id/post
// @access  Private (Admin/Staff)
const postStockSale = async (req, res) => {
  try {
    const stockSale = await StockSales.findById(req.params.id);

    if (!stockSale) {
      return res.status(404).json({
        success: false,
        message: 'Stock sale not found'
      });
    }

    if (stockSale.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Stock sale is already posted'
      });
    }

    stockSale.status = 'completed';
    stockSale._updatedBy = req.user._id;
    await stockSale.save();

    const updatedSale = await StockSales.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Stock sale posted successfully',
      data: updatedSale
    });
  } catch (error) {
    console.error('Post stock sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while posting stock sale'
    });
  }
};

// @desc    Approve stock sale
// @route   PUT /api/stock/sales/:id/approve
// @access  Private (Admin/Staff)
const approveStockSale = async (req, res) => {
  try {
    const stockSale = await StockSales.findById(req.params.id);

    if (!stockSale) {
      return res.status(404).json({
        success: false,
        message: 'Stock sale not found'
      });
    }

    if (stockSale.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Stock sale is already approved'
      });
    }

    // Validate stock availability before approval
    const StockBalance = mongoose.model('StockBalance');
    const insufficientStock = [];

    for (const item of stockSale.items) {
      const stockBalance = await StockBalance.findOne({
        society: stockSale.society,
        product: item.product,
        isActive: true
      });

      if (!stockBalance || stockBalance.quantityOnHand < item.quantity) {
        const available = stockBalance ? stockBalance.quantityOnHand : 0;
        insufficientStock.push({
          productCode: item.productCode,
          productName: item.productName,
          requested: item.quantity,
          available: available
        });
      }
    }

    if (insufficientStock.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for approval',
        insufficientStock: insufficientStock
      });
    }

    // Validate store exists
    const store = await StoreInformation.findById(stockSale.store);
    if (!store) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store selected'
      });
    }

    // Validate all products exist and have correct codes
    for (const item of stockSale.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productCode} not found`
        });
      }
      if (product.code !== item.productCode) {
        return res.status(400).json({
          success: false,
          message: `Product code mismatch for ${item.productName}`
        });
      }
    }

    // Update status and update stock balances using TWS logic
    stockSale.status = 'approved';
    stockSale.approvedBy = req.user.userId || req.user._id;
    stockSale.approvedAt = new Date();
    stockSale.updatedBy = req.user.userId || req.user._id;

    await stockSale.updateStockBalances();

    const updatedSale = await StockSales.findById(stockSale._id)
      .populate('society', 'code name')
      .populate('financialPeriod', 'periodNumber description')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('approvedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Stock sale approved and stock balances updated successfully',
      data: updatedSale
    });
  } catch (error) {
    console.error('Approve stock sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving stock sale'
    });
  }
};

// @desc    Reject stock sale
// @route   PUT /api/stock/sales/:id/reject
// @access  Private (Admin/Staff)
const rejectStockSale = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const stockSale = await StockSales.findById(req.params.id);

    if (!stockSale) {
      return res.status(404).json({
        success: false,
        message: 'Stock sale not found'
      });
    }

    if (stockSale.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Stock sale is already rejected'
      });
    }

    stockSale.status = 'rejected';
    stockSale.rejectedBy = req.user._id;
    stockSale.rejectedAt = new Date();
    stockSale.rejectionReason = rejectionReason;
    stockSale.updatedBy = req.user._id;

    await stockSale.save();

    const updatedSale = await StockSales.findById(stockSale._id)
      .populate('society', 'code name')
      .populate('financialPeriod', 'periodNumber description')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('rejectedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Stock sale rejected successfully',
      data: updatedSale
    });
  } catch (error) {
    console.error('Reject stock sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting stock sale'
    });
  }
};

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
  searchStockSales,
  postStockSale,
  approveStockSale,
  rejectStockSale,
  getStockSalesSummary
};
