import React from 'react';
import { Bell, User, Gear } from 'phosphor-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import './Topbar.css';

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light topbar-navbar">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <h5 className="mb-0 text-primary fw-bold topbar-title">Polyibadan Cooperative System</h5>
        </div>

        <div className="d-flex align-items-center">
          {/* Welcome Message */}
          <div className="welcome-section me-4 d-none d-lg-block">
            <span className="welcome-text">Welcome back, <strong>{user?.username || 'Admin'}</strong>! 👋</span>
          </div>

          {/* Notifications */}
          <button className="btn btn-link position-relative me-3 notification-btn">
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge">
              3
            </span>
          </button>

          {/* User Menu */}
          <div className="dropdown">
            <button
              className="btn btn-link dropdown-toggle d-flex align-items-center user-menu-btn"
              type="button"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 user-avatar"
                   style={{ width: '36px', height: '36px' }}>
                <User size={18} />
              </div>
              <div className="d-none d-md-flex flex-column align-items-start">
                <span className="user-name fw-semibold">{user?.username || 'Admin'}</span>
                <small className="user-role text-muted">{user?.role || 'Administrator'}</small>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end user-dropdown-menu">
              <li><h6 className="dropdown-header user-info-header">
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                       style={{ width: '32px', height: '32px' }}>
                    <User size={16} />
                  </div>
                  <div>
                    <div className="fw-semibold">{user?.username || 'Admin'}</div>
                    <small className="text-muted">{user?.role || 'Administrator'}</small>
                  </div>
                </div>
              </h6></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#"><Gear size={16} className="me-2" />Settings</a></li>
              <li><a className="dropdown-item" href="#">Profile</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item text-danger" onClick={logout}>
                <span className="me-2">↪</span>Logout
              </button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
