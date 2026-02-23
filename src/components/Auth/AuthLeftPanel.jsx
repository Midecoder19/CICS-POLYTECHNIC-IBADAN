import React from 'react';
import loginImage from '../../pages/bg/login.svg';

const AuthLeftPanel = () => {
  return (
    <div className="auth-left-panel">
      <div className="auth-left-content">
        <div className="auth-logo-section">
          <h1 className="auth-title">Routers Itech Limited</h1>
          <p className="auth-subtitle">Cooperative Management System</p>
        </div>
        <div className="auth-image-wrapper">
          <img src={loginImage} alt="Cooperative Management" className="auth-image" />
        </div>
        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <div className="feature-text">
              <h3>Comprehensive Management</h3>
              <p>Manage accounts, stock, and operations all in one place</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <div className="feature-text">
              <h3>Secure & Reliable</h3>
              <p>Your data is protected with enterprise-grade security</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">
              <h3>Real-time Updates</h3>
              <p>Get instant insights into your cooperative operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLeftPanel;
