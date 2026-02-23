import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import './MemberLogin.css';

const MemberLogin = () => {
  const [formData, setFormData] = useState({
    memberId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, error, clearError } = useMemberAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/member/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.memberId || !formData.password) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData.memberId, formData.password);
      
      if (result.success) {
        navigate('/member/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card shadow-lg border-0"
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <div className="card-body p-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mb-3">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white" 
                   style={{ width: '60px', height: '60px' }}>
                <User size={28} />
              </div>
            </div>
            <h2 className="fw-bold mb-2">Member Portal</h2>
            <p className="text-muted small">Login with your Member ID and Password</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger small" role="alert">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Member ID */}
            <div className="mb-3">
              <label htmlFor="memberId" className="form-label fw-medium">
                Member ID
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <User size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="memberId"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleInputChange}
                  placeholder="Enter your Member ID"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-medium">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="text-center mt-4">
            <div className="alert alert-info small mb-0">
              <strong>Demo Credentials:</strong><br />
              Member ID: <code>STU2024001</code><br />
              Password: <code>demo123</code>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemberLogin;
