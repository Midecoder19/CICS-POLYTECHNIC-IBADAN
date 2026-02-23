const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import member authentication controller
const {
  memberLogin,
  getMemberProfile,
  getMemberLoans,
  getMemberLedger
} = require('../controllers/memberAuthController');

// Import member authentication middleware
const { authenticateMember } = require('../middleware/memberAuth');

// @desc    Member login
// @route   POST /api/member/auth/login
// @access  Public
router.post('/auth/login', [
  body('memberId')
    .notEmpty()
    .withMessage('Member ID is required')
    .isLength({ min: 3 })
    .withMessage('Member ID must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], memberLogin);

// @desc    Get member profile
// @route   GET /api/member/profile
// @access  Private (Members only)
router.get('/profile', authenticateMember, getMemberProfile);

// @desc    Get member loans
// @route   GET /api/member/loans
// @access  Private (Members only)
router.get('/loans', authenticateMember, getMemberLoans);

// @desc    Get member ledger
// @route   GET /api/member/ledger
// @access  Private (Members only)
router.get('/ledger', authenticateMember, getMemberLedger);

module.exports = router;
