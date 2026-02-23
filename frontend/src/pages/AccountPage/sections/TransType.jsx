import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class TransType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transTypes: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        name: "",
        category: "",
        description: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("transTypes") || "[]");
    this.setState({ transTypes: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.transTypes !== this.state.transTypes) {
      // Demo: Save to localStorage
      localStorage.setItem("transTypes", JSON.stringify(this.state.transTypes));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        category: "",
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
    const exists = this.state.transTypes.find((t) => t.code === this.state.formData.code);
    if (exists) return alert("Transaction Type code already exists.");
    this.setState({
      transTypes: [...this.state.transTypes, this.state.formData],
    });
    alert("Transaction Type added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update transaction type.");
    const updated = this.state.transTypes.map((t) =>
      t.code === this.state.formData.code ? this.state.formData : t
    );
    this.setState({ transTypes: updated });
    alert("Transaction Type updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete transaction type.");
    const filtered = this.state.transTypes.filter((t) => t.code !== this.state.formData.code);
    this.setState({ transTypes: filtered });
    alert("Transaction Type deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.transTypes.length) return alert("No transaction types available.");
    this.setState({ showReport: true });
  };

  handleSelectTransType = (transType) => {
    this.setState({
      formData: transType,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>🔄 Transaction Type</h2>
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
                { label: "Category", name: "category" },
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
                <h3>🔍 Transaction Type Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.transTypes.map((tt) => (
                  <div
                    className="lookup-item"
                    key={tt.code}
                    onClick={() => this.handleSelectTransType(tt)}
                  >
                    <strong>{tt.name}</strong> ({tt.code})<br />
                    {tt.category}
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
                <h3>📋 Transaction Type Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.transTypes.map((tt) => (
                  <div className="report-card" key={tt.code}>
                    <div className="report-info">
                      <strong>{tt.name}</strong> ({tt.code})<br />
                      Category: {tt.category}<br />
                      {tt.description}
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

export default withRouter(TransType);
