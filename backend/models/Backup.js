const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Backup name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['full', 'partial'],
    default: 'full'
  },
  description: {
    type: String,
    trim: true
  },
  path: {
    type: String,
    required: [true, 'Backup file path is required']
  },
  size: {
    type: Number, // Size in bytes
    default: 0
  },
  collections: [{
    name: String,
    documentCount: Number,
    size: Number
  }],
  metadata: {
    version: String,
    createdAt: Date,
    serverInfo: mongoose.Schema.Types.Mixed,
    collectionsCount: Number,
    totalDocuments: Number,
    totalSize: Number
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String,
    trim: true
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Initiated by is required']
  },
  completedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
backupSchema.index({ type: 1, createdAt: -1 });
backupSchema.index({ status: 1, createdAt: -1 });
backupSchema.index({ initiatedBy: 1, createdAt: -1 });
backupSchema.index({ isActive: 1, createdAt: -1 });

// Method to get backup file info
backupSchema.methods.getFileInfo = async function() {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    const stats = await fs.stat(this.path);
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
};

// Method to delete backup file
backupSchema.methods.deleteFile = async function() {
  const fs = require('fs').promises;

  try {
    await fs.unlink(this.path);
    return true;
  } catch (error) {
    console.error('Error deleting backup file:', error);
    return false;
  }
};

// Static method to clean up old backups
backupSchema.statics.cleanupOldBackups = async function(retentionDays = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const oldBackups = await this.find({
    createdAt: { $lt: cutoffDate },
    isActive: true
  });

  let deletedCount = 0;
  for (const backup of oldBackups) {
    const fileDeleted = await backup.deleteFile();
    if (fileDeleted) {
      backup.isActive = false;
      await backup.save();
      deletedCount++;
    }
  }

  return deletedCount;
};

// Static method to get backup statistics
backupSchema.statics.getBackupStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalBackups: { $sum: 1 },
        totalSize: { $sum: '$size' },
        byType: {
          $push: '$type'
        },
        byStatus: {
          $push: '$status'
        }
      }
    },
    {
      $project: {
        totalBackups: 1,
        totalSize: 1,
        typeBreakdown: {
          full: {
            $size: {
              $filter: {
                input: '$byType',
                cond: { $eq: ['$$this', 'full'] }
              }
            }
          },
          partial: {
            $size: {
              $filter: {
                input: '$byType',
                cond: { $eq: ['$$this', 'partial'] }
              }
            }
          }
        },
        statusBreakdown: {
          completed: {
            $size: {
              $filter: {
                input: '$byStatus',
                cond: { $eq: ['$$this', 'completed'] }
              }
            }
          },
          failed: {
            $size: {
              $filter: {
                input: '$byStatus',
                cond: { $eq: ['$$this', 'failed'] }
              }
            }
          },
          in_progress: {
            $size: {
              $filter: {
                input: '$byStatus',
                cond: { $eq: ['$$this', 'in_progress'] }
              }
            }
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalBackups: 0,
    totalSize: 0,
    typeBreakdown: { full: 0, partial: 0 },
    statusBreakdown: { completed: 0, failed: 0, in_progress: 0 }
  };
};

module.exports = mongoose.model('Backup', backupSchema);
