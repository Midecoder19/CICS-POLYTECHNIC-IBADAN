import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import SocietyLookupModal from "./SocietyLookupModal";
import "../../../styles/SocietyInfo.css";

class SocietyInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      societies: [],
      showLookup: false,
      showReport: false,
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
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("societies") || "[]");
    this.setState({ societies: stored });

    // TODO: Uncomment for real API
    // this.fetchSocieties();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.societies !== this.state.societies) {
      // Demo: Save to localStorage
      localStorage.setItem("societies", JSON.stringify(this.state.societies));

      // TODO: Uncomment for real API
      // this.saveSocietiesToAPI(this.state.societies);
    }
  }

  // TODO: Uncomment for real API
  // async fetchSocieties() {
  //   try {
  //     const response = await fetch('/api/societies');
  //     const data = await response.json();
  //     this.setState({ societies: data });
  //   } catch (error) {
  //     console.error('Error fetching societies:', error);
  //   }
  // }

  // TODO: Uncomment for real API
  // async saveSocietiesToAPI(societies) {
  //   try {
  //     await fetch('/api/societies', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(societies)
  //     });
  //   } catch (error) {
  //     console.error('Error saving societies:', error);
  //   }
  // }

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

  handleChange = (e) => {
    this.setState({
      formData: { ...this.state.formData, [e.target.name]: e.target.value },
    });
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

  handleAdd = () => {
    if (!this.state.formData.code) return alert("Please enter a code before adding.");
    const exists = this.state.societies.find((s) => s.code === this.state.formData.code);
    if (exists) return alert("Society code already exists.");
    this.setState({
      societies: [...this.state.societies, this.state.formData],
    });
    alert("Society added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update society.");
    const updated = this.state.societies.map((s) =>
      s.code === this.state.formData.code ? this.state.formData : s
    );
    this.setState({ societies: updated });
    alert("Society updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete society.");
    const filtered = this.state.societies.filter((s) => s.code !== this.state.formData.code);
    this.setState({ societies: filtered });
    alert("Society deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.societies.length) return alert("No societies available.");
    this.setState({ showReport: true });
  };

  handleSelectSociety = (society) => {
    this.setState({
      formData: society,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>🏢 Society Information</h2>
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
                <label>Code:</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="code"
                    value={this.state.formData.code}
                    onChange={this.handleChange}
                  />
                  <button
                    type="button"
                    className="key-btn"
                    onClick={() => this.setState({ showLookup: true })}
                  >
                    🔑
                  </button>
                </div>
              </div>

              {[
                { label: "Name", name: "name" },
                { label: "Street", name: "street" },
                { label: "Town", name: "town" },
                { label: "State", name: "state" },
                { label: "Country", name: "country" },
                { label: "Telephone No", name: "phone" },
                { label: "Email Address", name: "email", type: "email" },
                { label: "Website", name: "website" },
                { label: "Bank", name: "bank" },
                { label: "Bank Title", name: "bankTitle" },
                { label: "SMTP Password", name: "smtpPassword", type: "password" },
              ].map((field) => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}:</label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={this.state.formData[field.name]}
                    onChange={this.handleChange}
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
              <input type="file" accept="image/*" onChange={this.handleLogoUpload} />
              <button
                type="button"
                className="clear-logo-btn"
                onClick={this.handleClearLogo}
              >
                Clear Logo
              </button>
            </div>
          </div>

          <div className="footer-buttons">
            <button type="button" className="btn btn-primary" onClick={this.handleUpdate}>
              Save
            </button>
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => this.props.navigate("/dashboard")}
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
                  <div className="report-card" key={s.code}>
                    <div className="report-info">
                      <strong>{s.name}</strong> ({s.code})<br />
                      {s.street}, {s.town}, {s.state}, {s.country}
                      <br />
                      📞 {s.phone} | ✉️ {s.email}
                      <br />
                      🌐 {s.website} <br />
                      🏦 {s.bank} - {s.bankTitle}
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
      </div>
    );
  }
}

export default withRouter(SocietyInfo);
