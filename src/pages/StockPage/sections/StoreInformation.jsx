 import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw } from "lucide-react";
import "../../../styles/StoreInformation.css";

const StoreInformation = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    storeCode: "",
    name: "",
    location: "",
    glAccountCode: "",
    glStockAdjCode: "",
    glAccountName: "",
    glStockAdjName: "",
    status: "Active",
  });



  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    data: [],
  });

  const [showReport, setShowReport] = useState(false);

  // Demo data - in real app, this would come from API
  const demoData = {
    storeCodes: ["STR001", "STR002", "STR003", "STR004", "STR005"],
    glCodes: ["GL001", "GL002", "GL003", "GL004", "GL005"],
    glStockCodes: ["ADJ001", "ADJ002", "ADJ003", "ADJ004", "ADJ005"],
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const openModal = useCallback((type) => {
    const data = demoData[type];
    setModal({
      isOpen: true,
      type,
      data,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal({
      isOpen: false,
      type: null,
      data: [],
    });
  }, []);

  const selectFromModal = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    closeModal();
  }, [closeModal]);

  const handleAdd = useCallback(() => {
    setFormData({
      storeCode: "",
      name: "",
      location: "",
      glAccountCode: "",
      glStockAdjCode: "",
      glAccountName: "",
      glStockAdjName: "",
      status: "Active",
    });
  }, []);

  const handleUpdate = useCallback(() => {
    alert("Update functionality - to be implemented");
  }, []);

  const handleDelete = useCallback(() => {
    alert("Delete functionality - to be implemented");
  }, []);

  const handlePrint = useCallback(() => {
    setShowReport(true);
  }, []);

  const handleClose = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const handleHelp = useCallback(() => {
    alert("Help: Use this form to manage store information. Click key icons to lookup existing codes.");
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    alert("Store Information saved successfully!");
    // TODO: Implement API call
    // await saveStoreInfo(formData);
  }, []);

  const handleCancel = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const LookupInput = ({ name, value, onChange, dropdownType, placeholder, required = false }) => (
    <div className="input-with-icon">
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="button"
        onClick={() => openModal(dropdownType)}
        className="key-btn"
        title={`Lookup ${placeholder}`}
      >
        <Key size={16} />
      </button>
    </div>
  );

  return (
    <>
      <div className="society-page">
        <div className="society-header">
          <h2>🏪 Store Information</h2>
          <button className="back-btn" onClick={() => navigate(-1)}>
            ⬅ Back
          </button>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <button onClick={handleAdd}>➕ Add</button>
          <button className="primary" onClick={handleUpdate}>
            💾 Update
          </button>
          <button onClick={handleDelete}>🗑 Delete</button>
          <button onClick={handlePrint}>🖨 Print</button>
        </div>

        {/* Form */}
        <form className="society-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Store Code + Key */}
            <div className="form-group code-field">
              <label>Store Code:</label>
              <LookupInput
                name="storeCode"
                value={formData.storeCode}
                onChange={handleInputChange}
                dropdownType="storeCodes"
                placeholder="Enter store code"
                required
              />
            </div>

            {/* Store Name */}
            <div className="form-group">
              <label>Store Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter store name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter store location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* GL Account Code */}
            <div className="form-group">
              <label>GL Account Code:</label>
              <LookupInput
                name="glAccountCode"
                value={formData.glAccountCode}
                onChange={handleInputChange}
                dropdownType="glCodes"
                placeholder="Enter GL account code"
              />
            </div>

            {/* GL Account Name */}
            <div className="form-group">
              <label>GL Account Name:</label>
              <input
                type="text"
                name="glAccountName"
                value={formData.glAccountName}
                onChange={handleInputChange}
                placeholder="Enter GL account name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* GL Stock Adjustment Code */}
            <div className="form-group">
              <label>GL Stock Adjustment Code:</label>
              <LookupInput
                name="glStockAdjCode"
                value={formData.glStockAdjCode}
                onChange={handleInputChange}
                dropdownType="glStockCodes"
                placeholder="Enter GL stock adjustment code"
              />
            </div>

            {/* GL Stock Adjustment Name */}
            <div className="form-group">
              <label>GL Stock Adjustment Name:</label>
              <input
                type="text"
                name="glStockAdjName"
                value={formData.glStockAdjName}
                onChange={handleInputChange}
                placeholder="Enter GL stock adjustment name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="footer-buttons">
            <button type="submit" className="primary">
              <Save size={16} className="inline mr-2" />
              Save
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
            >
              <RotateCcw size={16} className="inline mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
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
                🔑 Select {modal.type === 'storeCodes' ? 'Store Code' : modal.type === 'glCodes' ? 'GL Account Code' : 'GL Stock Adjustment Code'}
              </h5>
              <button
                className="btn btn-sm btn-light fw-semibold"
                onClick={closeModal}
              >
                ✖ Close
              </button>
            </div>

            {/* Body */}
            <div className="card-body p-4">
              {/* Search bar */}
              <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm flex-grow-1"
                  placeholder="Search by code..."
                  value=""
                  onChange={() => {}}
                />
                <span className="text-muted small">{modal.data.length} result(s)</span>
              </div>

              {/* Table */}
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light position-sticky top-0">
                    <tr>
                      <th>Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modal.data.length ? (
                      modal.data.map((code, i) => (
                        <tr
                          key={i}
                          onClick={() => selectFromModal(
                            modal.type === 'storeCodes' ? 'storeCode' :
                            modal.type === 'glCodes' ? 'glAccountCode' : 'glStockAdjCode',
                            code
                          )}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{code}</td>
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
            </div>

            {/* Footer */}
            <div className="card-footer bg-light text-center text-muted small py-2">
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
              <div className="report-card">
                <div className="report-info">
                  <strong>Store Information Details</strong><br />
                  <br />
                  <strong>Store Code:</strong> {formData.storeCode || "Not set"}<br />
                  <strong>Store Name:</strong> {formData.name || "Not set"}<br />
                  <strong>Location:</strong> {formData.location || "Not set"}<br />
                  <strong>GL Account Code:</strong> {formData.glAccountCode || "Not set"}<br />
                  <strong>GL Account Name:</strong> {formData.glAccountName || "Not set"}<br />
                  <strong>GL Stock Adjustment Code:</strong> {formData.glStockAdjCode || "Not set"}<br />
                  <strong>GL Stock Adjustment Name:</strong> {formData.glStockAdjName || "Not set"}<br />
                  <strong>Status:</strong> {formData.status || "Not set"}<br />
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
    </>
  );
};

export default StoreInformation;
