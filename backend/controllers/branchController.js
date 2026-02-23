const Branch = require('../models/Branch');
const { validationResult } = require('express-validator');

// Get all branches
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true })
      .populate('society', 'code name')
      .populate('organization', 'code name')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branches',
      error: error.message
    });
  }
};

// Get branch by ID
const getBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('society', 'code name')
      .populate('organization', 'code name')
      .populate('createdBy', 'username');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branch',
      error: error.message
    });
  }
};

// Create new branch
const createBranch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, name, society, organization, description } = req.body;

    // Check if branch code already exists for this organization
    const existingBranch = await Branch.findOne({ code, organization });
    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: 'Branch code already exists for this organization'
      });
    }

    const branch = new Branch({
      code,
      name,
      society,
      organization,
      description,
      createdBy: req.user.id
    });

    await branch.save();

    const populatedBranch = await Branch.findById(branch._id)
      .populate('society', 'code name')
      .populate('organization', 'code name')
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: populatedBranch
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create branch',
      error: error.message
    });
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, name, society, organization, description } = req.body;

    // Check if updated code conflicts with existing branch
    const existingBranch = await Branch.findOne({
      code,
      organization,
      _id: { $ne: req.params.id }
    });
    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: 'Branch code already exists for this organization'
      });
    }

    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    branch.code = code;
    branch.name = name;
    branch.society = society;
    branch.organization = organization;
    branch.description = description;
    branch._updatedBy = req.user.id;

    await branch.save();

    const updatedBranch = await Branch.findById(branch._id)
      .populate('society', 'code name')
      .populate('organization', 'code name')
      .populate('createdBy', 'username');

    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: updatedBranch
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branch',
      error: error.message
    });
  }
};

// Delete branch (soft delete)
const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    branch.isActive = false;
    branch._updatedBy = req.user.id;
    await branch.save();

    res.json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete branch',
      error: error.message
    });
  }
};

// Search branches
const searchBranches = async (req, res) => {
  try {
    const { query, organization, society } = req.query;
    let searchCriteria = { isActive: true };

    if (society) {
      searchCriteria.society = society;
    }

    if (organization) {
      searchCriteria.organization = organization;
    }

    if (query) {
      searchCriteria.$or = [
        { code: new RegExp(query, 'i') },
        { name: new RegExp(query, 'i') }
      ];
    }

    const branches = await Branch.find(searchCriteria)
      .populate('society', 'code name')
      .populate('organization', 'code name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error('Error searching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search branches',
      error: error.message
    });
  }
};

module.exports = {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  searchBranches
};
