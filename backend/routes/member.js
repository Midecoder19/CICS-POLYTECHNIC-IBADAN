const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  memberLogin,
  getMemberProfile,
  getMemberLoans,
  getMemberLedger
} = require('../controllers/memberController');
const {
  authenticateToken,
  requireActiveUser,
  requireMember
} = require('../middleware/auth');

// Validation middleware
const memberLoginValidation = [
  body('memberId')
    .notEmpty()
    .withMessage('Member ID is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Member ID must be between 3 and 20 characters'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Public routes
router.post('/auth/login', memberLoginValidation, handleValidationErrors, memberLogin);

// Protected routes (require member authentication)
router.get('/profile', authenticateToken, requireActiveUser, requireMember, getMemberProfile);
router.get('/loans', authenticateToken, requireActiveUser, requireMember, getMemberLoans);
router.get('/ledger', authenticateToken, requireActiveUser, requireMember, getMemberLedger);

module.exports = router;
