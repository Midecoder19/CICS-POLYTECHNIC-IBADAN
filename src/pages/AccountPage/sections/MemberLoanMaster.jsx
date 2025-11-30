import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class MemberLoanMaster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      memberLoans: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        memberId: "",
        loanAmount: "",
        interestRate: "",
        tenure: "",
        status: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("memberLoans") || "[]");
    this.setState({ memberLoans: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.memberLoans !== this.state.memberLoans) {
      // Demo: Save to localStorage
      localStorage.setItem("memberLoans", JSON.stringify(this.state.memberLoans));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        memberId: "",
        loanAmount: "",
        interestRate: "",
        tenure: "",
        status: "",
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
    const exists = this.state.memberLoans.find((ml) => ml.code === this.state.formData.code);
    if (exists) return alert("Member Loan code already exists.");
    this.setState({
      memberLoans: [...this.state.memberLoans, this.state.formData],
    });
    alert("Member Loan added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update member loan.");
    const updated = this.state.memberLoans.map((ml) =>
      ml.code === this.state.formData.code ? this.state.formData : ml
    );
    this.setState({ memberLoans: updated });
    alert("Member Loan updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete member loan.");
    const filtered = this.state.memberLoans.filter((ml) => ml.code !== this.state.formData.code);
    this.setState({ memberLoans: filtered });
    alert("Member Loan deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.memberLoans.length) return alert("No member loans available.");
    this.setState({ showReport: true });
  };

  handleSelectMemberLoan = (memberLoan) => {
    this.setState({
      formData: memberLoan,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>💰 Member Loan Master</h2>
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
                { label: "Loan Amount", name: "loanAmount" },
                { label: "Interest Rate (%)", name: "interestRate" },
                { label: "Tenure (months)", name: "tenure" },
                { label: "Status", name: "status" },
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
                <h3>🔍 Member Loan Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.memberLoans.map((ml) => (
                  <div
                    className="lookup-item"
                    key={ml.code}
                    onClick={() => this.handleSelectMemberLoan(ml)}
                  >
                    <strong>Loan {ml.code}</strong> - Member: {ml.memberId}<br />
                    Amount: {ml.loanAmount} | Status: {ml.status}
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
                <h3>📋 Member Loan Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.memberLoans.map((ml) => (
                  <div className="report-card" key={ml.code}>
                    <div className="report-info">
                      <strong>Loan {ml.code}</strong><br />
                      Member ID: {ml.memberId}<br />
                      Amount: {ml.loanAmount} | Interest: {ml.interestRate}%<br />
                      Tenure: {ml.tenure} months | Status: {ml.status}
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

export default withRouter(MemberLoanMaster);
