const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getSocieties,
  getSociety,
  getSocietyByCode,
  createSociety,  
  updateSociety,
  deleteSociety,
  searchSocieties
} = require('../controllers/societyController');
const {
  authenticateToken,
  requireActiveUser,
  requireAdmin,
  requireAdminOrStaff
} = require('../middleware/auth');

// Validation error handler middleware
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

// Validation middleware for create (code required)
const createSocietyValidation = [
  body('code')
    .notEmpty()
    .withMessage('Society code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Society code must be between 2 and 10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Society code can only contain uppercase letters and numbers'),

  body('name')
    .notEmpty()
    .withMessage('Society name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Society name must be between 1 and 100 characters')
    .trim(),

  body('street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),

  body('town')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Town cannot exceed 50 characters'),

  body('state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),

  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),

  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('bank')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bank name cannot exceed 100 characters'),

  body('bankTitle')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bank title cannot exceed 100 characters'),

  body('smtpPassword')
    .optional()
    .isLength({ max: 100 })
    .withMessage('SMTP password cannot exceed 100 characters')
];

// Validation middleware for update (code optional)
const updateSocietyValidation = [
  body('code')
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('Society code must be between 2 and 10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Society code can only contain uppercase letters and numbers'),

  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Society name must be between 1 and 100 characters')
    .trim(),

  body('street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),

  body('town')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Town cannot exceed 50 characters'),

  body('state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),

  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),

  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('bank')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bank name cannot exceed 100 characters'),

  body('bankTitle')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bank title cannot exceed 100 characters'),

  body('smtpPassword')
    .optional()
    .isLength({ max: 100 })
    .withMessage('SMTP password cannot exceed 100 characters')
];

// Routes
router.get('/', authenticateToken, requireActiveUser, getSocieties);
router.get('/search/:query', authenticateToken, requireActiveUser, searchSocieties);
router.get('/code/:code', authenticateToken, requireActiveUser, getSocietyByCode);
router.get('/:id', authenticateToken, requireActiveUser, getSociety);
router.post('/', authenticateToken, requireActiveUser, createSocietyValidation, handleValidationErrors, createSociety);
router.put('/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, updateSocietyValidation, handleValidationErrors, updateSociety);
router.delete('/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, deleteSociety);

module.exports = router;