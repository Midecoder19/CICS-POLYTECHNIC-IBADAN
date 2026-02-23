const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUserActivity,
  getSystemHealth
} = require('../controllers/dashboardController');
const {
  authenticateToken,
  requireActiveUser,
  requireAdmin
} = require('../middleware/auth');

router.get('/stats', authenticateToken, requireActiveUser, getDashboardStats);
router.get('/activity', authenticateToken, requireActiveUser, getUserActivity);
router.get('/health', authenticateToken, requireActiveUser, requireAdmin, getSystemHealth);

module.exports = router;