import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import './MemberActivation.css';

const MemberActivation = () => {
  const [formData, setFormData] = useState({
    memberNumber: '',
    verificationCode: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error || success) {
      setError('');
      setSuccess('');
    }
  };

  const validateForm = () => {
    if (!formData.memberNumber.trim()) {
      setError('Member ID is required');
      return false;
    }
    
    if (!formData.verificationCode.trim()) {
      setError('Verification code is required');
      return false;
    }
    
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/activate-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberNumber: formData.memberNumber.trim(),
          verificationCode: formData.verificationCode.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Account activated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/member/login');
        }, 2000);
      } else {
        setError(data.message || 'Activation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
        style={{ width: '100%', maxWidth: '450px' }}
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
            <h2 className="fw-bold mb-2">Activate Member Account</h2>
            <p className="text-muted small">
              Complete your registration by setting your password
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="alert alert-success d-flex align-items-center" role="alert">
              <CheckCircle size={18} className="me-2" />
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <AlertCircle size={18} className="me-2" />
              {error}
            </div>
          )}

          {/* Activation Form */}
          <form onSubmit={handleSubmit}>
            {/* Member ID */}
            <div className="mb-3">
              <label htmlFor="memberNumber" className="form-label fw-medium">
                Member ID
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <User size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="memberNumber"
                  name="memberNumber"
                  value={formData.memberNumber}
                  onChange={handleChange}
                  placeholder="Enter your Member ID"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Verification Code */}
            <div className="mb-3">
              <label htmlFor="verificationCode" className="form-label fw-medium">
                Verification Code
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="verificationCode"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
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
                  onChange={handleChange}
                  placeholder="Create your password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label fw-medium">
                Confirm Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
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
                  Activating...
                </>
              ) : (
                'Activate Account'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <button 
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={() => navigate('/member/login')}
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-4">
            <p className="text-muted small mb-0">
              Need help? Contact your cooperative administrator.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemberActivation;
