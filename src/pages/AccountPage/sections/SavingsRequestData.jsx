import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class SavingsRequestData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      savingsRequests: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        memberId: "",
        amount: "",
        requestDate: "",
        status: "",
        remarks: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("savingsRequests") || "[]");
    this.setState({ savingsRequests: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.savingsRequests !== this.state.savingsRequests) {
      // Demo: Save to localStorage
      localStorage.setItem("savingsRequests", JSON.stringify(this.state.savingsRequests));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        memberId: "",
        amount: "",
        requestDate: "",
        status: "",
        remarks: "",
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
    const exists = this.state.savingsRequests.find((sr) => sr.code === this.state.formData.code);
    if (exists) return alert("Savings Request code already exists.");
    this.setState({
      savingsRequests: [...this.state.savingsRequests, this.state.formData],
    });
    alert("Savings Request added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update savings request.");
    const updated = this.state.savingsRequests.map((sr) =>
      sr.code === this.state.formData.code ? this.state.formData : sr
    );
    this.setState({ savingsRequests: updated });
    alert("Savings Request updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete savings request.");
    const filtered = this.state.savingsRequests.filter((sr) => sr.code !== this.state.formData.code);
    this.setState({ savingsRequests: filtered });
    alert("Savings Request deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.savingsRequests.length) return alert("No savings requests available.");
    this.setState({ showReport: true });
  };

  handleSelectSavingsRequest = (savingsRequest) => {
    this.setState({
      formData: savingsRequest,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>💸 Savings Request Data</h2>
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
                { label: "Member ID", name: "memberId" },
                { label: "Amount", name: "amount" },
                { label: "Request Date", name: "requestDate", type: "date" },
                { label: "Status", name: "status" },
                { label: "Remarks", name: "remarks" },
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
                <h3>🔍 Savings Request Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.savingsRequests.map((sr) => (
                  <div
                    className="lookup-item"
                    key={sr.code}
                    onClick={() => this.handleSelectSavingsRequest(sr)}
                  >
                    <strong>Request {sr.code}</strong> - Member: {sr.memberId}<br />
                    Amount: {sr.amount} | Status: {sr.status}
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
                <h3>📋 Savings Request Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.savingsRequests.map((sr) => (
                  <div className="report-card" key={sr.code}>
                    <div className="report-info">
                      <strong>Request {sr.code}</strong><br />
                      Member ID: {sr.memberId}<br />
                      Amount: {sr.amount} | Date: {sr.requestDate}<br />
                      Status: {sr.status}<br />
                      Remarks: {sr.remarks}
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

export default withRouter(SavingsRequestData);
