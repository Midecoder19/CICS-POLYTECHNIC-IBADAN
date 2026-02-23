const Organization = require('../models/Organization');
const { validationResult } = require('express-validator');

// Get all organizations
const getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({ isActive: true })
      .populate('society', 'code name')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message
    });
  }
};

// Get organization by ID
const getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('society', 'code name')
      .populate('createdBy', 'username');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization',
      error: error.message
    });
  }
};

// Create new organization
const createOrganization = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, name, society, description } = req.body;

    // Check if organization code already exists for this society
    const existingOrg = await Organization.findOne({ code, society });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization code already exists for this society'
      });
    }

    const organization = new Organization({
      code,
      name,
      society,
      description,
      createdBy: req.user.id
    });

    await organization.save();

    const populatedOrg = await Organization.findById(organization._id)
      .populate('society', 'code name')
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: populatedOrg
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
      error: error.message
    });
  }
};

// Update organization
const updateOrganization = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, name, society, description } = req.body;

    // Check if updated code conflicts with existing organization
    const existingOrg = await Organization.findOne({
      code,
      society,
      _id: { $ne: req.params.id }
    });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization code already exists for this society'
      });
    }

    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    organization.code = code;
    organization.name = name;
    organization.society = society;
    organization.description = description;
    organization._updatedBy = req.user.id;

    await organization.save();

    const updatedOrg = await Organization.findById(organization._id)
      .populate('society', 'code name')
      .populate('createdBy', 'username');

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: updatedOrg
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: error.message
    });
  }
};

// Delete organization (soft delete)
const deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    organization.isActive = false;
    organization._updatedBy = req.user.id;
    await organization.save();

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete organization',
      error: error.message
    });
  }
};

// Search organizations
const searchOrganizations = async (req, res) => {
  try {
    const { query, society } = req.query;
    let searchCriteria = { isActive: true };

    if (society) {
      searchCriteria.society = society;
    }

    if (query) {
      searchCriteria.$or = [
        { code: new RegExp(query, 'i') },
        { name: new RegExp(query, 'i') }
      ];
    }

    const organizations = await Organization.find(searchCriteria)
      .populate('society', 'code name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Error searching organizations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search organizations',
      error: error.message
    });
  }
};

module.exports = {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  searchOrganizations
};
