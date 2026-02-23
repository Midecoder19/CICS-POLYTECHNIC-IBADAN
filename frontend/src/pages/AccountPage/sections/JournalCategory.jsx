import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class JournalCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      journalCategories: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        name: "",
        type: "",
        description: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("journalCategories") || "[]");
    this.setState({ journalCategories: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.journalCategories !== this.state.journalCategories) {
      // Demo: Save to localStorage
      localStorage.setItem("journalCategories", JSON.stringify(this.state.journalCategories));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        type: "",
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
    const exists = this.state.journalCategories.find((jc) => jc.code === this.state.formData.code);
    if (exists) return alert("Journal Category code already exists.");
    this.setState({
      journalCategories: [...this.state.journalCategories, this.state.formData],
    });
    alert("Journal Category added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update journal category.");
    const updated = this.state.journalCategories.map((jc) =>
      jc.code === this.state.formData.code ? this.state.formData : jc
    );
    this.setState({ journalCategories: updated });
    alert("Journal Category updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete journal category.");
    const filtered = this.state.journalCategories.filter((jc) => jc.code !== this.state.formData.code);
    this.setState({ journalCategories: filtered });
    alert("Journal Category deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.journalCategories.length) return alert("No journal categories available.");
    this.setState({ showReport: true });
  };

  handleSelectJournalCategory = (journalCategory) => {
    this.setState({
      formData: journalCategory,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>📝 Journal Category</h2>
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
                <h3>🔍 Journal Category Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.journalCategories.map((jc) => (
                  <div
                    className="lookup-item"
                    key={jc.code}
                    onClick={() => this.handleSelectJournalCategory(jc)}
                  >
                    <strong>{jc.name}</strong> ({jc.code})<br />
                    Type: {jc.type}
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
                <h3>📋 Journal Category Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.journalCategories.map((jc) => (
                  <div className="report-card" key={jc.code}>
                    <div className="report-info">
                      <strong>{jc.name}</strong> ({jc.code})<br />
                      Type: {jc.type}<br />
                      {jc.description}
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

export default withRouter(JournalCategory);
