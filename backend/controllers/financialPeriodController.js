const FinancialPeriod = require('../models/FinancialPeriod');
const Society = require('../models/Society');

// @desc    Get all financial periods for a society
// @route   GET /api/common/financial-period
// @access  Private (Admin/Staff)
const getFinancialPeriods = async (req, res) => {
  try {
    const { society, year, current } = req.query;
    const query = { isActive: true };

    if (society) {
      query.society = society;
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (current === 'true') {
      query.isCurrent = true;
    }

    const financialPeriods = await FinancialPeriod.find(query)
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .sort({ year: -1, periodNumber: 1 });

    res.json({
      success: true,
      count: financialPeriods.length,
      data: financialPeriods
    });
  } catch (error) {
    console.error('Get financial periods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching financial periods'
    });
  }
};

// @desc    Get single financial period
// @route   GET /api/common/financial-period/:id
// @access  Private (Admin/Staff)
const getFinancialPeriod = async (req, res) => {
  try {
    const financialPeriod = await FinancialPeriod.findById(req.params.id)
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!financialPeriod) {
      return res.status(404).json({
        success: false,
        message: 'Financial period not found'
      });
    }

    res.json({
      success: true,
      data: financialPeriod
    });
  } catch (error) {
    console.error('Get financial period error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching financial period'
    });
  }
};



// @desc    Create financial period
// @route   POST /api/common/financial-period
// @access  Private (Admin/Staff)
const createFinancialPeriod = async (req, res) => {
  try {
    const { society, startDate, endDate, year, periodNumber, description, isCurrent } = req.body;

    // Validate required fields
    if (!society || !startDate || !endDate || !year || !periodNumber) {
      return res.status(400).json({
        success: false,
        message: 'Society, start date, end date, year, and period number are required'
      });
    }

    // Check if period already exists
    const existingPeriod = await FinancialPeriod.findOne({
      society,
      year,
      periodNumber,
      isActive: true
    });

    if (existingPeriod) {
      return res.status(400).json({
        success: false,
        message: 'Financial period already exists for this society, year, and period number'
      });
    }

    // If setting as current, remove current flag from other periods
    if (isCurrent) {
      await FinancialPeriod.updateMany(
        { society, isActive: true },
        { isCurrent: false, updatedBy: req.user.userId || req.user._id }
      );
    }

    const financialPeriod = await FinancialPeriod.create({
      society,
      startDate,
      endDate,
      year,
      periodNumber,
      description: description || `Period ${periodNumber}`,
      isCurrent: isCurrent || false,
      isClosed: false,
      createdBy: req.user.userId || req.user._id,
      updatedBy: req.user.userId || req.user._id
    });

    const populatedPeriod = await FinancialPeriod.findById(financialPeriod._id)
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Financial period created successfully',
      data: populatedPeriod
    });
  } catch (error) {
    console.error('Create financial period error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating financial period'
    });
  }
};

// @desc    Generate financial periods (based on VB6 periodgen sub)
// @route   POST /api/common/financial-period/generate
// @access  Private (Admin/Staff)
const generateFinancialPeriods = async (req, res) => {
  try {
    const { society, beginDate, numberOfPeriods } = req.body;

    if (!society || !beginDate || !numberOfPeriods) {
      return res.status(400).json({
        success: false,
        message: 'Society, begin date, and number of periods are required'
      });
    }

    const beginDateObj = new Date(beginDate);
    const year = beginDateObj.getFullYear();
    const periods = [];

    // Delete existing periods for this society and year
    await FinancialPeriod.updateMany(
      { society, year, isActive: true },
      { isActive: false, updatedBy: req.user.userId || req.user._id }
    );

    for (let i = 1; i <= numberOfPeriods; i++) {
      const month = beginDateObj.getMonth() + 1; // JavaScript months are 0-based
      let startDate, endDate;

      // Calculate start date
      startDate = new Date(beginDateObj.getFullYear(), beginDateObj.getMonth(), 1);

      // Calculate end date based on month
      if ([4, 6, 9, 11].includes(month)) { // 30 days
        endDate = new Date(beginDateObj.getFullYear(), beginDateObj.getMonth(), 30);
      } else if (month === 2) { // February - simplified to 28 days
        endDate = new Date(beginDateObj.getFullYear(), beginDateObj.getMonth(), 28);
      } else { // 31 days
        endDate = new Date(beginDateObj.getFullYear(), beginDateObj.getMonth(), 31);
      }

      // Format month name
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const description = monthNames[month - 1];

      const period = await FinancialPeriod.create({
        society,
        startDate,
        endDate,
        year,
        periodNumber: i,
        description,
        isCurrent: i === 1, // First period is current by default
        isClosed: false,
        createdBy: req.user.userId || req.user._id,
        updatedBy: req.user.userId || req.user._id
      });

      periods.push(period);

      // Move to next month
      beginDateObj.setMonth(beginDateObj.getMonth() + 1);
    }

    res.status(201).json({
      success: true,
      message: `${periods.length} financial periods generated successfully`,
      data: periods
    });
  } catch (error) {
    console.error('Generate financial periods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating financial periods'
    });
  }
};

// @desc    Update financial period
// @route   PUT /api/common/financial-period/:id
// @access  Private (Admin/Staff)
const updateFinancialPeriod = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user.userId || req.user._id
    };

    const financialPeriod = await FinancialPeriod.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    if (!financialPeriod) {
      return res.status(404).json({
        success: false,
        message: 'Financial period not found'
      });
    }

    res.json({
      success: true,
      message: 'Financial period updated successfully',
      data: financialPeriod
    });
  } catch (error) {
    console.error('Update financial period error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating financial period'
    });
  }
};

// @desc    Delete financial period
// @route   DELETE /api/common/financial-period/:id
// @access  Private (Admin/Staff)
const deleteFinancialPeriod = async (req, res) => {
  try {
    const financialPeriod = await FinancialPeriod.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user.userId },
      { new: true }
    );

    if (!financialPeriod) {
      return res.status(404).json({
        success: false,
        message: 'Financial period not found'
      });
    }

    res.json({
      success: true,
      message: 'Financial period deleted successfully'
    });
  } catch (error) {
    console.error('Delete financial period error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting financial period'
    });
  }
};

// @desc    Set current period
// @route   PUT /api/common/financial-period/:id/set-current
// @access  Private (Admin/Staff)
const setCurrentPeriod = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove current flag from all periods in the same society
    const period = await FinancialPeriod.findById(id);
    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Financial period not found'
      });
    }

    await FinancialPeriod.updateMany(
      { society: period.society, isActive: true },
      { isCurrent: false, updatedBy: req.user.userId }
    );

    // Set the selected period as current
    const updatedPeriod = await FinancialPeriod.findByIdAndUpdate(
      id,
      { isCurrent: true, updatedBy: req.user.userId },
      { new: true }
    )
      .populate('society', 'code name')
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    // Update default parameters with the current financial period dates
    const DefaultParameter = require('../models/DefaultParameter');
    await DefaultParameter.updateMany(
      { society: period.society, isActive: true },
      {
        financialPeriodStart: period.startDate,
        financialPeriodEnd: period.endDate,
        updatedBy: req.user.userId || req.user._id || req.user._id
      }
    );

    res.json({
      success: true,
      message: 'Current period updated successfully',
      data: updatedPeriod
    });
  } catch (error) {
    console.error('Set current period error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while setting current period'
    });
  }
};

module.exports = {
  getFinancialPeriods,
  getFinancialPeriod,
  createFinancialPeriod,
  generateFinancialPeriods,
  updateFinancialPeriod,
  deleteFinancialPeriod,
  setCurrentPeriod
};
