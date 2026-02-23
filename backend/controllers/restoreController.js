const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// @desc    Restore database from backup
// @route   POST /api/common/restore
// @access  Private (Admin only)
const restoreFromBackup = async (req, res) => {
  try {
    const { backupId, confirmRestore = false } = req.body;

    if (!backupId) {
      return res.status(400).json({
        success: false,
        message: 'Backup ID is required'
      });
    }

    if (!confirmRestore) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm restore operation by setting confirmRestore to true'
      });
    }

    const Backup = mongoose.model('Backup');
    const backup = await Backup.findById(backupId);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    // Check if backup file exists
    try {
      await fs.access(backup.path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found on disk'
      });
    }

    // Read backup file
    const backupData = JSON.parse(await fs.readFile(backup.path, 'utf8'));

    // Validate backup format
    if (!backupData.metadata || !backupData.collections) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup file format'
      });
    }

    // Create restore log
    const RestoreLog = mongoose.model('RestoreLog');
    const restoreLog = await RestoreLog.create({
      backupId,
      backupName: backup.name,
      initiatedBy: req.user.userId || req.user._id,
      status: 'in_progress',
      metadata: backupData.metadata
    });

    // Perform restore operation (run in background)
    performRestore(backupData, restoreLog._id)
      .then(async (result) => {
        await RestoreLog.findByIdAndUpdate(restoreLog._id, {
          status: 'completed',
          completedAt: new Date(),
          result
        });
      })
      .catch(async (error) => {
        console.error('Restore failed:', error);
        await RestoreLog.findByIdAndUpdate(restoreLog._id, {
          status: 'failed',
          completedAt: new Date(),
          error: error.message
        });
      });

    res.json({
      success: true,
      message: 'Restore operation initiated. This may take several minutes.',
      data: {
        restoreId: restoreLog._id,
        backupName: backup.name,
        status: 'in_progress'
      }
    });
  } catch (error) {
    console.error('Restore from backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while initiating restore'
    });
  }
};

// @desc    Get restore logs
// @route   GET /api/common/restore/logs
// @access  Private (Admin only)
const getRestoreLogs = async (req, res) => {
  try {
    const RestoreLog = mongoose.model('RestoreLog');
    const logs = await RestoreLog.find({})
      .populate('backupId', 'name type')
      .populate('initiatedBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get restore logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching restore logs'
    });
  }
};

// @desc    Get restore log by ID
// @route   GET /api/common/restore/logs/:id
// @access  Private (Admin only)
const getRestoreLog = async (req, res) => {
  try {
    const RestoreLog = mongoose.model('RestoreLog');
    const log = await RestoreLog.findById(req.params.id)
      .populate('backupId', 'name type path')
      .populate('initiatedBy', 'username firstName lastName');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Restore log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get restore log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching restore log'
    });
  }
};

// @desc    Validate backup file
// @route   POST /api/common/restore/validate
// @access  Private (Admin only)
const validateBackup = async (req, res) => {
  try {
    const { backupId } = req.body;

    if (!backupId) {
      return res.status(400).json({
        success: false,
        message: 'Backup ID is required'
      });
    }

    const Backup = mongoose.model('Backup');
    const backup = await Backup.findById(backupId);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    // Check if backup file exists
    try {
      await fs.access(backup.path);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Backup file not found on disk'
      });
    }

    // Read and validate backup file
    const backupData = JSON.parse(await fs.readFile(backup.path, 'utf8'));

    // Validate backup structure
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {
        collections: 0,
        totalDocuments: 0,
        collectionsWithData: []
      }
    };

    if (!backupData.metadata) {
      validation.isValid = false;
      validation.errors.push('Missing metadata section');
    }

    if (!backupData.collections) {
      validation.isValid = false;
      validation.errors.push('Missing collections section');
    } else {
      validation.stats.collections = Object.keys(backupData.collections).length;

      for (const [collectionName, documents] of Object.entries(backupData.collections)) {
        if (!Array.isArray(documents)) {
          validation.errors.push(`Collection '${collectionName}' is not an array`);
          validation.isValid = false;
        } else {
          validation.stats.totalDocuments += documents.length;
          if (documents.length > 0) {
            validation.stats.collectionsWithData.push({
              name: collectionName,
              count: documents.length
            });
          }
        }
      }
    }

    // Check for potential issues
    if (validation.stats.totalDocuments === 0) {
      validation.warnings.push('Backup contains no documents');
    }

    res.json({
      success: true,
      data: {
        backup: {
          id: backup._id,
          name: backup.name,
          type: backup.type,
          createdAt: backup.createdAt
        },
        validation
      }
    });
  } catch (error) {
    console.error('Validate backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while validating backup'
    });
  }
};

// Helper function to perform the actual restore
async function performRestore(backupData, restoreLogId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = {
      collectionsProcessed: 0,
      documentsRestored: 0,
      errors: []
    };

    // Clear existing data and restore from backup
    for (const [collectionName, documents] of Object.entries(backupData.collections)) {
      try {
        // Skip system collections
        if (collectionName.startsWith('system.')) {
          continue;
        }

        const collection = mongoose.connection.db.collection(collectionName);

        // Clear existing data
        await collection.deleteMany({}, { session });

        // Insert backup data
        if (documents.length > 0) {
          await collection.insertMany(documents, { session });
        }

        result.collectionsProcessed++;
        result.documentsRestored += documents.length;

      } catch (error) {
        result.errors.push(`Failed to restore collection ${collectionName}: ${error.message}`);
        console.error(`Restore error for ${collectionName}:`, error);
      }
    }

    await session.commitTransaction();
    session.endSession();

    return result;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

module.exports = {
  restoreFromBackup,
  getRestoreLogs,
  getRestoreLog,
  validateBackup
};
