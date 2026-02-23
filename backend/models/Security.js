const mongoose = require('mongoose');

const securitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: [true, 'Society is required']
  },
  // Permission flags based on VB6 global variables
  utility: {
    type: Boolean,
    default: false
  },
  security: {
    type: Boolean,
    default: false
  },
  main: {
    type: Boolean,
    default: false
  },
  task: {
    type: Boolean,
    default: false
  },
  periodic: {
    type: Boolean,
    default: false
  },
  report: {
    type: Boolean,
    default: false
  },
  update: {
    type: Boolean,
    default: false
  },
  // Additional permissions
  canCreateUsers: {
    type: Boolean,
    default: false
  },
  canDeleteUsers: {
    type: Boolean,
    default: false
  },
  canModifySettings: {
    type: Boolean,
    default: false
  },
  canAccessFinancialData: {
    type: Boolean,
    default: false
  },
  canAccessPayroll: {
    type: Boolean,
    default: false
  },
  canAccessStock: {
    type: Boolean,
    default: false
  },
  canBackupData: {
    type: Boolean,
    default: false
  },
  canRestoreData: {
    type: Boolean,
    default: false
  },
  // Branch and department restrictions
  allowedBranches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  allowedDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  // IP restrictions
  allowedIPs: [{
    type: String,
    trim: true
  }],
  // Time restrictions
  allowedHours: {
    start: {
      type: String, // HH:MM format
      default: '00:00'
    },
    end: {
      type: String, // HH:MM format
      default: '23:59'
    }
  },
  // Session management
  maxSessions: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  sessionTimeout: {
    type: Number, // minutes
    default: 60,
    min: 5,
    max: 480
  },
  // Audit trail
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
securitySchema.index({ user: 1, society: 1 }, { unique: true });
securitySchema.index({ society: 1 });
securitySchema.index({ isActive: 1 });
securitySchema.index({ 'allowedIPs': 1 });

// Pre-save middleware to set default permissions based on user role
securitySchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      // Get user to check role
      const User = mongoose.model('User');
      const user = await User.findById(this.user);

      if (user) {
        // Set default permissions based on role
        if (user.role === 'admin') {
          this.utility = true;
          this.security = true;
          this.main = true;
          this.task = true;
          this.periodic = true;
          this.report = true;
          this.update = true;
          this.canCreateUsers = true;
          this.canDeleteUsers = true;
          this.canModifySettings = true;
          this.canAccessFinancialData = true;
          this.canAccessPayroll = true;
          this.canAccessStock = true;
          this.canBackupData = true;
          this.canRestoreData = true;
        } else if (user.role === 'staff') {
          // Staff gets basic permissions
          this.main = true;
          this.task = true;
          this.report = true;
          this.canAccessFinancialData = true;
          this.canAccessPayroll = true;
          this.canAccessStock = true;
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if user has permission
securitySchema.methods.hasPermission = function(permission) {
  return this[permission] === true;
};

// Method to check IP restriction
securitySchema.methods.isIPAllowed = function(ip) {
  if (!this.allowedIPs || this.allowedIPs.length === 0) {
    return true; // No restrictions
  }
  return this.allowedIPs.includes(ip);
};

// Method to check time restriction
securitySchema.methods.isTimeAllowed = function() {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const startTime = parseInt(this.allowedHours.start.replace(':', ''));
  const endTime = parseInt(this.allowedHours.end.replace(':', ''));

  return currentTime >= startTime && currentTime <= endTime;
};

// Method to check if account is locked
securitySchema.methods.isLocked = function() {
  return !!(this.lockedUntil && this.lockedUntil > new Date());
};

// Method to increment login attempts
securitySchema.methods.incLoginAttempts = function() {
  if (this.loginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  }
  this.loginAttempts += 1;
  return this.save();
};

// Method to reset login attempts
securitySchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockedUntil = undefined;
  return this.save();
};

module.exports = mongoose.model('Security', securitySchema);
