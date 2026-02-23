import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class Branch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      branches: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        name: "",
        address: "",
        phone: "",
        manager: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("branches") || "[]");
    this.setState({ branches: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.branches !== this.state.branches) {
      // Demo: Save to localStorage
      localStorage.setItem("branches", JSON.stringify(this.state.branches));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        address: "",
        phone: "",
        manager: "",
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
    const exists = this.state.branches.find((b) => b.code === this.state.formData.code);
    if (exists) return alert("Branch code already exists.");
    this.setState({
      branches: [...this.state.branches, this.state.formData],
    });
    alert("Branch added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update branch.");
    const updated = this.state.branches.map((b) =>
      b.code === this.state.formData.code ? this.state.formData : b
    );
    this.setState({ branches: updated });
    alert("Branch updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete branch.");
    const filtered = this.state.branches.filter((b) => b.code !== this.state.formData.code);
    this.setState({ branches: filtered });
    alert("Branch deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.branches.length) return alert("No branches available.");
    this.setState({ showReport: true });
  };

  handleSelectBranch = (branch) => {
    this.setState({
      formData: branch,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>🏢 Branch</h2>
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
                { label: "Address", name: "address" },
                { label: "Phone", name: "phone" },
                { label: "Manager", name: "manager" },
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
                <h3>🔍 Branch Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.branches.map((branch) => (
                  <div
                    className="lookup-item"
                    key={branch.code}
                    onClick={() => this.handleSelectBranch(branch)}
                  >
                    <strong>{branch.name}</strong> ({branch.code})<br />
                    {branch.address} | {branch.phone}
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
                <h3>📋 Branch Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.branches.map((branch) => (
                  <div className="report-card" key={branch.code}>
                    <div className="report-info">
                      <strong>{branch.name}</strong> ({branch.code})<br />
                      {branch.address}<br />
                      📞 {branch.phone} | 👤 {branch.manager}
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

export default withRouter(Branch);
