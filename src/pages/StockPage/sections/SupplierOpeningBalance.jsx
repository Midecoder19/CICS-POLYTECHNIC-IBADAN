import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { api } from "../../../config/api.js";
import AuthService from "../../../services/AuthService.js";
import "../../../styles/SocietyInfo.css";

class SupplierOpeningBalance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suppliers: [],
      balances: [],
      showLookup: false,
      query: "",
      loading: false,
      error: null,
      success: null,
      selectedBalance: null,
      user: AuthService.getUser(),
      formData: {
        supplier: "",
        supplierName: "",
        date: "",
        debit: "",
        credit: "",
      },
    };
  }

  componentDidMount() {
    this.loadSuppliers();
    this.loadBalances();
  }

  loadSuppliers = async () => {
    try {
      const response = await api.get('/common/suppliers');

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          this.setState({ suppliers: data.data });
        }
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  loadBalances = async () => {
    try {
      this.setState({ loading: true, error: null });
      const response = await api.get('/common/supplier-opening-balances');

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          this.setState({ balances: data.data || [] });
        } else {
          this.setState({ balances: [] });
        }
      } else {
        this.setState({ balances: [] });
      }
    } catch (error) {
      console.error('Error loading balances:', error);
      this.setState({ balances: [] });
    } finally {
      this.setState({ loading: false });
    }
  };


  clearForm = () => {
    this.setState({
      formData: {
        supplier: "",
        supplierName: "",
        date: "",
        debit: "",
        credit: "",
      },
      selectedBalance: null,
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      formData: { ...this.state.formData, [name]: value }
    });
  };

  handleLookup = () => {
    this.setState({ showLookup: true, query: "" });
  };

  handleLookupSelect = (supplier) => {
    this.setState({
      formData: {
        ...this.state.formData,
        supplier: supplier._id,
        supplierName: supplier.name
      },
      showLookup: false,
    });
  };

  closeLookup = () => {
    this.setState({ showLookup: false });
  };

  handleSearchChange = (e) => {
    this.setState({ query: e.target.value });
  };

  filteredSuppliers = () => {
    const { suppliers, query } = this.state;
    if (!query) return suppliers;
    const q = query.toLowerCase();
    return suppliers.filter(s => 
      s.code.toLowerCase().includes(q) || 
      s.name.toLowerCase().includes(q)
    );
  };

  handleAdd = async () => {
    try {
      this.setState({ loading: true, error: null, success: null });

      if (!this.state.formData.supplier) {
        this.setState({ error: 'Please select a supplier', loading: false });
        return;
      }

      if (!this.state.formData.date) {
        this.setState({ error: 'Please select a date', loading: false });
        return;
      }

      const data = {
        supplier: this.state.formData.supplier,
        date: this.state.formData.date,
        debit: parseFloat(this.state.formData.debit) || 0,
        credit: parseFloat(this.state.formData.credit) || 0,
      };

      const response = await api.post('/common/supplier-opening-balances', data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          // Add to list immediately
          this.setState(prevState => ({
            balances: [responseData.data, ...prevState.balances],
            success: 'Supplier opening balance created successfully',
            selectedBalance: null
          }));
          this.clearForm();
          setTimeout(() => this.setState({ success: null }), 3000);
        } else {
          this.setState({ error: responseData.message || 'Failed to create balance' });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({ error: errorData.message || `Server error: ${response.status}` });
      }
    } catch (error) {
      console.error('Error creating balance:', error);
      this.setState({ error: error.message || 'Failed to create supplier opening balance' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleUpdate = async () => {
    if (!this.state.selectedBalance) {
      this.setState({ error: 'No balance selected to update' });
      return;
    }

    try {
      this.setState({ loading: true, error: null, success: null });

      const data = {
        supplier: this.state.formData.supplier,
        date: this.state.formData.date,
        debit: parseFloat(this.state.formData.debit) || 0,
        credit: parseFloat(this.state.formData.credit) || 0,
      };

      const response = await api.put(`/common/supplier-opening-balances/${this.state.selectedBalance._id}`, data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          // Update in list
          this.setState(prevState => ({
            balances: prevState.balances.map(b => 
              b._id === this.state.selectedBalance._id ? responseData.data : b
            ),
            success: 'Supplier opening balance updated successfully',
            selectedBalance: responseData.data
          }));
          setTimeout(() => this.setState({ success: null }), 3000);
        } else {
          this.setState({ error: responseData.message || 'Failed to update balance' });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({ error: errorData.message || `Server error: ${response.status}` });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      this.setState({ error: error.message || 'Failed to update supplier opening balance' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async () => {
    if (!this.state.selectedBalance) {
      this.setState({ error: 'No balance selected to delete' });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this supplier opening balance?')) {
      return;
    }

    try {
      this.setState({ loading: true, error: null, success: null });

      const response = await api.delete(`/common/supplier-opening-balances/${this.state.selectedBalance._id}`);

      if (response.ok) {
        // Remove from list
        this.setState(prevState => ({
          balances: prevState.balances.filter(b => b._id !== this.state.selectedBalance._id),
          success: 'Supplier opening balance deleted successfully',
          selectedBalance: null
        }));
        this.clearForm();
        setTimeout(() => this.setState({ success: null }), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({ error: errorData.message || `Server error: ${response.status}` });
      }
    } catch (error) {
      console.error('Error deleting balance:', error);
      this.setState({ error: error.message || 'Failed to delete supplier opening balance' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleBalanceSelect = (balance) => {
    this.setState({
      selectedBalance: balance,
      formData: {
        supplier: balance.supplier?._id || balance.supplier || "",
        supplierName: balance.supplier?.name || "",
        date: balance.date ? new Date(balance.date).toISOString().split('T')[0] : "",
        debit: balance.debit || "",
        credit: balance.credit || "",
      }
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>💰 Supplier Opening Balance</h2>
          <button className="back-btn" onClick={() => this.props.navigate(-1)}>
            ⬅ Back
          </button>
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

        <div className="society-content">
          {/* Balance List */}
          <div className="society-list">
            <h3>Supplier Opening Balances</h3>
            <div className="list-container">
              {this.state.balances.length > 0 ? (
                this.state.balances.map((balance) => (
                  <div
                    key={balance._id}
                    className={`list-item ${this.state.selectedBalance?._id === balance._id ? 'selected' : ''}`}
                    onClick={() => this.handleBalanceSelect(balance)}
                  >
                    <div className="item-code">{balance.supplier?.code || balance.supplier || 'N/A'}</div>
                    <div className="item-name">{balance.supplier?.name || 'Unknown Supplier'}</div>
                    <div className="item-category" style={{ fontSize: '0.8em', color: '#666' }}>
                      {balance.date ? new Date(balance.date).toLocaleDateString() : 'No date'} • Debit: ₦{(balance.debit || 0).toLocaleString()} • Credit: ₦{(balance.credit || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">No opening balances found</div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="society-form">
            {/* Toolbar */}
            <div className="toolbar">
              <button onClick={() => this.clearForm()} disabled={this.state.loading || !this.state.selectedBalance}>
                ➕ Add
              </button>
              <button className="primary" onClick={this.handleUpdate} disabled={this.state.loading || !this.state.selectedBalance}>
                💾 Update
              </button>
              <button onClick={this.handleDelete} disabled={this.state.loading || !this.state.selectedBalance}>
                🗑 Delete
              </button>
              <button onClick={() => { alert('Print function not implemented yet.'); }} disabled={this.state.loading}>
                🖨 Print
              </button>
            </div>

            <form className="society-card" onSubmit={(e) => e.preventDefault()}>
              <div className="form-section">
                <div className="form-grid">
                  {/* Supplier */}
                  <div className="form-group code-field">
                    <label>Supplier:</label>
                    <div className="input-with-icon">
                      <input
                        type="text"
                        name="supplierName"
                        value={this.state.formData.supplierName}
                        onChange={this.handleChange}
                        placeholder="Select supplier"
                        disabled={true}
                      />
                      <button type="button" className="key-btn" onClick={this.handleLookup}>
                        🔑
                      </button>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="form-group">
                    <label>Date:</label>
                    <input
                      type="date"
                      name="date"
                      value={this.state.formData.date}
                      onChange={this.handleChange}
                      disabled={this.state.loading}
                    />
                  </div>

                  {/* Debit */}
                  <div className="form-group">
                    <label>Debit:</label>
                    <input
                      type="number"
                      name="debit"
                      value={this.state.formData.debit}
                      onChange={this.handleChange}
                      placeholder="Enter debit amount"
                      step="0.01"
                      min="0"
                      disabled={this.state.loading}
                    />
                  </div>

                  {/* Credit */}
                  <div className="form-group">
                    <label>Credit:</label>
                    <input
                      type="number"
                      name="credit"
                      value={this.state.formData.credit}
                      onChange={this.handleChange}
                      placeholder="Enter credit amount"
                      step="0.01"
                      min="0"
                      disabled={this.state.loading}
                    />
                  </div>
                </div>
              </div>

              <div className="footer-buttons">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={this.state.selectedBalance ? this.handleUpdate : this.handleAdd}
                  disabled={this.state.loading}
                >
                  {this.state.loading ? 'Saving...' : 'OK'}
                </button>
                <button
                  type="button"
                  className="btn cancel-btn"
                  onClick={() => this.props.navigate(-1)}
                  disabled={this.state.loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Lookup Modal */}
        {this.state.showLookup && (
          <div className="lookup-overlay">
            <div className="lookup-modal">
              <div className="lookup-header">
                <h5 className="mb-0 fw-semibold">🔑 Supplier Lookup</h5>
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
                  {this.filteredSuppliers().length} result(s)
                </span>
              </div>
              <div className="lookup-table-container">
                <table className="lookup-table">
                  <thead>
                    <tr>
                      <th>Supplier Code</th>
                      <th>Supplier Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.filteredSuppliers().length ? (
                      this.filteredSuppliers().map((supplier) => (
                        <tr
                          key={supplier._id}
                          className="lookup-row"
                          onClick={() => this.handleLookupSelect(supplier)}
                        >
                          <td>{supplier.code}</td>
                          <td>{supplier.name}</td>
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
      </div>
    );
  }
}

export default withRouter(SupplierOpeningBalance);
