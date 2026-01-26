import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw } from "lucide-react";
import "../../../styles/StockReceiptVoucher.css";

const StockReceiptVoucher = () => {
  const navigate = useNavigate();

  const [headerData, setHeaderData] = useState({
    store: "",
    srvNo: "",
    srvDate: "",
    purchaseBy: "cash",
    supplierName: "",
    invoiceNo: "",
    invoiceDate: "",
    discountRate: "",
    discountAmount: "",
    vatRate: "",
    vatAmount: "",
    status: "Active",
  });

  const [detailsData, setDetailsData] = useState({
    itemCode: "",
    unitCost: "",
    quantity: "",
    bulkPrice: "",
    amount: "",
  });

  const [roughSheet, setRoughSheet] = useState([]);
  const [totals, setTotals] = useState({
    totalAmount: 0,
    discountAmount: 0,
    vatAmount: 0,
    netPay: 0,
  });
  const [stockBalance, setStockBalance] = useState(0);

  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    data: [],
  });

  const [showReport, setShowReport] = useState(false);

  // Demo data - in real app, this would come from API
  const demoData = {
    stores: ["Store A", "Store B", "Store C"],
    srvNos: ["SRV001", "SRV002", "SRV003"],
    purchaseByOptions: ["cash", "credit"],
    suppliers: ["Supplier X", "Supplier Y", "Supplier Z"],
    itemCodes: ["ITEM001", "ITEM002", "ITEM003"],
  };

  const handleHeaderChange = useCallback((e) => {
    const { name, value } = e.target;
    setHeaderData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDetailsChange = useCallback((e) => {
    const { name, value } = e.target;
    setDetailsData(prev => ({ ...prev, [name]: value }));
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
    if (field in headerData) {
      setHeaderData(prev => ({ ...prev, [field]: value }));
    } else if (field in detailsData) {
      setDetailsData(prev => ({ ...prev, [field]: value }));
    }
    closeModal();
  }, [closeModal, headerData, detailsData]);

  const handleAddItem = useCallback(() => {
    const newItem = {
      itemCode: detailsData.itemCode,
      description: "Sample Description", // In real app, fetch from API
      measure: "Unit",
      bulk: detailsData.quantity,
      bulkPrice: detailsData.bulkPrice,
      pieces: detailsData.quantity,
      unitPrice: detailsData.unitCost,
      extended: parseFloat(detailsData.amount) || 0,
    };
    setRoughSheet(prev => [...prev, newItem]);
    // Reset details
    setDetailsData({
      itemCode: "",
      unitCost: "",
      quantity: "",
      bulkPrice: "",
      amount: "",
    });
    // Update totals
    setTotals(prev => ({
      ...prev,
      totalAmount: prev.totalAmount + newItem.extended,
      netPay: prev.totalAmount + newItem.extended - prev.discountAmount + prev.vatAmount,
    }));
  }, [detailsData]);

  const handleAdd = useCallback(() => {
    setHeaderData({
      store: "",
      srvNo: "",
      srvDate: "",
      purchaseBy: "cash",
      supplierName: "",
      invoiceNo: "",
      invoiceDate: "",
      discountRate: "",
      discountAmount: "",
      vatRate: "",
      vatAmount: "",
      status: "Active",
    });
    setDetailsData({
      itemCode: "",
      unitCost: "",
      quantity: "",
      bulkPrice: "",
      amount: "",
    });
    setRoughSheet([]);
    setTotals({
      totalAmount: 0,
      discountAmount: 0,
      vatAmount: 0,
      netPay: 0,
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

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    alert("Stock Receipt Voucher saved successfully!");
    // TODO: Implement API call
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
      <div className="srv-page">
        <div className="srv-header">
          <h2>📦 Stock Receipt Voucher</h2>
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

        {/* HEADER PLANE */}
        <div className="srv-card">
          <h3>HEADER PLANE</h3>
          <div className="form-grid">
            {/* Store */}
            <div className="form-group">
              <label>Store:</label>
              <select
                name="store"
                value={headerData.store}
                onChange={handleHeaderChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Store</option>
                {demoData.stores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>

            {/* SRV No */}
            <div className="form-group">
              <label>SRV No:</label>
              <LookupInput
                name="srvNo"
                value={headerData.srvNo}
                onChange={handleHeaderChange}
                dropdownType="srvNos"
                placeholder="Enter SRV No"
                required
              />
            </div>

            {/* SRV Date */}
            <div className="form-group">
              <label>SRV Date:</label>
              <input
                type="date"
                name="srvDate"
                value={headerData.srvDate}
                onChange={handleHeaderChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Purchase By */}
            <div className="form-group">
              <label>Purchase By:</label>
              <select
                name="purchaseBy"
                value={headerData.purchaseBy}
                onChange={handleHeaderChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {demoData.purchaseByOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Supplier Name */}
            <div className="form-group">
              <label>Supplier Name:</label>
              <LookupInput
                name="supplierName"
                value={headerData.supplierName}
                onChange={handleHeaderChange}
                dropdownType="suppliers"
                placeholder="Enter supplier name"
              />
            </div>

            {/* Invoice No */}
            <div className="form-group">
              <label>Invoice No:</label>
              <input
                type="text"
                name="invoiceNo"
                value={headerData.invoiceNo}
                onChange={handleHeaderChange}
                placeholder="Enter invoice no"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Invoice Date */}
            <div className="form-group">
              <label>Invoice Date:</label>
              <input
                type="date"
                name="invoiceDate"
                value={headerData.invoiceDate}
                onChange={handleHeaderChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Discount Rate */}
            <div className="form-group">
              <label>Discount Rate (%):</label>
              <input
                type="number"
                name="discountRate"
                value={headerData.discountRate}
                onChange={handleHeaderChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Discount Amount */}
            <div className="form-group">
              <label>Discount Amount:</label>
              <input
                type="number"
                name="discountAmount"
                value={headerData.discountAmount}
                onChange={handleHeaderChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* VAT Rate */}
            <div className="form-group">
              <label>VAT Rate (%):</label>
              <input
                type="number"
                name="vatRate"
                value={headerData.vatRate}
                onChange={handleHeaderChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* VAT Amount */}
            <div className="form-group">
              <label>VAT Amount:</label>
              <input
                type="number"
                name="vatAmount"
                value={headerData.vatAmount}
                onChange={handleHeaderChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={headerData.status}
                onChange={handleHeaderChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* DETAILS PLANE */}
        <div className="srv-card">
          <h3>DETAILS PLANE</h3>
          <div className="details-grid">
            {/* Item Code */}
            <div className="form-group">
              <label>Item Code:</label>
              <LookupInput
                name="itemCode"
                value={detailsData.itemCode}
                onChange={handleDetailsChange}
                dropdownType="itemCodes"
                placeholder="Enter item code"
              />
            </div>

            {/* Unit Cost */}
            <div className="form-group">
              <label>Unit Cost:</label>
              <input
                type="number"
                name="unitCost"
                value={detailsData.unitCost}
                onChange={handleDetailsChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={detailsData.quantity}
                onChange={handleDetailsChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Bulk Price */}
            <div className="form-group">
              <label>Bulk Price:</label>
              <input
                type="number"
                name="bulkPrice"
                value={detailsData.bulkPrice}
                onChange={handleDetailsChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Amount */}
            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                name="amount"
                value={detailsData.amount}
                onChange={handleDetailsChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="details-buttons">
            <button type="button" onClick={handleAddItem} className="primary">
              OK
            </button>
            <button type="button" className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>

        {/* ROUGH SHEET */}
        <div className="rough-sheet">
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Measure</th>
                <th>Bulk</th>
                <th>Bulk Price</th>
                <th>Pieces</th>
                <th>Unit Price</th>
                <th>Extended</th>
              </tr>
            </thead>
            <tbody>
              {roughSheet.map((item, index) => (
                <tr key={index}>
                  <td>{item.itemCode}</td>
                  <td>{item.description}</td>
                  <td>{item.measure}</td>
                  <td>{item.bulk}</td>
                  <td>{item.bulkPrice}</td>
                  <td>{item.pieces}</td>
                  <td>{item.unitPrice}</td>
                  <td>{item.extended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS AND STOCK BALANCE */}
        <div className="totals-section">
          <div className="totals-left">
            <div className="totals-grid">
              <div className="form-group">
                <label>Total Amount:</label>
                <input
                  type="number"
                  value={totals.totalAmount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div className="form-group">
                <label>Discount Amount:</label>
                <input
                  type="number"
                  value={totals.discountAmount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div className="form-group">
                <label>VAT Amount:</label>
                <input
                  type="number"
                  value={totals.vatAmount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div className="form-group">
                <label>Net Pay:</label>
                <input
                  type="number"
                  value={totals.netPay}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>
          <div className="totals-right">
            <div className="form-group">
              <label>Stock Balance:</label>
              <input
                type="number"
                value={stockBalance}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="footer-buttons">
          <button type="submit" className="primary" onClick={handleSubmit}>
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
                🔑 Select {modal.type === 'stores' ? 'Store' : modal.type === 'srvNos' ? 'SRV No' : modal.type === 'suppliers' ? 'Supplier' : 'Item Code'}
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
                      <th>Code/Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modal.data.length ? (
                      modal.data.map((item, i) => (
                        <tr
                          key={i}
                          onClick={() => selectFromModal(
                            modal.type === 'stores' ? 'store' :
                            modal.type === 'srvNos' ? 'srvNo' :
                            modal.type === 'suppliers' ? 'supplierName' : 'itemCode',
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
              <h3>📋 SRV Report</h3>
              <button className="close-btn" onClick={() => setShowReport(false)}>
                ✖
              </button>
            </div>
            <div className="report-body">
              <div className="report-card">
                <div className="report-info">
                  <strong>Stock Receipt Voucher Details</strong><br />
                  <br />
                  <strong>Store:</strong> {headerData.store || "Not set"}<br />
                  <strong>SRV No:</strong> {headerData.srvNo || "Not set"}<br />
                  <strong>SRV Date:</strong> {headerData.srvDate || "Not set"}<br />
                  <strong>Purchase By:</strong> {headerData.purchaseBy || "Not set"}<br />
                  <strong>Supplier Name:</strong> {headerData.supplierName || "Not set"}<br />
                  <strong>Invoice No:</strong> {headerData.invoiceNo || "Not set"}<br />
                  <strong>Invoice Date:</strong> {headerData.invoiceDate || "Not set"}<br />
                  <strong>Discount Rate:</strong> {headerData.discountRate || "0"}%<br />
                  <strong>Discount Amount:</strong> {headerData.discountAmount || "0"}<br />
                  <strong>VAT Rate:</strong> {headerData.vatRate || "0"}%<br />
                  <strong>VAT Amount:</strong> {headerData.vatAmount || "0"}<br />
                  <strong>Status:</strong> {headerData.status || "Not set"}<br />
                  <strong>Total Amount:</strong> {totals.totalAmount}<br />
                  <strong>Net Pay:</strong> {totals.netPay}<br />
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

export default StockReceiptVoucher;
