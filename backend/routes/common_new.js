const storeInformationController = require('../controllers/storeInformationController');
const supplierController = require('../controllers/supplierController');
const productController = require('../controllers/productController');
const productOpeningBalanceController = require('../controllers/productOpeningBalanceController');
const stockReceiptController = require('../controllers/stockReceiptController');
const stockBalanceController = require('../controllers/stockBalanceController');
const supplierOpeningBalanceController = require('../controllers/supplierOpeningBalanceController');
const essentialCommodityController = require('../controllers/essentialCommodityController');
const financialPeriodController = require('../controllers/financialPeriodController');
const defaultParameterController = require('../controllers/defaultParameterController');
const userController = require('../controllers/userController');
const User = require('../models/User');

// Define routes
const express = require('express');
const router = express.Router();
const { authenticateToken, requireActiveUser, requireAdminOrStaff } = require('../middleware/auth');

// Store Information routes
router.get('/store-information', authenticateToken, requireActiveUser, storeInformationController.getStoreInformation);
router.post('/store-information', authenticateToken, requireActiveUser, requireAdminOrStaff, storeInformationController.createStoreInformation);
router.put('/store-information/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, storeInformationController.updateStoreInformation);
router.delete('/store-information/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, storeInformationController.deleteStoreInformation);

// Supplier routes
router.get('/suppliers', authenticateToken, requireActiveUser, supplierController.getSuppliers);
router.post('/suppliers', authenticateToken, requireActiveUser, requireAdminOrStaff, supplierController.createSupplier);
router.put('/suppliers/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, supplierController.updateSupplier);
router.delete('/suppliers/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, supplierController.deleteSupplier);

// Product routes
router.get('/products', authenticateToken, requireActiveUser, productController.getProducts);
router.get('/products/search', authenticateToken, requireActiveUser, productController.searchProducts);
router.post('/products', authenticateToken, requireActiveUser, requireAdminOrStaff, productController.createProduct);
router.put('/products/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, productController.updateProduct);
router.delete('/products/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, productController.deleteProduct);

// Product Opening Balance routes
router.get('/product-opening-balances', authenticateToken, requireActiveUser, productOpeningBalanceController.getProductOpeningBalances);
router.get('/product-opening-balances/:id', authenticateToken, requireActiveUser, productOpeningBalanceController.getProductOpeningBalance);
router.post('/product-opening-balances', authenticateToken, requireActiveUser, requireAdminOrStaff, productOpeningBalanceController.createProductOpeningBalance);
router.put('/product-opening-balances/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, productOpeningBalanceController.updateProductOpeningBalance);
router.delete('/product-opening-balances/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, productOpeningBalanceController.deleteProductOpeningBalance);
router.get('/product-opening-balances/search', authenticateToken, requireActiveUser, productOpeningBalanceController.searchProductOpeningBalances);

// Stock Receipt routes
router.get('/stock-receipts', authenticateToken, requireActiveUser, stockReceiptController.getStockReceipts);
router.get('/stock-receipts/next-srvno', authenticateToken, requireActiveUser, stockReceiptController.getNextSrvNo);
router.get('/stock-receipts/:id', authenticateToken, requireActiveUser, stockReceiptController.getStockReceipt);
router.post('/stock-receipts', authenticateToken, requireActiveUser, requireAdminOrStaff, stockReceiptController.createStockReceipt);
router.put('/stock-receipts/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, stockReceiptController.updateStockReceipt);
router.delete('/stock-receipts/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, stockReceiptController.deleteStockReceipt);
router.put('/stock-receipts/:id/approve', authenticateToken, requireActiveUser, requireAdminOrStaff, stockReceiptController.approveStockReceipt);
router.get('/stock-receipts/summary', authenticateToken, requireActiveUser, stockReceiptController.getStockReceiptSummary);
router.get('/stock-receipts/latest-price/:productId', stockReceiptController.getLatestReceiptPrice);

// Stock Balance routes
router.get('/stock-balances', authenticateToken, requireActiveUser, stockBalanceController.getStockBalances);
router.get('/stock-balances/:id', authenticateToken, requireActiveUser, stockBalanceController.getStockBalance);
router.get('/stock-balances/total/:societyId', authenticateToken, requireActiveUser, stockBalanceController.getTotalStockBalance);
router.get('/stock-balances/product/:societyId/:productId', authenticateToken, requireActiveUser, stockBalanceController.getProductStockBalance);

// Supplier Opening Balance routes
router.get('/supplier-opening-balances', authenticateToken, requireActiveUser, supplierOpeningBalanceController.getSupplierOpeningBalances);
router.get('/supplier-opening-balances/:id', authenticateToken, requireActiveUser, supplierOpeningBalanceController.getSupplierOpeningBalance);
router.post('/supplier-opening-balances', authenticateToken, requireActiveUser, requireAdminOrStaff, supplierOpeningBalanceController.createSupplierOpeningBalance);
router.put('/supplier-opening-balances/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, supplierOpeningBalanceController.updateSupplierOpeningBalance);
router.delete('/supplier-opening-balances/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, supplierOpeningBalanceController.deleteSupplierOpeningBalance);

// Essential Commodity routes (added alias for plural)
router.get('/essential-commodity', authenticateToken, requireActiveUser, essentialCommodityController.getEssentialCommodities);
router.get('/essential-commodities', authenticateToken, requireActiveUser, essentialCommodityController.getEssentialCommodities);
router.get('/essential-commodity/:id', authenticateToken, requireActiveUser, essentialCommodityController.getEssentialCommodity);
router.post('/essential-commodity', authenticateToken, requireActiveUser, requireAdminOrStaff, essentialCommodityController.createEssentialCommodity);
router.put('/essential-commodity/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, essentialCommodityController.updateEssentialCommodity);
router.delete('/essential-commodity/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, essentialCommodityController.deleteEssentialCommodity);
router.get('/essential-commodity/search/:query', authenticateToken, requireActiveUser, essentialCommodityController.searchEssentialCommodities);

// Financial Period routes
router.get('/financial-periods', authenticateToken, requireActiveUser, financialPeriodController.getFinancialPeriods);
router.get('/financial-periods/:id', authenticateToken, requireActiveUser, financialPeriodController.getFinancialPeriod);
router.post('/financial-periods', authenticateToken, requireActiveUser, requireAdminOrStaff, financialPeriodController.createFinancialPeriod);
router.put('/financial-periods/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, financialPeriodController.updateFinancialPeriod);
router.delete('/financial-periods/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, financialPeriodController.deleteFinancialPeriod);

// Default Parameter routes
router.get('/default-parameters', authenticateToken, requireActiveUser, defaultParameterController.getDefaultParameters);
router.get('/default-parameters/:id', authenticateToken, requireActiveUser, defaultParameterController.getDefaultParameter);
router.post('/default-parameters', authenticateToken, requireActiveUser, requireAdminOrStaff, defaultParameterController.createDefaultParameter);
router.put('/default-parameters/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, defaultParameterController.updateDefaultParameter);
router.delete('/default-parameters/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, defaultParameterController.deleteDefaultParameter);

// Member routes (for member lookup in stock sales)
router.get('/members', authenticateToken, requireActiveUser, userController.getUsers);

module.exports = router;
