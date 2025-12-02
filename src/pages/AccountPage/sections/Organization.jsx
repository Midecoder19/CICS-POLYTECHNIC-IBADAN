import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class Organization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      organizations: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        name: "",
        society: "",
        description: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("organizations") || "[]");
    this.setState({ organizations: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.organizations !== this.state.organizations) {
      // Demo: Save to localStorage
      localStorage.setItem("organizations", JSON.stringify(this.state.organizations));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        society: "",
        description: "",
      },
    });
  };

  handleChange = (e) => {
    this.setState({
      formData: { ...this.state.formData, [e.target.name]: e.target.value },
    });
  };

  handleAdd = () => {
    if (!this.state.formData.code) return alert("Please enter a code before adding.");
    const exists = this.state.organizations.find((o) => o.code === this.state.formData.code);
    if (exists) return alert("Organization code already exists.");
    this.setState({
      organizations: [...this.state.organizations, this.state.formData],
    });
    alert("Organization added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update organization.");
    const updated = this.state.organizations.map((o) =>
      o.code === this.state.formData.code ? this.state.formData : o
    );
    this.setState({ organizations: updated });
    alert("Organization updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete organization.");
    const filtered = this.state.organizations.filter((o) => o.code !== this.state.formData.code);
    this.setState({ organizations: filtered });
    alert("Organization deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.organizations.length) return alert("No organizations available.");
    this.setState({ showReport: true });
  };

  handleSelectOrganization = (organization) => {
    this.setState({
      formData: organization,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>🏢 Organization</h2>
          <button className="back-btn" onClick={() => this.props.navigate("/account")}>
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
                { label: "Society", name: "society" },
                { label: "Description", name: "description" },
              ].map((field) => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}:</label>
                  <input
                    type="text"
                    name={field.name}
                    value={this.state.formData[field.name]}
                    onChange={this.handleChange}
                  />
                </div>
              ))}
            </div>

            {/* Right Section - Placeholder for future use */}
            <div className="logo-section">
              <div className="logo-box">
                <span>No Image</span>
              </div>
            </div>
          </div>

          <div className="footer-buttons">
            <button type="button" className="btn btn-primary" onClick={this.handleUpdate}>
              OK
        </form>
            <button
              type="button"

              onClick={() => this.props.navigate("/dashboard")}
        {/* Lookup Modal */}
        {this.state.showLookup && (
          <div className="lookup-overlay">
          </div>
            <div className="lookup-modal">
              <div className="lookup-header">
                <h3>🔍 Organization Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.organizations.map((org) => (
                  <div
                    className="lookup-item"
                    key={org.code}
                    onClick={() => this.handleSelectOrganization(org)}
                  >
                    <strong>{org.name}</strong> ({org.code})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {this.state.showReport && (
          <div className="report-overlay">
            <div className="report-modal">
              <div className="report-header">
                <h3>📋 Organization Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.organizations.map((org) => (
                  <div className="report-card" key={org.code}>
                    <div className="report-info">
                      <strong>{org.name}</strong> ({org.code})<br />
                      Society: {org.society}<br />
                      Description: {org.description}
                    </div>
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

export default withRouter(Organization);
