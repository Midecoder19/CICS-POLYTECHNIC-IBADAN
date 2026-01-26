import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/SocietyInfo.css";

class Department extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      departments: [],
      showLookup: false,
      showReport: false,
      formData: {
        code: "",
        name: "",
        head: "",
        description: "",
      },
    };
  }

  componentDidMount() {
    // Demo: Load from localStorage
    const stored = JSON.parse(localStorage.getItem("departments") || "[]");
    this.setState({ departments: stored });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.departments !== this.state.departments) {
      // Demo: Save to localStorage
      localStorage.setItem("departments", JSON.stringify(this.state.departments));
    }
  }

  clearForm = () => {
    this.setState({
      formData: {
        code: "",
        name: "",
        head: "",
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
    const exists = this.state.departments.find((d) => d.code === this.state.formData.code);
    if (exists) return alert("Department code already exists.");
    this.setState({
      departments: [...this.state.departments, this.state.formData],
    });
    alert("Department added successfully!");
    this.clearForm();
  };

  handleUpdate = () => {
    if (!this.state.formData.code) return alert("Enter code to update department.");
    const updated = this.state.departments.map((d) =>
      d.code === this.state.formData.code ? this.state.formData : d
    );
    this.setState({ departments: updated });
    alert("Department updated successfully!");
  };

  handleDelete = () => {
    if (!this.state.formData.code) return alert("Enter code to delete department.");
    const filtered = this.state.departments.filter((d) => d.code !== this.state.formData.code);
    this.setState({ departments: filtered });
    alert("Department deleted!");
    this.clearForm();
  };

  handlePrint = () => {
    if (!this.state.departments.length) return alert("No departments available.");
    this.setState({ showReport: true });
  };

  handleSelectDepartment = (department) => {
    this.setState({
      formData: department,
      showLookup: false,
    });
  };

  render() {
    return (
      <div className="society-page">
        <div className="society-header">
          <h2>🏢 Department</h2>
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
                { label: "Head", name: "head" },
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
                <h3>🔍 Department Lookup</h3>
                <button className="close-btn" onClick={() => this.setState({ showLookup: false })}>
                  ✖
                </button>
              </div>
              <div className="lookup-body">
                {this.state.departments.map((dept) => (
                  <div
                    className="lookup-item"
                    key={dept.code}
                    onClick={() => this.handleSelectDepartment(dept)}
                  >
                    <strong>{dept.name}</strong> ({dept.code})<br />
                    Head: {dept.head}
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
                <h3>📋 Department Summary Report</h3>
                <button className="close-btn" onClick={() => this.setState({ showReport: false })}>
                  ✖
                </button>
              </div>
              <div className="report-body">
                {this.state.departments.map((dept) => (
                  <div className="report-card" key={dept.code}>
                    <div className="report-info">
                      <strong>{dept.name}</strong> ({dept.code})<br />
                      Head: {dept.head}<br />
                      {dept.description}
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

export default withRouter(Department);
