import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw } from "lucide-react";
import "../../../styles/StoreInformation.css";

const LPO = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    store: "",
    lpoNo: "",
    date: "",
    supplier: "",
    discountRate: "",
    discountAmount: "",
    vatRate: "",
    vatAmount: "",
  });

  const [detailData, setDetailData] = useState({
    newCode: "",
    measures: "",
    unitCost: "",
    bulkQuantity: "",
    piecesQuantity: "",
    amount: "",
  });

  const [items, setItems] = useState([]);

  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    data: [],
  });

  // Demo data - in real app, this would come from API
  const demoData = {
    stores: ["Store 1", "Store 2", "Store 3", "Store 4", "Store 5"],
    lpoNos: ["LPO001", "LPO002", "LPO003", "LPO004", "LPO005"],
    suppliers: ["Supplier A", "Supplier B", "Supplier C", "Supplier D", "Supplier E"],
    newCodes: ["CODE001", "CODE002", "CODE003", "CODE004", "CODE005"],
    measures: ["Kg", "Liter", "Piece", "Box", "Dozen"],
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDetailChange = useCallback((e) => {
    const { name, value } = e.target;
    setDetailData(prev => ({ ...prev, [name]: value }));
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
    if (field === 'lpoNo' || field === 'newCode') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setDetailData(prev => ({ ...prev, [field]: value }));
    }
    closeModal();
  }, [closeModal]);

  const handleAddItem = useCallback(() => {
    if (detailData.newCode && detailData.measures && detailData.unitCost) {
      const newItem = {
        itemCode: detailData.newCode,
        description: `Description for ${detailData.newCode}`,
        measures: detailData.measures,
        bulkPrice: detailData.unitCost,
        piecesPrice: detailData.unitCost,
        extended: (parseFloat(detailData.bulkQuantity || 0) + parseFloat(detailData.piecesQuantity || 0)) * parseFloat(detailData.unitCost || 0),
      };
      setItems(prev => [...prev, newItem]);
      setDetailData({
        newCode: "",
        measures: "",
        unitCost: "",
        bulkQuantity: "",
        piecesQuantity: "",
        amount: "",
      });
    }
  }, [detailData]);

  const handleCancelItem = useCallback(() => {
    setDetailData({
      newCode: "",
      measures: "",
      unitCost: "",
      bulkQuantity: "",
      piecesQuantity: "",
      amount: "",
    });
  }, []);

  const handleAdd = useCallback(() => {
    setFormData({
      store: "",
      lpoNo: "",
      date: "",
      supplier: "",
      discountRate: "",
      discountAmount: "",
      vatRate: "",
      vatAmount: "",
    });
    setItems([]);
  }, []);

  const handleUpdate = useCallback(() => {
    alert("Update functionality - to be implemented");
  }, []);

  const handleDelete = useCallback(() => {
    alert("Delete functionality - to be implemented");
  }, []);

  const handlePrint = useCallback(() => {
    alert("Print functionality - to be implemented");
  }, []);

  const handleClose = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const handleHelp = useCallback(() => {
    alert("Help: Use this form to manage LPO. Click key icons to lookup existing codes.");
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    alert("LPO saved successfully!");
    // TODO: Implement API call
    // await saveLPO(formData, items);
  }, [formData, items]);

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

  const totalAmount = items.reduce((sum, item) => sum + item.extended, 0);
  const discountAmount = (totalAmount * parseFloat(formData.discountRate || 0)) / 100;
  const vatAmount = ((totalAmount - discountAmount) * parseFloat(formData.vatRate || 0)) / 100;
  const netPay = totalAmount - discountAmount + vatAmount;

  return (
    <>
      <div className="society-page">
        <div className="society-header">
          <h2>📋 Local Purchase Order (LPO)</h2>
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
          {/* Header Section */}
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

            {/* LPO No + Key */}
            <div className="form-group code-field">
              <label>LPO No:</label>
              <LookupInput
                name="lpoNo"
                value={formData.lpoNo}
                onChange={handleInputChange}
                dropdownType="lpoNos"
                placeholder="Enter LPO number"
                required
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Supplier */}
            <div className="form-group">
              <label>Supplier:</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Supplier</option>
                {demoData.suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            {/* Discount Rate */}
            <div className="form-group">
              <label>Discount Rate (%):</label>
              <input
                type="number"
                name="discountRate"
                value={formData.discountRate}
                onChange={handleInputChange}
                placeholder="Enter discount rate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Discount Amount */}
            <div className="form-group">
              <label>Discount Amount:</label>
              <input
                type="number"
                name="discountAmount"
                value={discountAmount.toFixed(2)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            {/* VAT Rate */}
            <div className="form-group">
              <label>VAT Rate (%):</label>
              <input
                type="number"
                name="vatRate"
                value={formData.vatRate}
                onChange={handleInputChange}
                placeholder="Enter VAT rate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* VAT Amount */}
            <div className="form-group">
              <label>VAT Amount:</label>
              <input
                type="number"
                name="vatAmount"
                value={vatAmount.toFixed(2)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="form-group col-span-full">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="form-grid">
              {/* New Code + Key */}
              <div className="form-group code-field">
                <label>New Code:</label>
                <LookupInput
                  name="newCode"
                  value={detailData.newCode}
                  onChange={handleDetailChange}
                  dropdownType="newCodes"
                  placeholder="Enter new code"
                />
              </div>

              {/* Measures */}
              <div className="form-group">
                <label>Measures:</label>
                <select
                  name="measures"
                  value={detailData.measures}
                  onChange={handleDetailChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Measure</option>
                  {demoData.measures.map(measure => (
                    <option key={measure} value={measure}>{measure}</option>
                  ))}
                </select>
              </div>

              {/* Unit Cost */}
              <div className="form-group">
                <label>Unit Cost:</label>
                <input
                  type="number"
                  name="unitCost"
                  value={detailData.unitCost}
                  onChange={handleDetailChange}
                  placeholder="Enter unit cost"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Quantity - Bulk */}
              <div className="form-group">
                <label>Bulk Quantity:</label>
                <input
                  type="number"
                  name="bulkQuantity"
                  value={detailData.bulkQuantity}
                  onChange={handleDetailChange}
                  placeholder="Enter bulk quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Quantity - Pieces */}
              <div className="form-group">
                <label>Pieces Quantity:</label>
                <input
                  type="number"
                  name="piecesQuantity"
                  value={detailData.piecesQuantity}
                  onChange={handleDetailChange}
                  placeholder="Enter pieces quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Amount */}
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  name="amount"
                  value={detailData.amount}
                  onChange={handleDetailChange}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="footer-buttons">
              <button type="button" onClick={handleAddItem} className="primary">
                <Save size={16} className="inline mr-2" />
                OK
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelItem}
              >
                <RotateCcw size={16} className="inline mr-2" />
                Cancel
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="form-group col-span-full">
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Item Code</th>
                    <th>Description</th>
                    <th>Measures</th>
                    <th>Bulk Price</th>
                    <th>Pieces Price</th>
                    <th>Extended</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemCode}</td>
                      <td>{item.description}</td>
                      <td>{item.measures}</td>
                      <td>{item.bulkPrice}</td>
                      <td>{item.piecesPrice}</td>
                      <td>{item.extended.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="form-group col-span-full">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label>Total Amount:</label>
                <input
                  type="number"
                  value={totalAmount.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label>Discount Amount:</label>
                <input
                  type="number"
                  value={discountAmount.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label>VAT Amount:</label>
                <input
                  type="number"
                  value={vatAmount.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label>Net Pay:</label>
                <input
                  type="number"
                  value={netPay.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
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
                🔑 Select {modal.type === 'lpoNos' ? 'LPO No' : modal.type === 'newCodes' ? 'New Code' : 'Code'}
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
                      <th>{modal.type === 'lpoNos' ? 'LPO No' : modal.type === 'newCodes' ? 'New Code' : 'Code'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modal.data.length ? (
                      modal.data.map((item, i) => (
                        <tr
                          key={i}
                          onClick={() => selectFromModal(
                            modal.type === 'lpoNos' ? 'lpoNo' : 'newCode',
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
    </>
  );
};

export default LPO;
