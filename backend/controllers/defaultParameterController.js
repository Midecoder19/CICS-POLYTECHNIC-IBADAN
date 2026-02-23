const DefaultParameter = require('../models/DefaultParameter');
const Society = require('../models/Society');

// @desc    Get default parameters for a society
// @route   GET /api/common/default-parameters
// @access  Private (Admin/Staff)
const getDefaultParameters = async (req, res) => {
  try {
    const { society } = req.query;
    const query = { isActive: true };

    if (society) {
      query.society = society;
    }

    const defaultParameters = await DefaultParameter.find(query)
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: defaultParameters.length,
      data: defaultParameters
    });
  } catch (error) {
    console.error('Get default parameters error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching default parameters'
    });
  }
};

// @desc    Get single default parameter
// @route   GET /api/common/default-parameters/:id
// @access  Private (Admin/Staff)
const getDefaultParameter = async (req, res) => {
  try {
    const defaultParameter = await DefaultParameter.findById(req.params.id)
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!defaultParameter) {
      return res.status(404).json({
        success: false,
        message: 'Default parameter not found'
      });
    }

    res.json({
      success: true,
      data: defaultParameter
    });
  } catch (error) {
    console.error('Get default parameter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching default parameter'
    });
  }
};

// @desc    Create default parameter
// @route   POST /api/common/default-parameters
// @access  Private (Admin/Staff)
const createDefaultParameter = async (req, res) => {
  try {
    const { society, ...otherData } = req.body;

    // Check if society exists
    if (society) {
      const societyExists = await Society.findById(society);
      if (!societyExists) {
        return res.status(404).json({
          success: false,
          message: 'Society not found'
        });
      }
    }

    // Check if default parameter already exists for this society
    const existingParameter = await DefaultParameter.findOne({
      society,
      isActive: true
    });

    if (existingParameter) {
      return res.status(400).json({
        success: false,
        message: 'Default parameters already exist for this society'
      });
    }

    const defaultParameter = await DefaultParameter.create({
      ...otherData,
      society,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    const populatedParameter = await DefaultParameter.findById(defaultParameter._id)
      .populate('society', 'code name');

    res.status(201).json({
      success: true,
      message: 'Default parameters created successfully',
      data: populatedParameter
    });
  } catch (error) {
    console.error('Create default parameter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating default parameters'
    });
  }
};

// @desc    Update default parameter
// @route   PUT /api/common/default-parameters/:id
// @access  Private (Admin/Staff)
const updateDefaultParameter = async (req, res) => {
  try {
    const { society, ...updateData } = req.body;

    const defaultParameter = await DefaultParameter.findById(req.params.id);

    if (!defaultParameter) {
      return res.status(404).json({
        success: false,
        message: 'Default parameter not found'
      });
    }

    // Check if society is being changed and if it conflicts
    if (society && society !== defaultParameter.society.toString()) {
      const existingParameter = await DefaultParameter.findOne({
        society,
        isActive: true,
        _id: { $ne: req.params.id }
      });

      if (existingParameter) {
        return res.status(400).json({
          success: false,
          message: 'Default parameters already exist for this society'
        });
      }
    }

    const updatedParameter = await DefaultParameter.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        ...(society && { society }),
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Default parameters updated successfully',
      data: updatedParameter
    });
  } catch (error) {
    console.error('Update default parameter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating default parameters'
    });
  }
};

// @desc    Delete default parameter (soft delete)
// @route   DELETE /api/common/default-parameters/:id
// @access  Private (Admin)
const deleteDefaultParameter = async (req, res) => {
  try {
    const defaultParameter = await DefaultParameter.findById(req.params.id);

    if (!defaultParameter) {
      return res.status(404).json({
        success: false,
        message: 'Default parameter not found'
      });
    }

    defaultParameter.isActive = false;
    defaultParameter.updatedBy = req.user._id;
    await defaultParameter.save();

    res.json({
      success: true,
      message: 'Default parameters deleted successfully'
    });
  } catch (error) {
    console.error('Delete default parameter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting default parameters'
    });
  }
};

// @desc    Search accounts for default parameters
// @route   GET /api/common/default-parameters/search/accounts
// @access  Private (Admin/Staff)
const searchAccounts = async (req, res) => {
  try {
    const { society, query } = req.query;

    // For now, return a mock response since account system is not implemented
    // In a real implementation, this would search the account master
    const mockAccounts = [
      { code: '1001', name: 'Cash Account' },
      { code: '1002', name: 'Bank Account' },
      { code: '2001', name: 'Creditor Account' },
      { code: '2002', name: 'Debtor Account' },
      { code: '3001', name: 'GL Bank Account' }
    ];

    const filteredAccounts = query
      ? mockAccounts.filter(account =>
          account.code.toLowerCase().includes(query.toLowerCase()) ||
          account.name.toLowerCase().includes(query.toLowerCase())
        )
      : mockAccounts;

    res.json({
      success: true,
      count: filteredAccounts.length,
      data: filteredAccounts
    });
  } catch (error) {
    console.error('Search accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching accounts'
    });
  }
};

module.exports = {
  getDefaultParameters,
  getDefaultParameter,
  createDefaultParameter,
  updateDefaultParameter,
  deleteDefaultParameter,
  searchAccounts
};
