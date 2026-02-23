const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/stockSalesController_new');

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

// Special routes
router.get('/siv/:sivNo', getStockSaleBySivNo);
router.get('/search/:query', searchStockSales);
router.put('/:id/post', requireRole('admin', 'staff'), postStockSale);
router.put('/:id/approve', requireRole('admin', 'staff'), approveStockSale);
router.put('/:id/reject', requireRole('admin', 'staff'), rejectStockSale);
router.get('/summary', getStockSalesSummary);

module.exports = router;
