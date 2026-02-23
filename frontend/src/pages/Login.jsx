import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useMemberAuth } from '../contexts/MemberAuthContext.jsx';
import AuthService from '../services/AuthService.js';
import AuthLeftPanel from '../components/Auth/AuthLeftPanel.jsx';
import LoginForm from '../components/Auth/LoginForm.jsx';
import RegisterForm from '../components/Auth/RegisterForm.jsx';
import SuccessModal from '../components/Auth/SuccessModal.jsx';
import ErrorModal from '../components/Auth/ErrorModal.jsx';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal.jsx';
import './LoginCustom.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  
  // Determine initial isRegistering based on URL path
  const isSignupRoute = location.pathname === '/signup';
  const [state, setState] = useState({
    isRegistering: isSignupRoute,
    signupType: 'member', // 'member' or 'staff'
    // Member signup fields
    regMemberId: '',
    regEmail: '',
    regFirstName: '',
    regLastName: '',
    // Staff signup fields
    regUsername: '',
    regPassword: '',
    regConfirmPassword: '',
    regTerms: false,
    // Login fields
    username: '',
    password: '',
    loading: false,
    rememberMe: false,
    loginAttempts: 0,
    accountSuspended: false,
    showErrorModal: false,
    errorMessage: '',
    showSuccessModal: false,
    successMessage: '',
    showVerificationModal: false,
    showForgotPasswordModal: false,
    forgotEmail: '',
    justLoggedIn: false,
    showPassword: false,
    showRegPassword: false,
    showRegConfirmPassword: false,
  });

  // Redirect to member dashboard if already logged in as member
  useEffect(() => {
    if (user && user.role === 'member') {
      navigate('/member/dashboard');
    }
  }, [user, navigate]);

  // Redirect staff to dashboard if already logged in as staff
  useEffect(() => {
    if (user && (user.role === 'staff' || user.role === 'admin')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
    if (state.showErrorModal || state.showSuccessModal) {
      setState(prev => ({ ...prev, showErrorModal: false, showSuccessModal: false }));
    }
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
      const userData = await login(username, password);

      setState(prev => ({ ...prev, loading: false, showSuccessModal: true, successMessage: 'Login successful! Redirecting...', justLoggedIn: true }));
      // Redirect immediately based on user role from response
      if (userData && userData.role === 'member') {
        navigate('/member/dashboard');
      } else if (userData && (userData.role === 'staff' || userData.role === 'admin')) {
        navigate('/dashboard');
      }
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

  const togglePasswordVisibility = (field) => {
    setState(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleForgotPassword = () => {
    setState(prev => ({ ...prev, showForgotPasswordModal: true, showErrorModal: false }));
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const { forgotEmail } = state;
    

    if (!forgotEmail.trim()) {
      setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Please enter your email address' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      await AuthService.forgotPassword(forgotEmail);
      setState(prev => ({
        ...prev,
        loading: false,
        showForgotPasswordModal: false,
        showSuccessModal: true,
        successMessage: 'Password reset instructions have been sent to your email.'
      }));
      setTimeout(() => {
        setState(prev => ({ ...prev, showSuccessModal: false }));
      }, 3000);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        showErrorModal: true,
        errorMessage: error.message || 'Failed to send reset email. Please try again.'
      }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { signupType, regMemberId, regEmail, regFirstName, regLastName, regPhone, regUsername, regPassword, regConfirmPassword, regTerms } = state;

    // Validation for member signup
    if (signupType === 'member') {
      if (!regMemberId.trim() || !regEmail.trim() || !regPassword.trim()) {
        setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Member ID, email, and password are required' }));
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Passwords do not match' }));
        return;
      }
      if (regPassword.length < 6) {
        setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Password must be at least 6 characters long' }));
        return;
      }
      if (!regTerms) {
        setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Please agree to the Terms & Conditions' }));
        return;
      }
    }

    // Validation for staff signup
    if (signupType === 'staff') {
      if (!regFirstName.trim() || !regLastName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
        setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Please fill out all registration fields' }));
        return;
      }
      if (!regTerms) {
        setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Please agree to the Terms & Conditions' }));
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Passwords do not match' }));
        return;
      }
      if (regPassword.length < 6) {
        setState(prev => ({ ...prev, showErrorModal: true, errorMessage: 'Password must be at least 6 characters long' }));
        return;
      }
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      let userData;

      if (signupType === 'member') {
        userData = {
          signupType: 'member',
          memberNumber: regMemberId,
          email: regEmail,
          password: regPassword
        };
      } else if (signupType === 'staff') {
        userData = {
          signupType: 'staff',
          username: regUsername,
          password: regPassword,
          email: regEmail,
          firstName: regFirstName,
          lastName: regLastName,
          role: 'staff' // Default to staff, can be changed to admin later
        };
      }

      const response = await AuthService.register(userData);

      // Clear form
      setState(prev => ({
        ...prev,
        regMemberId: '',
        regFirstName: '',
        regLastName: '',
        regPhone: '',
        regUsername: '',
        regPassword: '',
        regConfirmPassword: '',
        regEmail: '',
        regTerms: false,
        loading: false,
      }));

      if (signupType === 'member') {
        // For members, redirect to verification page
        navigate('/verify', { state: { user: response.data } });
      } else {
        // For staff, redirect to login
        setState(prev => ({
          ...prev,
          showSuccessModal: true,
          successMessage: 'Staff account created successfully! You can now login.'
        }));
        setTimeout(() => {
          setState(prev => ({ ...prev, isRegistering: false, showSuccessModal: false }));
        }, 3000);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        showErrorModal: true,
        errorMessage: error.message || 'Registration failed. Please try again.'
      }));
    }
  };

  const closeModals = () => {
    setState(prev => ({ 
      ...prev, 
      showErrorModal: false, 
      showSuccessModal: false, 
      showForgotPasswordModal: false,
      errorMessage: '',
      successMessage: ''
    }));
  };

  const {
    isRegistering,
    username,
    password,
    loading,
    rememberMe,
    loginAttempts,
    accountSuspended,
    regFirstName,
    regLastName,
    regEmail,
    regPhone,
    regMemberId,
    regUsername,
    regPassword,
    regConfirmPassword,
    regTerms,
    showErrorModal,
    errorMessage,
    showSuccessModal,
    successMessage,
    showVerificationModal,
    showForgotPasswordModal,
    forgotEmail,
    justLoggedIn,
    showPassword,
    showRegPassword,
    showRegConfirmPassword,
  } = state;

  useEffect(() => {
    if (justLoggedIn && user && !showSuccessModal) {
      // Redirect based on user role
      if (user.role === 'member') {
        navigate('/member/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, justLoggedIn, navigate, showSuccessModal]);

  useEffect(() => {
    if (showSuccessModal && !isRegistering) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, showSuccessModal: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, isRegistering]);

  // Handle success message from email verification
  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      setState(prev => ({
        ...prev,
        showSuccessModal: true,
        successMessage: location.state.message
      }));
      // Clear the location state to prevent showing the message again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const setForgotEmail = (value) => {
    setState(prev => ({ ...prev, forgotEmail: value }));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <AuthLeftPanel />

        {/* Right Side - Forms */}
        <div className="auth-right-panel">
          {/* Toggle Buttons */}
          <div className="auth-toggle">
            <button
              type="button"
              className={`toggle-btn ${!isRegistering ? 'active' : ''}`}
              onClick={() => setState(prev => ({ ...prev, isRegistering: false }))}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`toggle-btn ${isRegistering ? 'active' : ''}`}
              onClick={() => setState(prev => ({ ...prev, isRegistering: true }))}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-forms">
            <LoginForm
              className={!isRegistering ? 'active' : ''}
              username={username}
              password={password}
              rememberMe={rememberMe}
              loading={loading}
              accountSuspended={accountSuspended}
              showPassword={showPassword}
              handleChange={handleChange}
              handleLoginSubmit={handleLoginSubmit}
              togglePasswordVisibility={togglePasswordVisibility}
              handleForgotPassword={handleForgotPassword}
            />

            <RegisterForm
              className={isRegistering ? 'active' : ''}
              signupType={state.signupType}
              regMemberId={regMemberId}
              regEmail={regEmail}
              regFirstName={regFirstName}
              regLastName={regLastName}
              regPhone={regPhone}
              regUsername={regUsername}
              regPassword={regPassword}
              regConfirmPassword={regConfirmPassword}
              regTerms={regTerms}
              loading={loading}
              handleChange={handleChange}
              handleRegisterSubmit={handleRegisterSubmit}
              togglePasswordVisibility={togglePasswordVisibility}
              showRegPassword={showRegPassword}
              showRegConfirmPassword={showRegConfirmPassword}
            />
          </div>
        </div>
      </div>

      <SuccessModal
        showSuccessModal={showSuccessModal}
        successMessage={successMessage}
        closeModals={closeModals}
      />

      <ErrorModal
        showErrorModal={showErrorModal}
        errorMessage={errorMessage}
        closeModals={closeModals}
      />

      <ForgotPasswordModal
        showForgotPasswordModal={showForgotPasswordModal}
        forgotEmail={forgotEmail}
        loading={loading}
        handleForgotPasswordSubmit={handleForgotPasswordSubmit}
        closeModals={closeModals}
        setForgotEmail={setForgotEmail}
      />
    </div>
  );
};

export default Login;
