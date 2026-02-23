import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import SecurityLookupModal from "./SecurityLookupModal";
import "../../../styles/SocietyInfo.css";

class Security extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSection: "roleOperation",
      showLookup: false,
      lookupItems: [],
      lookupTitle: "",
      roleOperation: {
        code: "",
        description: "",
      },
      groupRole: {
        code: "",
        description: "",
        permissions: {
          endOfMonth: false,
          endOfYear: false,
          maintenance: false,
          report: false,
          security: false,
          task: false,
          utility: false,
        },
      },
      password: "",
      userId: "",
      confirmPassword: "",
      officialName: "",
      userGroupRole: "", // renamed from duplicate groupRole
      passportPhoto: null,
      passportPhotoPreview: null,
    };
  }

  handleSectionChange = (section) => {
    this.setState({ selectedSection: section });
  };

  handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name.startsWith("roleOperation.")) {
      const field = name.split(".")[1];
      this.setState({
        roleOperation: { ...this.state.roleOperation, [field]: value },
      });
    } else if (name.startsWith("groupRole.")) {
      if (name.startsWith("groupRole.permissions.")) {
        const permission = name.split(".")[2];
        this.setState({
          groupRole: {
            ...this.state.groupRole,
            permissions: {
              ...this.state.groupRole.permissions,
              [permission]: checked,
            },
          },
        });
      } else {
        const field = name.split(".")[1];
        this.setState({
          groupRole: { ...this.state.groupRole, [field]: value },
        });
      }
    } else {
      this.setState({ [name]: value });
    }
  };

  handleOK = () => {
    console.log("Role Operation saved!", this.state.roleOperation);
  };

  handleCancel = () => {
    this.setState({
      roleOperation: { code: "", description: "" },
    });
  };

  handleLookupClick = (section) => {
    const mockItems = [
      { code: "ADM001", description: "Administrator Role" },
      { code: "USR001", description: "User Role" },
      { code: "MGR001", description: "Manager Role" },
      { code: "SUP001", description: "Supervisor Role" },
    ];
    this.setState({
      showLookup: true,
      lookupItems: mockItems,
      lookupTitle: section === "roleOperation" ? "Role Operation" : "Group Role",
    });
  };

  handleSelectLookupItem = (item) => {
    if (this.state.selectedSection === "roleOperation") {
      this.setState({
        roleOperation: { code: item.code, description: item.description },
        showLookup: false,
      });
    } else if (this.state.selectedSection === "groupRole") {
      this.setState({
        groupRole: { ...this.state.groupRole, code: item.code, description: item.description },
        showLookup: false,
      });
    }
  };

  render() {
    const { selectedSection, roleOperation, groupRole, userId, password, confirmPassword, officialName, userGroupRole, passportPhotoPreview, showLookup, lookupItems, lookupTitle } = this.state;

    return (
      <div className="society-page">
        <div className="society-header">
          <h2>🔒 Security Settings</h2>
          <button className="back-btn" onClick={() => this.props.navigate("/common")}>⬅ Back</button>
        </div>

        <div className="toolbar">
          <button onClick={() => console.log("Add clicked!")}>➕ Add</button>
          <button className="primary" onClick={() => console.log("Update clicked!")}>💾 Update</button>
          <button onClick={() => console.log("Delete clicked!")}>🗑 Delete</button>
          <button onClick={() => console.log("Print clicked!")}>🖨 Print</button>
        </div>

        <div className="form-group" style={{ marginBottom: "2rem" }}>
          <label>Select Section:</label>
          <select
            value={selectedSection}
            onChange={(e) => this.handleSectionChange(e.target.value)}
            style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--hover)", background: "var(--bg)", color: "var(--text)" }}
          >
            <option value="roleOperation">Role Operation</option>
            <option value="groupRole">Group Role</option>
            <option value="password">Password</option>
          </select>
        </div>

        <div className="security-content">
          {selectedSection === "roleOperation" && (
            <div className="security-tile">
              <h3>Role Operation</h3>
              <div className="form-group code-field">
                <label>Code:</label>
                <div className="input-with-icon">
                  <input type="text" name="roleOperation.code" value={roleOperation.code} onChange={this.handleChange} />
                  <button type="button" className="key-btn" onClick={() => this.handleLookupClick("roleOperation")}>🔑</button>
                </div>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea name="roleOperation.description" value={roleOperation.description} onChange={this.handleChange} rows="3" />
              </div>
              <div className="footer-buttons">
                <button type="button" className="btn btn-primary" onClick={this.handleOK}>OK</button>
                <button type="button" className="btn cancel-btn" onClick={this.handleCancel}>Cancel</button>
              </div>
            </div>
          )}

          {selectedSection === "groupRole" && (
            <div className="security-tile">
              <h3>Group Role</h3>
              <div className="form-group code-field">
                <label>Code:</label>
                <div className="input-with-icon">
                  <input type="text" name="groupRole.code" value={groupRole.code} onChange={this.handleChange} />
                  <button type="button" className="key-btn" onClick={() => this.handleLookupClick("groupRole")}>🔑</button>
                </div>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea name="groupRole.description" value={groupRole.description} onChange={this.handleChange} rows="3" />
              </div>
              <div className="form-group">
                <label>Permissions:</label>
                <div className="permissions-grid">
                  {Object.keys(groupRole.permissions).map((permission) => (
                    <label key={permission} className="permission-checkbox">
                      <input type="checkbox" name={`groupRole.permissions.${permission}`} checked={groupRole.permissions[permission]} onChange={this.handleChange} />
                      {permission.charAt(0).toUpperCase() + permission.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedSection === "password" && (
            <div className="security-tile">
              <h3>Password</h3>
              <div className="form-group">
                <label>User ID:</label>
                <input type="text" name="userId" value={userId} onChange={this.handleChange} />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input type="password" name="password" value={password} onChange={this.handleChange} />
              </div>
              <div className="form-group">
                <label>Confirm Password:</label>
                <input type="password" name="confirmPassword" value={confirmPassword} onChange={this.handleChange} />
              </div>
              <div className="form-group">
                <label>Official Name:</label>
                <input type="text" name="officialName" value={officialName} onChange={this.handleChange} />
              </div>
              <div className="form-group">
                <label>Group Role:</label>
                <input type="text" name="userGroupRole" value={userGroupRole} onChange={this.handleChange} />
              </div>
              <div className="form-group">
                <label>Passport Photograph:</label>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => this.setState({ passportPhotoPreview: ev.target.result });
                      reader.readAsDataURL(file);
                      this.setState({ passportPhoto: file });
                    }
                  }} />
                  {passportPhotoPreview && <img src={passportPhotoPreview} alt="Passport Preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }} />}
                </div>
              </div>
            </div>
          )}
        </div>

        {showLookup && (
          <SecurityLookupModal items={lookupItems} onClose={() => this.setState({ showLookup: false })} onSelect={this.handleSelectLookupItem} title={lookupTitle} />
        )}
      </div>
    );
  }
}

export default withRouter(Security);
