import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import memberService from '../../services/MemberAuthService';
import { motion } from 'framer-motion';
import { User, ArrowLeft, RefreshCw, Mail, Phone, Calendar, Shield } from 'lucide-react';
import './MemberDashboard.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useMemberAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await memberService.getProfile();

      if (response.success) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="member-dashboard">
        <div className="loading">Loading your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="member-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="dashboard-container"
      >
        {/* Header */}
        <div className="dashboard-header">
          <h1>👤 My Profile</h1>
          <Link to="/member/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>

        {/* Profile Card */}
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </div>
            <div className="profile-info">
              <h2>{profile.firstName} {profile.lastName}</h2>
              <p className="member-id">Member ID: {profile.memberNumber}</p>
              <p className="member-role">Role: {profile.role}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h3>📞 Contact Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{profile.email || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span className="value">{profile.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>🏛️ Account Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Member Since:</span>
                  <span className="value">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Last Login:</span>
                  <span className="value">
                    {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Never'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Account Status:</span>
                  <span className="value" style={{
                    color: profile.isActive ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Email Verified:</span>
                  <span className="value" style={{
                    color: profile.isEmailVerified ? '#28a745' : '#ffc107'
                  }}>
                    {profile.isEmailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {profile.society && (
              <div className="detail-section">
                <h3>🏢 Society Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Society Name:</span>
                    <span className="value">{profile.society.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Society Code:</span>
                    <span className="value">{profile.society.code}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Note */}
        <motion.div
          className="profile-note"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p>
            📝 <strong>Note:</strong> This is a read-only profile. To update your information,
            please contact the cooperative office.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
