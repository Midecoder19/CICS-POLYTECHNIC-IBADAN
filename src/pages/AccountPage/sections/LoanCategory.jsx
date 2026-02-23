import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class LoanCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loanCategories: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        name: "",
        interestRate: "",
        maxAmount: "",
        description: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("loanCategories") || "[]");
    this.setState({ loanCategories: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.loanCategories !== this.state.loanCategories) {
      // Demo: Save to localStorage
      localStorage.setItem("loanCategories", JSON.stringify(this.state.loanCategories));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        interestRate: "",
        maxAmount: "",
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
    const exists = this.state.loanCategories.find((lc) => lc.code === this.state.formData.code);
    if (exists) return alert("Loan Category code already exists.");
    this.setState({
      loanCategories: [...this.state.loanCategories, this.state.formData],
    });
    alert("Loan Category added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update loan category.");
    const updated = this.state.loanCategories.map((lc) =>
      lc.code === this.state.formData.code ? this.state.formData : lc
    );
    this.setState({ loanCategories: updated });
    alert("Loan Category updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete loan category.");
    const filtered = this.state.loanCategories.filter((lc) => lc.code !== this.state.formData.code);
    this.setState({ loanCategories: filtered });
    alert("Loan Category deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.loanCategories.length) return alert("No loan categories available.");
    this.setState({ showReport: true });
  };

  handleSelectLoanCategory = (loanCategory) => {
    this.setState({
      formData: loanCategory,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>💳 Loan Category</h2>
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
                { label: "Interest Rate (%)", name: "interestRate" },
                { label: "Max Amount", name: "maxAmount" },
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
                <h3>🔍 Loan Category Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.loanCategories.map((lc) => (
                  <div
                    className="lookup-item"
                    key={lc.code}
                    onClick={() => this.handleSelectLoanCategory(lc)}
                  >
                    <strong>{lc.name}</strong> ({lc.code})<br />
                    Interest: {lc.interestRate}% | Max: {lc.maxAmount}
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
                <h3>📋 Loan Category Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.loanCategories.map((lc) => (
                  <div className="report-card" key={lc.code}>
                    <div className="report-info">
                      <strong>{lc.name}</strong> ({lc.code})<br />
                      Interest Rate: {lc.interestRate}%<br />
                      Max Amount: {lc.maxAmount}<br />
                      {lc.description}
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

export default withRouter(LoanCategory);
