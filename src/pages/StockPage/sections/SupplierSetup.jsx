import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../config/api.js";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import "../../../styles/SocietyInfo.css";

const SupplierSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [showLookup, setShowLookup] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [query, setQuery] = useState("");
  const [currentField, setCurrentField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    salesPerson: "",
    phone: "",
    email: "",
    website: "",
    bank: "",
    bankAccountNo: "",
    status: "Active",
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/common/suppliers');

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          setSuppliers(data.data);
        } else {
          setError('Invalid response format from server');
        }
      } else {
        setError(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setError(error.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      code: "",
      name: "",
      address: "",
      salesPerson: "",
      phone: "",
      email: "",
      website: "",
      bank: "",
      bankAccountNo: "",
      status: "Active",
    });
    setSelectedSupplier(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [name]: value
      }
    });
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      bankDetails: {
        ...formData.bankDetails,
        [name]: value
      }
    });
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = {
        society: user.society._id || user.society,
        code: formData.code,
        name: formData.name,
        address: formData.address || "",
        contactPerson: formData.salesPerson,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        bankDetails: {
          bankName: formData.bank,
          accountNumber: formData.bankAccountNo
        },
        isActive: formData.status === "Active"
      };
      const response = await api.post('/common/suppliers', data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          setSuccess('Supplier created successfully');
          setSelectedSupplier(responseData.data);
          loadSuppliers(); // Refresh the list
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(responseData.message || 'Failed to create supplier');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      setError(error.message || 'Failed to create supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedSupplier) {
      setError('No supplier selected to update');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = {
        code: formData.code,
        name: formData.name,
        address: formData.address,
        contactPerson: formData.salesPerson,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        bankDetails: {
          bankName: formData.bank,
          accountNumber: formData.bankAccountNo
        },
        isActive: formData.status === "Active"
      };

      const response = await api.put(`/common/suppliers/${selectedSupplier._id}`, data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          setSuccess('Supplier updated successfully');
          setSelectedSupplier(responseData.data);
          loadSuppliers(); // Refresh the list
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(responseData.message || 'Failed to update supplier');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      setError(error.message || 'Failed to update supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) {
      setError('No supplier selected to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await api.delete(`/common/suppliers/${selectedSupplier._id}`);

      if (response.ok) {
        setSuccess('Supplier deleted successfully');
        clearForm();
        loadSuppliers(); // Refresh the list
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setError(error.response?.data?.message || 'Failed to delete supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    // Handle address - can be string or object
    const addressStr = typeof supplier.address === 'string' 
      ? supplier.address 
      : supplier.address?.street || supplier.address?.fullAddress || "";
    
    setFormData({
      code: supplier.code || "",
      name: supplier.name || "",
      address: addressStr,
      salesPerson: supplier.contactPerson || supplier.salesPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      website: supplier.website || "",
      bank: supplier.bankDetails?.bankName || supplier.bank || "",
      bankAccountNo: supplier.bankDetails?.accountNumber || supplier.bankAccountNo || "",
      status: supplier.isActive !== undefined ? (supplier.isActive ? "Active" : "Inactive") : (supplier.status || "Active"),
    });
  };

  const handleLookup = (field) => {
    setShowLookup(true);
    setCurrentField(field);
    setQuery("");
    searchAccounts(""); // Load initial accounts
  };

  const handleLookupSelect = (account) => {
    setFormData({ ...formData, [currentField]: account.code });
    setShowLookup(false);
  };

  const closeLookup = () => {
    setShowLookup(false);
  };

  const searchAccounts = async (searchQuery) => {
    try {
      const societyId = user?.society?._id || user?.society;
      if (!societyId) return;

      const response = await api.get('/common/default-parameter/search/accounts', {
        params: {
          society: societyId,
          query: searchQuery
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAccounts(data.data);
        }
      }
    } catch (error) {
      console.error('Error searching accounts:', error);
      setAccounts([]);
    }
  };

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchAccounts(newQuery);
  };

  const filteredAccounts = () => {
    return accounts || [];
  };

  const handlePrint = () => {
    setShowReport(true);
  };

  return (
    <div className="society-page">
      <div className="society-header">
        <h2>🚚 Supplier Setup</h2>
        <button className="back-btn" onClick={() => navigate("/stock/maintain")}>
          ⬅ Back
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="error-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="success-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px', color: '#363' }}>
          ✅ {success}
        </div>
      )}
      {loading && (
        <div className="loading-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#eef', border: '1px solid #ccf', borderRadius: '4px', color: '#336' }}>
          ⏳ Loading...
        </div>
      )}

      <div className="society-content">
        {/* Supplier List */}
        <div className="society-list">
          <h3>Suppliers</h3>
          <div className="search-container" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by supplier name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div className="list-container">
            {(() => {
              const filteredSuppliers = suppliers.filter(supplier =>
                supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supplier.code.toLowerCase().includes(searchQuery.toLowerCase())
              );
              return filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier._id}
                    className={`list-item ${selectedSupplier?._id === supplier._id ? 'selected' : ''}`}
                    onClick={() => handleSupplierSelect(supplier)}
                  >
                    <div className="item-code">{supplier.code}</div>
                    <div className="item-name">{supplier.name}</div>
                    <div className="item-category" style={{ fontSize: '0.8em', color: '#666' }}>
                      {supplier.phone || 'No phone'} • ₦{supplier.currentBalance?.toLocaleString() || '0'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No suppliers found</div>
              );
            })()}
          </div>
        </div>

        {/* Form */}
        <div className="society-form">
          {/* Toolbar */}
          <div className="toolbar">
            {!selectedSupplier && (
              <button onClick={handleAdd} disabled={loading}>
                ➕ Add
              </button>
            )}
            {selectedSupplier && (
              <button className="primary" onClick={handleUpdate} disabled={loading}>
                💾 Update
              </button>
            )}
            {selectedSupplier && (
              <button onClick={handleDelete} disabled={loading}>
                🗑 Delete
              </button>
            )}
            <button onClick={handlePrint}>🖨 Print</button>
          </div>

          <form className="society-card" onSubmit={(e) => e.preventDefault()}>
            <div className="form-section">
              <div className="form-grid">
                {/* Supplier ID No */}
                <div className="form-group">
                  <label>Supplier ID No:</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Enter supplier ID"
                    disabled={loading}
                  />
                </div>

                {/* Supplier Name */}
                <div className="form-group">
                  <label>Supplier Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter supplier name"
                    disabled={loading}
                  />
                </div>

                {/* Address */}
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    placeholder="Enter address"
                    disabled={loading}
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                </div>

                {/* Status */}
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="footer-buttons">
              <button
                type="button"
                className="btn btn-primary"
                onClick={selectedSupplier ? handleUpdate : handleAdd}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'OK'}
              </button>
              <button
                type="button"
                className="btn cancel-btn"
                onClick={() => navigate("/stock/maintain")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lookup Modal */}
      {showLookup && (
        <div className="lookup-overlay">
          <div className="lookup-modal">
            <div className="lookup-header">
              <h5 className="mb-0 fw-semibold">
                🔑 Account Lookup
              </h5>
              <button className="close-btn" onClick={closeLookup}>
                ✖ Close
              </button>
            </div>
            <div className="lookup-search">
              <input
                type="text"
                placeholder="Search by code or name..."
                value={query || ""}
                onChange={handleSearchChange}
              />
              <span className="result-count">
                {filteredAccounts().length} result(s)
              </span>
            </div>
            <div className="lookup-table-container">
              <table className="lookup-table">
                <thead>
                  <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts().length ? (
                    filteredAccounts().map((account) => (
                      <tr
                        key={account.code}
                        className="lookup-row"
                        onClick={() => handleLookupSelect(account)}
                      >
                        <td>{account.code}</td>
                        <td>{account.name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="no-results">
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="lookup-footer">
              💡 Tip: Click a row to autofill the form.
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="report-overlay">
          <div className="report-modal">
            <div className="report-header">
              <h3>📋 Supplier Information Report</h3>
              <button className="close-btn" onClick={() => setShowReport(false)}>
                ✖
              </button>
            </div>
            <div className="report-body">
              <div className="report-card">
                <div className="report-info">
                  <strong>Supplier Information Details</strong><br />
                  <br />
                  {selectedSupplier ? (
                    <>
                      <strong>Supplier ID No:</strong> {selectedSupplier.code}<br />
                      <strong>Supplier Name:</strong> {selectedSupplier.name}<br />
                      <strong>Address:</strong> {typeof selectedSupplier.address === 'string' ? selectedSupplier.address : (selectedSupplier.address?.street || "Not set")}<br />
                      <strong>Sales Person:</strong> {selectedSupplier.contactPerson || "Not set"}<br />
                      <strong>Telephone Number:</strong> {selectedSupplier.phone || "Not set"}<br />
                      <strong>Email:</strong> {selectedSupplier.email || "Not set"}<br />
                      <strong>Website:</strong> {selectedSupplier.website || "Not set"}<br />
                      <strong>Bank:</strong> {selectedSupplier.bankDetails?.bankName || selectedSupplier.bank || "Not set"}<br />
                      <strong>Bank Account No:</strong> {selectedSupplier.bankDetails?.accountNumber || selectedSupplier.bankAccountNo || "Not set"}<br />
                      <strong>Status:</strong> {selectedSupplier.status || "Not set"}<br />
                      <strong>Created:</strong> {new Date(selectedSupplier.createdAt).toLocaleDateString()}<br />
                    </>
                  ) : (
                    <strong>No supplier selected</strong>
                  )}
                </div>
              </div>
            </div>
            <div className="report-footer">
              <button onClick={() => window.print()}>🖨 Print Report</button>
              <button onClick={() => setShowReport(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierSetup;
