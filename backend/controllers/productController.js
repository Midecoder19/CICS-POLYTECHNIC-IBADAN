const Product = require('../models/Product');
const StockBalance = require('../models/StockBalance');

// Get all products
const getProducts = async (req, res) => {
  try {
    const { society } = req.query;
    // If society is provided, return products for that society OR products without society (global)
    // This ensures products are visible regardless of society assignment
    const query = society ? { $or: [{ society }, { society: { $exists: false } }] } : {};

    const products = await Product.find(query)
      .populate('supplier', 'code name')
      .populate('store', 'storeCode name')
      .populate('glAccount', 'code name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('supplier', 'code name')
      .populate('store', 'storeCode name')
      .populate('glAccount', 'code name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Validate required fields
    if (!productData.code || !productData.name || !productData.unit) {
      return res.status(400).json({
        success: false,
        message: 'Product code, name, and unit are required'
      });
    }

    // Check if product code already exists
    const existingProduct = await Product.findOne({ code: productData.code });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product code already exists'
      });
    }

    const product = new Product(productData);
    await product.save();

    // Create initial stock balance record for the product
    try {
      const stockBalanceData = {
        society: productData.society,
        product: product._id,
        productCode: productData.code,
        productName: productData.name,
        unit: productData.unit,
        quantityOnHand: 0, // Start with zero balance
        reorderPoint: productData.reorderPoint || 0,
        minimumStock: productData.minimumStock || 0,
        maximumStock: productData.maximumStock || 0
      };

      const stockBalance = new StockBalance(stockBalanceData);
      await stockBalance.save();
    } catch (stockError) {
      console.error('Error creating stock balance:', stockError);
      // Don't fail the product creation if stock balance creation fails
    }

    const populatedProduct = await Product.findById(product._id)
      .populate('supplier', 'code name')
      .populate('store', 'storeCode name')
      .populate('glAccount', 'code name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if code is being changed and if it conflicts
    if (updateData.code && updateData.code !== existingProduct.code) {
      const codeExists = await Product.findOne({
        code: updateData.code,
        _id: { $ne: id }
      });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Product code already exists'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('supplier', 'code name')
      .populate('store', 'storeCode name')
      .populate('glAccount', 'code name');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { query, society } = req.query;

    let searchQuery = {};

    if (society) {
      searchQuery.society = society;
    }

    if (query) {
      searchQuery.$or = [
        { code: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ];
    }

    const products = await Product.find(searchQuery)
      .populate('supplier', 'code name')
      .populate('store', 'storeCode name')
      .limit(50) // Limit results
      .sort({ name: 1 });

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
};
