import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw } from "lucide-react";
import "../../../styles/StoreInformation.css";

const ProductOpeningBalance = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    store: "",
    itemCode: "",
    description: "",
    measure: "",
    fraction: "",
    date: "",
    price: "",
    quantity: "",
    bulkPrice: "",
    bulkQuantity: "",
    extended: "",
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
    itemCodes: ["ITEM001", "ITEM002", "ITEM003", "ITEM004", "ITEM005"],
    measures: ["Kg", "Liter", "Piece", "Box", "Dozen"],
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
      store: "",
      itemCode: "",
      description: "",
      measure: "",
      fraction: "",
      date: "",
      price: "",
      quantity: "",
      bulkPrice: "",
      bulkQuantity: "",
      extended: "",
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
    alert("Help: Use this form to manage product opening balance. Click key icons to lookup existing codes.");
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    alert("Product Opening Balance saved successfully!");
    // TODO: Implement API call
    // await saveProductOpeningBalance(formData);
    // const response = await fetch('/api/product-opening-balance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
    // if (!response.ok) throw new Error('Failed to save product opening balance');
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
          <h2>📦 Product Opening Balance</h2>
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
            {/* Store */}
            <div className="form-group">
              <label>Store:</label>
              <select
                name="store"
                value={formData.store}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Store</option>
                {demoData.stores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>

            {/* Item Code + Key */}
            <div className="form-group code-field">
              <label>Item Code:</label>
              <LookupInput
                name="itemCode"
                value={formData.itemCode}
                onChange={handleInputChange}
                dropdownType="itemCodes"
                placeholder="Enter item code"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Measure */}
            <div className="form-group">
              <label>Measure:</label>
              <select
                name="measure"
                value={formData.measure}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Price Label */}
            <div className="form-group col-span-full">
              <h3 className="text-lg font-semibold mb-4">Price</h3>
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
              />
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Bulk Label */}
            <div className="form-group col-span-full">
              <h3 className="text-lg font-semibold mb-4">Bulk</h3>
            </div>

            {/* Bulk Price */}
            <div className="form-group">
              <label>Bulk Price:</label>
              <input
                type="number"
                name="bulkPrice"
                value={formData.bulkPrice}
                onChange={handleInputChange}
                placeholder="Enter bulk price"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Bulk Quantity */}
            <div className="form-group">
              <label>Bulk Quantity:</label>
              <input
                type="number"
                name="bulkQuantity"
                value={formData.bulkQuantity}
                onChange={handleInputChange}
                placeholder="Enter bulk quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Extended */}
            <div className="form-group">
              <label>Extended:</label>
              <input
                type="text"
                name="extended"
                value={formData.extended}
                onChange={handleInputChange}
                placeholder="Enter extended value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="footer-buttons">
            <button type="submit" className="btn btn-primary inline-flex items-center">
              <Save size={16} className="mr-2" />
              OK
            </button>
            <button
              type="button"
              className="btn cancel-btn inline-flex items-center"
              onClick={handleCancel}
            >
              <RotateCcw size={16} className="mr-2" />
              Cancel
            </button>
            <button
              type="button"
              className="print-btn"
              onClick={handlePrint}
            >
              <Printer size={16} className="inline mr-2" />
              Print
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
                🔑 Select {modal.type === 'stores' ? 'Store' : modal.type === 'itemCodes' ? 'Item Code' : 'Measure'}
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
                  placeholder="Search..."
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
                      <th>{modal.type === 'stores' ? 'Store' : modal.type === 'itemCodes' ? 'Item Code' : 'Measure'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modal.data.length ? (
                      modal.data.map((item, i) => (
                        <tr
                          key={i}
                          onClick={() => selectFromModal(
                            modal.type === 'stores' ? 'store' :
                            modal.type === 'itemCodes' ? 'itemCode' : 'measure',
                            item
                          )}
                          style={{ cursor: "pointer" }}
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
              <h3>📋 Product Opening Balance Report</h3>
              <button className="close-btn" onClick={() => setShowReport(false)}>
                ✖
              </button>
            </div>
            <div className="report-body">
              <div className="report-card">
                <div className="report-info">
                  <strong>Product Opening Balance Details</strong><br />
                  <br />
                  <strong>Store:</strong> {formData.store || "Not set"}<br />
                  <strong>Item Code:</strong> {formData.itemCode || "Not set"}<br />
                  <strong>Description:</strong> {formData.description || "Not set"}<br />
                  <strong>Measure:</strong> {formData.measure || "Not set"}<br />
                  <strong>Fraction:</strong> {formData.fraction || "Not set"}<br />
                  <strong>Date:</strong> {formData.date || "Not set"}<br />
                  <strong>Price:</strong> {formData.price || "Not set"}<br />
                  <strong>Quantity:</strong> {formData.quantity || "Not set"}<br />
                  <strong>Bulk Price:</strong> {formData.bulkPrice || "Not set"}<br />
                  <strong>Bulk Quantity:</strong> {formData.bulkQuantity || "Not set"}<br />
                  <strong>Extended:</strong> {formData.extended || "Not set"}<br />
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

export default ProductOpeningBalance;
