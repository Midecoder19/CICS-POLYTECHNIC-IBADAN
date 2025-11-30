// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import "./styles/Layout.css";

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }

  toggleSidebar = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    return (
      <div className="layout-container">
        {/* Sidebar (only one in the whole app) */}
        <Sidebar isOpen={this.state.isOpen} />

        {/* Main area */}
        <div className={`main-content ${this.state.isOpen ? "sidebar-open" : ""}`}>
          <header className="topbar">
            <div className="topbar-left">
              <button className="menu-btn" onClick={this.toggleSidebar}>
                {this.state.isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <h1 className="app-title">Routers Itech Limited</h1>
            </div>
            <div className="topbar-right">
              <span className="user-info">Admin</span>
            </div>
          </header>

          <main className="content-area">{this.props.children}</main>
        </div>
      </div>
    );
  }
}

export default Layout;
