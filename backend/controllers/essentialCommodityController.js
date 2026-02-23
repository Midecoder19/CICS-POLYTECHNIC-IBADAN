const EssentialCommodity = require('../models/EssentialCommodity');
const mongoose = require('mongoose');

// Get all essential commodities
const getEssentialCommodities = async (req, res) => {
  try {
    const commodities = await EssentialCommodity.find({ isActive: true })
      .sort({ code: 1 });

    res.json({
      success: true,
      data: commodities,
      count: commodities.length
    });
  } catch (error) {
    console.error('Error fetching essential commodities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch essential commodities',
      error: error.message
    });
  }
};

// Get single essential commodity
const getEssentialCommodity = async (req, res) => {
  try {
    const { id } = req.params;
    const commodity = await EssentialCommodity.findById(id);

    if (!commodity) {
      return res.status(404).json({
        success: false,
        message: 'Essential commodity not found'
      });
    }

    res.json({
      success: true,
      data: commodity
    });
  } catch (error) {
    console.error('Error fetching essential commodity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch essential commodity',
      error: error.message
    });
  }
};

// Create essential commodity
const createEssentialCommodity = async (req, res) => {
  try {
    const { code, name, description, category, unit, minimumStock, maximumStock, reorderPoint, glAccount } = req.body;

    // Check if code already exists
    const existingCommodity = await EssentialCommodity.findOne({ code: code.toUpperCase(), isActive: true });
    if (existingCommodity) {
      return res.status(400).json({
        success: false,
        message: 'Essential commodity code already exists'
      });
    }

    // Handle GL account - can be a string code or an object with code and name
    let glAccountData = null;
    if (glAccount) {
      if (typeof glAccount === 'object' && glAccount.code) {
        glAccountData = {
          code: glAccount.code.toUpperCase().trim(),
          name: glAccount.name?.trim() || ""
        };
      } else if (typeof glAccount === 'string') {
        glAccountData = {
          code: glAccount.toUpperCase().trim(),
          name: ""
        };
      }
    }

    const commodity = new EssentialCommodity({
      code: code.toUpperCase(),
      name,
      description,
      category,
      unit,
      minimumStock: minimumStock || 0,
      maximumStock: maximumStock || 0,
      reorderPoint: reorderPoint || 0,
      glAccount: glAccountData
    });

    await commodity.save();

    const populatedCommodity = await EssentialCommodity.findById(commodity._id);

    res.status(201).json({
      success: true,
      message: 'Essential commodity created successfully',
      data: populatedCommodity
    });
  } catch (error) {
    console.error('Error creating essential commodity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create essential commodity',
      error: error.message
    });
  }
};

// Update essential commodity
const updateEssentialCommodity = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, category, unit, minimumStock, maximumStock, reorderPoint, glAccount, isActive } = req.body;

    const commodity = await EssentialCommodity.findById(id);
    if (!commodity) {
      return res.status(404).json({
        success: false,
        message: 'Essential commodity not found'
      });
    }

    // Check if code already exists (excluding current record)
    if (code && code.toUpperCase() !== commodity.code) {
      const existingCommodity = await EssentialCommodity.findOne({
        code: code.toUpperCase(),
        _id: { $ne: id },
        isActive: true
      });
      if (existingCommodity) {
        return res.status(400).json({
          success: false,
          message: 'Essential commodity code already exists'
        });
      }
    }

    // Handle GL account - can be a string code or an object with code and name
    if (glAccount) {
      if (typeof glAccount === 'object' && glAccount.code) {
        commodity.glAccount = {
          code: glAccount.code.toUpperCase().trim(),
          name: glAccount.name?.trim() || ""
        };
      } else if (typeof glAccount === 'string') {
        commodity.glAccount = {
          code: glAccount.toUpperCase().trim(),
          name: ""
        };
      }
    }

    commodity.code = code ? code.toUpperCase() : commodity.code;
    commodity.name = name || commodity.name;
    commodity.description = description !== undefined ? description : commodity.description;
    commodity.category = category || commodity.category;
    commodity.unit = unit || commodity.unit;
    commodity.minimumStock = minimumStock !== undefined ? minimumStock : commodity.minimumStock;
    commodity.maximumStock = maximumStock !== undefined ? maximumStock : commodity.maximumStock;
    commodity.reorderPoint = reorderPoint !== undefined ? reorderPoint : commodity.reorderPoint;
    commodity.isActive = isActive !== undefined ? isActive : commodity.isActive;

    await commodity.save();

    const updatedCommodity = await EssentialCommodity.findById(id);

    res.json({
      success: true,
      message: 'Essential commodity updated successfully',
      data: updatedCommodity
    });
  } catch (error) {
    console.error('Error updating essential commodity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update essential commodity',
      error: error.message
    });
  }
};

// Delete essential commodity
const deleteEssentialCommodity = async (req, res) => {
  try {
    const { id } = req.params;

    const commodity = await EssentialCommodity.findById(id);
    if (!commodity) {
      return res.status(404).json({
        success: false,
        message: 'Essential commodity not found'
      });
    }

    await EssentialCommodity.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Essential commodity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting essential commodity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete essential commodity',
      error: error.message
    });
  }
};

// Search essential commodities
const searchEssentialCommodities = async (req, res) => {
  try {
    const { query } = req.query;

    const searchRegex = new RegExp(query, 'i');
    const commodities = await EssentialCommodity.find({
      isActive: true,
      $or: [
        { code: searchRegex },
        { name: searchRegex },
        { description: searchRegex }
      ]
    })
      .sort({ code: 1 })
      .limit(50);

    res.json({
      success: true,
      data: commodities,
      count: commodities.length
    });
  } catch (error) {
    console.error('Error searching essential commodities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search essential commodities',
      error: error.message
    });
  }
};

module.exports = {
  getEssentialCommodities,
  getEssentialCommodity,
  createEssentialCommodity,
  updateEssentialCommodity,
  deleteEssentialCommodity,
  searchEssentialCommodities
};
