const User = require('../models/User');
const Loan = require('../models/Loan');
const Ledger = require('../models/Ledger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Member login
// @route   POST /api/member/auth/login
// @access  Public (Members only)
const memberLogin = async (req, res) => {
  try {
    const { memberId, password } = req.body;

    // Validate input
    if (!memberId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Member ID and password are required'
      });
    }

    // Find user by memberNumber and role member
    const user = await User.findOne({
      memberNumber: memberId,
      role: 'member',
      isActive: true,
      activated: true
    }).populate('society', 'code name');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid member ID or password'
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
        user: {
          id: user._id,
          memberNumber: user.memberNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          society: user.society,
          activated: user.activated
        },
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Member login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// @desc    Get member profile
// @route   GET /api/member/profile
// @access  Private (Members only)
const getMemberProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({
      _id: userId,
      role: 'member'
    }).populate('society', 'code name address phone email')
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get member profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
};

// @desc    Get member loans
// @route   GET /api/member/loans
// @access  Private (Members only)
const getMemberLoans = async (req, res) => {
  try {
    const userId = req.user.userId;

    const loans = await Loan.find({
      member: userId
    })
    .populate('member', 'firstName lastName memberNumber')
    .sort({ createdAt: -1 });

    // Calculate totals
    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalBalance = loans.reduce((sum, loan) => sum + loan.balance, 0);
    const activeLoans = loans.filter(loan => loan.status === 'active').length;

    res.json({
      success: true,
      data: {
        loans,
        summary: {
          totalLoans: loans.length,
          activeLoans,
          totalPrincipal,
          totalBalance
        }
      },
      message: 'Loans retrieved successfully'
    });

  } catch (error) {
    console.error('Get member loans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve loans'
    });
  }
};

// @desc    Get member ledger
// @route   GET /api/member/ledger
// @access  Private (Members only)
const getMemberLedger = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const ledger = await Ledger.find({
      member: userId
    })
    .populate('member', 'firstName lastName memberNumber')
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Ledger.countDocuments({ member: userId });

    // Calculate totals
    const totalDebit = ledger.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = ledger.reduce((sum, entry) => sum + entry.credit, 0);
    const netBalance = totalCredit - totalDebit;

    res.json({
      success: true,
      data: {
        ledger,
        summary: {
          totalEntries: total,
          totalDebit,
          totalCredit,
          netBalance
        }
      },
      message: 'Ledger retrieved successfully'
    });

  } catch (error) {
    console.error('Get member ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ledger'
    });
  }
};

module.exports = {
  memberLogin,
  getMemberProfile,
  getMemberLoans,
  getMemberLedger
};
