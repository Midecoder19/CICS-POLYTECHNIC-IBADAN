import React from 'react';

const ForgotPasswordModal = ({
  showForgotPasswordModal,
  forgotEmail,
  loading,
  handleForgotPasswordSubmit,
  closeModals,
  setForgotEmail
}) => {
  if (!showForgotPasswordModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Reset Password</h3>
          <button className="modal-close" onClick={closeModals}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleForgotPasswordSubmit}>
            <div className="form-group">
              <label htmlFor="forgotEmail">Email Address</label>
              <input
                type="email"
                id="forgotEmail"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
