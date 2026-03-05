const mongoose = require('mongoose');
const StockBalance = require('../models/StockBalance');
const StockReceipt = require('../models/StockReceipt');
const StockSales = require('../models/StockSales');

// @desc    Get all stock balances (calculated from Stock Receipts - Stock Sales)
// @route   GET /api/common/stock-balances
// @access  Private (Admin/Staff)
const getStockBalances = async (req, res) => {
  try {
    const { society, product, page = 1, limit = 50 } = req.query;
    
    console.log('=== getStockBalances called ===');
    console.log('req.query:', req.query);
    console.log('society value:', society, 'type:', typeof society);
    
    if (!society) {
      // Return empty data if society is not provided
      console.log('NO SOCIETY PROVIDED - returning empty');
      return res.json({
        success: true,
        count: 0,
        total: 0,
        pages: 0,
        currentPage: 1,
        data: []
      });
    }

    console.log('=== Stock Balance Query Debug ===');
    console.log('Society ID from request:', society);
    console.log('Query society ObjectId:', new mongoose.Types.ObjectId(society));
    
    // Get all ACTIVE stock receipts for this society
    const receiptsAll = await StockReceipt.find({ 
      society: society,
      isActive: true
    }).populate('items.product', 'code name unit');
    const receipts = receiptsAll;
    
    console.log('=== Stock Balance Query Debug ===');
    console.log('Society ID from request:', society);
    console.log('Total receipts in DB:', receiptsAll.length);

    // Get all ACTIVE stock sales for this society
    const sales = await StockSales.find({
      society: society,
      isActive: true
    }).populate('items.product', 'code name unit');
    
    console.log('Total receipts (no filter):', receiptsAll.length);
    console.log('Active receipts:', receipts.length);
    console.log('Sales found:', sales.length);

    // Calculate stock balance per product
    const productBalances = {};

    // Process receipts (add to stock)
    console.log('=== Processing Receipts ===');
    receipts.forEach((receipt, rIdx) => {
      console.log(`Receipt ${rIdx}: ${receipt.receiptNumber}, items: ${receipt.items?.length || 0}`);
      if (receipt.items && receipt.items.length > 0) {
        console.log(`  First item product:`, receipt.items[0].product);
      }
      
      receipt.items.forEach(item => {
        // item.product is now a populated object after .populate()
        const productObj = item.product;
        const productId = productObj?._id?.toString() || item.productId?.toString();
        
        console.log(`    Product ID: ${productId}, qty: ${item.quantity}, price: ${item.unitPrice}`);
        
        if (!productBalances[productId]) {
          productBalances[productId] = {
            product: productObj, // Store the full populated object
            productCode: productObj?.code || item.productCode,
            productName: productObj?.name || item.productName,
            unit: productObj?.unit || item.unit,
            quantityOnHand: 0,
            unitPrice: item.unitPrice || 0 // Store the latest unit price from receipts
          };
        } else {
          // Update unit price to the latest receipt price
          if (item.unitPrice) {
            productBalances[productId].unitPrice = item.unitPrice;
          }
        }
        productBalances[productId].quantityOnHand += item.quantity || 0;
      });
    });

    // Process sales (subtract from stock)
    console.log('=== Processing Sales ===');
    sales.forEach((sale, sIdx) => {
      console.log(`Sale ${sIdx}: ${sale.sivNo}, items: ${sale.items?.length || 0}`);
      
      sale.items.forEach(item => {
        // item.product is now a populated object after .populate('items.product')
        const productObj = item.product;
        const productId = productObj?._id?.toString() || item.productId?.toString();
        
        console.log(`    Product ID: ${productId}, qty: ${item.quantity}`);
        
        if (!productBalances[productId]) {
          // Product was sold but never received - create a negative balance
          productBalances[productId] = {
            product: productObj,
            productCode: productObj?.code || item.productCode,
            productName: productObj?.name || item.productName,
            unit: productObj?.unit || item.unit,
            quantityOnHand: 0,
            unitPrice: item.unitPrice || 0
          };
        } else {
          // Update unit price if this is the latest
          if (item.unitPrice) {
            productBalances[productId].unitPrice = item.unitPrice;
          }
        }
        productBalances[productId].quantityOnHand -= item.quantity || 0;
      });
    });

    // Debug: Check what product data looks like in receipts
    console.log('=== DEBUG: Receipt Product Data ===');
    if (receipts.length > 0) {
      console.log('First receipt:', JSON.stringify(receipts[0], null, 2));
    }
    
    // Convert to array
    let stockBalances = Object.values(productBalances);
    
    console.log('=== Stock Balances Calculated ===');
    console.log('Society:', society);
    console.log('Receipts found:', receipts.length);
    console.log('Sales found:', sales.length);
    console.log('Product balances:', stockBalances);

    // Filter by product if specified
    if (product) {
      stockBalances = stockBalances.filter(b => 
        b.product?.toString() === product || 
        b.product?._id?.toString() === product
      );
    }

    const total = stockBalances.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    stockBalances = stockBalances.slice(skip, skip + parseInt(limit));

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

// @desc    Get stock balance for a specific product (calculated from Stock Receipts - Stock Sales)
// @route   GET /api/common/stock-balances/product/:societyId/:productId
// @access  Private (Admin/Staff)
const getProductStockBalance = async (req, res) => {
  try {
    const { societyId, productId } = req.params;

    if (!societyId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Society and Product are required'
      });
    }

    const productObjId = require('mongoose').Types.ObjectId(productId);
    const societyObjId = require('mongoose').Types.ObjectId(societyId);

    // Get total received from Stock Receipts (no status filter - show from all receipts)
    const receipts = await StockReceipt.aggregate([
      {
        $match: {
          society: societyObjId,
          isActive: true,
          'items.product': productObjId
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.product': productObjId } },
      {
        $group: {
          _id: null,
          totalReceived: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Get total sold from Stock Sales
    const sales = await StockSales.aggregate([
      {
        $match: {
          society: societyObjId,
          status: 'approved',
          isActive: true,
          'items.product': productObjId
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.product': productObjId } },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$items.quantity' }
        }
      }
    ]);

    const totalReceived = receipts.length > 0 ? receipts[0].totalReceived : 0;
    const totalSold = sales.length > 0 ? sales[0].totalSold : 0;
    const quantityOnHand = totalReceived - totalSold;

    res.json({
      success: true,
      data: {
        society: societyId,
        product: productId,
        quantityOnHand: quantityOnHand,
        totalReceived: totalReceived,
        totalSold: totalSold
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
