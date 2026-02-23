import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../config/api.js";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import "../../../styles/SocietyInfo.css";

const StoreInformation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stores, setStores] = useState([]);
  const [showLookup, setShowLookup] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [query, setQuery] = useState("");
  const [currentField, setCurrentField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [modal, setModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  });
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    glAccount: "",
    glAccountName: "",
    glStockAdj: "",
    glStockAdjName: "",
    status: "Active",
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);

      const societyId = user?.society?._id || user?.society;
      const response = await api.get('/common/store-information', {
        params: { society: societyId }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          setStores(data.data);
        } else {
          setError('Invalid response format from server');
        }
      } else {
        setError(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
      setError(error.message || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      code: "",
      name: "",
      address: "",
      glAccount: "",
      glAccountName: "",
      glStockAdj: "",
      glStockAdjName: "",
      status: "Active",
    });
    setSelectedStore(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validation
      if (!formData.code.trim()) {
        setError('Store code is required');
        setLoading(false);
        return;
      }
      if (!formData.name.trim()) {
        setError('Store name is required');
        setLoading(false);
        return;
      }
      if (!formData.glAccount.trim()) {
        setError('GL Account code is required');
        setLoading(false);
        return;
      }
      if (!formData.glStockAdj.trim()) {
        setError('GL Stock Adjustment code is required');
        setLoading(false);
        return;
      }

      const societyId = user?.society?._id || user?.society;
      const data = {
        society: societyId,
        storeCode: formData.code,
        name: formData.name,
        address: formData.address,
        glAccount: { code: formData.glAccount, name: formData.glAccountName || "" },
        glStockAdj: { code: formData.glStockAdj, name: formData.glStockAdjName || "" },
      };

      const response = await api.post('/common/store-information', data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          setSuccess('Store information created successfully');
          setSelectedStore(responseData.data);
          loadStores(); // Refresh the list
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(responseData.message || 'Failed to create store');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating store:', error);
      setError(error.message || 'Failed to create store information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    console.log('Update called, selectedStore:', selectedStore);
    if (!selectedStore) {
      setError('No store selected to update');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validation
      if (!formData.code.trim()) {
        setError('Store code is required');
        setLoading(false);
        return;
      }
      if (!formData.name.trim()) {
        setError('Store name is required');
        setLoading(false);
        return;
      }
      if (!formData.glAccount.trim()) {
        setError('GL Account code is required');
        setLoading(false);
        return;
      }
      if (!formData.glStockAdj.trim()) {
        setError('GL Stock Adjustment code is required');
        setLoading(false);
        return;
      }

      const data = {
        storeCode: formData.code,
        name: formData.name,
        address: formData.address,
        glAccount: { code: formData.glAccount, name: formData.glAccountName || "" },
        glStockAdj: { code: formData.glStockAdj, name: formData.glStockAdjName || "" },
      };

      const response = await api.put(`/common/store-information/${selectedStore._id}`, data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          setSuccess('Store information updated successfully');
          setSelectedStore(responseData.data);
          loadStores(); // Refresh the list
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(responseData.message || 'Failed to update store');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating store:', error);
      setError(error.message || 'Failed to update store information');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStore) {
      setError('No store selected to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this store information?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await api.delete(`/common/store-information/${selectedStore._id}`);

      if (response.ok) {
        setSuccess('Store information deleted successfully');
        clearForm();
        loadStores(); // Refresh the list
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      setError(error.response?.data?.message || 'Failed to delete store information');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    console.log('Selected store:', store);
    setSelectedStore(store);
    setFormData({
      code: store.storeCode,
      name: store.name,
      address: store.location || "",
      glAccount: store.glAccount?.code || "",
      glAccountName: store.glAccount?.name || "",
      glStockAdj: store.glStockAdj?.code || "",
      glStockAdjName: store.glStockAdj?.name || "",
      status: store.status || (store.isActive ? "Active" : "Inactive"),
    });
  };

  const handleLookup = (field) => {
    setShowLookup(true);
    setCurrentField(field);
    setQuery("");
    // For store code lookup, we don't need to search accounts
    if (field === "code") {
      // Store lookup - no initial search needed
    } else {
      searchAccounts(""); // Load initial accounts for GL fields
    }
  };

  const handleLookupSelect = (item) => {
    if (currentField === "code") {
      // Store lookup - populate entire form
      handleStoreSelect(item);
    } else {
      // Account lookup - populate specific field
      setFormData({ ...formData, [currentField]: item.code, [`${currentField}Name`]: item.name });
    }
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
    if (currentField === "code") {
      // For store lookup, just update the query - filtering is done in filteredItems()
    } else {
      searchAccounts(newQuery);
    }
  };

  const filteredAccounts = () => {
    return accounts || [];
  };

  const filteredItems = () => {
    if (currentField === "code") {
      // Store lookup - filter stores
      console.log('Store lookup - stores array:', stores);
      const q = (query || "").toLowerCase().trim();
      if (!q) return stores || [];
      return (stores || []).filter((store) =>
        `${store.storeCode} ${store.name}`.toLowerCase().includes(q)
      );
    } else {
      // Account lookup - return accounts
      return filteredAccounts();
    }
  };

  const handlePrint = () => {
    setShowReport(true);
  };

  return (
    <div className="society-page">
      <div className="society-header">
        <h2>🏪 Store Information</h2>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
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
        {/* Form */}
        <div className="society-form" style={{ width: '100%' }}>
          {/* Toolbar */}
          <div className="toolbar">
            <button onClick={handleAdd} disabled={loading}>
              ➕ Add
            </button>
            <button className="primary" onClick={handleUpdate} disabled={loading || !selectedStore}>
              💾 Update
            </button>
            <button onClick={handleDelete} disabled={loading || !selectedStore}>
              🗑 Delete
            </button>
            <button onClick={handlePrint}>🖨 Print</button>
          </div>

          <form className="society-card" onSubmit={(e) => e.preventDefault()}>
            <div className="form-section">
              <div className="form-grid">
                {/* Code + Key */}
                <div className="form-group code-field">
                  <label>Store Code:</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Enter store code"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="key-btn"
                      onClick={() => handleLookup("code")}
                      disabled={loading}
                    >
                      🔑
                    </button>
                  </div>
                </div>

                {/* Store Name */}
                <div className="form-group">
                  <label>Store Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter store name"
                    disabled={loading}
                  />
                </div>

                {/* Location */}
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label>Location:</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter store location"
                    disabled={loading}
                  />
                </div>

                {/* GL Account Code */}
                <div className="form-group">
                  <label>GL Account Code:</label>
                  <input
                    type="text"
                    name="glAccount"
                    value={formData.glAccount}
                    onChange={handleChange}
                    placeholder="GL account code"
                    disabled={loading}
                  />
                </div>

                {/* GL Account Name */}
                <div className="form-group">
                  <label>GL Account Name:</label>
                  <input
                    type="text"
                    name="glAccountName"
                    value={formData.glAccountName}
                    onChange={handleChange}
                    placeholder="GL account name"
                    disabled={loading}
                  />
                </div>

                {/* GL Stock Adj Code */}
                <div className="form-group">
                  <label>GL Stock Adj Code:</label>
                  <input
                    type="text"
                    name="glStockAdj"
                    value={formData.glStockAdj}
                    onChange={handleChange}
                    placeholder="GL stock adjustment code"
                    disabled={loading}
                  />
                </div>

                {/* GL Stock Adj Name */}
                <div className="form-group">
                  <label>GL Stock Adj Name:</label>
                  <input
                    type="text"
                    name="glStockAdjName"
                    value={formData.glStockAdjName}
                    onChange={handleChange}
                    placeholder="GL stock adjustment name"
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
                onClick={selectedStore ? handleUpdate : handleAdd}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'OK'}
              </button>
              <button
                type="button"
                className="btn cancel-btn"
                onClick={() => navigate("/dashboard")}
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
                🔑 {currentField === "code" ? "Store Lookup" : "Account Lookup"}
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
                {filteredItems().length} result(s)
              </span>
            </div>
            <div className="lookup-table-container">
              <table className="lookup-table">
                <thead>
                  <tr>
                    <th>{currentField === "code" ? "Store Code" : "Account Code"}</th>
                    <th>{currentField === "code" ? "Store Name" : "Account Name"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems().length ? (
                    filteredItems().map((item) => (
                      <tr
                        key={currentField === "code" ? item._id : item.code}
                        className="lookup-row"
                        onClick={() => handleLookupSelect(item)}
                      >
                        <td>{currentField === "code" ? item.storeCode : item.code}</td>
                        <td>{item.name}</td>
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
              <h3>📋 Store Information Report</h3>
              <button className="close-btn" onClick={() => setShowReport(false)}>
                ✖
              </button>
            </div>
            <div className="report-body">
              {stores.map((store) => (
                <div className="report-card" key={store._id}>
                  <div className="report-info">
                    <strong>{store.name}</strong> ({store.storeCode})<br />
                    Address: {store.location || "Not set"}<br />
                    GL Account: {store.glAccount?.code || "Not set"}<br />
                    GL Stock Adj: {store.glStockAdj?.code || "Not set"}<br />
                    Status: {store.status || (store.isActive ? "Active" : "Inactive")}<br />
                    Created: {new Date(store.createdAt).toLocaleDateString()}<br />
                  </div>
                </div>
              ))}
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

export default StoreInformation;
