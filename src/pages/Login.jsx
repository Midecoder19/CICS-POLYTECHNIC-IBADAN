import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.jsx';
import './LoginCustom.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [state, setState] = useState({
    isRegistering: false,
    username: '',
    password: '',
    loading: false,
    rememberMe: false,
    loginAttempts: 0,
    accountSuspended: false,
    regFirstName: '',
    regLastName: '',
    regPhoneNumber: '',
    regEmail: '',
    regMemberId: '',
    regAddress: '',
    regPassword: '',
    regConfirmPassword: '',
    showErrorModal: false,
    errorMessage: '',
    showSuccessModal: false,
    showVerificationModal: false,
    justLoggedIn: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { username, password, accountSuspended, loginAttempts, rememberMe } = state;
    if (!username.trim() || !password.trim()) {
      setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Please enter username and password' }));
      return;
    }

    if (accountSuspended) {
      setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Account suspended due to too many failed login attempts. Please contact support.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      await login(username, password);
      setState(prev => ({ ...prev, loading: false, showSuccessModal: true, justLoggedIn: true }));
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setState(prev => ({ ...prev, loginAttempts: newAttempts, loading: false }));

      if (newAttempts >= 3) {
        setState(prev => ({ ...prev, accountSuspended: true, showErrorModal: true, errorMessage: 'Account suspended due to too many failed login attempts. Please contact support.' }));
      } else {
        setState(prev => ({ ...prev, showErrorModal: true, errorMessage: `Wrong Credentials (Attempt ${newAttempts} of 3)` }));
      }
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const { regFirstName, regLastName, regPhoneNumber, regEmail, regMemberId, regAddress, regPassword, regConfirmPassword } = state;
    if (!regFirstName.trim() || !regLastName.trim() || !regPhoneNumber.trim() || !regEmail.trim() || !regMemberId.trim() || !regAddress.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
      setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Please fill out all registration fields' }));
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Passwords do not match' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    setTimeout(() => {
      setState(prev => ({ ...prev, loading: false, showVerificationModal: true }));
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          showVerificationModal: false,
          isRegistering: false,
          regFirstName: '',
          regLastName: '',
          regPhoneNumber: '',
          regEmail: '',
          regMemberId: '',
          regAddress: '',
          regPassword: '',
          regConfirmPassword: '',
        }));
      }, 6000);
    }, 1500);
  };

  const fillDemo = () => {
    setState(prev => ({ ...prev, username: 'demo', password: 'demo' }));
  };

  const {
    isRegistering,
    username,
    password,
    loading,
    rememberMe,
    accountSuspended,
    regFirstName,
    regLastName,
    regPhoneNumber,
    regEmail,
    regMemberId,
    regAddress,
    regPassword,
    regConfirmPassword,
    showErrorModal,
    errorMessage,
    showSuccessModal,
    showVerificationModal,
    justLoggedIn,
  } = state;

  useEffect(() => {
    if (justLoggedIn && user && !showSuccessModal) {
      navigate('/dashboard');
    }
  }, [user, justLoggedIn, navigate, showSuccessModal]);

  useEffect(() => {
    if (showSuccessModal && !isRegistering) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, showSuccessModal: false }));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, isRegistering]);

  return (
    <div>
      <div className={`container ${isRegistering ? 'active' : ''}`}>
        <div className="form-container sign-in">
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign In</h1>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={handleChange}
              required
              disabled={loading || accountSuspended}
              autoComplete="off"
              style={{ paddingRight: '3rem' }}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={handleChange}
              required
              disabled={loading || accountSuspended}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setState(prev => ({ ...prev, rememberMe: e.target.checked }))}
                disabled={loading}
                style={{ transform: 'scale(1.2)' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                Remember me
              </label>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button type="button" onClick={fillDemo} disabled={loading}>
              Use Demo
            </button>
          </form>
        </div>

        <div className="form-container sign-up">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Create Account</h1>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                name="regFirstName"
                placeholder="First Name"
                value={regFirstName}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ flex: 1 }}
              />
              <input
                type="text"
                name="regLastName"
                placeholder="Last Name"
                value={regLastName}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="tel"
                name="regPhoneNumber"
                placeholder="Phone Number"
                value={regPhoneNumber}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ flex: 1 }}
              />
              <input
                type="email"
                name="regEmail"
                placeholder="Email"
                value={regEmail}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="text"
                name="regMemberId"
                placeholder="Member ID"
                value={regMemberId}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ flex: 1 }}
              />
              <input
                type="text"
                name="regAddress"
                placeholder="Address or Location"
                value={regAddress}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input
                type="password"
                name="regPassword"
                placeholder="Password"
                value={regPassword}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ flex: 1 }}
              />
              <input
                type="password"
                name="regConfirmPassword"
                placeholder="Confirm Password"
                value={regConfirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ flex: 1 }}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Register with personal details to use all of site features</p>
              <button className="hidden" onClick={() => setState(prev => ({ ...prev, isRegistering: false }))}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Welcome</h1>
              <p>Login with your personal details to use all of site features</p>
              <button className="hidden" onClick={() => setState(prev => ({ ...prev, isRegistering: true }))}>Sign Up</button>
            </div>
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
            transition={{ duration: 0.9}}
          >
            <div className="modal-header" style={{ backgroundColor: "#28a745" }}>
              ✅ {isRegistering ? "Registration Successful" : "Login Successful"}
            </div>
            <div className="modal-body">
              <span>🎉</span>
              <h6>{isRegistering ? "Account created!" : "Welcome back!"}</h6>
              <p>{isRegistering ? "You can now sign in." : "Redirecting to dashboard..."}</p>
              <div className="spinner-border text-success" role="status" aria-hidden="true"></div>
            </div>
          </motion.div>
        </div>
      )}

      {/* VERIFICATION MODAL */}
    
{/* VERIFICATION MODAL */}
{showVerificationModal && (
  <div className="modal-wrapper">
    <motion.div
      className="modal-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="modal-header" style={{ backgroundColor: "#007bff" }}>
        📧 Verification Required
      </div>
      <div className="modal-body">
        <span>📧</span>
        <h6>Check your email/SMS for verification</h6>
        <p>We've sent a verification link to your email and phone number. Please verify your account to continue.</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
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
              ❌ {isRegistering ? "Registration Failed" : "Login Failed"}
              <button
                className="text-white font-semibold"
                onClick={() => setState(prev => ({ ...prev, showErrorModal: false }))}
              >
                ✖
              </button>
            </div>
            <div className="modal-body">
              <span>😞</span>
              <h6>{isRegistering ? "Registration Error" : "Wrong Credentials"}</h6>
              <p>{errorMessage}</p>
              <button
                className="modal-button"
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    showErrorModal: false,
                    password: !prev.isRegistering ? "" : prev.password,
                    regPassword: prev.isRegistering ? "" : prev.regPassword,
                    regConfirmPassword: prev.isRegistering ? "" : prev.regConfirmPassword,
                  }));
                }}
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      )}


    </div>
  );
};

export default Login;
