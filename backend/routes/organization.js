const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  searchOrganizations
} = require('../controllers/organizationController');
const {
  authenticateToken,
  requireActiveUser,
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

// Validation middleware for create
const createOrganizationValidation = [
  body('code')
    .notEmpty()
    .withMessage('Organization code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Organization code must be between 2 and 10 characters')
    .matches(/^[A-Z0-9]+$/i)
    .withMessage('Organization code can only contain letters and numbers'),

  body('name')
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Organization name must be between 1 and 100 characters')
    .trim(),

  body('society')
    .notEmpty()
    .withMessage('Society is required')
    .isMongoId()
    .withMessage('Invalid society ID'),

  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters')
];

// Validation middleware for update
const updateOrganizationValidation = [
  body('code')
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('Organization code must be between 2 and 10 characters')
    .matches(/^[A-Z0-9]+$/i)
    .withMessage('Organization code can only contain letters and numbers'),

  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Organization name must be between 1 and 100 characters')
    .trim(),

  body('society')
    .optional()
    .isMongoId()
    .withMessage('Invalid society ID'),

  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters')
];

// Routes
router.get('/', authenticateToken, requireActiveUser, getOrganizations);
router.get('/search', authenticateToken, requireActiveUser, searchOrganizations);
router.get('/:id', authenticateToken, requireActiveUser, getOrganization);
router.post('/', authenticateToken, requireActiveUser, requireAdminOrStaff, createOrganizationValidation, handleValidationErrors, createOrganization);
router.put('/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, updateOrganizationValidation, handleValidationErrors, updateOrganization);
router.delete('/:id', authenticateToken, requireActiveUser, requireAdminOrStaff, deleteOrganization);

module.exports = router;
