const Security = require('../models/Security');
const User = require('../models/User');

// @desc    Get all security settings
// @route   GET /api/common/security
// @access  Private (Admin only)
const getSecuritySettings = async (req, res) => {
  try {
    const { society, user } = req.query;
    const query = { isActive: true };

    if (society) {
      query.society = society;
    }

    if (user) {
      query.user = user;
    }

    const securitySettings = await Security.find(query)
      .populate('user', 'username firstName lastName role')
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('allowedBranches', 'code name')
      .populate('allowedDepartments', 'code name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: securitySettings.length,
      data: securitySettings
    });
  } catch (error) {
    console.error('Get security settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching security settings'
    });
  }
};

// @desc    Get security settings for a specific user
// @route   GET /api/common/security/user/:userId
// @access  Private (Admin/Staff)
const getUserSecurity = async (req, res) => {
  try {
    const security = await Security.findOne({
      user: req.params.userId,
      isActive: true
    })
      .populate('user', 'username firstName lastName role')
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('allowedBranches', 'code name')
      .populate('allowedDepartments', 'code name');

    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security settings not found for this user'
      });
    }

    res.json({
      success: true,
      data: security
    });
  } catch (error) {
    console.error('Get user security error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user security settings'
    });
  }
};

// @desc    Create security settings for a user
// @route   POST /api/common/security
// @access  Private (Admin only)
const createSecuritySettings = async (req, res) => {
  try {
    const { user, society, ...permissions } = req.body;

    // Check if security settings already exist for this user
    const existingSecurity = await Security.findOne({
      user,
      society,
      isActive: true
    });

    if (existingSecurity) {
      return res.status(400).json({
        success: false,
        message: 'Security settings already exist for this user in this society'
      });
    }

    const security = await Security.create({
      user,
      society,
      ...permissions,
      createdBy: req.user.userId || req.user._id,
      updatedBy: req.user.userId || req.user._id
    });

    const populatedSecurity = await Security.findById(security._id)
      .populate('user', 'username firstName lastName role')
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('allowedBranches', 'code name')
      .populate('allowedDepartments', 'code name');

    res.status(201).json({
      success: true,
      message: 'Security settings created successfully',
      data: populatedSecurity
    });
  } catch (error) {
    console.error('Create security settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating security settings'
    });
  }
};

// @desc    Update security settings
// @route   PUT /api/common/security/:id
// @access  Private (Admin only)
const updateSecuritySettings = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user.userId || req.user._id
    };

    const security = await Security.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'username firstName lastName role')
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .populate('allowedBranches', 'code name')
      .populate('allowedDepartments', 'code name');

    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: security
    });
  } catch (error) {
    console.error('Update security settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating security settings'
    });
  }
};

// @desc    Delete security settings
// @route   DELETE /api/common/security/:id
// @access  Private (Admin only)
const deleteSecuritySettings = async (req, res) => {
  try {
    const security = await Security.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user.userId || req.user._id },
      { new: true }
    );

    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security settings not found'
      });
    }

    res.json({
      success: true,
      message: 'Security settings deleted successfully'
    });
  } catch (error) {
    console.error('Delete security settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting security settings'
    });
  }
};

// @desc    Check user permissions
// @route   GET /api/common/security/check-permission/:permission
// @access  Private
const checkPermission = async (req, res) => {
  try {
    const { permission } = req.params;
    const userId = req.user.userId || req.user._id;

    const security = await Security.findOne({
      user: userId,
      isActive: true
    });

    if (!security) {
      return res.json({
        success: true,
        hasPermission: false,
        message: 'No security settings found for user'
      });
    }

    const hasPermission = security.hasPermission(permission);

    res.json({
      success: true,
      hasPermission,
      userPermissions: {
        utility: security.utility,
        security: security.security,
        main: security.main,
        task: security.task,
        periodic: security.periodic,
        report: security.report,
        update: security.update,
        canCreateUsers: security.canCreateUsers,
        canDeleteUsers: security.canDeleteUsers,
        canModifySettings: security.canModifySettings,
        canAccessFinancialData: security.canAccessFinancialData,
        canAccessPayroll: security.canAccessPayroll,
        canAccessStock: security.canAccessStock,
        canBackupData: security.canBackupData,
        canRestoreData: security.canRestoreData
      }
    });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking permissions'
    });
  }
};

// @desc    Get users without security settings
// @route   GET /api/common/security/unassigned-users
// @access  Private (Admin only)
const getUnassignedUsers = async (req, res) => {
  try {
    const { society } = req.query;

    // Get all users
    const allUsers = await User.find({ isActive: true })
      .select('username firstName lastName role email')
      .sort({ username: 1 });

    // Get users who already have security settings
    const assignedUserIds = await Security.find({ society, isActive: true })
      .distinct('user');

    // Filter out assigned users
    const unassignedUsers = allUsers.filter(user =>
      !assignedUserIds.includes(user._id.toString())
    );

    res.json({
      success: true,
      count: unassignedUsers.length,
      data: unassignedUsers
    });
  } catch (error) {
    console.error('Get unassigned users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unassigned users'
    });
  }
};

// @desc    Bulk update security settings
// @route   PUT /api/common/security/bulk-update
// @access  Private (Admin only)
const bulkUpdateSecurity = async (req, res) => {
  try {
    const { userIds, updates } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const updateData = {
      ...updates,
      updatedBy: req.user.userId || req.user._id
    };

    const result = await Security.updateMany(
      { user: { $in: userIds }, isActive: true },
      updateData,
      { runValidators: true }
    );

    res.json({
      success: true,
      message: `Updated security settings for ${result.modifiedCount} users`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update security error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while bulk updating security settings'
    });
  }
};

module.exports = {
  getSecuritySettings,
  getUserSecurity,
  createSecuritySettings,
  updateSecuritySettings,
  deleteSecuritySettings,
  checkPermission,
  getUnassignedUsers,
  bulkUpdateSecurity
};
