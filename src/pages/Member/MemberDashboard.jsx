import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import memberService from '../../services/MemberAuthService';
import { motion } from 'framer-motion';
import {
  User,
  CreditCard,
  Wallet,
  TrendingUp,
  LogOut,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import './MemberDashboard.css';

const MemberDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, logout } = useMemberAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, loansRes, ledgerRes] = await Promise.all([
        memberService.getProfile(),
        memberService.getLoans(), // Get all loans with summary
        memberService.getLedger() // Get all transactions with summary
      ]);

      if (profileRes.success) {
        setProfile(profileRes.data);
      }

      if (loansRes.success) {
        setLoans(loansRes.data);
      }

      if (ledgerRes.success) {
        setLedger(ledgerRes.data);
      }

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="alert alert-danger">
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={loadDashboardData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="member-dashboard container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Member Dashboard</h2>
              <p className="text-muted mb-0">
                Welcome back, {profile?.firstName} {profile?.lastName}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>
              <button
                className="btn btn-outline-danger d-flex align-items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Member Info Card */}
      <div className="row mb-4">
        <div className="col-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card border-primary welcome-section"
          >
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white" 
                         style={{ width: '60px', height: '60px' }}>
                      <User size={28} />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">
                        {profile?.firstName} {profile?.lastName}
                      </h5>
                      <p className="text-muted mb-1">
                        Member ID: <strong>{profile?.memberNumber}</strong>
                      </p>
                      <p className="text-muted mb-0">
                        {profile?.email} | {profile?.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <span className="badge bg-success fs-6">
                    Active Member
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card border-0 shadow-sm h-100"
          >
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-info text-white" 
                       style={{ width: '40px', height: '40px' }}>
                    <CreditCard size={20} />
                  </div>
                  <span className="fw-medium">Total Loans</span>
                </div>
                <CreditCard className="text-muted" size={18} />
              </div>
              <h3 className="fw-bold mb-1">{loans?.summary?.totalLoans || 0}</h3>
              <p className="text-muted small mb-0">
                {loans?.summary?.activeLoans || 0} active
              </p>
            </div>
          </motion.div>
        </div>

        <div className="col-md-4 mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card border-0 shadow-sm h-100 summary-card stats-card"
          >
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-warning text-white" 
                       style={{ width: '40px', height: '40px' }}>
                    <Wallet size={20} />
                  </div>
                  <span className="fw-medium">Loan Balance</span>
                </div>
                <Wallet className="text-muted" size={18} />
              </div>
              <h3 className="fw-bold mb-1">
                {formatCurrency(loans?.summary?.totalBalance || 0)}
              </h3>
              <p className="text-muted small mb-0">
                Outstanding balance
              </p>
            </div>
          </motion.div>
        </div>

        <div className="col-md-4 mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card border-0 shadow-sm h-100 summary-card stats-card"
          >
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-success text-white" 
                       style={{ width: '40px', height: '40px' }}>
                    <TrendingUp size={20} />
                  </div>
                  <span className="fw-medium">Net Balance</span>
                </div>
                <TrendingUp className="text-muted" size={18} />
              </div>
              <h3 className="fw-bold mb-1">
                {formatCurrency(ledger?.summary?.netBalance || 0)}
              </h3>
              <p className="text-muted small mb-0">
                Contributions - Debits
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card border-0 shadow-sm h-100"
          >
            <div className="card-header bg-light border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0">Recent Loans</h6>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate('/member/loans')}
                >
                  View All
                  <ArrowRight size={16} className="ms-1" />
                </button>
              </div>
            </div>
            <div className="card-body">
              {loans?.loans?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Balance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.loans.slice(0, 3).map((loan) => (
                        <tr key={loan._id}>
                          <td className="text-capitalize">{loan.loanType}</td>
                          <td>{formatCurrency(loan.balance)}</td>
                          <td>
                            <span className={`badge bg-${
                              loan.status === 'active' ? 'success' : 
                              loan.status === 'paid' ? 'primary' : 'warning'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No loans found</p>
              )}
            </div>
          </motion.div>
        </div>

        <div className="col-md-6 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="card border-0 shadow-sm h-100 activity-card"
          >
            <div className="card-header bg-light border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0">Recent Transactions</h6>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate('/member/ledger')}
                >
                  View All
                  <ArrowRight size={16} className="ms-1" />
                </button>
              </div>
            </div>
            <div className="card-body">
              {ledger?.ledger?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.ledger.slice(0, 5).map((entry) => (
                        <tr key={entry._id}>
                          <td className="small">{formatDate(entry.date)}</td>
                          <td className="small">{entry.description}</td>
                          <td className="text-end">
                            {entry.credit > 0 ? (
                              <span className="text-success">
                                +{formatCurrency(entry.credit)}
                              </span>
                            ) : (
                              <span className="text-danger">
                                -{formatCurrency(entry.debit)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No transactions found</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
