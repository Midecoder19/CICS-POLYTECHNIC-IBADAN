import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw } from "lucide-react";
import "../../../styles/StoreInformation.css";
import { useFormContext } from "../../../contexts/FormContext.jsx";

const ProductInformation = () => {
  const navigate = useNavigate();
  const { markFormAsUnsaved, markFormAsSaved } = useFormContext();

  const [formData, setFormData] = useState({
    store: "",
    itemNo: "",
    name: "",
    reorderQty: "",
    minReorderLevel: "",
    measure: "",
    fraction: "",
    price: "",
  });

  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    data: [],
  });

  const [showReport, setShowReport] = useState(false);

  // Demo data - in real app, this would come from API
  const demoData = {
    stores: ["Store 1", "Store 2", "Store 3", "Store 4", "Store 5"],
    itemNos: ["ITEM001", "ITEM002", "ITEM003", "ITEM004", "ITEM005"],
    measures: ["Kg", "Liter", "Piece", "Box", "Dozen"],
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    markFormAsUnsaved("product-info");
  }, [markFormAsUnsaved]);

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
    markFormAsUnsaved("product-info");
    closeModal();
  }, [markFormAsUnsaved, closeModal]);

  const handleAdd = useCallback(() => {
    setFormData({
      store: "",
      itemNo: "",
      name: "",
      reorderQty: "",
      minReorderLevel: "",
      measure: "",
      fraction: "",
      price: "",
    });
    markFormAsSaved("product-info");
  }, [markFormAsSaved]);

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
    alert("Help: Use this form to manage product information. Click key icons to lookup existing codes.");
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    alert("Product Information saved successfully!");
    markFormAsSaved("product-info");
    // TODO: Implement API call
    // await saveProductInfo(formData);
    // const response = await fetch('/api/product-info', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
    // if (!response.ok) throw new Error('Failed to save product information');
  }, [markFormAsSaved]);

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
        tabIndex="0"
      />
      <button
        type="button"
        onClick={() => openModal(dropdownType)}
        className="key-btn"
        title={`Lookup ${placeholder}`}
        tabIndex="0"
      >
        <Key size={16} />
      </button>
    </div>
  );

  return (
    <>
      <div className="society-page">
        <div className="society-header">
          <h2>📦 Product Information</h2>
          <button className="back-btn" onClick={() => navigate(-1)} tabIndex="0">
            ⬅ Back
          </button>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <button onClick={handleAdd} tabIndex="0">➕ Add</button>
          <button className="primary" onClick={handleUpdate} tabIndex="0">
            💾 Update
          </button>
          <button onClick={handleDelete} tabIndex="0">🗑 Delete</button>
          <button onClick={handlePrint} tabIndex="0">🖨 Print</button>
        </div>

        {/* Form */}
        <form className="society-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Store Dropdown */}
            <div className="form-group">
              <label>Store:</label>
              <select
                name="store"
                value={formData.store}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              >
                <option value="">Select Store</option>
                {demoData.stores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>

            {/* Item No */}
            <div className="form-group code-field">
              <label>Item No:</label>
              <LookupInput
                name="itemNo"
                value={formData.itemNo}
                onChange={handleInputChange}
                dropdownType="itemNos"
                placeholder="Enter item number"
                required
              />
            </div>

            {/* Name */}
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>

            {/* Reorder Qty */}
            <div className="form-group">
              <label>Reorder Qty:</label>
              <input
                type="number"
                name="reorderQty"
                value={formData.reorderQty}
                onChange={handleInputChange}
                placeholder="Enter reorder quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>

            {/* Min Reorder Level */}
            <div className="form-group">
              <label>Min Reorder Level:</label>
              <input
                type="number"
                name="minReorderLevel"
                value={formData.minReorderLevel}
                onChange={handleInputChange}
                placeholder="Enter minimum reorder level"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>

            {/* Purchase Information Section */}
            <div className="form-group col-span-full">
              <h3 className="text-lg font-semibold mb-4">Purchase Information</h3>
            </div>

            {/* Measure */}
            <div className="form-group">
              <label>Measure:</label>
              <select
                name="measure"
                value={formData.measure}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              >
                <option value="">Select Measure</option>
                {demoData.measures.map(measure => (
                  <option key={measure} value={measure}>{measure}</option>
                ))}
              </select>
            </div>

            {/* Fraction */}
            <div className="form-group">
              <label>Fraction:</label>
              <input
                type="text"
                name="fraction"
                value={formData.fraction}
                onChange={handleInputChange}
                placeholder="Enter fraction"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>

            {/* Price */}
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>
          </div>

          <div className="footer-buttons">
            <button type="submit" className="primary" tabIndex="0">
              <Save size={16} className="inline mr-2" />
              OK
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              tabIndex="0"
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
                🔑 Select {modal.type === 'stores' ? 'Store' : modal.type === 'itemNos' ? 'Item No' : 'Measure'}
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
              {/* Search bar */}
              <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm flex-grow-1"
                  placeholder="Search..."
                  value=""
                  onChange={() => {}}
                  tabIndex="0"
                />
                <span className="text-muted small">{modal.data.length} result(s)</span>
              </div>

              {/* Table */}
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light position-sticky top-0">
                    <tr>
                      <th>{modal.type === 'stores' ? 'Store' : modal.type === 'itemNos' ? 'Item No' : 'Measure'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modal.data.length ? (
                      modal.data.map((item, i) => (
                        <tr
                          key={i}
                          onClick={() => selectFromModal(
                            modal.type === 'stores' ? 'store' :
                            modal.type === 'itemNos' ? 'itemNo' : 'measure',
                            item
                          )}
                          style={{ cursor: "pointer" }}
                          tabIndex="0"
                        >
                          <td>{item}</td>
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
              <h3>📋 Product Information Report</h3>
              <button className="close-btn" onClick={() => setShowReport(false)} tabIndex="0">
                ✖
              </button>
            </div>
            <div className="report-body">
              <div className="report-card">
                <div className="report-info">
                  <strong>Product Information Details</strong><br />
                  <br />
                  <strong>Store:</strong> {formData.store || "Not set"}<br />
                  <strong>Item No:</strong> {formData.itemNo || "Not set"}<br />
                  <strong>Name:</strong> {formData.name || "Not set"}<br />
                  <strong>Reorder Qty:</strong> {formData.reorderQty || "Not set"}<br />
                  <strong>Min Reorder Level:</strong> {formData.minReorderLevel || "Not set"}<br />
                  <strong>Measure:</strong> {formData.measure || "Not set"}<br />
                  <strong>Fraction:</strong> {formData.fraction || "Not set"}<br />
                  <strong>Price:</strong> {formData.price || "Not set"}<br />
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

export default ProductInformation;
