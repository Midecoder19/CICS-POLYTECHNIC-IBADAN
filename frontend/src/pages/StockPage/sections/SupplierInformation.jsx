import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { api } from "../../../config/api.js";
import AuthService from "../../../services/AuthService.js";
import "../../../styles/SocietyInfo.css";

class SupplierInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suppliers: [],
      showLookup: false,
      showReport: false,
      query: "",
      loading: false,
      error: null,
      success: null,
      selectedSupplier: null,
      formData: {
        code: "",
        name: "",
        address: "",
        salesPerson: "",
        phone: "",
        email: "",
        website: "",
        bank: "",
        bankAccountNo: "",
        status: "Active",
      },
    };
  }

  componentDidMount() {
    this.loadSuppliers();
  }

  loadSuppliers = async () => {
    try {
      this.setState({ loading: true, error: null });

      const response = await api.get('/common/suppliers');

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          this.setState({ suppliers: data.data || [] });
        } else {
          this.setState({ error: 'Invalid response format from server' });
        }
      } else {
        this.setState({ error: `Server error: ${response.status}` });
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      this.setState({ error: error.message || 'Failed to load suppliers' });
    } finally {
      this.setState({ loading: false });
    }
  };

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        address: "",
        salesPerson: "",
        phone: "",
        email: "",
        website: "",
        bank: "",
        bankAccountNo: "",
        status: "Active",
      },
      selectedSupplier: null,
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      formData: { ...this.state.formData, [name]: value }
    });
  };

  handleAdd = async () => {
    try {
      this.setState({ loading: true, error: null, success: null });

      if (!this.state.formData.code.trim()) {
        this.setState({ error: 'Supplier ID No is required', loading: false });
        return;
      }

      if (!this.state.formData.name.trim()) {
        this.setState({ error: 'Supplier Name is required', loading: false });
        return;
      }

      const data = {
        code: this.state.formData.code,
        name: this.state.formData.name,
        address: this.state.formData.address,
        contactPerson: this.state.formData.salesPerson,
        phone: this.state.formData.phone,
        email: this.state.formData.email,
        website: this.state.formData.website,
        bankDetails: {
          bankName: this.state.formData.bank,
          accountNumber: this.state.formData.bankAccountNo
        },
        isActive: this.state.formData.status === "Active"
      };

      const response = await api.post('/common/suppliers', data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          this.setState({
            success: 'Supplier information created successfully',
            selectedSupplier: responseData.data
          });
          this.loadSuppliers(); // Refresh suppliers for lookup modal
          this.clearForm(); // Clear form after successful add
          setTimeout(() => this.setState({ success: null }), 3000);
        } else {
          this.setState({ error: responseData.message || 'Failed to create supplier' });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({ error: errorData.message || `Server error: ${response.status}` });
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      this.setState({ error: error.message || 'Failed to create supplier information' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleUpdate = async () => {
    if (!this.state.selectedSupplier) {
      this.setState({ error: 'No supplier selected to update. Please select a supplier from lookup first.' });
      return;
    }

    try {
      this.setState({ loading: true, error: null, success: null });

      if (!this.state.formData.code.trim()) {
        this.setState({ error: 'Supplier ID No is required', loading: false });
        return;
      }

      if (!this.state.formData.name.trim()) {
        this.setState({ error: 'Supplier Name is required', loading: false });
        return;
      }

      const data = {
        code: this.state.formData.code,
        name: this.state.formData.name,
        address: this.state.formData.address,
        contactPerson: this.state.formData.salesPerson,
        phone: this.state.formData.phone,
        email: this.state.formData.email,
        website: this.state.formData.website,
        bankDetails: {
          bankName: this.state.formData.bank,
          accountNumber: this.state.formData.bankAccountNo
        },
        isActive: this.state.formData.status === "Active"
      };

      const response = await api.put(`/common/suppliers/${this.state.selectedSupplier._id}`, data);

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          this.setState({
            success: 'Supplier information updated successfully',
            selectedSupplier: responseData.data
          });
          this.loadSuppliers(); // Refresh suppliers for lookup modal
          setTimeout(() => this.setState({ success: null }), 3000);
        } else {
          this.setState({ error: responseData.message || 'Failed to update supplier' });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({ error: errorData.message || `Server error: ${response.status}` });
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      this.setState({ error: error.message || 'Failed to update supplier information' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async () => {
    if (!this.state.selectedSupplier) {
      this.setState({ error: 'No supplier selected to delete. Please select a supplier from lookup first.' });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this supplier information?')) {
      return;
    }

    try {
      this.setState({ loading: true, error: null, success: null });

      const response = await api.delete(`/common/suppliers/${this.state.selectedSupplier._id}`);

      if (response.ok) {
        this.setState({
          success: 'Supplier information deleted successfully'
        });
        this.loadSuppliers(); // Refresh suppliers for lookup modal
        this.clearForm();
        setTimeout(() => this.setState({ success: null }), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.setState({ error: errorData.message || `Server error: ${response.status}` });
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      this.setState({ error: error.message || 'Failed to delete supplier information' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleLookup = () => {
    this.setState({ showLookup: true, query: "" });
  };

  handleLookupSelect = (supplier) => {
    this.setState({
      selectedSupplier: supplier,
      formData: {
        code: supplier.code || "",
        name: supplier.name || "",
        address: typeof supplier.address === 'string' 
          ? supplier.address 
          : supplier.address?.street || "",
        salesPerson: supplier.contactPerson || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        website: supplier.website || "",
        bank: supplier.bankDetails?.bankName || supplier.bank || "",
        bankAccountNo: supplier.bankDetails?.accountNumber || supplier.bankAccountNo || "",
        status: supplier.isActive !== undefined ? (supplier.isActive ? "Active" : "Inactive") : (supplier.status || "Active"),
      },
      showLookup: false
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
      (s.code && s.code.toLowerCase().includes(q)) || 
      (s.name && s.name.toLowerCase().includes(q))
    );
  };

  handlePrint = () => {
    this.setState({ showReport: true });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>👤 Supplier Information</h2>
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

        {/* Toolbar */}
        <div className="toolbar">
          <button onClick={this.handleAdd} disabled={this.state.loading}>
            ➕ Add
          </button>
          <button className="primary" onClick={this.handleUpdate} disabled={this.state.loading || !this.state.selectedSupplier}>
            💾 Update
          </button>
          <button onClick={this.handleDelete} disabled={this.state.loading || !this.state.selectedSupplier}>
            🗑 Delete
          </button>
          <button onClick={this.handlePrint}>🖨 Print</button>
        </div>

        {/* Form */}
        <form className="society-card" onSubmit={(e) => e.preventDefault()}>
          <div className="form-section">
            <div className="form-grid">
              {/* Supplier ID No */}
              <div className="form-group code-field">
                <label>Supplier ID No:</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="code"
                    value={this.state.formData.code}
                    onChange={this.handleChange}
                    placeholder="Enter supplier ID"
                    disabled={this.state.loading}
                  />
                  <button
                    type="button"
                    className="key-btn"
                    onClick={this.handleLookup}
                    disabled={this.state.loading}
                  >
                    🔑
                  </button>
                </div>
              </div>

              {/* Supplier Name */}
              <div className="form-group">
                <label>Supplier Name:</label>
                <input
                  type="text"
                  name="name"
                  value={this.state.formData.name}
                  onChange={this.handleChange}
                  placeholder="Enter supplier name"
                  disabled={this.state.loading}
                />
              </div>

              {/* Address */}
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={this.state.formData.address}
                  onChange={this.handleChange}
                  placeholder="Enter address"
                  disabled={this.state.loading}
                />
              </div>

              {/* Sales Person */}
              <div className="form-group">
                <label>Sales Person:</label>
                <input
                  type="text"
                  name="salesPerson"
                  value={this.state.formData.salesPerson}
                  onChange={this.handleChange}
                  placeholder="Enter sales person name"
                  disabled={this.state.loading}
                />
              </div>

              {/* Telephone Number */}
              <div className="form-group">
                <label>Telephone Number:</label>
                <input
                  type="tel"
                  name="phone"
                  value={this.state.formData.phone}
                  onChange={this.handleChange}
                  placeholder="Enter telephone number"
                  disabled={this.state.loading}
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={this.state.formData.email}
                  onChange={this.handleChange}
                  placeholder="Enter email address"
                  disabled={this.state.loading}
                />
              </div>

              {/* Website */}
              <div className="form-group">
                <label>Website:</label>
                <input
                  type="url"
                  name="website"
                  value={this.state.formData.website}
                  onChange={this.handleChange}
                  placeholder="Enter website URL"
                  disabled={this.state.loading}
                />
              </div>

              {/* Bank */}
              <div className="form-group">
                <label>Bank:</label>
                <input
                  type="text"
                  name="bank"
                  value={this.state.formData.bank}
                  onChange={this.handleChange}
                  placeholder="Enter bank name"
                  disabled={this.state.loading}
                />
              </div>

              {/* Bank Account No */}
              <div className="form-group">
                <label>Bank Account No:</label>
                <input
                  type="text"
                  name="bankAccountNo"
                  value={this.state.formData.bankAccountNo}
                  onChange={this.handleChange}
                  placeholder="Enter bank account number"
                  disabled={this.state.loading}
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Status:</label>
                <select
                  name="status"
                  value={this.state.formData.status}
                  onChange={this.handleChange}
                  disabled={this.state.loading}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="footer-buttons">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.state.selectedSupplier ? this.handleUpdate : this.handleAdd}
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
                      <th>Phone</th>
                      <th>Email</th>
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
                          <td>{supplier.phone || '-'}</td>
                          <td>{supplier.email || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="no-results">
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
                    {this.state.selectedSupplier ? (
                      <>
                        <strong>Supplier ID No:</strong> {this.state.selectedSupplier.code}<br />
                        <strong>Supplier Name:</strong> {this.state.selectedSupplier.name}<br />
                        <strong>Address:</strong> {typeof this.state.selectedSupplier.address === 'string' ? this.state.selectedSupplier.address : (this.state.selectedSupplier.address?.street || "Not set")}<br />
                        <strong>Sales Person:</strong> {this.state.selectedSupplier.contactPerson || "Not set"}<br />
                        <strong>Telephone Number:</strong> {this.state.selectedSupplier.phone || "Not set"}<br />
                        <strong>Email:</strong> {this.state.selectedSupplier.email || "Not set"}<br />
                        <strong>Website:</strong> {this.state.selectedSupplier.website || "Not set"}<br />
                        <strong>Bank:</strong> {this.state.selectedSupplier.bankDetails?.bankName || this.state.selectedSupplier.bank || "Not set"}<br />
                        <strong>Bank Account No:</strong> {this.state.selectedSupplier.bankDetails?.accountNumber || this.state.selectedSupplier.bankAccountNo || "Not set"}<br />
                        <strong>Status:</strong> {this.state.selectedSupplier.isActive ? "Active" : "Inactive"}<br />
                        <strong>Created:</strong> {new Date(this.state.selectedSupplier.createdAt).toLocaleDateString()}<br />
                      </>
                    ) : (
                      <>
                        <strong>Supplier ID No:</strong> {this.state.formData.code || "Not set"}<br />
                        <strong>Supplier Name:</strong> {this.state.formData.name || "Not set"}<br />
                        <strong>Address:</strong> {this.state.formData.address || "Not set"}<br />
                        <strong>Sales Person:</strong> {this.state.formData.salesPerson || "Not set"}<br />
                        <strong>Telephone Number:</strong> {this.state.formData.phone || "Not set"}<br />
                        <strong>Email:</strong> {this.state.formData.email || "Not set"}<br />
                        <strong>Website:</strong> {this.state.formData.website || "Not set"}<br />
                        <strong>Bank:</strong> {this.state.formData.bank || "Not set"}<br />
                        <strong>Bank Account No:</strong> {this.state.formData.bankAccountNo || "Not set"}<br />
                        <strong>Status:</strong> {this.state.formData.status || "Not set"}<br />
                      </>
                    )}
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

export default withRouter(SupplierInformation);
