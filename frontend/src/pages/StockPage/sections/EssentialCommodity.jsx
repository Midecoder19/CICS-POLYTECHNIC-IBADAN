import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw, Loader } from "lucide-react";
import "../../../styles/EssentialCommodity.css";
import { useFormContext } from "../../../contexts/FormContext.jsx";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { api, API_ENDPOINTS } from "../../../config/api.js";

const EssentialCommodity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [commodities, setCommodities] = useState([]);
  const [showLookup, setShowLookup] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [query, setQuery] = useState("");
  const [currentField, setCurrentField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: [], loading: false });
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    category: "OTHER",
    unit: "",
    minimumStock: 0,
    maximumStock: 0,
    reorderPoint: 0,
    glAccount: "",
  });

  useEffect(() => {
    loadCommodities();
  }, []);

  const loadCommodities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/common/essential-commodities');

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          setCommodities(data.data);
        } else {
          setError('Invalid response format from server');
        }
      } else {
        setError(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading essential commodities:', error);
      setError(error.message || 'Failed to load essential commodities');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      category: "OTHER",
      unit: "",
      minimumStock: 0,
      maximumStock: 0,
      reorderPoint: 0,
      glAccount: "",
    });
    setSelectedCommodity(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = {
        ...formData,
      };

      const response = await api.post('/common/essential-commodity', data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          setSuccess('Essential commodity created successfully');
          setSelectedCommodity(responseData.data);
          loadCommodities(); // Refresh the list
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(responseData.message || 'Failed to create essential commodity');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating essential commodity:', error);
      setError(error.message || 'Failed to create essential commodity');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCommodity) {
      setError('No essential commodity selected to update');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = { ...formData };

      const response = await api.put(`/common/essential-commodity/${selectedCommodity._id}`, data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          setSuccess('Essential commodity updated successfully');
          setSelectedCommodity(responseData.data);
          loadCommodities(); // Refresh the list
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(responseData.message || 'Failed to update essential commodity');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating essential commodity:', error);
      setError(error.message || 'Failed to update essential commodity');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCommodity) {
      setError('No essential commodity selected to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this essential commodity?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await api.delete(`/common/essential-commodity/${selectedCommodity._id}`);

      if (response.ok) {
        setSuccess('Essential commodity deleted successfully');
        clearForm();
        loadCommodities(); // Refresh the list
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting essential commodity:', error);
      setError(error.response?.data?.message || 'Failed to delete essential commodity');
    } finally {
      setLoading(false);
    }
  };

  const handleCommoditySelect = (commodity) => {
    setSelectedCommodity(commodity);
    setFormData({
      code: commodity.code,
      name: commodity.name,
      description: commodity.description || "",
      category: commodity.category,
      unit: commodity.unit,
      minimumStock: commodity.minimumStock || 0,
      maximumStock: commodity.maximumStock || 0,
      reorderPoint: commodity.reorderPoint || 0,
      glAccount: commodity.glAccount?.code || "",
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

  const openModal = (type, data = null) => {
    if (type === 'accounts') {
      setModal({ isOpen: true, type, data: [], loading: true });
      searchAccounts('').then((accounts) => setModal(prev => ({ ...prev, data: accounts, loading: false })));
    } else {
      setModal({ isOpen: true, type, data: data || [], loading: false });
      if (data) {
        handleCommoditySelect(data);
      }
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', data: [], loading: false });
    clearForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal.type === 'add') {
      handleAdd();
    } else if (modal.type === 'update') {
      handleUpdate();
    }
  };

  const handleInputChange = (e) => {
    handleChange(e);
  };

  const selectFromModal = (field, value) => {
    setFormData({ ...formData, [field]: value });
    closeModal();
  };

  return (
    <>
      <div className="society-page">
        <div className="society-header">
          <h2>🍞 Essential Commodities</h2>
          <button className="back-btn" onClick={() => navigate(-1)} tabIndex="0">
            ⬅ Back
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="toolbar">
          <button onClick={() => openModal('add')} tabIndex="0" disabled={loading}>
            ➕ Add
          </button>
          <button
            onClick={() => selectedCommodity && openModal('update', selectedCommodity)}
            tabIndex="0"
            disabled={loading || !selectedCommodity}
          >
            ✏️ Update
          </button>
          <button
            onClick={() => selectedCommodity && openModal('delete', selectedCommodity)}
            tabIndex="0"
            disabled={loading || !selectedCommodity}
          >
            🗑️ Delete
          </button>
          <button onClick={handlePrint} tabIndex="0">🖨 Print</button>
        </div>

        {/* Commodities List */}
        <div className="society-card">
          <h3>Essential Commodities ({commodities.length})</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading essential commodities...</p>
            </div>
          ) : commodities.length > 0 ? (
            <div className="commodities-grid">
              {commodities.map((commodity) => (
                <div
                  key={commodity._id}
                  className="commodity-card"
                  onClick={() => {
                    setSelectedCommodity(commodity);
                    openModal('update', commodity);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="commodity-header">
                    <h4>{commodity.code}</h4>
                    <div className="commodity-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCommodity(commodity);
                          openModal('update', commodity);
                        }}
                        className="action-btn edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCommodity(commodity);
                          openModal('delete', commodity);
                        }}
                        className="action-btn delete"
                        title="Delete"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="commodity-body">
                    <p className="commodity-name"><strong>{commodity.name}</strong></p>
                    <p className="commodity-category">
                      <span className="badge bg-secondary me-2">{commodity.category}</span>
                      <span className="text-muted">{commodity.unit}</span>
                    </p>
                    <div className="commodity-details">
                      <div className="row text-center">
                        <div className="col-4">
                          <small className="text-muted">Min Stock</small>
                          <br />
                          <strong className="text-success">{commodity.minimumStock}</strong>
                        </div>
                        <div className="col-4">
                          <small className="text-muted">Max Stock</small>
                          <br />
                          <strong className="text-warning">{commodity.maximumStock}</strong>
                        </div>
                        <div className="col-4">
                          <small className="text-muted">Reorder</small>
                          <br />
                          <strong className="text-danger">{commodity.reorderPoint}</strong>
                        </div>
                      </div>
                    </div>
                    {commodity.description && (
                      <p className="commodity-description text-muted small mt-2">
                        {commodity.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="text-muted">
                <HelpCircle size={48} className="mb-3 opacity-50" />
                <h5>No Essential Commodities Found</h5>
                <p>Click the "Add" button above to create your first essential commodity.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-center pt-5"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(6px)",
            zIndex: 1060,
          }}
        >
          <div
            className="card shadow-lg border-0"
            style={{
              width: "90%",
              maxWidth: 600,
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3 px-4">
              <h5 className="mb-0 fw-semibold">
                {modal.type === 'add' ? '➕ Add Essential Commodity' :
                 modal.type === 'update' ? '✏️ Update Essential Commodity' :
                 modal.type === 'delete' ? '🗑️ Delete Essential Commodity' :
                 '🔑 Select Account'}
              </h5>
              <button
                className="btn btn-sm btn-light fw-semibold"
                onClick={closeModal}
                tabIndex="0"
              >
                ✖ Close
              </button>
            </div>

            {/* Body */}
            <div className="card-body p-4">
              {modal.type === 'delete' ? (
                <div className="text-center">
                  <p>Are you sure you want to delete this essential commodity?</p>
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <button
                      onClick={handleDelete}
                      className="btn btn-danger"
                      disabled={loading}
                    >
                      {loading ? <Loader className="animate-spin inline mr-2" size={16} /> : 'Delete'}
                    </button>
                    <button
                      onClick={closeModal}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : modal.type === 'accounts' ? (
                <>
                  {/* Search bar */}
                  <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm flex-grow-1"
                      placeholder="Search accounts..."
                      value=""
                      onChange={() => {}}
                      tabIndex="0"
                    />
                    <span className="text-muted small">
                      {modal.loading ? 'Loading...' : `${modal.data.length} result(s)`}
                    </span>
                  </div>

                  {/* Table */}
                  <div style={{ maxHeight: 360, overflowY: "auto" }}>
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light position-sticky top-0">
                        <tr>
                          <th>Account Code - Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modal.loading ? (
                          <tr>
                            <td className="text-center text-muted py-4">
                              <Loader className="animate-spin inline mr-2" size={16} />
                              Loading...
                            </td>
                          </tr>
                        ) : modal.data.length ? (
                          modal.data.map((account, i) => (
                            <tr
                              key={account._id || i}
                              onClick={() => selectFromModal('glAccount', account.code)}
                              style={{ cursor: "pointer" }}
                              tabIndex="0"
                            >
                              <td>{account.code} - {account.name}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="text-center text-muted py-4">
                              No results found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* Add/Update Form */
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Commodity Code:</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="Enter commodity code"
                        required
                        className="form-control"
                        tabIndex="0"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Commodity Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter commodity name"
                        required
                        className="form-control"
                        tabIndex="0"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category:</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="form-select"
                        tabIndex="0"
                      >
                        <option value="FOOD">Food</option>
                        <option value="MEDICINE">Medicine</option>
                        <option value="HOUSEHOLD">Household</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Unit:</label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        placeholder="e.g., KG, LTR, PCS"
                        required
                        className="form-control"
                        tabIndex="0"
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Description:</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter commodity description"
                        rows="2"
                        className="form-control"
                        tabIndex="0"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Minimum Stock:</label>
                      <input
                        type="number"
                        name="minimumStock"
                        value={formData.minimumStock}
                        onChange={handleInputChange}
                        placeholder="Enter minimum stock"
                        min="0"
                        step="0.01"
                        className="form-control"
                        tabIndex="0"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Maximum Stock:</label>
                      <input
                        type="number"
                        name="maximumStock"
                        value={formData.maximumStock}
                        onChange={handleInputChange}
                        placeholder="Enter maximum stock"
                        min="0"
                        step="0.01"
                        className="form-control"
                        tabIndex="0"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Reorder Point:</label>
                      <input
                        type="number"
                        name="reorderPoint"
                        value={formData.reorderPoint}
                        onChange={handleInputChange}
                        placeholder="Enter reorder point"
                        min="0"
                        step="0.01"
                        className="form-control"
                        tabIndex="0"
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">GL Account:</label>
                      <div className="input-group">
                        <input
                          type="text"
                          name="glAccount"
                          value={formData.glAccount}
                          onChange={handleInputChange}
                          placeholder="GL account code"
                          className="form-control"
                          tabIndex="0"
                        />
                        <button
                          type="button"
                          onClick={() => openModal('accounts')}
                          className="btn btn-outline-secondary"
                          title="Lookup GL Account"
                          tabIndex="0"
                        >
                          <Key size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? <Loader className="animate-spin inline mr-2" size={16} /> : <Save size={16} className="inline mr-2" />}
                      {modal.type === 'add' ? 'Create' : 'Update'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="card-footer bg-light text-center text-muted small py-2">
              💡 Tip: {modal.type === 'accounts' ? 'Click a row to autofill the form.' :
                       modal.type === 'delete' ? 'This action cannot be undone.' :
                       'Fill in all required fields to save the commodity.'}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="report-overlay">
          <div className="report-modal">
            <div className="report-header">
              <h3>📋 Essential Commodities Report</h3>
              <button className="close-btn" onClick={() => setShowReport(false)} tabIndex="0">
                ✖
              </button>
            </div>
            <div className="report-body">
              <div className="report-card">
                <div className="report-info">
                  <strong>Essential Commodities Summary</strong><br />
                  <br />
                  <strong>Total Commodities:</strong> {commodities.length}<br />
                  <br />
                  {commodities.map((commodity, index) => (
                    <div key={commodity._id} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                      <strong>{index + 1}. {commodity.code} - {commodity.name}</strong><br />
                      <strong>Category:</strong> {commodity.category}<br />
                      <strong>Unit:</strong> {commodity.unit}<br />
                      <strong>Min/Max Stock:</strong> {commodity.minimumStock} / {commodity.maximumStock}<br />
                      <strong>Reorder Point:</strong> {commodity.reorderPoint}<br />
                      <strong>GL Account:</strong> {commodity.glAccount?.code || 'Not set'}<br />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="report-footer">
              <button onClick={() => window.print()} tabIndex="0">🖨 Print Report</button>
              <button onClick={() => setShowReport(false)} tabIndex="0">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EssentialCommodity;
