import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { api } from "../../../config/api.js";

import "../../../styles/SocietyInfo.css";

class DefaultParameter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      showLookup: false,
      showReport: false,
      showHelp: false,
      query: "",
      currentField: "",
      loading: false,
      error: null,
      success: null,
      defaultParameter: null,
      societies: [],
      organizations: [],
      branches: [],
      stores: [],
      isFinancialPeriodClosed: false,
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

  componentDidMount() {
    this.loadDefaultParameters();
    // Also load financial periods to sync
    this.loadFinancialPeriods();
    // Load dropdown data
    this.loadSocieties();
    this.loadOrganizations();
    this.loadBranches();
    this.loadStores();
  }

  loadDefaultParameters = async () => {
    try {
      this.setState({ loading: true, error: null });
      const response = await api.get('/common/default-parameter');

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.data && data.data.length > 0) {
          const defaultParam = data.data[0]; // Assuming one default parameter per society
        this.setState({
          defaultParameter: defaultParam,
          formData: {
            society: defaultParam.society?.code || "",
            organization: defaultParam.organization || "",
            branch: defaultParam.branch || "",
            store: defaultParam.store || "",
            date: defaultParam.date ? new Date(defaultParam.date).toISOString().split('T')[0] : "",
            bank: defaultParam.bank || "",
            financialPeriodStart: defaultParam.financialPeriodStart ? new Date(defaultParam.financialPeriodStart).toISOString().split('T')[0] : "",
            financialPeriodEnd: defaultParam.financialPeriodEnd ? new Date(defaultParam.financialPeriodEnd).toISOString().split('T')[0] : "",
            cashAccount: defaultParam.cashAccount?.code || "",
            bankAccount: defaultParam.bankAccount?.code || "",
            payComponents: defaultParam.payComponents || "",
            glBank: defaultParam.glBank?.code || "",
            savings: defaultParam.savings || "",
            creditorAccount: defaultParam.creditorAccount?.code || "",
            debtorAccount: defaultParam.debtorAccount?.code || "",
            processingPriority: defaultParam.processingPriority || "",
            appStatus: defaultParam.appStatus || "",
          }
        });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({
          error: errorData.message || `Server error: ${response.status}`
        });
      }
    } catch (error) {
      console.error('Error loading default parameters:', error);
      this.setState({
        error: error.message || 'Failed to load default parameters'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  loadFinancialPeriods = async () => {
    try {
      const response = await api.get('/common/financial-periods');
      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.data && data.data.length > 0) {
          // Find current period
          const currentPeriod = data.data.find(p => p.isCurrent);
          if (currentPeriod) {
            // Sync financial period dates to default parameter form
            this.setState(prevState => ({
              formData: {
                ...prevState.formData,
                financialPeriodStart: currentPeriod.startDate ? new Date(currentPeriod.startDate).toISOString().split('T')[0] : prevState.formData.financialPeriodStart,
                financialPeriodEnd: currentPeriod.endDate ? new Date(currentPeriod.endDate).toISOString().split('T')[0] : prevState.formData.financialPeriodEnd,
              },
              isFinancialPeriodClosed: currentPeriod.isClosed || false
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading financial periods:', error);
      // Don't show error for this, it's just for syncing
    }
  };

  loadSocieties = async () => {
    try {
      const response = await api.get('/societies');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.setState({ societies: data.data });
        }
      }
    } catch (error) {
      console.error('Error loading societies:', error);
    }
  };

  loadOrganizations = async () => {
    try {
      // Load from localStorage as per Organization.jsx
      const stored = JSON.parse(localStorage.getItem("organizations") || "[]");
      this.setState({ organizations: stored });
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  loadBranches = async () => {
    try {
      // Load from localStorage as per Branch.jsx (assuming similar structure)
      const stored = JSON.parse(localStorage.getItem("branches") || "[]");
      this.setState({ branches: stored });
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  loadStores = async () => {
    try {
      const response = await api.get('/common/store-information');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.setState({ stores: data.data });
        }
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

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
      defaultParameter: null,
    });
  };

  handleChange = (e) => {
    this.setState({
      formData: { ...this.state.formData, [e.target.name]: e.target.value },
    });
  };

  handleAdd = async () => {
    try {
      this.setState({ loading: true, error: null, success: null });

      const data = {
        society: this.state.formData.society,
        organization: this.state.formData.organization,
        branch: this.state.formData.branch,
        store: this.state.formData.store,
        date: this.state.formData.date,
        bank: this.state.formData.bank,
        financialPeriodStart: this.state.formData.financialPeriodStart,
        financialPeriodEnd: this.state.formData.financialPeriodEnd,
        cashAccount: this.state.formData.cashAccount,
        bankAccount: this.state.formData.bankAccount,
        payComponents: this.state.formData.payComponents,
        glBank: this.state.formData.glBank,
        savings: this.state.formData.savings,
        creditorAccount: this.state.formData.creditorAccount,
        debtorAccount: this.state.formData.debtorAccount,
        processingPriority: this.state.formData.processingPriority,
        appStatus: this.state.formData.appStatus,
      };

      const response = await api.post('/common/default-parameter', data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          this.setState({
            success: 'Default parameters created successfully',
            defaultParameter: responseData.data
          });
          setTimeout(() => this.setState({ success: null }), 3000);
        } else {
          this.setState({
            error: responseData.message || 'Failed to create default parameters'
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({
          error: errorData.message || `Server error: ${response.status}`
        });
      }
    } catch (error) {
      console.error('Error creating default parameters:', error);
      this.setState({
        error: error.message || 'Failed to create default parameters'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleUpdate = async () => {
    try {
      this.setState({ loading: true, error: null, success: null });

      if (!this.state.defaultParameter) {
        this.setState({ error: 'No default parameter to update. Please add first.' });
        return;
      }

      const data = {
        society: this.state.formData.society,
        organization: this.state.formData.organization,
        branch: this.state.formData.branch,
        store: this.state.formData.store,
        date: this.state.formData.date,
        bank: this.state.formData.bank,
        financialPeriodStart: this.state.formData.financialPeriodStart,
        financialPeriodEnd: this.state.formData.financialPeriodEnd,
        cashAccount: this.state.formData.cashAccount,
        bankAccount: this.state.formData.bankAccount,
        payComponents: this.state.formData.payComponents,
        glBank: this.state.formData.glBank,
        savings: this.state.formData.savings,
        creditorAccount: this.state.formData.creditorAccount,
        debtorAccount: this.state.formData.debtorAccount,
        processingPriority: this.state.formData.processingPriority,
        appStatus: this.state.formData.appStatus,
      };

      const response = await api.put(`/common/default-parameter/${this.state.defaultParameter._id}`, data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          this.setState({
            success: 'Default parameters updated successfully',
            defaultParameter: responseData.data
          });
          setTimeout(() => this.setState({ success: null }), 3000);
        } else {
          this.setState({
            error: responseData.message || 'Failed to update default parameters'
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({
          error: errorData.message || `Server error: ${response.status}`
        });
      }
    } catch (error) {
      console.error('Error updating default parameters:', error);
      this.setState({
        error: error.message || 'Failed to update default parameters'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async () => {
    if (!this.state.defaultParameter) {
      this.setState({ error: 'No default parameter to delete' });
      return;
    }

    if (!window.confirm('Are you sure you want to delete the default parameters?')) {
      return;
    }

    try {
      this.setState({ loading: true, error: null, success: null });

      const response = await api.delete(`/common/default-parameter/${this.state.defaultParameter._id}`);

      if (response.ok) {
        this.setState({
          success: 'Default parameters deleted successfully',
          defaultParameter: null
        });
        this.clearForm();
        setTimeout(() => this.setState({ success: null }), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({
          error: errorData.message || `Server error: ${response.status}`
        });
      }
    } catch (error) {
      console.error('Error deleting default parameters:', error);
      this.setState({
        error: error.message || 'Failed to delete default parameters'
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  handlePrint = () => {
    this.setState({ showReport: true });
  };

  handleLookup = (field) => {
    this.setState({ showLookup: true, currentField: field, query: "" });
    this.searchAccounts(""); // Load initial accounts
  };

  handleLookupSelect = (account) => {
    this.setState({
      formData: { ...this.state.formData, [this.state.currentField]: account.code },
      showLookup: false,
    });
  };

  closeLookup = () => {
    this.setState({ showLookup: false, accounts: [] });
  };

  searchAccounts = async (searchQuery) => {
    try {
      const response = await api.get('/common/default-parameter/search/accounts', {
        params: {
          society: this.state.formData.society,
          query: searchQuery
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.setState({ accounts: data.data });
        }
      }
    } catch (error) {
      console.error('Error searching accounts:', error);
      this.setState({ accounts: [] });
    }
  };

  handleSearchChange = (e) => {
    const query = e.target.value;
    this.setState({ query });
    this.searchAccounts(query);
  };

  filteredAccounts = () => {
    return this.state.accounts;
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
          {!this.state.defaultParameter && (
            <button onClick={this.handleAdd} disabled={this.state.loading || this.state.isFinancialPeriodClosed}>
              ➕ Add
            </button>
          )}
          {this.state.defaultParameter && (
            <button className="primary" onClick={this.handleUpdate} disabled={this.state.loading || this.state.isFinancialPeriodClosed}>
              💾 Update
            </button>
          )}
          {this.state.defaultParameter && (
            <button onClick={this.handleDelete} disabled={this.state.loading || this.state.isFinancialPeriodClosed}>
              🗑 Delete
            </button>
          )}
          <button onClick={this.handlePrint} disabled={this.state.loading}>🖨 Print</button>
          <button onClick={() => this.setState({ showHelp: true })}>❓ Help</button>
        </div>

        {/* Messages */}
        {this.state.error && (
          <div className="error-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
            ❌ {this.state.error}
          </div>
        )}
        {this.state.success && (
          <div className="success-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px', color: '#363' }}>
            ✅ {this.state.success}
          </div>
        )}
        {this.state.loading && (
          <div className="loading-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#eef', border: '1px solid #ccf', borderRadius: '4px', color: '#336' }}>
            ⏳ Loading...
          </div>
        )}

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
                    {this.state.societies.map(society => (
                      <option key={society._id} value={society.code}>{society.name}</option>
                    ))}
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
                    {this.state.organizations.map(org => (
                      <option key={org.code} value={org.name}>{org.name}</option>
                    ))}
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
                    {this.state.branches.map(branch => (
                      <option key={branch.code} value={branch.name}>{branch.name}</option>
                    ))}
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
                    {this.state.stores.map(store => (
                      <option key={store._id} value={store.code}>{store.name}</option>
                    ))}
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
                  onChange={this.handleSearchChange}
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

        {/* Help Modal */}
        {this.state.showHelp && (
          <div className="lookup-overlay">
            <div className="lookup-modal">
              <div className="lookup-header">
                <h5 className="mb-0 fw-semibold">❓ Help - Default Parameters</h5>
                <button className="close-btn" onClick={() => this.setState({ showHelp: false })}>
                  ✖ Close
                </button>
              </div>
              <div className="lookup-body">
                <div style={{ padding: '1rem', lineHeight: '1.6' }}>
                  <h6>📋 About Default Parameters</h6>
                  <p>Default Parameters allow you to set system-wide defaults for various entities and configurations used throughout the application.</p>

                  <h6>🔧 Available Actions</h6>
                  <ul>
                    <li><strong>Add:</strong> Create new default parameters (only available when no parameters exist)</li>
                    <li><strong>Update:</strong> Modify existing default parameters</li>
                    <li><strong>Delete:</strong> Remove current default parameters</li>
                    <li><strong>Print:</strong> Generate a report of current parameters</li>
                    <li><strong>Help:</strong> Display this help information</li>
                  </ul>

                  <h6>🏢 Entity Selection</h6>
                  <p>The dropdowns automatically populate with available societies, organizations, branches, and stores created in the system.</p>

                  <h6>📅 Financial Period Restrictions</h6>
                  <p>When the current financial period is closed, Add, Update, and Delete operations are disabled to maintain data integrity.</p>

                  <h6>💡 Tips</h6>
                  <ul>
                    <li>Use the 🔑 buttons to lookup account codes</li>
                    <li>All required fields must be filled before saving</li>
                    <li>Changes take effect immediately after updating</li>
                  </ul>
                </div>
              </div>
              <div className="lookup-footer">
                💡 Press Close to return to the form.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(DefaultParameter);
