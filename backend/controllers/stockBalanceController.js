const StockBalance = require('../models/StockBalance');

// @desc    Get all stock balances
// @route   GET /api/common/stock-balances
// @access  Private (Admin/Staff)
const getStockBalances = async (req, res) => {
  try {
    const {
      society,
      product,
      page = 1,
      limit = 50
    } = req.query;

    const query = { isActive: true };

    if (society) {
      query.society = society;
    }

    if (product) {
      query.product = product;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const stockBalances = await StockBalance.find(query)
      .populate('society', 'code name')
      .populate('product', 'code name unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockBalance.countDocuments(query);

    res.json({
      success: true,
      count: stockBalances.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: stockBalances
    });
  } catch (error) {
    console.error('Get stock balances error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stock balances'
    });
  }
};

// @desc    Get single stock balance
// @route   GET /api/common/stock-balances/:id
// @access  Private (Admin/Staff)
const getStockBalance = async (req, res) => {
  try {
    const stockBalance = await StockBalance.findById(req.params.id)
      .populate('society', 'code name')
      .populate('product', 'code name unit');

    if (!stockBalance) {
      return res.status(404).json({
        success: false,
        message: 'Stock balance not found'
      });
    }

    res.json({
      success: true,
      data: stockBalance
    });
  } catch (error) {
    console.error('Get stock balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stock balance'
    });
  }
};

// @desc    Get total stock balance for a society
// @route   GET /api/common/stock-balances/total/:societyId
// @access  Private (Admin/Staff)
const getTotalStockBalance = async (req, res) => {
  try {
    const { societyId } = req.params;

    const totalBalance = await StockBalance.getTotalStockBalance(societyId);

    res.json({
      success: true,
      data: {
        society: societyId,
        totalQuantity: totalBalance
      }
    });
  } catch (error) {
    console.error('Get total stock balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching total stock balance'
    });
  }
};

// @desc    Get stock balance for a specific product
// @route   GET /api/common/stock-balances/product/:societyId/:productId
// @access  Private (Admin/Staff)
const getProductStockBalance = async (req, res) => {
  try {
    const { societyId, productId } = req.params;

    const quantity = await StockBalance.getProductStockBalance(societyId, productId);

    res.json({
      success: true,
      data: {
        society: societyId,
        product: productId,
        quantityOnHand: quantity
      }
    });
  } catch (error) {
    console.error('Get product stock balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product stock balance'
    });
  }
};

module.exports = {
  getStockBalances,
  getStockBalance,
  getTotalStockBalance,
  getProductStockBalance
};
