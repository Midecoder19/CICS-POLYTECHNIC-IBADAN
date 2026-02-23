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

// @desc    Register user (Member activation OR Staff signup)
const register = async (req, res) => {
  try {
    const { signupType, memberNumber, email, firstName, lastName, username, password } = req.body;

    // Validate signup type
    if (!signupType || !['member', 'staff'].includes(signupType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signup type. Must be "member" or "staff"'
      });
    }

    // MEMBER SIGNUP FLOW (Activation-based)
    if (signupType === 'member') {
      // Validate required fields for member signup
      if (!memberNumber || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Member ID, email, and password are required for member activation.'
        });
      }

      // Check if member exists in database
      const existingMember = await User.findOne({
        memberNumber: memberNumber.trim(),
        role: 'member'
      });

      if (!existingMember) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Member ID. Please contact your cooperative administrator.'
        });
      }

      // Check if member is already activated
      if (existingMember.activated) {
        return res.status(400).json({
          success: false,
          message: 'This member account is already activated. Please login with your credentials.'
        });
      }

      // Check if member has been approved by admin
      if (existingMember.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Your member account is pending approval. Please contact your cooperative administrator.'
        });
      }

      // Check if email is already in use by another member
      const existingEmail = await User.findOne({
        email: email.toLowerCase().trim(),
        role: 'member',
        _id: { $ne: existingMember._id }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered to another member account.'
        });
      }

      // Generate verification token
      const verificationToken = generateOTP();

      // Update member record with new information
      existingMember.email = email.toLowerCase().trim();
      existingMember.memberNumber = memberNumber.trim(); // Store original member number
      existingMember.username = memberNumber.padStart(3, '0'); // Pad to meet min length requirement
      existingMember.password = password; // Plain password - will be hashed by pre-save hook
      existingMember.status = 'approved'; // Auto-approve
      existingMember.emailVerificationToken = verificationToken;
      existingMember.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await existingMember.save();

      // Send verification email
      try {
        await sendVerificationEmail(existingMember.email, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        console.log(`TESTING: Verification code for ${existingMember.email} is: ${verificationToken}`);
        // Continue anyway, user can request resend
      }

      return res.status(201).json({
        success: true,
        message: 'Verification email sent. Please check your email and enter the verification code.',
        data: {
          id: existingMember._id,
          memberNumber: existingMember.memberNumber,
          email: existingMember.email,
          requiresVerification: true
        }
      });
    }

    // STAFF/ADMIN SIGNUP FLOW (Direct registration)
    else if (signupType === 'staff') {
      // Validate required fields for staff signup
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required for staff signup.'
        });
      }

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [
          { username: username },
          { email: email.toLowerCase() }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this username or email'
        });
      }

      // Create staff/admin user (approved by default)
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.create({
        username,
        password: hashedPassword,
        email: email.toLowerCase(),
        firstName: firstName,
        lastName: lastName,
        role: 'staff', // Default to staff, can be changed to admin later
        status: 'approved', // Staff/admin are approved immediately
        activated: true
      });

      return res.status(201).json({
        success: true,
        message: 'Staff account created successfully. You can now login.',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: 'approved'
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// @desc    Verify email
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationToken: code,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    // For members, activate the account after email verification
    if (user.role === 'member') {
      user.activated = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: { email: user.email }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
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
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationToken = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Phone verified successfully',
      data: { phone: user.phone }
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ success: false, message: 'Phone verification failed' });
  }
};

// @desc    Login user (Member, Staff, or Admin)
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user;

    // Priority search: Admin/Staff first, then Members
    // First try to find admin/staff by username or email
    user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ],
      role: { $in: ['admin', 'staff'] }
    }).populate('society', 'code name');

    // If not found, try to find member by memberNumber or email
    if (!user) {
      user = await User.findOne({
        $or: [
          { memberNumber: username },
          { email: username }
        ],
        role: 'member'
      }).populate('society', 'code name');
    }

    // If still not found, try username for members (fallback)
    if (!user) {
      user = await User.findOne({
        username: username,
        role: 'member'
      }).populate('society', 'code name');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For members, check if activated and approved
    if (user.role === 'member') {
      if (!user.activated) {
        return res.status(401).json({
          success: false,
          message: 'Account not activated. Please complete signup process.'
        });
      }
      if (user.status !== 'approved') {
        return res.status(401).json({
          success: false,
          message: 'Account pending approval. Please contact administrator.'
        });
      }
    }

    // Check password for all users
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          memberNumber: user.memberNumber,
          society: user.society,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          activated: user.activated
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// @desc    Activate member account (set password after email verification) - Auto approve
const activateMemberAutoApprove = async (req, res) => {
  try {
    const { memberNumber, password, verificationCode } = req.body;

    // Validate required fields
    if (!memberNumber || !password || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Member ID, password, and verification code are required.'
      });
    }

    // Find member by memberNumber and verification code
    const member = await User.findOne({
      memberNumber: memberNumber.trim(),
      role: 'member',
      emailVerificationToken: verificationCode,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!member) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Member ID or verification code.'
      });
    }

    // Check if member is already activated
    if (member.activated) {
      return res.status(400).json({
        success: false,
        message: 'Member account is already activated. Please login.'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update member record
    member.password = hashedPassword;
    member.activated = true;
    member.status = 'approved'; // Auto-approve after activation
    member.emailVerificationToken = undefined;
    member.emailVerificationExpires = undefined;
    member.activatedAt = new Date();

    await member.save();

    res.status(200).json({
      success: true,
      message: 'Member account activated successfully. You can now login.',
      data: {
        id: member._id,
        memberNumber: member.memberNumber,
        email: member.email,
        activated: true,
        status: 'approved'
      }
    });

  } catch (error) {
    console.error('Member activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Activation failed'
    });
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

    res.json({
      success: true,
      message: 'If an account with this email exists, a reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed'
    });
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
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Password reset failed' });
  }
};

// @desc    Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// @desc    Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('society', 'code name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        society: user.society,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
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

    const emailToken = generateOTP();
    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    try {
      await sendVerificationEmail(user.email, emailToken);
      res.json({ success: true, message: 'Verification email sent successfully' });
    } catch (error) {
      console.error('Resend email verification error:', error.message);
      res.status(500).json({
        success: false,
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
      res.json({ success: true, message: 'Verification code sent successfully' });
    } catch (error) {
      console.error('Resend phone verification error:', error.message);
      res.status(500).json({
        success: false,
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

// @desc    Activate member account (set password after approval)
const activateMemberAfterApproval = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationToken: code,
      emailVerificationExpires: { $gt: Date.now() },
      role: 'member',
      status: 'approved' // Must be approved by admin
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activation code or account not approved'
      });
    }

    if (user.activated) {
      return res.status(400).json({
        success: false,
        message: 'Account is already activated'
      });
    }

    // Set password and activate account
    user.password = password;
    user.activated = true;
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Account activated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          memberNumber: user.memberNumber,
          activated: user.activated
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Member activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Account activation failed'
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
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        society: user.society,
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
  resendPhoneVerification,
  activateMember: activateMemberAutoApprove,
  activateMemberAutoApprove,
  activateMemberAfterApproval
};
