  const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  register,
  verifyEmail,
  verifyPhone,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  getProfile,
  updateProfile,
  resendEmailVerification,
  resendPhoneVerification,
  activateMemberAutoApprove
} = require('../controllers/authController');
const {
  authenticateToken,
  requireActiveUser,
  requireAdmin
} = require('../middleware/auth');

// Validation middleware
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const emailVerificationValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must contain only numbers')
];

const phoneVerificationValidation = [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required'),

  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must contain only numbers')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),

  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),

  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

const resendEmailValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

const resendPhoneValidation = [
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
];

const activateMemberValidation = [
  body('memberNumber')
    .notEmpty()
    .withMessage('Member ID is required')
    .trim(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must contain only numbers')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Public routes
router.post('/register', register);
router.post('/verify-email', emailVerificationValidation, handleValidationErrors, verifyEmail);
router.post('/verify-phone', phoneVerificationValidation, handleValidationErrors, verifyPhone);
router.post('/resend-email-verification', resendEmailValidation, handleValidationErrors, resendEmailVerification);
router.post('/resend-phone-verification', resendPhoneValidation, handleValidationErrors, resendPhoneVerification);
router.post('/activate-member', activateMemberValidation, handleValidationErrors, activateMemberAutoApprove);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, resetPassword);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/profile', authenticateToken, requireActiveUser, getProfile);
router.put('/profile', authenticateToken, requireActiveUser, updateProfileValidation, handleValidationErrors, updateProfile);

// Test routes for email and WhatsApp (protected - admin only, remove in production)
router.post('/test-email', authenticateToken, requireActiveUser, requireAdmin, async (req, res) => {
  try {
    const { sendVerificationEmail } = require('../utils/emailService');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    await sendVerificationEmail(email, 'TEST123');
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/test-whatsapp', authenticateToken, requireActiveUser, requireAdmin, async (req, res) => {
  try {
    const { sendVerificationWhatsApp } = require('../utils/smsService');
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    await sendVerificationWhatsApp(phone, 'TEST123');
    res.json({ message: 'Test WhatsApp message sent successfully' });
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;