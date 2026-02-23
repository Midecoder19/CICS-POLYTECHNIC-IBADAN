// Import controllers
const defaultParameterController = require('../controllers/defaultParameterController');
const financialPeriodController = require('../controllers/financialPeriodController');
const securityController = require('../controllers/securityController');
const backupController = require('../controllers/backupController');
const restoreController = require('../controllers/restoreController');
const storeInformationController = require('../controllers/storeInformationController');
const essentialCommodityController = require('../controllers/essentialCommodityController');
const supplierController = require('../controllers/supplierController');
const productController = require('../controllers/productController');
const stockBalanceController = require('../controllers/stockBalanceController');
const userController = require('../controllers/userController');

// Define routes
const express = require('express');
const router = express.Router();
const { authenticateToken, requireActiveUser, requireAdminOrStaff } = require('../middleware/auth');

// Default Parameter routes
router.get('/default-parameters', authenticateToken, requireActiveUser, defaultParameterController.getDefaultParameters);
router.post('/default-parameters', authenticateToken, requireActiveUser, requireAdminOrStaff, defaultParameterController.createDefaultParameter);
router.put('/default-parameters/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, defaultParameterController.updateDefaultParameter);
router.delete('/default-parameters/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, defaultParameterController.deleteDefaultParameter);

// Route for searching accounts
router.get('/default-parameters/search/accounts', authenticateToken, requireActiveUser, defaultParameterController.searchAccounts);

// Financial Period routes
router.get('/financial-periods', authenticateToken, requireActiveUser, financialPeriodController.getFinancialPeriods);
router.get('/financial', authenticateToken, requireActiveUser, financialPeriodController.getFinancialPeriods); // Frontend compatibility
router.get('/common/financial-periods', authenticateToken, requireActiveUser, financialPeriodController.getFinancialPeriods); // Alias for frontend compatibility
// Note: Financial periods are typically created through setup/initialization, not via direct POST
router.put('/financial-periods/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, financialPeriodController.updateFinancialPeriod);
router.delete('/financial-periods/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, financialPeriodController.deleteFinancialPeriod);

// Store Information routes
router.get('/store-information', authenticateToken, requireActiveUser, storeInformationController.getStoreInformation);
router.post('/store-information', authenticateToken, requireActiveUser, requireAdminOrStaff, storeInformationController.createStoreInformation);
router.put('/store-information/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, storeInformationController.updateStoreInformation);
router.delete('/store-information/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, storeInformationController.deleteStoreInformation);

// Essential Commodity routes
router.get('/essential-commodities', authenticateToken, requireActiveUser, essentialCommodityController.getEssentialCommodities);
router.get('/essential-commodity', authenticateToken, requireActiveUser, essentialCommodityController.getEssentialCommodities); // Alias for singular
router.post('/essential-commodities', authenticateToken, requireActiveUser, requireAdminOrStaff, essentialCommodityController.createEssentialCommodity);
router.put('/essential-commodities/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, essentialCommodityController.updateEssentialCommodity);
router.delete('/essential-commodities/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, essentialCommodityController.deleteEssentialCommodity);

// Supplier routes
router.get('/suppliers', authenticateToken, requireActiveUser, supplierController.getSuppliers);
router.post('/suppliers', authenticateToken, requireActiveUser, requireAdminOrStaff, supplierController.createSupplier);
router.put('/suppliers/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, supplierController.updateSupplier);
router.delete('/suppliers/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, supplierController.deleteSupplier);

// Product routes
router.get('/products', authenticateToken, requireActiveUser, productController.getProducts);
router.post('/products', authenticateToken, requireActiveUser, requireAdminOrStaff, productController.createProduct);
router.put('/products/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, productController.updateProduct);
router.delete('/products/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, productController.deleteProduct);
router.get('/products/search', authenticateToken, requireActiveUser, productController.searchProducts);

// Stock Balance routes
router.get('/stock-balances', authenticateToken, requireActiveUser, stockBalanceController.getStockBalances);
router.get('/stock-balances/:id', authenticateToken, requireActiveUser, stockBalanceController.getStockBalance);
router.get('/stock-balances/total/:societyId', authenticateToken, requireActiveUser, stockBalanceController.getTotalStockBalance);
router.get('/stock-balances/product/:societyId/:productId', authenticateToken, requireActiveUser, stockBalanceController.getProductStockBalance);

// Member routes (for member lookup in stock sales)
router.get('/members', authenticateToken, requireActiveUser, userController.getUsers);

module.exports = router;
