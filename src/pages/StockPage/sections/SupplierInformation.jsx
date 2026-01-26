import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw } from "lucide-react";
import "../../../styles/StoreInformation.css";

class SupplierInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        supplierCode: "",
        supplierName: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
      },
      modal: {
        isOpen: false,
        type: null,
        data: [],
      },
      showReport: false,
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
        supplierName: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
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
    this.setState({ showReport: true });
  };

  handleClose = () => {
    this.props.navigate("/dashboard");
  };

  handleHelp = () => {
    // Demo: Show help
    alert("Help: Use this form to manage supplier information. Click key icons to lookup existing codes.");
  };

  handleSubmit = (e) => {
    e.preventDefault();
    alert("Supplier Information saved successfully!");
    // TODO: Implement API call
    // await saveSupplierInfo(formData);
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
            <h2>👤 Supplier Information</h2>
            <button className="back-btn" onClick={() => this.props.navigate(-1)}>
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

              {/* Supplier Name */}
              <div className="form-group">
                <label>Supplier Name:</label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={this.handleChange}
                  placeholder="Enter supplier name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Contact Person */}
              <div className="form-group">
                <label>Contact Person:</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={this.handleChange}
                  placeholder="Enter contact person"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={this.handleChange}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={this.handleChange}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={this.handleChange}
                  placeholder="Enter address"
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

        {/* Report Modal */}
        {this.state.showReport && (
          <div className="report-overlay">
            <div className="report-modal">
              <div className="report-header">
                <h3>📋 Supplier Information Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                <div className="report-card">
                  <div className="report-info">
                    <strong>Supplier Information Details</strong><br />
                    <br />
                    <strong>Supplier Code:</strong> {this.state.formData.supplierCode || "Not set"}<br />
                    <strong>Supplier Name:</strong> {this.state.formData.supplierName || "Not set"}<br />
                    <strong>Contact Person:</strong> {this.state.formData.contactPerson || "Not set"}<br />
                    <strong>Phone:</strong> {this.state.formData.phone || "Not set"}<br />
                    <strong>Email:</strong> {this.state.formData.email || "Not set"}<br />
                    <strong>Address:</strong> {this.state.formData.address || "Not set"}<br />
                  </div>
                </div>
              </div>
              <div className="report-footer">
                <button onClick={() => window.print()}>🖨 Print Report</button>
                <button onClick={() => this.setState({ showReport: false })}>Close</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default withRouter(SupplierInformation);
