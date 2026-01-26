import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";
import "../../../styles/Layout.css";

class Roles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roles: [], // Demo: Static roles list
      showAddForm: false,
      newRole: { name: "", description: "" }
    };
  }

  componentDidMount() {
    // Demo: Load static roles
    this.setState({
      roles: [
        { id: 1, name: "Admin", description: "Full system access" },
        { id: 2, name: "User", description: "Limited access" }
      ]
    });

    // TODO: Uncomment for real API
    // this.fetchRoles();
  }

  // TODO: Uncomment for real API
  // async fetchRoles() {
  //   try {
  //     const response = await fetch('/api/roles');
  //     const data = await response.json();
  //     this.setState({ roles: data });
  //   } catch (error) {
  //     console.error('Error fetching roles:', error);
  //   }
  // }

  // TODO: Uncomment for real API
  // async addRole(role) {
  //   try {
  //     const response = await fetch('/api/roles', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(role)
  //     });
  //     const newRole = await response.json();
  //     this.setState({ roles: [...this.state.roles, newRole] });
  //   } catch (error) {
  //     console.error('Error adding role:', error);
  //   }
  // }

  handleAddRole = () => {
    // Demo: Add role locally
    const newRole = {
      id: Date.now(),
      ...this.state.newRole
    };
    this.setState({
      roles: [...this.state.roles, newRole],
      newRole: { name: "", description: "" },
      showAddForm: false
    });

    // TODO: Uncomment for real API
    // this.addRole(this.state.newRole);
  };

  render() {
    return (
      <div className="section-container">
        <h2>Roles Management</h2>
        <p>Define and assign roles to users.</p>

        {/* Demo: Show roles list */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Current Roles:</h3>
          <ul>
            {this.state.roles.map(role => (
              <li key={role.id}>
                {role.name} - {role.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="section-grid">
          <div className="section-card" onClick={() => this.setState({ showAddForm: !this.state.showAddForm })}>
            <Shield size={32} />
            <h3>Add Role</h3>
            <p>Create a new role.</p>
          </div>
          <div className="section-card">
            <ShieldCheck size={32} />
            <h3>Assign Role</h3>
            <p>Assign roles to users.</p>
          </div>
          <div className="section-card">
            <ShieldX size={32} />
            <h3>Revoke Role</h3>
            <p>Remove roles from users.</p>
          </div>
        </div>

        {/* Demo: Add role form */}
        {this.state.showAddForm && (
          <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc" }}>
            <h4>Add New Role</h4>
            <input
              type="text"
              placeholder="Role Name"
              value={this.state.newRole.name}
              onChange={(e) => this.setState({ newRole: { ...this.state.newRole, name: e.target.value } })}
            />
            <input
              type="text"
              placeholder="Description"
              value={this.state.newRole.description}
              onChange={(e) => this.setState({ newRole: { ...this.state.newRole, description: e.target.value } })}
            />
            <button onClick={this.handleAddRole}>Add Role</button>
            <button onClick={() => this.setState({ showAddForm: false })}>Cancel</button>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Roles);
