import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw, Loader } from "lucide-react";
import "../../../styles/ProductOpeningBalance.css";
import { useFormContext } from "../../../contexts/FormContext.jsx";
import ProductService from "../../../services/ProductService.js";
import { useAuth } from "../../../contexts/AuthContext.jsx";

const ProductOpeningBalance = () => {
  const navigate = useNavigate();
  const { markFormAsUnsaved, markFormAsSaved } = useFormContext();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    store: "",
    product: "",
    date: "",
    price: "",
    quantity: "",
    bulkPrice: "",
    bulkQuantity: "",
    extended: "",
    fraction: "",
    notes: "",
  });

  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    data: [],
    loading: false,
  });

  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentBalanceId, setCurrentBalanceId] = useState(null);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [financialPeriods, setFinancialPeriods] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [storesRes, productsRes, periodsRes] = await Promise.all([
        ProductService.getStores(user?.society),
        ProductService.searchProducts('', user?.society),
        ProductService.getFinancialPeriods(user?.society)
      ]);

      setStores(storesRes.data || []);
      setProducts(productsRes.data || []);
      setFinancialPeriods(periodsRes.data || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    markFormAsUnsaved("product-opening-balance");
  }, [markFormAsUnsaved]);

  const openModal = useCallback(async (type) => {
    setModal(prev => ({ ...prev, loading: true, isOpen: true, type }));

    try {
      let data = [];
      if (type === 'stores') {
        data = stores;
      } else if (type === 'products') {
        data = products;
      }

      setModal(prev => ({ ...prev, data, loading: false }));
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      setModal(prev => ({ ...prev, data: [], loading: false }));
    }
  }, [stores, products]);

  const closeModal = useCallback(() => {
    setModal({
      isOpen: false,
      type: null,
      data: [],
      loading: false,
    });
  }, []);

  const selectFromModal = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markFormAsUnsaved("product-opening-balance");
    closeModal();
  }, [markFormAsUnsaved, closeModal]);

  const handleAdd = useCallback(() => {
    setFormData({
      store: "",
      product: "",
      date: "",
      price: "",
      quantity: "",
      bulkPrice: "",
      bulkQuantity: "",
      extended: "",
      fraction: "",
      notes: "",
    });
    setCurrentBalanceId(null);
    markFormAsSaved("product-opening-balance");
  }, [markFormAsSaved]);

  const handleUpdate = useCallback(async () => {
    if (!currentBalanceId) {
      alert("Please select an opening balance to update");
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        ...formData,
        society: user?.society,
        price: parseFloat(formData.price) || 0,
        quantity: parseFloat(formData.quantity) || 0,
        bulkPrice: parseFloat(formData.bulkPrice) || 0,
        bulkQuantity: parseFloat(formData.bulkQuantity) || 0,
        extended: parseFloat(formData.extended) || 0,
      };

      await ProductService.updateProductOpeningBalance(currentBalanceId, updateData);
      alert("Product opening balance updated successfully!");
      markFormAsSaved("product-opening-balance");
    } catch (err) {
      console.error('Error updating product opening balance:', err);
      setError(err.response?.data?.message || 'Failed to update product opening balance');
    } finally {
      setLoading(false);
    }
  }, [currentBalanceId, formData, user?.society, markFormAsSaved]);

  const handleDelete = useCallback(async () => {
    if (!currentBalanceId) {
      alert("Please select an opening balance to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this opening balance?")) {
      return;
    }

    try {
      setLoading(true);
      await ProductService.deleteProductOpeningBalance(currentBalanceId);
      alert("Product opening balance deleted successfully!");
      handleAdd(); // Reset form
    } catch (err) {
      console.error('Error deleting product opening balance:', err);
      setError(err.response?.data?.message || 'Failed to delete product opening balance');
    } finally {
      setLoading(false);
    }
  }, [currentBalanceId]);

  const handlePrint = useCallback(() => {
    setShowReport(true);
  }, []);

  const handleClose = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const handleHelp = useCallback(() => {
    alert("Help: Use this form to manage product opening balances. Click key icons to lookup existing codes.");
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const balanceData = {
        ...formData,
        society: user?.society,
        price: parseFloat(formData.price) || 0,
        quantity: parseFloat(formData.quantity) || 0,
        bulkPrice: parseFloat(formData.bulkPrice) || 0,
        bulkQuantity: parseFloat(formData.bulkQuantity) || 0,
        extended: parseFloat(formData.extended) || 0,
        financialPeriod: user?.currentFinancialPeriod, // Assuming this is available in user context
      };

      const result = await ProductService.createProductOpeningBalance(balanceData);
      setCurrentBalanceId(result.data._id);
      alert("Product opening balance created successfully!");
      markFormAsSaved("product-opening-balance");
    } catch (err) {
      console.error('Error creating product opening balance:', err);
      setError(err.response?.data?.message || 'Failed to create product opening balance');
    } finally {
      setLoading(false);
    }
  }, [formData, user?.society, user?.currentFinancialPeriod, markFormAsSaved]);

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

  if (loading && !modal.isOpen) {
    return (
      <div className="society-page">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="animate-spin mr-2" size={24} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="society-page">
        <div className="society-header">
          <h2>📦 Product Opening Balance</h2>
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
          <button onClick={handleAdd} tabIndex="0" disabled={loading}>
            ➕ Add
          </button>
          <button
            className="primary"
            onClick={handleUpdate}
            tabIndex="0"
            disabled={loading || !currentBalanceId}
          >
            💾 Update
          </button>
          <button
            onClick={handleDelete}
            tabIndex="0"
            disabled={loading || !currentBalanceId}
          >
            🗑 Delete
          </button>
          <button onClick={handlePrint} tabIndex="0">🖨 Print</button>
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
                tabIndex="0"
              >
                <option value="">Select Store</option>
                {stores.map(store => (
                  <option key={store._id} value={store._id}>{store.storeCode} - {store.name}</option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div className="form-group">
              <label>Product:</label>
              <select
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>{product.code} - {product.name}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
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

            {/* Price Label */}
            <div className="form-group col-span-full">
              <h3 className="text-lg font-semibold mb-4">Price Information</h3>
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
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
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
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>

            {/* Bulk Label */}
            <div className="form-group col-span-full">
              <h3 className="text-lg font-semibold mb-4">Bulk Information</h3>
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
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
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
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>

            {/* Extended */}
            <div className="form-group">
              <label>Extended:</label>
              <input
                type="number"
                name="extended"
                value={formData.extended}
                onChange={handleInputChange}
                placeholder="Enter extended value"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>

            {/* Notes */}
            <div className="form-group col-span-full">
              <label>Notes:</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter additional notes"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>
          </div>

          <div className="footer-buttons">
            <button
              type="submit"
              className="primary"
              tabIndex="0"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin inline mr-2" size={16} /> : <Save size={16} className="inline mr-2" />}
              Save
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              tabIndex="0"
              disabled={loading}
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
                🔑 Select {modal.type === 'stores' ? 'Store' : 'Product'}
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
                <span className="text-muted small">
                  {modal.loading ? 'Loading...' : `${modal.data.length} result(s)`}
                </span>
              </div>

              {/* Table */}
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light position-sticky top-0">
                    <tr>
                      <th>
                        {modal.type === 'stores' ? 'Store Code - Name' : 'Product Code - Name'}
                      </th>
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
                      modal.data.map((item, i) => (
                        <tr
                          key={item._id || i}
                          onClick={() => selectFromModal(
                            modal.type === 'stores' ? 'store' : 'product',
                            item._id
                          )}
                          style={{ cursor: "pointer" }}
                          tabIndex="0"
                        >
                          <td>
                            {modal.type === 'stores' ? `${item.storeCode} - ${item.name}` : `${item.code} - ${item.name}`}
                          </td>
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
              <button className="close-btn" onClick={() => setShowReport(false)} tabIndex="0">
                ✖
              </button>
            </div>
            <div className="report-body">
              <div className="report-card">
                <div className="report-info">
                  <strong>Product Opening Balance Details</strong><br />
                  <br />
                  <strong>Store:</strong> {stores.find(s => s._id === formData.store)?.name || "Not set"}<br />
                  <strong>Product:</strong> {products.find(p => p._id === formData.product)?.name || "Not set"}<br />
                  <strong>Date:</strong> {formData.date || "Not set"}<br />
                  <strong>Price:</strong> {formData.price || "Not set"}<br />
                  <strong>Quantity:</strong> {formData.quantity || "Not set"}<br />
                  <strong>Bulk Price:</strong> {formData.bulkPrice || "Not set"}<br />
                  <strong>Bulk Quantity:</strong> {formData.bulkQuantity || "Not set"}<br />
                  <strong>Extended:</strong> {formData.extended || "Not set"}<br />
                  <strong>Fraction:</strong> {formData.fraction || "Not set"}<br />
                  <strong>Notes:</strong> {formData.notes || "Not set"}<br />
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

export default ProductOpeningBalance;
