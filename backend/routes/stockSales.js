const express = require('express');
const router = express.Router();
const {
  getStockSales,
  getStockSale,
  getStockSaleBySivNo,
  createStockSale,
  updateStockSale,
  deleteStockSale,
  searchStockSales
} = require('../controllers/stockSalesController');

const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Routes for stock sales
router.route('/')
  .get(getStockSales)
  .post(requireRole('admin', 'staff'), createStockSale);

router.route('/:id')
  .get(getStockSale)
  .put(requireRole('admin', 'staff'), updateStockSale)
  .delete(requireRole('admin'), deleteStockSale);

// Special routes - search only (approval removed)
router.get('/siv/:sivNo', getStockSaleBySivNo);
router.get('/search/:query', searchStockSales);

module.exports = router;
