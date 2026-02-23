import React from 'react';

const RegisterForm = ({
  className,
  signupType,
  regMemberId,
  regEmail,
  regFirstName,
  regLastName,
  regUsername,
  regPassword,
  regConfirmPassword,
  regTerms,
  loading,
  handleChange,
  handleRegisterSubmit,
  togglePasswordVisibility,
  showRegPassword,
  showRegConfirmPassword
}) => {
  return (
    <form className={`auth-form register-form ${className}`} onSubmit={handleRegisterSubmit} autoComplete="off">
      <div className="form-header">
        <h2>Sign Up</h2>
        <p className="form-description">Join our cooperative management system</p>
      </div>

      {/* Signup Type Selection */}
      <div className="form-group">
        <label>Account Type</label>
        <div className="signup-type-selector">
          <label className={`signup-type-option ${signupType === 'member' ? 'active' : ''}`}>
            <input
              type="radio"
              name="signupType"
              value="member"
              checked={signupType === 'member'}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Member</span>
          </label>
          <label className={`signup-type-option ${signupType === 'staff' ? 'active' : ''}`}>
            <input
              type="radio"
              name="signupType"
              value="staff"
              checked={signupType === 'staff'}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Staff</span>
          </label>
        </div>
      </div>

      {signupType === 'member' ? (
        /* Member Registration */
        <>
          <div className="form-group">
            <label htmlFor="regMemberId">Member ID</label>
            <input
              type="text"
              id="regMemberId"
              name="regMemberId"
              value={regMemberId}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your member ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="regEmail">Email Address</label>
            <input
              type="email"
              id="regEmail"
              name="regEmail"
              value={regEmail}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="regPassword">Password</label>
            <div className="password-input-container">
              <input
                type={showRegPassword ? "text" : "password"}
                id="regPassword"
                name="regPassword"
                value={regPassword}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="off"
                placeholder="Create a password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('showRegPassword')}
                disabled={loading}
              >
                {showRegPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="regConfirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showRegConfirmPassword ? "text" : "password"}
                id="regConfirmPassword"
                name="regConfirmPassword"
                value={regConfirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="off"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('showRegConfirmPassword')}
                disabled={loading}
              >
                {showRegConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Staff Registration */
        <>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="regFirstName">First Name</label>
              <input
                type="text"
                id="regFirstName"
                name="regFirstName"
                value={regFirstName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter first name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="regLastName">Last Name</label>
              <input
                type="text"
                id="regLastName"
                name="regLastName"
                value={regLastName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="regUsername">Username</label>
            <input
              type="text"
              id="regUsername"
              name="regUsername"
              value={regUsername}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="regEmail">Email Address</label>
            <input
              type="email"
              id="regEmail"
              name="regEmail"
              value={regEmail}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="regPassword">Password</label>
            <div className="password-input-container">
              <input
                type={showRegPassword ? "text" : "password"}
                id="regPassword"
                name="regPassword"
                value={regPassword}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="off"
                placeholder="Create a password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('showRegPassword')}
                disabled={loading}
              >
                {showRegPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="regConfirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showRegConfirmPassword ? "text" : "password"}
                id="regConfirmPassword"
                name="regConfirmPassword"
                value={regConfirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="off"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('showRegConfirmPassword')}
                disabled={loading}
              >
                {showRegConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Terms and Conditions */}
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            id="regTerms"
            name="regTerms"
            checked={regTerms}
            onChange={(e) => handleChange({ target: { name: 'regTerms', value: e.target.checked } })}
            required
            disabled={loading}
          />
          <span className="checkmark"></span>
          I agree to the <a href="#" className="terms-link">Terms & Conditions</a>
        </label>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default RegisterForm;
