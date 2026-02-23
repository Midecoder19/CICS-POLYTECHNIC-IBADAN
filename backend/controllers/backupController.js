const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Backup = mongoose.model('Backup');

// @desc    Create database backup
// @route   POST /api/common/backup
// @access  Private (Admin only)
const createBackup = async (req, res) => {
  try {
    const { name, type = 'full', description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Backup name is required'
      });
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    // Create backup record
    const backup = await Backup.create({
      name,
      type,
      description,
      path: filepath,
      status: 'in_progress',
      initiatedBy: req.user.userId || req.user._id
    });

    // Perform backup operation (run in background)
    performBackup(backup._id, filepath, type)
      .then(async (result) => {
        await Backup.findByIdAndUpdate(backup._id, {
          status: 'completed',
          size: result.size,
          collections: result.collections,
          metadata: result.metadata,
          completedAt: new Date()
        });
      })
      .catch(async (error) => {
        console.error('Backup failed:', error);
        await Backup.findByIdAndUpdate(backup._id, {
          status: 'failed',
          error: error.message,
          completedAt: new Date()
        });
      });

    res.status(201).json({
      success: true,
      message: 'Backup operation initiated. This may take several minutes.',
      data: {
        backupId: backup._id,
        name: backup.name,
        status: 'in_progress'
      }
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while initiating backup'
    });
  }
};

// @desc    Get all backups
// @route   GET /api/common/backup
// @access  Private (Admin only)
const getBackups = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const backups = await Backup.find(query)
      .populate('initiatedBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Backup.countDocuments(query);

    res.json({
      success: true,
      count: backups.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: backups
    });
  } catch (error) {
    console.error('Get backups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching backups'
    });
  }
};

// @desc    Get backup by ID
// @route   GET /api/common/backup/:id
// @access  Private (Admin only)
const getBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id)
      .populate('initiatedBy', 'username firstName lastName');

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    res.json({
      success: true,
      data: backup
    });
  } catch (error) {
    console.error('Get backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching backup'
    });
  }
};

// @desc    Delete backup
// @route   DELETE /api/common/backup/:id
// @access  Private (Admin only)
const deleteBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    // Delete the backup file
    try {
      await fs.unlink(backup.path);
    } catch (fileError) {
      console.warn('Could not delete backup file:', fileError.message);
    }

    // Mark backup as inactive
    backup.isActive = false;
    await backup.save();

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting backup'
    });
  }
};

// @desc    Download backup file
// @route   GET /api/common/backup/:id/download
// @access  Private (Admin only)
const downloadBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    if (backup.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Backup is not ready for download'
      });
    }

    // Check if file exists
    try {
      await fs.access(backup.path);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found on disk'
      });
    }

    // Send file for download
    res.download(backup.path, path.basename(backup.path));
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading backup'
    });
  }
};

// Helper function to perform the actual backup
async function performBackup(backupId, filepath, type) {
  const collections = {};
  let totalDocuments = 0;
  const collectionStats = [];

  try {
    // Get all collections
    const db = mongoose.connection.db;
    const collectionNames = await db.listCollections().toArray();

    for (const collectionInfo of collectionNames) {
      const collectionName = collectionInfo.name;

      // Skip system collections
      if (collectionName.startsWith('system.')) {
        continue;
      }

      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();

      collections[collectionName] = documents;
      totalDocuments += documents.length;

      collectionStats.push({
        name: collectionName,
        documentCount: documents.length,
        size: JSON.stringify(documents).length
      });
    }

    // Create backup metadata
    const metadata = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      serverInfo: {
        mongodb: mongoose.version,
        node: process.version
      },
      collectionsCount: Object.keys(collections).length,
      totalDocuments,
      type
    };

    // Write backup file
    const backupData = {
      metadata,
      collections
    };

    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf8');

    // Get file stats
    const stats = await fs.stat(filepath);

    return {
      size: stats.size,
      collections: collectionStats,
      metadata
    };

  } catch (error) {
    console.error('Backup operation failed:', error);
    throw error;
  }
}

module.exports = {
  createBackup,
  getBackups,
  getBackup,
  deleteBackup,
  downloadBackup
};
