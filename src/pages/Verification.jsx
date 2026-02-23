import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthService from '../services/AuthService';

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({
    emailCode: '',
    phoneCode: '',
    timer: 300, // 5 minutes in seconds
    loading: false,
    resendLoading: false,
    showErrorModal: false,
    errorMessage: '',
    showSuccessModal: false,
    successMessage: '',
    activeTab: 'email', // 'email' or 'phone'
  });

  const user = location.state?.user;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.timer <= 1) {
          clearInterval(interval);
          return { ...prev, timer: 0 };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVerify = async (type) => {
    const code = type === 'email' ? state.emailCode : state.phoneCode;
    if (!code || code.length !== 6) {
      setState(prev => ({
        ...prev,
        showErrorModal: true,
        errorMessage: 'Please enter a valid 6-digit code'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      if (type === 'email') {
        await AuthService.verifyEmail(user.email, state.emailCode);
      } else {
        await AuthService.verifyPhone(user.phone, state.phoneCode);
      }

      setState(prev => ({
        ...prev,
        loading: false,
        showSuccessModal: true,
        successMessage: `${type === 'email' ? 'Email' : 'Phone'} verified successfully!`
      }));

      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        showErrorModal: true,
        errorMessage: error.message || `Failed to verify ${type}`
      }));
    }
  };

  const handleResend = async (type) => {
    setState(prev => ({ ...prev, resendLoading: true }));

    try {
      if (type === 'email') {
        await AuthService.resendEmailVerification(user.email);
      } else {
        await AuthService.resendPhoneVerification(user.phone);
      }

      setState(prev => ({
        ...prev,
        resendLoading: false,
        timer: 300, // Reset timer to 5 minutes
        showSuccessModal: true,
        successMessage: `Verification ${type === 'email' ? 'email' : 'code'} sent successfully!`
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        resendLoading: false,
        showErrorModal: true,
        errorMessage: error.message || `Failed to resend ${type} verification`
      }));
    }
  };

  const {
    emailCode,
    phoneCode,
    timer,
    loading,
    resendLoading,
    showErrorModal,
    errorMessage,
    showSuccessModal,
    successMessage,
    activeTab,
  } = state;

  if (!user) return null;

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Info */}
        <div className="auth-left-panel">
          <div className="auth-left-content">
            <div className="auth-logo-section">
              <h1 className="auth-title">Polyibadan</h1>
              <p className="auth-subtitle">Cooperative Management System</p>
            </div>
            <div className="auth-image-wrapper">
              <div className="verification-icon">🔐</div>
            </div>
            <div className="auth-features">
              <div className="feature-item">
                <div className="feature-icon">📧</div>
                <div className="feature-text">
                  <h3>Email Verification</h3>
                  <p>Check your email for a verification link</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <div className="feature-text">
                  <h3>SMS/WhatsApp Verification</h3>
                  <p>Enter the 6-digit code sent to your phone</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⏰</div>
                <div className="feature-text">
                  <h3>Time Limited</h3>
                  <p>Verification codes expire in 10 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Verification Form */}
        <div className="auth-right-panel">
          <div className="auth-toggle">
            <button
              type="button"
              className={`toggle-btn ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setState(prev => ({ ...prev, activeTab: 'email' }))}
            >
              Email Verification
            </button>
            <button
              type="button"
              className={`toggle-btn ${activeTab === 'phone' ? 'active' : ''}`}
              onClick={() => setState(prev => ({ ...prev, activeTab: 'phone' }))}
            >
              Phone Verification
            </button>
          </div>

          <div className="auth-forms">
            {/* Email Verification Tab */}
            <div className={`auth-form verification-form ${activeTab === 'email' ? 'active' : ''}`}>
              <h2>Verify Your Email</h2>
              <p className="form-description">
                Enter the 6-digit code sent to <strong>{user.email}</strong>
              </p>

              <div className="timer-display">
                <div className="timer-icon">⏱️</div>
                <div className="timer-text">
                  <span>Time remaining: </span>
                  <strong className={timer < 60 ? 'timer-warning' : ''}>
                    {formatTime(timer)}
                  </strong>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="emailCode">Verification Code</label>
                <input
                  type="text"
                  id="emailCode"
                  name="emailCode"
                  value={emailCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  disabled={loading}
                  className="code-input"
                />
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => handleVerify('email')}
                disabled={loading || emailCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="verification-options">
                <p>Didn't receive the code?</p>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={() => handleResend('email')}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </button>
              </div>

              <div className="verification-note">
                <p>💡 <strong>Note:</strong> Check your spam/junk folder if you don't see the email in your inbox.</p>
              </div>
            </div>

            {/* Phone Verification Tab */}
            <div className={`auth-form verification-form ${activeTab === 'phone' ? 'active' : ''}`}>
              <h2>Verify Your Phone</h2>
              <p className="form-description">
                Enter the 6-digit code sent to <strong>{user.phone}</strong>
              </p>

              <div className="timer-display">
                <div className="timer-icon">⏱️</div>
                <div className="timer-text">
                  <span>Time remaining: </span>
                  <strong className={timer < 60 ? 'timer-warning' : ''}>
                    {formatTime(timer)}
                  </strong>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phoneCode">Verification Code</label>
                <input
                  type="text"
                  id="phoneCode"
                  name="phoneCode"
                  value={phoneCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  disabled={loading}
                  className="code-input"
                />
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => handleVerify('phone')}
                disabled={loading || phoneCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Phone'}
              </button>

              <div className="verification-options">
                <p>Didn't receive the code?</p>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={() => handleResend('phone')}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          </div>

          <div className="form-footer">
            <p>
              <button type="button" className="switch-link" onClick={() => navigate('/login')}>
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="modal-wrapper">
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="modal-header" style={{ backgroundColor: "#28a745" }}>
              ✅ {successMessage.includes('verified') ? 'Verification Successful' : 'Code Sent'}
            </div>
            <div className="modal-body">
              <span>🎉</span>
              <h6>{successMessage}</h6>
              <p>{successMessage.includes('verified') ? 'You can now login to your account.' : 'Please check your messages.'}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="modal-wrapper">
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="modal-header" style={{ backgroundColor: "#dc3545" }}>
              ❌ Verification Failed
              <button
                className="text-white font-semibold"
                onClick={() => setState(prev => ({ ...prev, showErrorModal: false }))}
              >
                ✖
              </button>
            </div>
            <div className="modal-body">
              <span>😞</span>
              <h6>Verification Error</h6>
              <p>{errorMessage}</p>
              <button
                className="modal-button"
                onClick={() => setState(prev => ({ ...prev, showErrorModal: false }))}
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        .verification-form {
          text-align: center;
        }

        .timer-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .timer-icon {
          font-size: 24px;
        }

        .timer-text {
          font-size: 16px;
        }

        .timer-warning {
          color: #dc3545;
          animation: pulse 1s infinite;
        }

        .code-input {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .resend-btn {
          background: transparent;
          color: #007bff;
          border: 1px solid #007bff;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 10px;
        }

        .resend-btn:hover:not(:disabled) {
          background: #007bff;
          color: white;
        }

        .resend-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .verification-options {
          margin: 20px 0;
        }

        .verification-options p {
          margin-bottom: 10px;
          color: #6c757d;
        }

        .verification-note {
          background: #e7f3ff;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .verification-note p {
          margin: 0;
          color: #0056b3;
          font-size: 14px;
        }

        .verification-icon {
          font-size: 80px;
          margin: 40px 0;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Verification;