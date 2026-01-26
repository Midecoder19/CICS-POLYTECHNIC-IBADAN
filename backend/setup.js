const fs = require('fs');
const path = require('path');

// Backend file structure and contents
const backendFiles = {
  'server.js': `const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📝 Environment: \${process.env.NODE_ENV || 'development'}\`);
});

module.exports = app;`,

  'models/User.js': `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'member'],
    default: 'member'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{2,3})+$/, 'Please enter a valid email']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  // Phone verification
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationToken: String,
  phoneVerificationExpires: Date,
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);`,

  'middleware/auth.js': `const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = requireRole('admin');

// Middleware to check if user is admin or staff
const requireAdminOrStaff = requireRole('admin', 'staff');

// Middleware to check if user is active
const requireActiveUser = (req, res, next) => {
  if (!req.user.isActive) {
    return res.status(403).json({ message: 'Account is not active' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireAdminOrStaff,
  requireActiveUser
};`,

  'controllers/authController.js': `const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '30d' }
  );
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
const register = async (req, res) => {
  try {
    const { username, password, email, phone, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this username or email'
      });
    }

    const user = await User.create({
      username,
      password,
      email,
      phone,
      firstName,
      lastName,
      role: role || 'member'
    });

    const emailToken = crypto.randomBytes(32).toString('hex');
    const phoneToken = generateOTP();

    user.emailVerificationToken = emailToken;
    user.phoneVerificationToken = phoneToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    user.phoneVerificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log('Email verification token:', emailToken);
    console.log('Phone verification code:', phoneToken);

    res.status(201).json({
      message: 'User registered successfully. Check console for verification tokens.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Email verification failed' });
  }
};

// @desc    Verify phone
const verifyPhone = async (req, res) => {
  try {
    const { phone, code } = req.body;

    const user = await User.findOne({
      phone,
      phoneVerificationToken: code,
      phoneVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationToken = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Phone verified successfully' });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ message: 'Phone verification failed' });
  }
};

// @desc    Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// @desc    Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If an account with this email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    console.log('Password reset token:', resetToken);

    res.json({ message: 'If an account with this email exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Password reset request failed' });
  }
};

// @desc    Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};

// @desc    Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newToken = generateToken(user._id);

    res.json({
      token: newToken,
      refreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// @desc    Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Profile update failed' });
  }
};

module.exports = {
  register,
  verifyEmail,
  verifyPhone,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  getProfile,
  updateProfile
};`,

  'routes/auth.js': `const express = require('express');
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
  updateProfile
} = require('../controllers/authController');
const {
  authenticateToken,
  requireActiveUser
} = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),

  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'staff', 'member'])
    .withMessage('Role must be admin, staff, or member')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const emailVerificationValidation = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
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
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/verify-email', emailVerificationValidation, handleValidationErrors, verifyEmail);
router.post('/verify-phone', phoneVerificationValidation, handleValidationErrors, verifyPhone);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, resetPassword);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/profile', authenticateToken, requireActiveUser, getProfile);
router.put('/profile', authenticateToken, requireActiveUser, updateProfileValidation, handleValidationErrors, updateProfile);

module.exports = router;`,

  'controllers/dashboardController.js': `const User = require('../models/User');

// @desc    Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
    const staffCount = await User.countDocuments({ role: 'staff', isActive: true });
    const memberCount = await User.countDocuments({ role: 'member', isActive: true });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        recent: recentRegistrations
      },
      roles: {
        admin: adminCount,
        staff: staffCount,
        member: memberCount
      },
      financial: {
        totalSavings: 15420000,
        monthlySavings: 1280000,
        activeLoans: 45200000,
        stockValue: 8900000
      },
      activity: {
        totalTransactions: 1247,
        pendingApprovals: 23,
        systemAlerts: 5
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get user activity summary
const getUserActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('lastLogin createdAt');

    const activity = {
      lastLogin: user.lastLogin,
      accountCreated: user.createdAt,
      recentActivities: [
        {
          type: 'login',
          description: 'Logged into the system',
          timestamp: user.lastLogin,
          ip: '192.168.1.100'
        },
        {
          type: 'profile_update',
          description: 'Updated profile information',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          ip: '192.168.1.100'
        }
      ],
      loginCount: 42,
      devicesUsed: [
        { device: 'Chrome on Windows', lastUsed: user.lastLogin },
        { device: 'Mobile Safari', lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      ]
    };

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('User activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
};

// @desc    Get system health status
const getSystemHealth = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    const systemHealth = {
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'polyibadan'
      },
      server: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      },
      services: {
        email: 'configured',
        sms: 'configured',
        whatsapp: 'enabled'
      }
    };

    res.json({
      success: true,
      data: systemHealth
    });

  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUserActivity,
  getSystemHealth
};`,

  'routes/dashboard.js': `const express = require('express');
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

module.exports = router;`,

  'utils/emailService.js': `const nodemailer = require('nodemailer');

// Create transporter for Brevo (Sendinblue)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER || 'your-brevo-smtp-user',
      pass: process.env.BREVO_SMTP_PASSWORD || 'your-brevo-smtp-password'
    }
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Polyibadan Cooperative',
        address: process.env.BREVO_FROM_EMAIL || 'noreply@polyibadan.com'
      },
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Send verification email
const sendVerificationEmail = async (to, token) => {
  const verificationUrl = \`\${process.env.FRONTEND_URL}/verify-email/\${token}\`;

  return sendEmail({
    to,
    subject: 'Verify Your Email - Polyibadan Cooperative',
    html: \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Polyibadan!</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your Cooperative Management Partner</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1e40af; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 30px;">
            Thank you for registering with Polyibadan Cooperative. To complete your registration,
            please verify your email address by clicking the button below.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="\${verificationUrl}"
               style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
              Verify Email Address
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <span style="word-break: break-all; color: #1e40af;">\${verificationUrl}</span>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This verification link will expire in 24 hours.
            <br>
            If you didn't create an account, please ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
          <p>© 2024 Polyibadan Cooperative. All rights reserved.</p>
        </div>
      </div>
    \`
  });
};

// Send password reset email
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = \`\${process.env.FRONTEND_URL}/reset-password/\${token}\`;

  return sendEmail({
    to,
    subject: 'Password Reset - Polyibadan Cooperative',
    html: \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Reset your Polyibadan account password</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #dc2626; margin-top: 0;">Forgot Your Password?</h2>
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password for your Polyibadan Cooperative account.
            Click the button below to create a new password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="\${resetUrl}"
               style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
              Reset Password
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <span style="word-break: break-all; color: #dc2626;">\${resetUrl}</span>
          </p>

          <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #dc2626;">
            <p style="color: #dc2626; margin: 0; font-size: 14px; font-weight: 500;">
              🔒 Security Notice: This link will expire in 1 hour for your security.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            If you didn't request a password reset, please ignore this email.
            <br>
            Your password will remain unchanged.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
          <p>© 2024 Polyibadan Cooperative. All rights reserved.</p>
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    \`
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};`,

  'utils/smsService.js': `const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS using Twilio
const sendSMS = async ({ to, message }) => {
  try {
    const phoneNumber = to.startsWith('+') ? to : \`+234\${to.replace(/^0/, '')}\`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('Failed to send SMS');
  }
};

// Send WhatsApp message using Twilio
const sendWhatsApp = async ({ to, message }) => {
  try {
    const phoneNumber = to.startsWith('+') ? to : \`+234\${to.replace(/^0/, '')}\`;

    const result = await client.messages.create({
      body: message,
      from: \`whatsapp:\${process.env.TWILIO_WHATSAPP_NUMBER}\`,
      to: \`whatsapp:\${phoneNumber}\`
    });

    console.log('WhatsApp message sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('WhatsApp message sending failed:', error);
    throw new Error('Failed to send WhatsApp message');
  }
};

// Send verification SMS
const sendVerificationSMS = async (to, code) => {
  const message = \`🔐 Polyibadan Verification Code

Your verification code is: \${code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this message.

📱 Polyibadan Cooperative\`;

  return sendSMS({ to, message });
};

// Send WhatsApp verification
const sendVerificationWhatsApp = async (to, code) => {
  const message = \`🔐 *Polyibadan Cooperative*

*Verification Code:* \${code}

This code will expire in *10 minutes*.

If you didn't request this code, please ignore this message.

📱 *Secure Login System*\`;

  return sendWhatsApp({ to, message });
};

// Send password reset SMS
const sendPasswordResetSMS = async (to, resetToken) => {
  const resetUrl = \`\${process.env.FRONTEND_URL}/reset-password/\${resetToken}\`;

  const message = \`🔑 Password Reset - Polyibadan

You requested a password reset.

Reset Link: \${resetUrl}

This link expires in 1 hour.

If you didn't request this, ignore this message.

🛡️ Polyibadan Cooperative\`;

  return sendSMS({ to, message });
};

// Send password reset WhatsApp
const sendPasswordResetWhatsApp = async (to, resetToken) => {
  const resetUrl = \`\${process.env.FRONTEND_URL}/reset-password/\${resetToken}\`;

  const message = \`🔑 *Polyibadan Cooperative*

*Password Reset Request*

You requested a password reset for your account.

*Reset Link:* \${resetUrl}

⏰ *Expires in 1 hour*

If you didn't request this, please ignore this message.

🛡️ *Secure System*\`;

  return sendWhatsApp({ to, message });
};

// Send welcome SMS after successful registration
const sendWelcomeSMS = async (to, username) => {
  const message = \`🎉 Welcome to Polyibadan Cooperative!

Hello \${username},

Your account has been successfully created and verified.

You can now access all cooperative services through our platform.

📱 Happy Banking!

Polyibadan Cooperative Team\`;

  return sendSMS({ to, message });
};

// Send welcome WhatsApp message
const sendWelcomeWhatsApp = async (to, username) => {
  const message = \`🎉 *Welcome to Polyibadan Cooperative!*

Hello *\${username}*,

Your account has been successfully created and verified.

You can now access all cooperative services through our platform.

📱 *Happy Banking!*

*Polyibadan Cooperative Team*\`;

  return sendWhatsApp({ to, message });
};

module.exports = {
  sendSMS,
  sendWhatsApp,
  sendVerificationSMS,
  sendVerificationWhatsApp,
  sendPasswordResetSMS,
  sendPasswordResetWhatsApp,
  sendWelcomeSMS,
  sendWelcomeWhatsApp
};`,

  'scripts/seed.js': `const mongoose = require('mongoose');
const User = require('../models/User');

// Sample users for testing
const sampleUsers = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@polyibadan.com',
    phone: '+2348012345678',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  },
  {
    username: 'staff1',
    password: 'staff123',
    email: 'staff@polyibadan.com',
    phone: '+2348023456789',
    firstName: 'John',
    lastName: 'Staff',
    role: 'staff',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  },
  {
    username: 'member1',
    password: 'member123',
    email: 'member@polyibadan.com',
    phone: '+2348034567890',
    firstName: 'Jane',
    lastName: 'Member',
    role: 'member',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  },
  {
    username: 'demo',
    password: 'demo',
    email: 'demo@polyibadan.com',
    phone: '+2348045678901',
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🌱 Connected to MongoDB');

    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push({
        username: user.username,
        email: user.email,
        role: user.role
      });
    }

    console.log('✅ Sample users created successfully');
    console.log('\\n📋 Created Users:');
    createdUsers.forEach(user => {
      console.log(\`   - \${user.username} (\${user.role}) - \${user.email}\`);
    });

    console.log('\\n🔐 Login Credentials:');
    sampleUsers.forEach(user => {
      console.log(\`   \${user.username}: \${user.password}\`);
    });

    console.log('\\n🎉 Database seeding completed successfully!');
    console.log('🚀 You can now start the server and login with any of the above credentials.');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
}

// Run the seeding function
seedDatabase();`,

  '.env.example': `# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/polyibadan

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-key-different-from-jwt-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Brevo (Sendinblue) Email Configuration
BREVO_SMTP_USER=your-brevo-smtp-user
BREVO_SMTP_PASSWORD=your-brevo-smtp-password
BREVO_FROM_EMAIL=noreply@polyibadan.com

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp Configuration (using Twilio)
TWILIO_WHATSAPP_NUMBER=+1234567890
WHATSAPP_ENABLED=true`
};

// Function to create directory structure
function createDirectories() {
  const dirs = [
    'models',
    'controllers',
    'routes',
    'middleware',
    'utils',
    'config',
    'scripts'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(\`📁 Created directory: \${dir}\`);
    }
  });
}

// Function to create files
function createFiles() {
  Object.entries(backendFiles).forEach(([filePath, content]) => {
    const fullPath = filePath;
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(\`📄 Created file: \${fullPath}\`);
  });
}

// Run the setup
console.log('🚀 Setting up Polyibadan Backend...');
createDirectories();
createFiles();
console.log('✅ Backend setup complete!');
console.log('\\n📋 Next steps:');
console.log('1. Copy .env.example to .env and configure your settings');
console.log('2. Run: npm install');
console.log('3. Run: npm run seed (optional, for sample data)');
console.log('4. Run: npm run dev');
console.log('\\n🎉 Happy coding!');