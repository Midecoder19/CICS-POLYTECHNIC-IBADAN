 import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw } from "lucide-react";
import "../../../styles/StoreInformation.css";

class SupplierOpeningBalance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        supplierCode: "",
        openingBalance: "",
        balanceDate: "",
        currency: "NGN",
        notes: "",
      },
      modal: {
        isOpen: false,
        type: null,
        data: [],
      },
      supplierCodes: ["SUP001", "SUP002", "SUP003"], // Demo data
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ formData: { ...this.state.formData, [name]: value } });
  };

  handleLookupClick = (type) => {
    let data = [];
    if (type === 'supplierCode') {
      data = this.state.supplierCodes;
    }
    this.setState({
      modal: {
        isOpen: true,
        type,
        data,
      },
    });
  };

  handleLookupSelect = (type, value) => {
    this.setState({
      formData: { ...this.state.formData, [type]: value },
      modal: {
        isOpen: false,
        type: null,
        data: [],
      },
    });
  };

  closeModal = () => {
    this.setState({
      modal: {
        isOpen: false,
        type: null,
        data: [],
      },
    });
  };

  handleAdd = () => {
    // Demo: Clear form for new entry
    this.setState({
      formData: {
        supplierCode: "",
        openingBalance: "",
        balanceDate: "",
        currency: "NGN",
        notes: "",
      }
    });
  };

  handleUpdate = () => {
    // Demo: Simulate update
    alert("Update functionality - to be implemented");
  };

  handleDelete = () => {
    // Demo: Simulate delete
    alert("Delete functionality - to be implemented");
  };

  handlePrint = () => {
    // Demo: Simulate print
    alert("Print functionality - to be implemented");
  };

  handleClose = () => {
    this.props.navigate("/dashboard");
  };

  handleHelp = () => {
    // Demo: Show help
    alert("Help: Use this form to manage supplier opening balance. Click key icons to lookup existing codes.");
  };

  handleSubmit = (e) => {
    e.preventDefault();
    alert("Supplier Opening Balance saved successfully!");
    // TODO: Implement API call
    // await saveOpeningBalance(formData);
  };

  handleCancel = () => {
    this.props.navigate("/dashboard");
  };

  LookupInput = ({ name, value, onChange, dropdownType, placeholder, required = false }) => (
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
        onClick={() => this.handleLookupClick(dropdownType)}
        className="key-btn"
        title={`Lookup ${placeholder}`}
      >
        <Key size={16} />
      </button>
    </div>
  );

  render() {
    const { formData, modal } = this.state;
    const { LookupInput } = this;
    return (
      <>
        <div className="society-page">
          <div className="society-header">
            <h2>💰 Supplier Opening Balance</h2>
            <button className="back-btn"   onClick={() => this.props.navigate(-1)}>
              ⬅ Back
            </button>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <button onClick={this.handleAdd}>➕ Add</button>
            <button className="primary" onClick={this.handleUpdate}>
              💾 Update
            </button>
            <button onClick={this.handleDelete}>🗑 Delete</button>
            <button onClick={this.handlePrint}>🖨 Print</button>
          </div>

          {/* Form */}
          <form className="society-card" onSubmit={this.handleSubmit}>
            <div className="form-grid">
              {/* Supplier Code + Key */}
              <div className="form-group code-field">
                <label>Supplier Code:</label>
                <LookupInput
                  name="supplierCode"
                  value={formData.supplierCode}
                  onChange={this.handleChange}
                  dropdownType="supplierCode"
                  placeholder="Enter supplier code"
                  required
                />
              </div>

              {/* Opening Balance */}
              <div className="form-group">
                <label>Opening Balance:</label>
                <input
                  type="number"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={this.handleChange}
                  placeholder="Enter opening balance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Balance Date */}
              <div className="form-group">
                <label>Balance Date:</label>
                <input
                  type="date"
                  name="balanceDate"
                  value={formData.balanceDate}
                  onChange={this.handleChange}
                  placeholder="Enter balance date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Currency */}
              <div className="form-group">
                <label>Currency:</label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={this.handleChange}
                  placeholder="Enter currency"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>Notes:</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={this.handleChange}
                  placeholder="Enter notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="footer-buttons">
              <button type="submit" className="btn btn-primary inline-flex items-center">
                <Save size={16} className="mr-2" />
                Save
              </button>
              <button
                type="button"
                className="btn cancel-btn inline-flex items-center"
                onClick={this.handleCancel}
              >
                <RotateCcw size={16} className="mr-2" />
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
                  🔑 Select Supplier Code
                </h5>
                <button
                  className="btn btn-sm btn-light fw-semibold"
                  onClick={this.closeModal}
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
                            onClick={() => this.handleLookupSelect(
                              modal.type,
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
      </>
    );
  }
}

export default withRouter(SupplierOpeningBalance);
