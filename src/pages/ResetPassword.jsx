import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthService from '../services/AuthService.js';
const loginImage = '/src/pages/bg/login.svg';
import './LoginCustom.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [state, setState] = useState({
    newPassword: '',
    confirmPassword: '',
    loading: false,
    showErrorModal: false,
    errorMessage: '',
    showSuccessModal: false,
    successMessage: '',
    showPassword: false,
    showConfirmPassword: false,
    tokenValid: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setState(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { newPassword, confirmPassword } = state;

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Please fill in all fields' }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Passwords do not match' }));
      return;
    }

    if (newPassword.length < 6) {
      setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Password must be at least 6 characters long' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      await AuthService.resetPassword(token, newPassword);
      setState(prev => ({
        ...prev,
        loading: false,
        showSuccessModal: true,
        successMessage: 'Password reset successfully! Redirecting to login...'
      }));

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        showErrorModal: true,
        errorMessage: error.message || 'Password reset failed. Please try again.'
      }));
    }
  };

  const {
    newPassword,
    confirmPassword,
    loading,
    showErrorModal,
    errorMessage,
    showSuccessModal,
    successMessage,
    showPassword,
    showConfirmPassword,
    tokenValid,
  } = state;

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setState(prev => ({ ...prev, tokenValid: false }));
    }
  }, [token]);

  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-right-panel" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <div className="auth-forms">
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h2 style={{ color: '#dc2626', marginBottom: '20px' }}>Invalid Reset Link</h2>
                <p style={{ color: '#64748b', marginBottom: '30px' }}>
                  This password reset link is invalid or has expired.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Image & Content */}
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
                <div className="feature-icon">🔒</div>
                <div className="feature-text">
                  <h3>Secure Reset</h3>
                  <p>Your new password will be securely encrypted</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-text">
                  <h3>Quick Process</h3>
                  <p>Reset your password in just a few steps</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <div className="feature-text">
                  <h3>Account Protection</h3>
                  <p>Keep your cooperative account secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="auth-right-panel">
          <div className="auth-forms">
            <form className="auth-form active" onSubmit={handleSubmit}>
              <h2>Reset Your Password</h2>
              <p className="form-description">Enter your new password below</p>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="6"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility('showPassword')}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="6"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility('showConfirmPassword')}
                    disabled={loading}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <div className="form-footer">
                <p>Remember your password? <button type="button" className="switch-link" onClick={() => navigate('/login')}>Back to Login</button></p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="modal-wrapper">
          <div className="modal-card">
            <div className="modal-header" style={{ backgroundColor: "#28a745" }}>
              ✅ Password Reset Successful
            </div>
            <div className="modal-body">
              <span>🎉</span>
              <h6>{successMessage}</h6>
              <div className="spinner-border text-success" role="status" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="modal-wrapper">
          <div className="modal-card">
            <div className="modal-header" style={{ backgroundColor: "#dc2626" }}>
              ❌ Password Reset Failed
              <button
                className="text-white font-semibold"
                onClick={() => setState(prev => ({ ...prev, showErrorModal: false }))}
              >
                ✖
              </button>
            </div>
            <div className="modal-body">
              <span>😞</span>
              <h6>Reset Error</h6>
              <p>{errorMessage}</p>
              <button
                className="modal-button"
                onClick={() => setState(prev => ({ ...prev, showErrorModal: false }))}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
