const User = require('../models/User');

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
};