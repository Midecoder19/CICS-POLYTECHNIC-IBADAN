import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import SocietyLookupModal from "./SocietyLookupModal";
import SocietyService from "../../../services/SocietyService";
import "../../../styles/SocietyInfo.css";

class SocietyInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      societies: [],
      showLookup: false,
      showReport: false,
      loading: false,
      error: null,
      modal: {
        show: false,
        title: '',
        message: '',
        type: 'info' // 'success', 'error', 'warning', 'info'
      },
      formData: {
        code: "",
        name: "",
        street: "",
        town: "",
        state: "",
        country: "",
        phone: "",
        email: "",
        website: "",
        bank: "",
        bankTitle: "",
        smtpPassword: "",
        logo: "",
      },
    };
  }

  componentDidMount() {
    this.fetchSocieties();
  }

  componentWillUnmount() {
    // Clean up any pending timeouts
    if (this.codeLookupTimeout) {
      clearTimeout(this.codeLookupTimeout);
    }
  }

  async fetchSocieties() {
    this.setState({ loading: true, error: null });
    try {
      const societies = await SocietyService.getSocieties();
      this.setState({ societies, loading: false });
    } catch (error) {
      console.error('Error fetching societies:', error);
      this.setState({
        error: error.message || 'Failed to load societies',
        loading: false
      });
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        street: "",
        town: "",
        state: "",
        country: "",
        phone: "",
        email: "",
        website: "",
        bank: "",
        bankTitle: "",
        smtpPassword: "",
        logo: "",
      },
    });
  };

  showModal = (type, title, message) => {
    this.setState({
      modal: {
        show: true,
        title,
        message,
        type
      }
    });
  };

  hideModal = () => {
    this.setState({
      modal: {
        show: false,
        title: '',
        message: '',
        type: 'info'
      }
    });
  };

  handleCodeLookup = async (code) => {
    try {
      // Find the society in the local societies array first (case-insensitive)
      const society = this.state.societies.find(
        s => s.code && s.code.toLowerCase() === code.toLowerCase()
      );

      if (society) {
        // Auto-fill the form with society data
        this.setState({
          formData: {
            ...this.state.formData,
            code: society.code,
            name: society.name || '',
            street: society.street || '',
            town: society.town || '',
            state: society.state || '',
            country: society.country || '',
            phone: society.phone || '',
            email: society.email || '',
            website: society.website || '',
            bank: society.bank || '',
            bankTitle: society.bankTitle || '',
            smtpPassword: society.smtpPassword || '',
            logo: society.logo || '',
          }
        });

        // Show success message
        this.showModal('success', 'Society Loaded', `Society "${society.name}" loaded successfully!`);
      } else {
        // Code not found, just update the code field
        this.setState({
          formData: {
            ...this.state.formData,
            code: code,
          }
        });
      }
    } catch (error) {
      console.error('Error during code lookup:', error);
      // Still update the code field even if lookup fails
      this.setState({
        formData: {
          ...this.state.formData,
          code: code,
        }
      });
    }
  };

  handleChange = async (e) => {
    const { name, value } = e.target;

    // Update the form data
    this.setState({
      formData: { ...this.state.formData, [name]: value },
    });

    // Auto-fill other fields when code changes (with debouncing)
    if (name === 'code') {
      // Clear any existing timeout
      if (this.codeLookupTimeout) {
        clearTimeout(this.codeLookupTimeout);
      }

      // Set a new timeout for 500ms after user stops typing
      this.codeLookupTimeout = setTimeout(async () => {
        if (value.trim()) {
          await this.handleCodeLookup(value.trim());
        }
      }, 500);
    }
  };

  handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.setState({
      formData: { ...this.state.formData, logo: reader.result },
    });
    reader.readAsDataURL(file);
  };

  handleClearLogo = () => this.setState({
    formData: { ...this.state.formData, logo: "" },
  });

  handleAdd = async () => {
    if (!this.state.formData.code || !this.state.formData.name) {
      this.showModal('warning', 'Validation Error', 'Please enter both code and name before adding.');
      return;
    }

    this.setState({ loading: true, error: null });
    try {
      // Convert code to uppercase before sending
      const societyData = {
        ...this.state.formData,
        code: this.state.formData.code.toUpperCase()
      };

      const newSociety = await SocietyService.createSociety(societyData);
      this.setState(prevState => ({
        societies: [...prevState.societies, newSociety],
        loading: false
      }));
      this.showModal('success', 'Society Added Successfully!', `Society "${newSociety.name}" has been added with code "${newSociety.code}".`);
      this.clearForm();
    } catch (error) {
      console.error('Error adding society:', error);
      this.setState({
        error: error.message || 'Failed to add society',
        loading: false
      });
      this.showModal('error', 'Add Failed', error.message || 'Failed to add society');
    }
  };

  handleUpdate = async () => {
    if (!this.state.formData.code) {
      this.showModal('warning', 'Validation Error', 'Enter code to update society.');
      return;
    }

    // Debug: Check societies array and search code
    console.log('Societies in state:', this.state.societies);
    console.log('Searching for code:', this.state.formData.code.toUpperCase());

    // Find the society to update (case-insensitive search)
    const societyToUpdate = this.state.societies.find(s => s.code.toUpperCase() === this.state.formData.code.toUpperCase());

    console.log('Found society:', societyToUpdate);

    if (!societyToUpdate) {
      const availableCodes = this.state.societies.map(s => s.code).join(', ');
      this.showModal('warning', 'Society Not Found', `Society with code "${this.state.formData.code.toUpperCase()}" not found.\n\nAvailable society codes: ${availableCodes}\n\nPlease enter one of the available codes or use the 🔑 button to select from the list.`);
      return;
    }

    this.setState({ loading: true, error: null });
    try {
      // Convert code to uppercase before sending
      const updateData = {
        ...this.state.formData,
        code: this.state.formData.code.toUpperCase()
      };

      const updatedSociety = await SocietyService.updateSociety(societyToUpdate._id, updateData);
      this.setState(prevState => ({
        societies: prevState.societies.map(s =>
          s._id === updatedSociety._id ? updatedSociety : s
        ),
        loading: false
      }));
      this.showModal('success', 'Society Updated Successfully!', `Society "${updatedSociety.name}" has been updated.`);
    } catch (error) {
      console.error('Error updating society:', error);
      this.setState({
        error: error.message || 'Failed to update society',
        loading: false
      });
      this.showModal('error', 'Update Failed', error.message || 'Failed to update society');
    }
  };

  handleDelete = async () => {
    if (!this.state.formData.code) {
      this.showModal('warning', 'Validation Error', 'Enter code to delete society.');
      return;
    }

    if (!window.confirm("Are you sure you want to delete this society?")) {
      return;
    }

    // Find the society to delete (case-insensitive search)
    const societyToDelete = this.state.societies.find(s => s.code.toUpperCase() === this.state.formData.code.toUpperCase());
    if (!societyToDelete) {
      this.showModal('warning', 'Society Not Found', 'Society not found.');
      return;
    }

    this.setState({ loading: true, error: null });
    try {
      await SocietyService.deleteSociety(societyToDelete._id);
      this.setState(prevState => ({
        societies: prevState.societies.filter(s => s._id !== societyToDelete._id),
        loading: false
      }));
      this.showModal('success', 'Society Deleted Successfully!', `Society "${societyToDelete.name}" has been deleted.`);
      this.clearForm();
    } catch (error) {
      console.error('Error deleting society:', error);
      this.setState({
        error: error.message || 'Failed to delete society',
        loading: false
      });
      this.showModal('error', 'Delete Failed', error.message || 'Failed to delete society');
    }
  };

  handlePrint = () => {
    if (!this.state.societies.length) {
      this.showModal('info', 'No Data', 'No societies available.');
      return;
    }
    this.setState({ showReport: true });
  };

  handleSelectSociety = (society) => {
    this.setState({
      formData: {
        code: society.code,
        name: society.name,
        street: society.street || "",
        town: society.town || "",
        state: society.state || "",
        country: society.country || "",
        phone: society.phone || "",
        email: society.email || "",
        website: society.website || "",
        bank: society.bank || "",
        bankTitle: society.bankTitle || "",
        smtpPassword: society.smtpPassword || "",
        logo: society.logo || "",
      },
      showLookup: false,
    });
  };

  render() {
    const { loading, error } = this.state;

    return (
      <div className="society-page">
        <div className="society-header">
          <h2>🏢 Society Information</h2>
          <button className="back-btn" onClick={() => this.props.navigate("/common")}>
            ⬅ Back
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="toolbar">
          <button onClick={this.handleAdd} disabled={loading}>
            {loading ? '⏳' : '➕'} Add
          </button>
          <button className="primary" onClick={this.handleUpdate} disabled={loading}>
            {loading ? '⏳' : '💾'} Update
          </button>
          <button onClick={this.handleDelete} disabled={loading}>
            {loading ? '⏳' : '🗑'} Delete
          </button>
          <button onClick={this.handlePrint} disabled={loading}>
            {loading ? '⏳' : '🖨'} Print
          </button>
        </div>

        {/* Form */}
        <form className="society-card" onSubmit={(e) => e.preventDefault()}>
          <div className="form-section">
            <div className="form-grid">
              {/* Code + Key */}
              <div className="form-group code-field">
                <label>Code:</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="code"
                    value={this.state.formData.code}
                    onChange={this.handleChange}
                    placeholder="Enter society code"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="key-btn"
                    onClick={() => this.setState({ showLookup: true })}
                    disabled={loading}
                  >
                    🔑
                  </button>
                </div>
              </div>

              {[
                { label: "Name", name: "name", required: true },
                { label: "Street", name: "street" },
                { label: "Town", name: "town" },
                { label: "State", name: "state" },
                { label: "Country", name: "country" },
                { label: "Telephone No", name: "phone" },
                { label: "Email Address", name: "email", type: "email" },
                { label: "Website", name: "website", type: "url" },
                { label: "Bank", name: "bank" },
                { label: "Bank Title", name: "bankTitle" },
                { label: "SMTP Password", name: "smtpPassword", type: "password" },
              ].map((field) => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}:{field.required && <span className="text-danger">*</span>}</label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={this.state.formData[field.name]}
                    onChange={this.handleChange}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>

            {/* Right Logo Section */}
            <div className="logo-section">
              <div className="logo-box">
                {this.state.formData.logo ? (
                  <img src={this.state.formData.logo} alt="Society Logo" />
                ) : (
                  <span>No Logo</span>
                )}
              </div>
              <div className="logo-buttons">
                <button
                  type="button"
                  className="load-logo-btn"
                  onClick={() => document.getElementById('logo-input').click()}
                  disabled={loading}
                >
                  Load Logo
                </button>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  onChange={this.handleLogoUpload}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="clear-logo-btn"
                  onClick={this.handleClearLogo}
                  disabled={loading}
                >
                  Clear Logo
                </button>
              </div>
            </div>
          </div>

          <div className="footer-buttons">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleUpdate}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => this.props.navigate("/dashboard")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Lookup Modal */}
        {this.state.showLookup && (
          <SocietyLookupModal
            societies={this.state.societies}
            onClose={() => this.setState({ showLookup: false })}
            onSelect={this.handleSelectSociety}
          />
        )}

        {/* Report Modal */}
        {this.state.showReport && (
          <div className="report-overlay">
            <div className="report-modal">
              <div className="report-header">
                <h3>📋 Society Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.societies.map((s) => (
                  <div className="report-card" key={s._id}>
                    <div className="report-info">
                      <strong>{s.name}</strong> ({s.code})<br />
                      {s.street && `${s.street}, `}{s.town && `${s.town}, `}{s.state && `${s.state}, `}{s.country}
                      <br />
                      {s.phone && `📞 ${s.phone} `}
                      {s.email && `✉️ ${s.email}`}
                      <br />
                      {s.website && `🌐 ${s.website} `}
                      <br />
                      {s.bank && `🏦 ${s.bank}`}
                      {s.bankTitle && ` - ${s.bankTitle}`}
                    </div>
                    {s.logo && (
                      <div className="report-logo">
                        <img src={s.logo} alt={s.name} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="report-footer">
                <button onClick={() => this.setState({ showReport: false })}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {this.state.modal.show && (
          <div className="modal-overlay" onClick={this.hideModal}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className={`modal-header ${this.state.modal.type === 'error' ? 'bg-danger' : this.state.modal.type === 'warning' ? 'bg-warning' : this.state.modal.type === 'success' ? 'bg-success' : 'bg-info'} text-white`}>
                  <h5 className="modal-title">
                    {this.state.modal.type === 'success' && '✅ '}
                    {this.state.modal.type === 'error' && '❌ '}
                    {this.state.modal.type === 'warning' && '⚠️ '}
                    {this.state.modal.type === 'info' && 'ℹ️ '}
                    {this.state.modal.title}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={this.hideModal}></button>
                </div>
                <div className="modal-body">
                  <p style={{ whiteSpace: 'pre-line' }}>{this.state.modal.message}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className={`btn ${this.state.modal.type === 'error' ? 'btn-danger' : this.state.modal.type === 'warning' ? 'btn-warning' : this.state.modal.type === 'success' ? 'btn-success' : 'btn-info'}`} onClick={this.hideModal}>
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(SocietyInfo);
