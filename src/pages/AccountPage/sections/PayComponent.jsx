import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class PayComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      payComponents: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        name: "",
        type: "",
        amount: "",
        description: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("payComponents") || "[]");
    this.setState({ payComponents: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.payComponents !== this.state.payComponents) {
      // Demo: Save to localStorage
      localStorage.setItem("payComponents", JSON.stringify(this.state.payComponents));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        type: "",
        amount: "",
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
    const exists = this.state.payComponents.find((pc) => pc.code === this.state.formData.code);
    if (exists) return alert("Pay Component code already exists.");
    this.setState({
      payComponents: [...this.state.payComponents, this.state.formData],
    });
    alert("Pay Component added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update pay component.");
    const updated = this.state.payComponents.map((pc) =>
      pc.code === this.state.formData.code ? this.state.formData : pc
    );
    this.setState({ payComponents: updated });
    alert("Pay Component updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete pay component.");
    const filtered = this.state.payComponents.filter((pc) => pc.code !== this.state.formData.code);
    this.setState({ payComponents: filtered });
    alert("Pay Component deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.payComponents.length) return alert("No pay components available.");
    this.setState({ showReport: true });
  };

  handleSelectPayComponent = (payComponent) => {
    this.setState({
      formData: payComponent,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>💰 Pay Component</h2>
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
                { label: "Type", name: "type" },
                { label: "Amount", name: "amount" },
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
                <h3>🔍 Pay Component Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.payComponents.map((pc) => (
                  <div
                    className="lookup-item"
                    key={pc.code}
                    onClick={() => this.handleSelectPayComponent(pc)}
                  >
                    <strong>{pc.name}</strong> ({pc.code})<br />
                    Type: {pc.type} | Amount: {pc.amount}
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
                <h3>📋 Pay Component Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.payComponents.map((pc) => (
                  <div className="report-card" key={pc.code}>
                    <div className="report-info">
                      <strong>{pc.name}</strong> ({pc.code})<br />
                      Type: {pc.type} | Amount: {pc.amount}<br />
                      {pc.description}
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

export default withRouter(PayComponent);
