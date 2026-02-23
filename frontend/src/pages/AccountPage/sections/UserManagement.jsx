import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { Users, UserPlus, UserMinus } from "lucide-react";
import "../../../styles/Layout.css"; // Assuming shared styles

class UserManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [], // Demo: Static users list
      showAddForm: false,
      newUser: {
        userId: "",
        password: "",
        confirmPassword: "",
        officialName: "",
        groupRole: "",
        passportPhoto: null,
        passportPhotoPreview: null
      }
    };
  }

  componentDidMount() {
    // Demo: Load static users
    this.setState({
      users: [
        { id: 1, name: "Admin User", email: "admin@example.com", role: "Admin" },
        { id: 2, name: "John Doe", email: "john@example.com", role: "User" }
      ]
    });

    // TODO: Uncomment for real API
    // this.fetchUsers();
  }

  // TODO: Uncomment for real API
  // async fetchUsers() {
  //   try {
  //     const response = await fetch('/api/users');
  //     const data = await response.json();
  //     this.setState({ users: data });
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //   }
  // }

  // TODO: Uncomment for real API
  // async addUser(user) {
  //   try {
  //     const response = await fetch('/api/users', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(user)
  //     });
  //     const newUser = await response.json();
  //     this.setState({ users: [...this.state.users, newUser] });
  //   } catch (error) {
  //     console.error('Error adding user:', error);
  //   }
  // }

  // TODO: Uncomment for real API
  // async removeUser(userId) {
  //   try {
  //     await fetch(`/api/users/${userId}`, { method: 'DELETE' });
  //     this.setState({ users: this.state.users.filter(u => u.id !== userId) });
  //   } catch (error) {
  //     console.error('Error removing user:', error);
  //   }
  // }

  handleAddUser = () => {
    // Demo: Add user locally
    const newUser = {
      id: Date.now(),
      ...this.state.newUser
    };
    this.setState({
      users: [...this.state.users, newUser],
      newUser: {
        userId: "",
        password: "",
        confirmPassword: "",
        officialName: "",
        groupRole: "",
        passportPhoto: null,
        passportPhotoPreview: null
      },
      showAddForm: false
    });

    // TODO: Uncomment for real API
    // this.addUser(this.state.newUser);
  };

  handleRemoveUser = (userId) => {
    // Demo: Remove user locally
    this.setState({
      users: this.state.users.filter(u => u.id !== userId)
    });

    // TODO: Uncomment for real API
    // this.removeUser(userId);
  };

  render() {
    return (
      <div className="section-container">
        <h2>User Management</h2>
        <p>Manage users, roles, and permissions here.</p>

        {/* Demo: Show users list */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Current Users:</h3>
          <ul>
            {this.state.users.map(user => (
              <li key={user.id}>
                {user.name} ({user.email}) - {user.role}
                <button onClick={() => this.handleRemoveUser(user.id)} style={{ marginLeft: "10px" }}>Remove</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="section-grid">
          <div className="section-card" onClick={() => this.setState({ showAddForm: !this.state.showAddForm })}>
            <UserPlus size={32} />
            <h3>Add User</h3>
            <p>Create a new user account.</p>
          </div>
          <div className="section-card">
            <Users size={32} />
            <h3>View Users</h3>
            <p>List all users in the system.</p>
          </div>
          <div className="section-card">
            <UserMinus size={32} />
            <h3>Remove User</h3>
            <p>Deactivate or delete a user.</p>
          </div>
        </div>

        {/* Demo: Add user form */}
        {this.state.showAddForm && (
          <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc" }}>
            <h4>Add New User</h4>
            <input
              type="text"
              placeholder="Name"
              value={this.state.newUser.name}
              onChange={(e) => this.setState({ newUser: { ...this.state.newUser, name: e.target.value } })}
            />
            <input
              type="email"
              placeholder="Email"
              value={this.state.newUser.email}
              onChange={(e) => this.setState({ newUser: { ...this.state.newUser, email: e.target.value } })}
            />
            <input
              type="text"
              placeholder="Role"
              value={this.state.newUser.role}
              onChange={(e) => this.setState({ newUser: { ...this.state.newUser, role: e.target.value } })}
            />
            <button onClick={this.handleAddUser}>Add User</button>
            <button onClick={() => this.setState({ showAddForm: false })}>Cancel</button>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(UserManagement);
