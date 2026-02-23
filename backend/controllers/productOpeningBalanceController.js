const ProductOpeningBalance = require('../models/ProductOpeningBalance');

// Get all product opening balances
const getProductOpeningBalances = async (req, res) => {
  try {
    const { society, store, product, financialPeriod } = req.query;
    const query = {};

    if (society) query.society = society;
    if (store) query.store = store;
    if (product) query.product = product;
    if (financialPeriod) query.financialPeriod = financialPeriod;

    const openingBalances = await ProductOpeningBalance.find(query)
      .populate('society', 'name code')
      .populate('store', 'storeCode name')
      .populate('product', 'code name unit')
      .populate('financialPeriod', 'periodName startDate endDate')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: openingBalances,
      count: openingBalances.length
    });
  } catch (error) {
    console.error('Error fetching product opening balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product opening balances',
      error: error.message
    });
  }
};

// Get single product opening balance
const getProductOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;

    const openingBalance = await ProductOpeningBalance.findById(id)
      .populate('society', 'name code')
      .populate('store', 'storeCode name')
      .populate('product', 'code name unit')
      .populate('financialPeriod', 'periodName startDate endDate');

    if (!openingBalance) {
      return res.status(404).json({
        success: false,
        message: 'Product opening balance not found'
      });
    }

    res.json({
      success: true,
      data: openingBalance
    });
  } catch (error) {
    console.error('Error fetching product opening balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product opening balance',
      error: error.message
    });
  }
};

// Create product opening balance
const createProductOpeningBalance = async (req, res) => {
  try {
    const openingBalanceData = { ...req.body };

    // Validate required fields
    if (!openingBalanceData.store || !openingBalanceData.product || !openingBalanceData.date || !openingBalanceData.financialPeriod) {
      return res.status(400).json({
        success: false,
        message: 'Store, product, date, and financial period are required'
      });
    }

    // Check if opening balance already exists for this store/product/financial period combination
    const existingBalance = await ProductOpeningBalance.findOne({
      store: openingBalanceData.store,
      product: openingBalanceData.product,
      financialPeriod: openingBalanceData.financialPeriod
    });

    if (existingBalance) {
      return res.status(400).json({
        success: false,
        message: 'Opening balance already exists for this store, product, and financial period'
      });
    }

    const openingBalance = new ProductOpeningBalance(openingBalanceData);
    await openingBalance.save();

    const populatedBalance = await ProductOpeningBalance.findById(openingBalance._id)
      .populate('society', 'name code')
      .populate('store', 'storeCode name')
      .populate('product', 'code name unit')
      .populate('financialPeriod', 'periodName startDate endDate');

    res.status(201).json({
      success: true,
      message: 'Product opening balance created successfully',
      data: populatedBalance
    });
  } catch (error) {
    console.error('Error creating product opening balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product opening balance',
      error: error.message
    });
  }
};

// Update product opening balance
const updateProductOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if opening balance exists
    const existingBalance = await ProductOpeningBalance.findById(id);
    if (!existingBalance) {
      return res.status(404).json({
        success: false,
        message: 'Product opening balance not found'
      });
    }

    // Check if updating would create a duplicate (only if store/product/financialPeriod changed)
    if (updateData.store && updateData.product && updateData.financialPeriod &&
        (updateData.store !== existingBalance.store.toString() ||
         updateData.product !== existingBalance.product.toString() ||
         updateData.financialPeriod !== existingBalance.financialPeriod.toString())) {

      const duplicateCheck = await ProductOpeningBalance.findOne({
        store: updateData.store,
        product: updateData.product,
        financialPeriod: updateData.financialPeriod,
        _id: { $ne: id }
      });

      if (duplicateCheck) {
        return res.status(400).json({
          success: false,
          message: 'Opening balance already exists for this store, product, and financial period'
        });
      }
    }

    const openingBalance = await ProductOpeningBalance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('society', 'name code')
      .populate('store', 'storeCode name')
      .populate('product', 'code name unit')
      .populate('financialPeriod', 'periodName startDate endDate');

    res.json({
      success: true,
      message: 'Product opening balance updated successfully',
      data: openingBalance
    });
  } catch (error) {
    console.error('Error updating product opening balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product opening balance',
      error: error.message
    });
  }
};

// Delete product opening balance
const deleteProductOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;

    const openingBalance = await ProductOpeningBalance.findByIdAndDelete(id);

    if (!openingBalance) {
      return res.status(404).json({
        success: false,
        message: 'Product opening balance not found'
      });
    }

    res.json({
      success: true,
      message: 'Product opening balance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product opening balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product opening balance',
      error: error.message
    });
  }
};

// Search product opening balances
const searchProductOpeningBalances = async (req, res) => {
  try {
    const { query, society, store } = req.query;

    let searchQuery = {};

    if (society) {
      searchQuery.society = society;
    }

    if (store) {
      searchQuery.store = store;
    }

    if (query) {
      // Search in populated product fields
      searchQuery.$or = [
        { 'product.code': { $regex: query, $options: 'i' } },
        { 'product.name': { $regex: query, $options: 'i' } }
      ];
    }

    const openingBalances = await ProductOpeningBalance.find(searchQuery)
      .populate('society', 'name code')
      .populate('store', 'storeCode name')
      .populate('product', 'code name unit')
      .populate('financialPeriod', 'periodName startDate endDate')
      .limit(50)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: openingBalances,
      count: openingBalances.length
    });
  } catch (error) {
    console.error('Error searching product opening balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search product opening balances',
      error: error.message
    });
  }
};

module.exports = {
  getProductOpeningBalances,
  getProductOpeningBalance,
  createProductOpeningBalance,
  updateProductOpeningBalance,
  deleteProductOpeningBalance,
  searchProductOpeningBalances
};
