import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { Lock, Unlock, Key } from "lucide-react";
import "../../../styles/Layout.css";

class Permissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permissions: [], // Demo: Static permissions list
      showAddForm: false,
      newPermission: { name: "", description: "" }
    };
  }

  componentDidMount() {
    // Demo: Load static permissions
    this.setState({
      permissions: [
        { id: 1, name: "Read Users", description: "Can view user list" },
        { id: 2, name: "Edit Users", description: "Can modify user data" }
      ]
    });

    // TODO: Uncomment for real API
    // this.fetchPermissions();
  }

  // TODO: Uncomment for real API
  // async fetchPermissions() {
  //   try {
  //     const response = await fetch('/api/permissions');
  //     const data = await response.json();
  //     this.setState({ permissions: data });
  //   } catch (error) {
  //     console.error('Error fetching permissions:', error);
  //   }
  // }

  // TODO: Uncomment for real API
  // async addPermission(permission) {
  //   try {
  //     const response = await fetch('/api/permissions', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(permission)
  //     });
  //     const newPermission = await response.json();
  //     this.setState({ permissions: [...this.state.permissions, newPermission] });
  //   } catch (error) {
  //     console.error('Error adding permission:', error);
  //   }
  // }

  handleAddPermission = () => {
    // Demo: Add permission locally
    const newPermission = {
      id: Date.now(),
      ...this.state.newPermission
    };
    this.setState({
      permissions: [...this.state.permissions, newPermission],
      newPermission: { name: "", description: "" },
      showAddForm: false
    });

    // TODO: Uncomment for real API
    // this.addPermission(this.state.newPermission);
  };

  render() {
    return (
      <div className="section-container">
        <h2>Permissions Management</h2>
        <p>Control access permissions for roles.</p>

        {/* Demo: Show permissions list */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Current Permissions:</h3>
          <ul>
            {this.state.permissions.map(permission => (
              <li key={permission.id}>
                {permission.name} - {permission.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="section-grid">
          <div className="section-card" onClick={() => this.setState({ showAddForm: !this.state.showAddForm })}>
            <Lock size={32} />
            <h3>Add Permission</h3>
            <p>Create a new permission.</p>
          </div>
          <div className="section-card">
            <Unlock size={32} />
            <h3>Grant Permission</h3>
            <p>Grant permissions to roles.</p>
          </div>
          <div className="section-card">
            <Key size={32} />
            <h3>Revoke Permission</h3>
            <p>Revoke permissions from roles.</p>
          </div>
        </div>

        {/* Demo: Add permission form */}
        {this.state.showAddForm && (
          <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc" }}>
            <h4>Add New Permission</h4>
            <input
              type="text"
              placeholder="Permission Name"
              value={this.state.newPermission.name}
              onChange={(e) => this.setState({ newPermission: { ...this.state.newPermission, name: e.target.value } })}
            />
            <input
              type="text"
              placeholder="Description"
              value={this.state.newPermission.description}
              onChange={(e) => this.setState({ newPermission: { ...this.state.newPermission, description: e.target.value } })}
            />
            <button onClick={this.handleAddPermission}>Add Permission</button>
            <button onClick={() => this.setState({ showAddForm: false })}>Cancel</button>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Permissions);
