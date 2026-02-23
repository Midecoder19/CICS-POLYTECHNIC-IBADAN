const Supplier = require('../models/Supplier');
const DefaultParameter = require('../models/DefaultParameter');

// Get all suppliers
const getSuppliers = async (req, res) => {
  try {
    const { society } = req.query;
    const query = { isActive: true };
    if (society) {
      query.society = society;
    }
    const suppliers = await Supplier.find(query)
      .sort({ code: 1 });

    res.json({
      success: true,
      data: suppliers,
      count: suppliers.length
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
};

// Get single supplier
const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier',
      error: error.message
    });
  }
};

// Create supplier
const createSupplier = async (req, res) => {
  try {
    const {
      society, code, name, contactPerson, phone, email, website, address,
      gstNumber, panNumber, bankDetails, creditLimit, paymentTerms,
      openingBalance, glAccount, notes
    } = req.body;

    // Check if code already exists
    const existingSupplier = await Supplier.findOne({ code: code.toUpperCase(), isActive: true });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier code already exists'
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

    const supplier = new Supplier({
      ...(society && { society }),
      code: code.toUpperCase(),
      name,
      contactPerson,
      phone,
      email,
      website,
      address,
      gstNumber,
      panNumber,
      bankDetails,
      creditLimit: creditLimit || 0,
      paymentTerms,
      openingBalance: openingBalance || 0,
      currentBalance: openingBalance || 0,
      glAccount: glAccountData,
      notes
    });

    await supplier.save();

    const populatedSupplier = await Supplier.findById(supplier._id);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: populatedSupplier
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

// Update supplier
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code, name, contactPerson, phone, email, website, address,
      gstNumber, panNumber, bankDetails, creditLimit, paymentTerms,
      glAccount, isActive, notes
    } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if code already exists (excluding current record)
    if (code && code.toUpperCase() !== supplier.code) {
      const existingSupplier = await Supplier.findOne({
        code: code.toUpperCase(),
        _id: { $ne: id },
        isActive: true
      });
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier code already exists'
        });
      }
    }

    // Handle GL account - can be a string code or an object with code and name
    if (glAccount) {
      if (typeof glAccount === 'object' && glAccount.code) {
        supplier.glAccount = {
          code: glAccount.code.toUpperCase().trim(),
          name: glAccount.name?.trim() || ""
        };
      } else if (typeof glAccount === 'string') {
        supplier.glAccount = {
          code: glAccount.toUpperCase().trim(),
          name: ""
        };
      }
    }

    supplier.code = code ? code.toUpperCase() : supplier.code;
    supplier.name = name || supplier.name;
    supplier.contactPerson = contactPerson !== undefined ? contactPerson : supplier.contactPerson;
    supplier.phone = phone !== undefined ? phone : supplier.phone;
    supplier.email = email !== undefined ? email : supplier.email;
    supplier.website = website !== undefined ? website : supplier.website;
    supplier.address = address || supplier.address;
    supplier.gstNumber = gstNumber !== undefined ? gstNumber : supplier.gstNumber;
    supplier.panNumber = panNumber !== undefined ? panNumber : supplier.panNumber;
    supplier.bankDetails = bankDetails || supplier.bankDetails;
    supplier.creditLimit = creditLimit !== undefined ? creditLimit : supplier.creditLimit;
    supplier.paymentTerms = paymentTerms || supplier.paymentTerms;
    supplier.isActive = isActive !== undefined ? isActive : supplier.isActive;
    supplier.notes = notes !== undefined ? notes : supplier.notes;

    await supplier.save();

    const updatedSupplier = await Supplier.findById(id);

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    await Supplier.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};

// Search suppliers
const searchSuppliers = async (req, res) => {
  try {
    const { society, query } = req.query;

    const searchQuery = {
      isActive: true,
      $or: [
        { code: new RegExp(query, 'i') },
        { name: new RegExp(query, 'i') },
        { contactPerson: new RegExp(query, 'i') },
        { phone: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ]
    };
    
    if (society) {
      searchQuery.society = society;
    }

    const suppliers = await Supplier.find(searchQuery)
      .sort({ code: 1 })
      .limit(50);

    res.json({
      success: true,
      data: suppliers,
      count: suppliers.length
    });
  } catch (error) {
    console.error('Error searching suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search suppliers',
      error: error.message
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers
};
