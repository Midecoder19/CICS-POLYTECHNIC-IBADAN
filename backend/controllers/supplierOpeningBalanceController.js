const SupplierOpeningBalance = require('../models/SupplierOpeningBalance');
const Supplier = require('../models/Supplier');

// Get all supplier opening balances
const getSupplierOpeningBalances = async (req, res) => {
  try {
    const { supplier } = req.query;
    const query = { isActive: true };

    if (supplier) {
      query.supplier = supplier;
    }

    const balances = await SupplierOpeningBalance.find(query)
      .populate('supplier', 'code name')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: balances.length,
      data: balances
    });
  } catch (error) {
    console.error('Error fetching supplier opening balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier opening balances',
      error: error.message
    });
  }
};

// Get single supplier opening balance
const getSupplierOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const balance = await SupplierOpeningBalance.findById(id)
      .populate('supplier', 'code name');

    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Supplier opening balance not found'
      });
    }

    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Error fetching supplier opening balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier opening balance',
      error: error.message
    });
  }
};

// Create supplier opening balance
const createSupplierOpeningBalance = async (req, res) => {
  try {
    const { supplier, date, debit, credit } = req.body;

    if (!supplier || !date) {
      return res.status(400).json({
        success: false,
        message: 'Supplier and date are required'
      });
    }

    // Verify supplier exists
    const supplierDoc = await Supplier.findById(supplier);
    if (!supplierDoc) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const balanceData = {
      supplier,
      date: new Date(date),
      debit: parseFloat(debit) || 0,
      credit: parseFloat(credit) || 0,
      createdBy: req.user.userId || req.user._id,
      updatedBy: req.user.userId || req.user._id
    };

    const balance = await SupplierOpeningBalance.create(balanceData);

    // Update supplier's opening balance
    const netBalance = (parseFloat(credit) || 0) - (parseFloat(debit) || 0);
    supplierDoc.openingBalance = (supplierDoc.openingBalance || 0) + netBalance;
    supplierDoc.currentBalance = (supplierDoc.currentBalance || 0) + netBalance;
    await supplierDoc.save();

    const populatedBalance = await SupplierOpeningBalance.findById(balance._id)
      .populate('supplier', 'code name');

    res.status(201).json({
      success: true,
      message: 'Supplier opening balance created successfully',
      data: populatedBalance
    });
  } catch (error) {
    console.error('Error creating supplier opening balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier opening balance',
      error: error.message
    });
  }
};

// Update supplier opening balance
const updateSupplierOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier, date, debit, credit } = req.body;

    const balance = await SupplierOpeningBalance.findById(id);
    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Supplier opening balance not found'
      });
    }

    // Calculate the difference to update supplier balance
    const oldNetBalance = (balance.credit || 0) - (balance.debit || 0);
    const newNetBalance = (parseFloat(credit) || 0) - (parseFloat(debit) || 0);
    const difference = newNetBalance - oldNetBalance;

    // Update balance
    balance.supplier = supplier || balance.supplier;
    balance.date = date ? new Date(date) : balance.date;
    balance.debit = parseFloat(debit) !== undefined ? parseFloat(debit) : balance.debit;
    balance.credit = parseFloat(credit) !== undefined ? parseFloat(credit) : balance.credit;
    balance.updatedBy = req.user.userId || req.user._id;

    await balance.save();

    // Update supplier's balance
    if (difference !== 0) {
      const supplierDoc = await Supplier.findById(balance.supplier);
      if (supplierDoc) {
        supplierDoc.openingBalance = (supplierDoc.openingBalance || 0) + difference;
        supplierDoc.currentBalance = (supplierDoc.currentBalance || 0) + difference;
        await supplierDoc.save();
      }
    }

    const updatedBalance = await SupplierOpeningBalance.findById(id)
      .populate('supplier', 'code name');

    res.json({
      success: true,
      message: 'Supplier opening balance updated successfully',
      data: updatedBalance
    });
  } catch (error) {
    console.error('Error updating supplier opening balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier opening balance',
      error: error.message
    });
  }
};

// Delete supplier opening balance
const deleteSupplierOpeningBalance = async (req, res) => {
  try {
    const { id } = req.params;

    const balance = await SupplierOpeningBalance.findById(id);
    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Supplier opening balance not found'
      });
    }

    // Reverse the balance from supplier
    const netBalance = (balance.credit || 0) - (balance.debit || 0);
    const supplierDoc = await Supplier.findById(balance.supplier);
    if (supplierDoc) {
      supplierDoc.openingBalance = (supplierDoc.openingBalance || 0) - netBalance;
      supplierDoc.currentBalance = (supplierDoc.currentBalance || 0) - netBalance;
      await supplierDoc.save();
    }

    await SupplierOpeningBalance.findByIdAndUpdate(id, {
      isActive: false,
      updatedBy: req.user.userId || req.user._id
    });

    res.json({
      success: true,
      message: 'Supplier opening balance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier opening balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier opening balance',
      error: error.message
    });
  }
};

module.exports = {
  getSupplierOpeningBalances,
  getSupplierOpeningBalance,
  createSupplierOpeningBalance,
  updateSupplierOpeningBalance,
  deleteSupplierOpeningBalance
};
