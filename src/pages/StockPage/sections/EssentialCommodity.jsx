import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { Key, Plus, Edit, Trash, Printer, X, HelpCircle, Save, RotateCcw } from "lucide-react";
import "../../../styles/StoreInformation.css";

class EssentialCommodity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        code: "",
        description: "",
        interestRate: "",
        minimumLoanAmount: "",
        repaymentPeriod: "",
        loanGLAccountCode: "",
        loanGLAccountName: "",
        interestGLAccountCode: "",
        interestIncomeAccountName: "",
        bankGLAccountCode: "",
        bankGLAccountName: "",
        include: "No",
        priorityLevel: "Low",
      },
      modal: {
        isOpen: false,
        type: null,
        data: [],
      },
      showReport: false,
      codes: ["COM001", "COM002", "COM003"], // Demo data
      loanGLCodes: ["LOAN001", "LOAN002", "LOAN003"], // Demo data
      interestGLCodes: ["INT001", "INT002", "INT003"], // Demo data
      bankGLCodes: ["BANK001", "BANK002", "BANK003"], // Demo data
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ formData: { ...this.state.formData, [name]: value } });
  };

  handleLookupClick = (type) => {
    let data = [];
    if (type === 'code') {
      data = this.state.codes;
    } else if (type === 'loanGLAccountCode') {
      data = this.state.loanGLCodes;
    } else if (type === 'interestGLAccountCode') {
      data = this.state.interestGLCodes;
    } else if (type === 'bankGLAccountCode') {
      data = this.state.bankGLCodes;
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
        code: "",
        description: "",
        interestRate: "",
        minimumLoanAmount: "",
        repaymentPeriod: "",
        loanGLAccountCode: "",
        loanGLAccountName: "",
        interestGLAccountCode: "",
        interestIncomeAccountName: "",
        bankGLAccountCode: "",
        bankGLAccountName: "",
        include: "No",
        priorityLevel: "Low",
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
    alert("Help: Use this form to manage essential commodities. Click key icons to lookup existing codes.");
  };

  handleSubmit = (e) => {
    e.preventDefault();
    alert("Essential Commodity saved successfully!");
    // TODO: Implement API call
    // await saveCommodity(formData);
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
            <h2>📦 Essential Commodity</h2>
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
              {/* Code + Key */}
              <div className="form-group code-field">
                <label>Code:</label>
                <LookupInput
                  name="code"
                  value={formData.code}
                  onChange={this.handleChange}
                  dropdownType="code"
                  placeholder="Enter code"
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
                  onChange={this.handleChange}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Interest Rate */}
              <div className="form-group">
                <label>Interest Rate:</label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={this.handleChange}
                  placeholder="Enter interest rate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Minimum Loan Amount */}
              <div className="form-group">
                <label>Minimum Loan Amount:</label>
                <input
                  type="number"
                  name="minimumLoanAmount"
                  value={formData.minimumLoanAmount}
                  onChange={this.handleChange}
                  placeholder="Enter minimum loan amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Repayment Period */}
              <div className="form-group">
                <label>Repayment Period:</label>
                <input
                  type="text"
                  name="repaymentPeriod"
                  value={formData.repaymentPeriod}
                  onChange={this.handleChange}
                  placeholder="Enter repayment period"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Loan GL Account Code */}
              <div className="form-group">
                <label>Loan GL A/C Code:</label>
                <LookupInput
                  name="loanGLAccountCode"
                  value={formData.loanGLAccountCode}
                  onChange={this.handleChange}
                  dropdownType="loanGLAccountCode"
                  placeholder="Enter loan GL account code"
                />
              </div>

              {/* Loan GL Account Name */}
              <div className="form-group">
                <label>Loan GL A/C Name:</label>
                <input
                  type="text"
                  name="loanGLAccountName"
                  value={formData.loanGLAccountName}
                  onChange={this.handleChange}
                  placeholder="Enter loan GL account name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Interest GL Account Code */}
              <div className="form-group">
                <label>Interest GL A/C Code:</label>
                <LookupInput
                  name="interestGLAccountCode"
                  value={formData.interestGLAccountCode}
                  onChange={this.handleChange}
                  dropdownType="interestGLAccountCode"
                  placeholder="Enter interest GL account code"
                />
              </div>

              {/* Interest Income Account Name */}
              <div className="form-group">
                <label>Interest Income A/C Name:</label>
                <input
                  type="text"
                  name="interestIncomeAccountName"
                  value={formData.interestIncomeAccountName}
                  onChange={this.handleChange}
                  placeholder="Enter interest income account name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Bank GL Account Code */}
              <div className="form-group">
                <label>Bank GL A/C Code:</label>
                <LookupInput
                  name="bankGLAccountCode"
                  value={formData.bankGLAccountCode}
                  onChange={this.handleChange}
                  dropdownType="bankGLAccountCode"
                  placeholder="Enter bank GL account code"
                />
              </div>

              {/* Bank GL Account Name */}
              <div className="form-group">
                <label>Bank GL A/C Name:</label>
                <input
                  type="text"
                  name="bankGLAccountName"
                  value={formData.bankGLAccountName}
                  onChange={this.handleChange}
                  placeholder="Enter bank GL account name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Include */}
              <div className="form-group">
                <label>Include:</label>
                <select
                  name="include"
                  value={formData.include}
                  onChange={this.handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {/* Priority Level */}
              <div className="form-group">
                <label>Priority Level:</label>
                <select
                  name="priorityLevel"
                  value={formData.priorityLevel}
                  onChange={this.handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
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
                  🔑 Select {modal.type === 'code' ? 'Code' : modal.type === 'loanGLAccountCode' ? 'Loan GL Account Code' : modal.type === 'interestGLAccountCode' ? 'Interest GL Account Code' : 'Bank GL Account Code'}
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
                <h3>📋 Essential Commodity Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                <div className="report-card">
                  <div className="report-info">
                    <strong>Essential Commodity Configuration</strong><br />
                    <br />
                    <strong>Code:</strong> {this.state.formData.code || "Not set"}<br />
                    <strong>Description:</strong> {this.state.formData.description || "Not set"}<br />
                    <strong>Interest Rate:</strong> {this.state.formData.interestRate || "Not set"}<br />
                    <strong>Minimum Loan Amount:</strong> {this.state.formData.minimumLoanAmount || "Not set"}<br />
                    <strong>Repayment Period:</strong> {this.state.formData.repaymentPeriod || "Not set"}<br />
                    <strong>Loan GL A/C Code:</strong> {this.state.formData.loanGLAccountCode || "Not set"}<br />
                    <strong>Loan GL A/C Name:</strong> {this.state.formData.loanGLAccountName || "Not set"}<br />
                    <strong>Interest GL A/C Code:</strong> {this.state.formData.interestGLAccountCode || "Not set"}<br />
                    <strong>Interest Income A/C Name:</strong> {this.state.formData.interestIncomeAccountName || "Not set"}<br />
                    <strong>Bank GL A/C Code:</strong> {this.state.formData.bankGLAccountCode || "Not set"}<br />
                    <strong>Bank GL A/C Name:</strong> {this.state.formData.bankGLAccountName || "Not set"}<br />
                    <strong>Include:</strong> {this.state.formData.include || "Not set"}<br />
                    <strong>Priority Level:</strong> {this.state.formData.priorityLevel || "Not set"}<br />
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

export default withRouter(EssentialCommodity);
