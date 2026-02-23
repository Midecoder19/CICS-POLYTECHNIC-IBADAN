const StoreInformation = require('../models/StoreInformation');
const Society = require('../models/Society');

// @desc    Get all store information for a society
// @route   GET /api/common/store-information
// @access  Private (Admin/Staff)
const getStoreInformation = async (req, res) => {
  try {
    const { society, active } = req.query;
    const query = {};

    if (society) {
      query.society = society;
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const stores = await StoreInformation.find(query)
      .populate('society', 'code name')
      .sort({ storeCode: 1 });

    res.json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    console.error('Get store information error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching store information'
    });
  }
};

// @desc    Get single store information
// @route   GET /api/common/store-information/:id
// @access  Private (Admin/Staff)
const getStoreInfo = async (req, res) => {
  try {
    const store = await StoreInformation.findById(req.params.id)
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store information not found'
      });
    }

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('Get store info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching store information'
    });
  }
};

// @desc    Create store information
// @route   POST /api/common/store-information
// @access  Private (Admin/Staff)
const createStoreInformation = async (req, res) => {
  try {
    const { society, storeCode, name, address, glAccount, glStockAdj } = req.body;

    if (!storeCode || !name) {
      return res.status(400).json({
        success: false,
        message: 'Store code and name are required'
      });
    }

    // Check if society exists if provided
    if (society) {
      const societyExists = await Society.findById(society);
      if (!societyExists) {
        return res.status(404).json({
          success: false,
          message: 'Society not found'
        });
      }
    }

    // Check if store code already exists
    const existingStore = await StoreInformation.findOne({
      storeCode: storeCode.toUpperCase(),
      isActive: true
    });

    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: 'Store code already exists'
      });
    }

    const storeData = {
      society,
      storeCode: storeCode.toUpperCase(),
      name,
      location: address,
      glAccount: glAccount ? {
        code: glAccount.code?.toUpperCase().trim(),
        name: glAccount.name?.trim() || ""
      } : null,
      glStockAdj: glStockAdj ? {
        code: glStockAdj.code?.toUpperCase().trim(),
        name: glStockAdj.name?.trim() || ""
      } : null,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const store = await StoreInformation.create(storeData);

    const populatedStore = await StoreInformation.findById(store._id)
      .populate('society', 'code name');

    res.status(201).json({
      success: true,
      message: 'Store information created successfully',
      data: populatedStore
    });
  } catch (error) {
    console.error('Create store information error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating store information'
    });
  }
};

// @desc    Update store information
// @route   PUT /api/common/store-information/:id
// @access  Private (Admin/Staff)
const updateStoreInformation = async (req, res) => {
  try {
    const { storeCode, name, address, glAccount, glStockAdj, status } = req.body;

    const store = await StoreInformation.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store information not found'
      });
    }

    // If storeCode is being updated, check for uniqueness
    if (storeCode && storeCode !== store.storeCode) {
      const existingStore = await StoreInformation.findOne({
        society: store.society,
        storeCode: storeCode.toUpperCase(),
        _id: { $ne: req.params.id }
      });

      if (existingStore) {
        return res.status(400).json({
          success: false,
          message: 'Store code already exists for this society'
        });
      }
    }

    const updateData = {
      ...(storeCode && { storeCode: storeCode.toUpperCase() }),
      ...(name && { name }),
      ...(address && { location: address }),
      ...(glAccount && { glAccount }),
      ...(glStockAdj && { glStockAdj }),
      ...(status && { status, isActive: status === 'Active' }),
      updatedBy: req.user._id
    };

    const updatedStore = await StoreInformation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Store information updated successfully',
      data: updatedStore
    });
  } catch (error) {
    console.error('Update store information error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating store information'
    });
  }
};

// @desc    Delete store information
// @route   DELETE /api/common/store-information/:id
// @access  Private (Admin/Staff)
const deleteStoreInformation = async (req, res) => {
  try {
    const store = await StoreInformation.findByIdAndDelete(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store information not found'
      });
    }

    res.json({
      success: true,
      message: 'Store information deleted successfully'
    });
  } catch (error) {
    console.error('Delete store information error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting store information'
    });
  }
};

// @desc    Search stores by code or name
// @route   GET /api/common/store-information/search
// @access  Private (Admin/Staff)
const searchStores = async (req, res) => {
  try {
    const { society, query } = req.query;

    if (!society || !query) {
      return res.status(400).json({
        success: false,
        message: 'Society and search query are required'
      });
    }

    const searchRegex = new RegExp(query, 'i');

    const stores = await StoreInformation.find({
      society,
      isActive: true,
      $or: [
        { storeCode: searchRegex },
        { name: searchRegex }
      ]
    })
      .populate('society', 'code name')
      .limit(10)
      .sort({ storeCode: 1 });

    res.json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    console.error('Search stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching stores'
    });
  }
};

module.exports = {
  getStoreInformation,
  getStoreInfo,
  createStoreInformation,
  updateStoreInformation,
  deleteStoreInformation,
  searchStores
};