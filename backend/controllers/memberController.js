 const User = require('../models/User');
const Loan = require('../models/Loan');
const Ledger = require('../models/Ledger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Member login (accepts admin, staff, and member)
const memberLogin = async (req, res) => {
  try {
    const { memberId, password } = req.body;

    let user;

    // Priority search: Admin/Staff first, then Members
    // First try to find admin/staff by username
    user = await User.findOne({
      username: memberId,
      role: { $in: ['admin', 'staff'] },
      isActive: true
    });

    // If not found, try to find member by memberNumber
    if (!user) {
      user = await User.findOne({
        memberNumber: memberId,
        role: 'member',
        isActive: true
      });
    }

    // If still not found, try username for members (fallback)
    if (!user) {
      user = await User.findOne({
        username: memberId,
        role: 'member',
        isActive: true
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid member ID or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        memberNumber: user.memberNumber
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          memberNumber: user.memberNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Member login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get member profile
const getMemberProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -phoneVerificationToken -passwordResetToken')
      .populate('society', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        memberNumber: user.memberNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        society: user.society,
        isActive: user.isActive,
        activated: user.activated,
        createdAt: user.createdAt
      },
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get member profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get member loans
const getMemberLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ member: req.user._id })
      .populate('society', 'name')
      .sort({ createdAt: -1 });

    // Calculate summary
    const totalLoans = loans.length;
    const activeLoans = loans.filter(loan => loan.status === 'active').length;
    const totalBalance = loans.reduce((sum, loan) => sum + loan.balance, 0);

    res.json({
      success: true,
      data: {
        loans,
        summary: {
          totalLoans,
          activeLoans,
          totalBalance
        }
      },
      message: 'Loans retrieved successfully'
    });

  } catch (error) {
    console.error('Get member loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get member ledger
const getMemberLedger = async (req, res) => {
  try {
    const ledger = await Ledger.find({ member: req.user.userId })
      .populate('society', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: ledger,
      message: 'Ledger retrieved successfully'
    });

  } catch (error) {
    console.error('Get member ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  memberLogin,
  getMemberProfile,
  getMemberLoans,
  getMemberLedger
};
