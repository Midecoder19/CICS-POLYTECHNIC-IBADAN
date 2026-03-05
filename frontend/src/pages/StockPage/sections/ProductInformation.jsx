import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw, Loader } from "lucide-react";
import "../../../styles/ProductInformation.css";
import { useFormContext } from "../../../contexts/FormContext.jsx";
import ProductService from "../../../services/ProductService.js";
import { useAuth } from "../../../contexts/AuthContext.jsx";

const ProductInformation = () => {
  const navigate = useNavigate();
  const { markFormAsUnsaved, markFormAsSaved } = useFormContext();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    store: "",
    code: "",
    name: "",
    reorderPoint: "",
    minimumStock: "",
    category: "",
    supplier: "",
    unit: "",
    fraction: "",
    purchasePrice: "",
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
  const [currentProductId, setCurrentProductId] = useState(null);
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [storesRes, suppliersRes, unitsRes] = await Promise.all([
        ProductService.getStores(user?.society?._id || user?.society),
        ProductService.getSuppliers(user?.society?._id || user?.society),
        ProductService.getUnits()
      ]);

      setStores(storesRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setUnits(unitsRes.data || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    markFormAsUnsaved("product-info");
  }, [markFormAsUnsaved]);

  const openModal = useCallback(async (type) => {
    setModal(prev => ({ ...prev, loading: true, isOpen: true, type }));

    try {
      let data = [];
      if (type === 'stores') {
        data = stores;
      } else if (type === 'suppliers') {
        data = suppliers;
      } else if (type === 'units') {
        data = units;
      } else if (type === 'products') {
        const result = await ProductService.searchProducts('');
        data = result.data || [];
      }

      setModal(prev => ({ ...prev, data, loading: false }));
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      setModal(prev => ({ ...prev, data: [], loading: false }));
    }
  }, [stores, suppliers, units, user?.society]);

  const closeModal = useCallback(() => {
    setModal({
      isOpen: false,
      type: null,
      data: [],
      loading: false,
    });
  }, []);

  const selectFromModal = useCallback(async (field, value) => {
    if (field === 'code') {
      try {
        const result = await ProductService.searchProducts(value);
        if (result.data && result.data.length > 0) {
          const product = result.data[0];
          setFormData({
            code: product.code || "",
            name: product.name || "",
            unit: product.unit || "",
            purchasePrice: product.purchasePrice?.toString() || "",
            minimumStock: product.minimumStock?.toString() || "",
            reorderPoint: product.reorderPoint?.toString() || "",
            store: product.store || "",
            supplier: product.supplier || "",
            description: product.description || "",
            category: product.category || "",
            brand: product.brand || "",
            barcode: product.barcode || "",
            hsnCode: product.hsnCode || "",
            gstRate: product.gstRate?.toString() || "",
            sellingPrice: product.sellingPrice?.toString() || "",
            mrp: product.mrp?.toString() || "",
            maximumStock: product.maximumStock?.toString() || "",
            isEssential: product.isEssential || false,
            notes: product.notes || "",
          });
          setCurrentProductId(product._id);
        } else {
          setFormData(prev => ({ ...prev, [field]: value }));
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    markFormAsUnsaved("product-info");
    closeModal();
  }, [markFormAsUnsaved, closeModal, user?.society]);

  const handleAdd = useCallback(() => {
    setFormData({
      code: "",
      name: "",
      unit: "",
      purchasePrice: "",
      minimumStock: "",
      reorderPoint: "",
      store: "",
      supplier: "",
      description: "",
      category: "",
      brand: "",
      barcode: "",
      hsnCode: "",
      gstRate: "",
      sellingPrice: "",
      mrp: "",
      maximumStock: "",
      isEssential: false,
      notes: "",
    });
    setCurrentProductId(null);
    markFormAsSaved("product-info");
  }, [markFormAsSaved]);

  const handleUpdate = useCallback(async () => {
    if (!currentProductId) {
      alert("Please select a product to update");
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        mrp: parseFloat(formData.mrp) || 0,
        minimumStock: parseFloat(formData.minimumStock) || 0,
        maximumStock: parseFloat(formData.maximumStock) || 0,
        reorderPoint: parseFloat(formData.reorderPoint) || 0,
        gstRate: parseFloat(formData.gstRate) || 0,
      };

      await ProductService.updateProduct(currentProductId, updateData);
      alert("Product updated successfully!");
      markFormAsSaved("product-info");
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  }, [currentProductId, formData, user?.society, markFormAsSaved]);

  const handleDelete = useCallback(async () => {
    if (!currentProductId) {
      alert("Please select a product to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      await ProductService.deleteProduct(currentProductId);
      alert("Product deleted successfully!");
      handleAdd(); // Reset form
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  }, [currentProductId]);

  const handlePrint = useCallback(() => {
    setShowReport(true);
  }, []);

  const handleClose = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const handleHelp = useCallback(() => {
    alert("Help: Use this form to manage product information. Click key icons to lookup existing codes.");
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const productData = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        mrp: parseFloat(formData.mrp) || 0,
        minimumStock: parseFloat(formData.minimumStock) || 0,
        maximumStock: parseFloat(formData.maximumStock) || 0,
        reorderPoint: parseFloat(formData.reorderPoint) || 0,
        gstRate: parseFloat(formData.gstRate) || 0,
      };

      const result = await ProductService.createProduct(productData);
      setCurrentProductId(result.data._id);
      alert("Product created successfully!");
      markFormAsSaved("product-info");
    } catch (err) {
      console.error('Error creating product:', err);
      // Show detailed validation errors
      if (err.response?.data?.message) {
        setError(`Validation Error: ${err.response.data.message}`);
      } else if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).join(', ');
        setError(`Validation Errors: ${errorMessages}`);
      } else {
        setError('Failed to create product. Please check your input and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, markFormAsSaved]);

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
          <h2>📦 Product Information</h2>
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
          <button
            className="primary"
            onClick={handleSubmit}
            tabIndex="0"
            disabled={loading}
          >
            ➕ Add
          </button>
          <button
            onClick={handleUpdate}
            tabIndex="0"
            disabled={loading || !currentProductId}
          >
            ✏️ Update
          </button>
          <button
            onClick={handleDelete}
            tabIndex="0"
            disabled={loading || !currentProductId}
          >
            🗑 Delete
          </button>
          <button onClick={handlePrint} tabIndex="0">🖨 Print</button>
        </div>

        {/* Form */}
        <form id="product-form" className="society-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Store */}
            <div className="form-group">
              <label>Store:</label>
              <select
                name="store"
                value={formData.store}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              >
                <option value="">Select Store</option>
                {stores.map(store => (
                  <option key={store._id} value={store._id}>{store.storeCode} - {store.name}</option>
                ))}
              </select>
            </div>

            {/* Item No (Product Code) */}
            <div className="form-group">
              <label>Item No:</label>
              <LookupInput
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                dropdownType="products"
                placeholder="Enter item no"
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

            {/* Reorder Quantity */}
            <div className="form-group">
              <label>Reorder Quantity:</label>
              <input
                type="number"
                name="reorderPoint"
                value={formData.reorderPoint}
                onChange={handleInputChange}
                placeholder="Enter reorder quantity"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>

            {/* Min Reorder Level */}
            <div className="form-group">
              <label>Min Reorder Level:</label>
              <input
                type="number"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleInputChange}
                placeholder="Enter min reorder level"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              />
            </div>

            {/* Type (Category) */}
            <div className="form-group">
              <label>Type:</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              >
                <option value="">Select Type</option>
                <option value="FOOD">Food</option>
                <option value="BEVERAGE">Beverage</option>
                <option value="HOUSEHOLD">Household</option>
                <option value="PERSONAL_CARE">Personal Care</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Supplier */}
            <div className="form-group">
              <label>Supplier:</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                tabIndex="0"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>{supplier.code} - {supplier.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchase Information Section */}
          <div className="form-section" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Purchase Information</h4>
            <div className="form-grid">
              {/* Measure (Unit) */}
              <div className="form-group">
                <label>Measure:</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  tabIndex="0"
                >
                  <option value="">Select Measure</option>
                  <option value="PIECES">Pieces</option>
                  <option value="PACK">Pack</option>
                  {units.filter(unit => unit.code !== 'PIECES' && unit.code !== 'PACK').map(unit => (
                    <option key={unit.code} value={unit.code}>{unit.name}</option>
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

              {/* Price (Purchase Price) */}
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  tabIndex="0"
                />
              </div>
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
                🔑 Select {modal.type === 'stores' ? 'Store' : modal.type === 'suppliers' ? 'Supplier' : modal.type === 'products' ? 'Product' : 'Unit'}
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
                        {modal.type === 'stores' ? 'Store Code - Name' :
                         modal.type === 'suppliers' ? 'Supplier Code - Name' :
                         modal.type === 'products' ? 'Product Code - Name' : 'Unit'}
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
                            modal.type === 'stores' ? 'store' :
                            modal.type === 'suppliers' ? 'supplier' :
                            modal.type === 'products' ? 'code' : 'unit',
                            modal.type === 'products' ? item.code :
                            modal.type === 'stores' ? item._id :
                            modal.type === 'suppliers' ? item._id : item.code
                          )}
                          style={{ cursor: "pointer" }}
                          tabIndex="0"
                        >
                          <td>
                            {modal.type === 'products' ? `${item.code} - ${item.name}` :
                             modal.type === 'stores' ? `${item.storeCode} - ${item.name}` :
                             modal.type === 'suppliers' ? `${item.code} - ${item.name}` :
                             `${item.code} - ${item.name}`}
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
                  <strong>Product Code:</strong> {formData.code || "Not set"}<br />
                  <strong>Product Name:</strong> {formData.name || "Not set"}<br />
                  <strong>Unit:</strong> {formData.unit || "Not set"}<br />
                  <strong>Purchase Price:</strong> {formData.purchasePrice || "Not set"}<br />
                  <strong>Minimum Stock:</strong> {formData.minimumStock || "Not set"}<br />
                  <strong>Reorder Point:</strong> {formData.reorderPoint || "Not set"}<br />
                  <strong>Store:</strong> {stores.find(s => s._id === formData.store)?.name || "Not set"}<br />
                  <strong>Supplier:</strong> {suppliers.find(s => s._id === formData.supplier)?.name || "Not set"}<br />
                  <strong>Category:</strong> {formData.category || "Not set"}<br />
                  <strong>Brand:</strong> {formData.brand || "Not set"}<br />
                  <strong>Barcode:</strong> {formData.barcode || "Not set"}<br />
                  <strong>HSN Code:</strong> {formData.hsnCode || "Not set"}<br />
                  <strong>GST Rate:</strong> {formData.gstRate || "Not set"}%<br />
                  <strong>Selling Price:</strong> {formData.sellingPrice || "Not set"}<br />
                  <strong>MRP:</strong> {formData.mrp || "Not set"}<br />
                  <strong>Maximum Stock:</strong> {formData.maximumStock || "Not set"}<br />
                  <strong>Essential:</strong> {formData.isEssential ? "Yes" : "No"}<br />
                  <strong>Description:</strong> {formData.description || "Not set"}<br />
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

export default ProductInformation;
