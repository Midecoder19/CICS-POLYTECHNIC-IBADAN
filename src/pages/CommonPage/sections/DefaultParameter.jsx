import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";

import "../../../styles/SocietyInfo.css";

class DefaultParameter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [
        { code: "1001", name: "Cash Account 1" },
        { code: "1002", name: "Cash Account 2" },
        { code: "2001", name: "Bank Account 1" },
        { code: "2002", name: "Bank Account 2" },
        { code: "3001", name: "Creditor Account 1" },
        { code: "3002", name: "Creditor Account 2" },
        { code: "4001", name: "Debtor Account 1" },
        { code: "4002", name: "Debtor Account 2" },
      ],
      showLookup: false,
      showReport: false,
      query: "",
      formData: {
        society: "",
        organization: "",
        branch: "",
        store: "",
        date: "",
        bank: "",
        financialPeriodStart: "",
        financialPeriodEnd: "",
        cashAccount: "",
        bankAccount: "",
        payComponents: "",
        glBank: "",
        savings: "",
        creditorAccount: "",
        debtorAccount: "",
        processingPriority: "",
        appStatus: "",
      },
    };
  }

  clearForm = () => {
    this.setState({
      formData: {
        society: "",
        organization: "",
        branch: "",
        store: "",
        date: "",
        bank: "",
        financialPeriodStart: "",
        financialPeriodEnd: "",
        cashAccount: "",
        bankAccount: "",
        payComponents: "",
        glBank: "",
        savings: "",
        creditorAccount: "",
        debtorAccount: "",
        processingPriority: "",
        appStatus: "",
      },
    });
  };

  handleChange = (e) => {
    this.setState({
      formData: { ...this.state.formData, [e.target.name]: e.target.value },
    });
  };

  handleAdd = () => {
    alert("Add functionality not implemented yet.");
  };

  handleUpdate = () => {
    alert("Update functionality not implemented yet.");
  };

  handleDelete = () => {
    alert("Delete functionality not implemented yet.");
  };

  handlePrint = () => {
    this.setState({ showReport: true });
  };

  handleLookup = (field) => {
    this.setState({ showLookup: true, currentField: field });
  };

  handleLookupSelect = (account) => {
    this.setState({
      formData: { ...this.state.formData, [this.state.currentField]: account.code },
      showLookup: false,
    });
  };

  closeLookup = () => {
    this.setState({ showLookup: false });
  };

  filteredAccounts = () => {
    const q = (this.state.query || "").toLowerCase().trim();
    if (!q) return this.state.accounts;
    return this.state.accounts.filter((account) =>
      `${account.code} ${account.name}`.toLowerCase().includes(q)
    );
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>⚙️ Default Parameters</h2>
          <button className="back-btn" onClick={() => this.props.navigate("/common")}>
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
        <form className="society-card" onSubmit={(e) => e.preventDefault()}>
          <div className="form-section">
            <div className="form-grid">
              {/* Code + Key */}
              <div className="form-group code-field">
                <label>Society:</label>
                <div className="input-with-icon">
                  <select
                    name="society"
                    value={this.state.formData.society}
                    onChange={this.handleChange}
                  >
                    <option value="">Select Society</option>
                    <option value="society1">Society 1</option>
                    <option value="society2">Society 2</option>
                  </select>
                </div>
              </div>

              <div className="form-group code-field">
                <label>Organization:</label>
                <div className="input-with-icon">
                  <select
                    name="organization"
                    value={this.state.formData.organization}
                    onChange={this.handleChange}
                  >
                    <option value="">Select Organization</option>
                    <option value="org1">Organization 1</option>
                    <option value="org2">Organization 2</option>
                  </select>
                </div>
              </div>

              <div className="form-group code-field">
                <label>Branch:</label>
                <div className="input-with-icon">
                  <select
                    name="branch"
                    value={this.state.formData.branch}
                    onChange={this.handleChange}
                  >
                    <option value="">Select Branch</option>
                    <option value="branch1">Branch 1</option>
                    <option value="branch2">Branch 2</option>
                  </select>
                </div>
              </div>

              <div className="form-group code-field">
                <label>Store:</label>
                <div className="input-with-icon">
                  <select
                    name="store"
                    value={this.state.formData.store}
                    onChange={this.handleChange}
                  >
                    <option value="">Select Store</option>
                    <option value="store1">Store 1</option>
                    <option value="store2">Store 2</option>
                  </select>
                </div>
              </div>

              {/* Side-by-side Date and Bank */}
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <label>Date:</label>
                    <input
                      type="date"
                      name="date"
                      value={this.state.formData.date}
                      onChange={this.handleChange}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Bank:</label>
                    <input
                      type="text"
                      name="bank"
                      value={this.state.formData.bank}
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Period */}
              <div className="form-group">
                <label>Financial Period Start:</label>
                <input
                  type="date"
                  name="financialPeriodStart"
                  value={this.state.formData.financialPeriodStart}
                  onChange={this.handleChange}
                />
              </div>

              <div className="form-group">
                <label>Financial Period End:</label>
                <input
                  type="date"
                  name="financialPeriodEnd"
                  value={this.state.formData.financialPeriodEnd}
                  onChange={this.handleChange}
                />
              </div>

              {/* Account Fields with Key Icons */}
              <div className="form-group code-field">
                <label>Cash Account:</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="cashAccount"
                    value={this.state.formData.cashAccount}
                    onChange={this.handleChange}
                  />
                  <button type="button" className="key-btn" onClick={() => this.handleLookup("cashAccount")}>
                    🔑
                  </button>
                </div>
              </div>

              <div className="form-group code-field">
                <label>Bank Account:</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="bankAccount"
                    value={this.state.formData.bankAccount}
                    onChange={this.handleChange}
                  />
                  <button type="button" className="key-btn" onClick={() => this.handleLookup("bankAccount")}>
                    🔑
                  </button>
                </div>
              </div>

              {/* Other Fields */}
              <div className="form-group">
                <label>Pay Components:</label>
                <input
                  type="text"
                  name="payComponents"
                  value={this.state.formData.payComponents}
                  onChange={this.handleChange}
                />
              </div>

              <div className="form-group">
                <label>GL Bank:</label>
                <input
                  type="text"
                  name="glBank"
                  value={this.state.formData.glBank}
                  onChange={this.handleChange}
                />
              </div>

              <div className="form-group">
                <label>Savings:</label>
                <input
                  type="text"
                  name="savings"
                  value={this.state.formData.savings}
                  onChange={this.handleChange}
                />
              </div>

              <div className="form-group code-field">
                <label>Creditor Account:</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="creditorAccount"
                    value={this.state.formData.creditorAccount}
                    onChange={this.handleChange}
                  />
                  <button type="button" className="key-btn" onClick={() => this.handleLookup("creditorAccount")}>
                    🔑
                  </button>
                </div>
              </div>

              <div className="form-group code-field">
                <label>Debtor Account:</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="debtorAccount"
                    value={this.state.formData.debtorAccount}
                    onChange={this.handleChange}
                  />
                  <button type="button" className="key-btn" onClick={() => this.handleLookup("debtorAccount")}>
                    🔑
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Processing Priority:</label>
                <input
                  type="text"
                  name="processingPriority"
                  value={this.state.formData.processingPriority}
                  onChange={this.handleChange}
                />
              </div>

              <div className="form-group">
                <label>App Status:</label>
                <select
                  name="appStatus"
                  value={this.state.formData.appStatus}
                  onChange={this.handleChange}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="footer-buttons">
            <button type="button" className="primary" onClick={this.handleUpdate}>
              Save
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => this.props.navigate("/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Lookup Modal */}
        {this.state.showLookup && (
          <div className="lookup-overlay">
            <div className="lookup-modal">
              <div className="lookup-header">
                <h5 className="mb-0 fw-semibold">🔑 Account Lookup</h5>
                <button className="close-btn" onClick={this.closeLookup}>
                  ✖ Close
                </button>
              </div>
              <div className="lookup-search">
                <input
                  type="text"
                  placeholder="Search by code or name..."
                  value={this.state.query || ""}
                  onChange={(e) => this.setState({ query: e.target.value })}
                />
                <span className="result-count">
                  {this.filteredAccounts().length} result(s)
                </span>
              </div>
              <div className="lookup-table-container">
                <table className="lookup-table">
                  <thead>
                    <tr>
                      <th>Account Code</th>
                      <th>Account Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.filteredAccounts().length ? (
                      this.filteredAccounts().map((account) => (
                        <tr
                          key={account.code}
                          className="lookup-row"
                          onClick={() => this.handleLookupSelect(account)}
                        >
                          <td>{account.code}</td>
                          <td>{account.name}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="no-results">
                          No results found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="lookup-footer">
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
                <h3>📋 Default Parameters Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                <div className="report-card">
                  <div className="report-info">
                    <strong>Default Parameters Configuration</strong><br />
                    <br />
                    <strong>Society:</strong> {this.state.formData.society || "Not set"}<br />
                    <strong>Organization:</strong> {this.state.formData.organization || "Not set"}<br />
                    <strong>Branch:</strong> {this.state.formData.branch || "Not set"}<br />
                    <strong>Store:</strong> {this.state.formData.store || "Not set"}<br />
                    <strong>Date:</strong> {this.state.formData.date || "Not set"}<br />
                    <strong>Bank:</strong> {this.state.formData.bank || "Not set"}<br />
                    <strong>Financial Period Start:</strong> {this.state.formData.financialPeriodStart || "Not set"}<br />
                    <strong>Financial Period End:</strong> {this.state.formData.financialPeriodEnd || "Not set"}<br />
                    <strong>Cash Account:</strong> {this.state.formData.cashAccount || "Not set"}<br />
                    <strong>Bank Account:</strong> {this.state.formData.bankAccount || "Not set"}<br />
                    <strong>Pay Components:</strong> {this.state.formData.payComponents || "Not set"}<br />
                    <strong>GL Bank:</strong> {this.state.formData.glBank || "Not set"}<br />
                    <strong>Savings:</strong> {this.state.formData.savings || "Not set"}<br />
                    <strong>Creditor Account:</strong> {this.state.formData.creditorAccount || "Not set"}<br />
                    <strong>Debtor Account:</strong> {this.state.formData.debtorAccount || "Not set"}<br />
                    <strong>Processing Priority:</strong> {this.state.formData.processingPriority || "Not set"}<br />
                    <strong>App Status:</strong> {this.state.formData.appStatus || "Not set"}<br />
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
      </div>
    );
  }
}

export default withRouter(DefaultParameter);
