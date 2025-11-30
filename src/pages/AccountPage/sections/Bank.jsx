import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class Bank extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      banks: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        name: "",
        branch: "",
        accountNumber: "",
        ifscCode: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("banks") || "[]");
    this.setState({ banks: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.banks !== this.state.banks) {
      // Demo: Save to localStorage
      localStorage.setItem("banks", JSON.stringify(this.state.banks));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        branch: "",
        accountNumber: "",
        ifscCode: "",
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
    const exists = this.state.banks.find((b) => b.code === this.state.formData.code);
    if (exists) return alert("Bank code already exists.");
    this.setState({
      banks: [...this.state.banks, this.state.formData],
    });
    alert("Bank added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update bank.");
    const updated = this.state.banks.map((b) =>
      b.code === this.state.formData.code ? this.state.formData : b
    );
    this.setState({ banks: updated });
    alert("Bank updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete bank.");
    const filtered = this.state.banks.filter((b) => b.code !== this.state.formData.code);
    this.setState({ banks: filtered });
    alert("Bank deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.banks.length) return alert("No banks available.");
    this.setState({ showReport: true });
  };

  handleSelectBank = (bank) => {
    this.setState({
      formData: bank,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>🏦 Bank</h2>
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
                { label: "Branch", name: "branch" },
                { label: "Account Number", name: "accountNumber" },
                { label: "IFSC Code", name: "ifscCode" },
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
          <div className="lookup-overlay">
            <div className="lookup-modal">
              <div className="lookup-header">
                <h3>🔍 Bank Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.banks.map((bank) => (
                  <div
                    className="lookup-item"
                    key={bank.code}
                    onClick={() => this.handleSelectBank(bank)}
                  >
                    <strong>{bank.name}</strong> ({bank.code})<br />
                    {bank.branch} | A/C: {bank.accountNumber}
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
                <h3>📋 Bank Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.banks.map((bank) => (
                  <div className="report-card" key={bank.code}>
                    <div className="report-info">
                      <strong>{bank.name}</strong> ({bank.code})<br />
                      Branch: {bank.branch}<br />
                      A/C: {bank.accountNumber} | IFSC: {bank.ifscCode}
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

export default withRouter(Bank);
