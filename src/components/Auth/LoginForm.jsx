import React from 'react';

const LoginForm = ({
  className,
  username,
  password,
  rememberMe,
  loading,
  accountSuspended,
  showPassword,
  handleChange,
  handleLoginSubmit,
  togglePasswordVisibility,
  handleForgotPassword
}) => {
  return (
    <form className={`auth-form login-form ${className}`} onSubmit={handleLoginSubmit} autoComplete="off">
      <div className="form-header">
        <h2>Welcome Back</h2>
        <p className="form-description">Sign in to your account to continue</p>
      </div>

      <div className="form-group">
        <label htmlFor="username">Username or Member ID</label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={handleChange}
          required
          disabled={loading || accountSuspended}
          autoComplete="username"
          placeholder="Enter username or member ID"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            disabled={loading || accountSuspended}
            autoComplete="off"
            placeholder="Enter password"
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => togglePasswordVisibility('showPassword')}
            disabled={loading || accountSuspended}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => handleChange({ target: { name: 'rememberMe', value: e.target.checked } })}
            disabled={loading}
          />
          <span className="checkmark"></span>
          Remember me
        </label>
        <button type="button" className="forgot-link" onClick={handleForgotPassword}>Forgot Password?</button>
      </div>

      <button type="submit" className="btn-primary" disabled={loading || accountSuspended}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <div className="form-footer">
        <p>Need to create an account? <a href="#" onClick={() => document.querySelector('.auth-toggle .toggle-btn:last-child').click()} className="activation-link">Sign Up</a></p>
      </div>
    </form>
  );
};

export default LoginForm;
