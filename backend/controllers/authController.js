const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { sendVerificationSMS, sendVerificationWhatsApp, sendPasswordResetSMS, sendPasswordResetWhatsApp } = require('../utils/smsService');

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

    // Send verification email and SMS/WhatsApp (non-blocking)
    // Note: Errors are caught but registration continues to allow user to resend codes
    if (user.email) {
      sendVerificationEmail(user.email, emailToken).catch(err => {
        console.error('Email sending failed:', err.message);
        // Log error but don't expose sensitive information
      });
    }

    if (user.phone) {
      sendVerificationSMS(user.phone, phoneToken).catch(err => {
        console.error('SMS sending failed:', err.message);
        // Log error but don't expose sensitive information
      });

      if (process.env.WHATSAPP_ENABLED !== 'false') {
        sendVerificationWhatsApp(user.phone, phoneToken).catch(err => {
          console.error('WhatsApp sending failed:', err.message);
          // Log error but don't expose sensitive information
        });
      }
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email and phone for verification codes.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
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

    // Send password reset email and SMS/WhatsApp (non-blocking)
    sendPasswordResetEmail(user.email, resetToken).catch(err => {
      console.error('Password reset email failed:', err.message);
    });

    sendPasswordResetSMS(user.phone, resetToken).catch(err => {
      console.error('Password reset SMS failed:', err.message);
    });

    if (process.env.WHATSAPP_ENABLED !== 'false') {
      sendPasswordResetWhatsApp(user.phone, resetToken).catch(err => {
        console.error('Password reset WhatsApp failed:', err.message);
      });
    }

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
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resend email verification
const resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const emailToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    try {
      await sendVerificationEmail(user.email, emailToken);
      res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
      console.error('Resend email verification error:', error.message);
      res.status(500).json({ 
        message: 'Failed to resend verification email. Please check your email service configuration.' 
      });
    }
  } catch (error) {
    console.error('Resend email verification error:', error.message);
    res.status(500).json({ 
      message: 'Failed to resend verification email' 
    });
  }
};

// @desc    Resend phone verification
const resendPhoneVerification = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({ message: 'Phone is already verified' });
    }

    const phoneToken = generateOTP();
    user.phoneVerificationToken = phoneToken;
    user.phoneVerificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      const sendPromises = [sendVerificationSMS(user.phone, phoneToken)];
      
      if (process.env.WHATSAPP_ENABLED !== 'false') {
        sendPromises.push(sendVerificationWhatsApp(user.phone, phoneToken));
      }

      await Promise.all(sendPromises);
      res.json({ message: 'Verification code sent successfully' });
    } catch (error) {
      console.error('Resend phone verification error:', error.message);
      res.status(500).json({ 
        message: 'Failed to resend verification code. Please check your SMS/WhatsApp service configuration.' 
      });
    }
  } catch (error) {
    console.error('Resend phone verification error:', error.message);
    res.status(500).json({ 
      message: 'Failed to resend verification code' 
    });
  }
};

// @desc    Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = email;
      user.isEmailVerified = false; // Require re-verification
    }

    // Check if phone is being changed and if it's already taken
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ phone, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number is already taken' });
      }
      user.phone = phone;
      user.isPhoneVerified = false; // Require re-verification
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
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
  updateProfile,
  resendEmailVerification,
  resendPhoneVerification
};