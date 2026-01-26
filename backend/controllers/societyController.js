const Society = require('../models/Society');

// @desc    Get all societies
// @route   GET /api/common/society
// @access  Private (Admin/Staff)
const getSocieties = async (req, res) => {
  try {
    const societies = await Society.find({ isActive: true })
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: societies.length,
      data: societies
    });
  } catch (error) {
    console.error('Get societies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching societies'
    });
  }
};

// @desc    Get single society
// @route   GET /api/common/society/:id
// @access  Private (Admin/Staff)
const getSociety = async (req, res) => {
  try {
    const society = await Society.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    res.json({
      success: true,
      data: society
    });
  } catch (error) {
    console.error('Get society error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching society'
    });
  }
};

// @desc    Get society by code
// @route   GET /api/common/society/code/:code
// @access  Private (Admin/Staff)
const getSocietyByCode = async (req, res) => {
  try {
    const society = await Society.findOne({
      code: req.params.code.toUpperCase(),
      isActive: true
    })
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    res.json({
      success: true,
      data: society
    });
  } catch (error) {
    console.error('Get society by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching society'
    });
  }
};

// @desc    Create new society
// @route   POST /api/common/society
// @access  Private (Admin)
const createSociety = async (req, res) => {
  try {
    const {
      code,
      name,
      street,
      town,
      state,
      country,
      phone,
      email,
      website,
      bank,
      bankTitle,
      smtpPassword,
      logo
    } = req.body;

    // Check if society code already exists
    const existingSociety = await Society.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (existingSociety) {
      return res.status(400).json({
        success: false,
        message: 'Society code already exists'
      });
    }

    const society = await Society.create({
      code: code.toUpperCase(),
      name,
      street,
      town,
      state,
      country,
      phone,
      email,
      website,
      bank,
      bankTitle,
      smtpPassword,
      logo,
      createdBy: req.user._id
    });

    const populatedSociety = await Society.findById(society._id)
      .populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Society created successfully',
      data: populatedSociety
    });
  } catch (error) {
    console.error('Create society error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Society code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating society'
    });
  }
};

// @desc    Update society
// @route   PUT /api/common/society/:id
// @access  Private (Admin)
const updateSociety = async (req, res) => {
  try {
    const {
      code,
      name,
      street,
      town,
      state,
      country,
      phone,
      email,
      website,
      bank,
      bankTitle,
      smtpPassword,
      logo
    } = req.body;

    const society = await Society.findById(req.params.id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // Check if code is being changed and if it conflicts
    if (code && code.toUpperCase() !== society.code) {
      const existingSociety = await Society.findOne({
        code: code.toUpperCase(),
        isActive: true,
        _id: { $ne: req.params.id }
      });

      if (existingSociety) {
        return res.status(400).json({
          success: false,
          message: 'Society code already exists'
        });
      }
    }

    society._updatedBy = req.user._id;

    society.code = code ? code.toUpperCase() : society.code;
    society.name = name || society.name;
    society.street = street !== undefined ? street : society.street;
    society.town = town !== undefined ? town : society.town;
    society.state = state !== undefined ? state : society.state;
    society.country = country || society.country;
    society.phone = phone !== undefined ? phone : society.phone;
    society.email = email !== undefined ? email : society.email;
    society.website = website !== undefined ? website : society.website;
    society.bank = bank !== undefined ? bank : society.bank;
    society.bankTitle = bankTitle !== undefined ? bankTitle : society.bankTitle;
    society.smtpPassword = smtpPassword !== undefined ? smtpPassword : society.smtpPassword;
    society.logo = logo !== undefined ? logo : society.logo;

    await society.save();

    const updatedSociety = await Society.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Society updated successfully',
      data: updatedSociety
    });
  } catch (error) {
    console.error('Update society error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Society code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating society'
    });
  }
};

// @desc    Delete society (soft delete)
// @route   DELETE /api/common/society/:id
// @access  Private (Admin)
const deleteSociety = async (req, res) => {
  try {
    const society = await Society.findById(req.params.id);

    if (!society) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    society.isActive = false;
    society._updatedBy = req.user._id;
    await society.save();

    res.json({
      success: true,
      message: 'Society deleted successfully'
    });
  } catch (error) {
    console.error('Delete society error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting society'
    });
  }
};

// @desc    Search societies
// @route   GET /api/common/society/search/:query
// @access  Private (Admin/Staff)
const searchSocieties = async (req, res) => {
  try {
    const query = req.params.query;
    const societies = await Society.find({
      isActive: true,
      $or: [
        { code: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('createdBy', 'username firstName lastName')
      .sort({ code: 1 })
      .limit(50);

    res.json({
      success: true,
      count: societies.length,
      data: societies
    });
  } catch (error) {
    console.error('Search societies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching societies'
    });
  }
};

module.exports = {
  getSocieties,
  getSociety,
  getSocietyByCode,
  createSociety,
  updateSociety,
  deleteSociety,
  searchSocieties
};