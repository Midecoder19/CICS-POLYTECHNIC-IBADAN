import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import memberService from '../../services/MemberAuthService';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, ArrowLeft, RefreshCw } from 'lucide-react';
import './MemberDashboard.css';

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useMemberAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadLoans(currentPage);
  }, [currentPage]);

  const loadLoans = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await memberService.getLoans(page, 10);

      if (response.success) {
        setLoans(response.data.loans);
        setSummary(response.data.summary);
        setTotalPages(Math.ceil(response.data.summary.totalLoans / 10));
      } else {
        setError(response.message || 'Failed to load loans');
      }
    } catch (err) {
      setError(err.message || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'bg-success', text: 'Active' },
      paid: { class: 'bg-primary', text: 'Paid' },
      overdue: { class: 'bg-warning', text: 'Overdue' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading && loans.length === 0) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => navigate('/member/dashboard')}
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>
              <div>
                <h2 className="fw-bold mb-0">My Loans</h2>
                <p className="text-muted mb-0">
                  View and manage your loan accounts
                </p>
              </div>
            </div>
            <button 
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => loadLoans(currentPage)}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
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
                <h3 className="fw-bold mb-1">{summary.totalLoans}</h3>
                <p className="text-muted small mb-0">
                  {summary.activeLoans} active
                </p>
              </div>
            </motion.div>
          </div>

          <div className="col-md-4 mb-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="card border-0 shadow-sm h-100"
            >
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-warning text-white" 
                         style={{ width: '40px', height: '40px' }}>
                      <Wallet size={20} />
                    </div>
                    <span className="fw-medium">Total Principal</span>
                  </div>
                  <Wallet className="text-muted" size={18} />
                </div>
                <h3 className="fw-bold mb-1">
                  {formatCurrency(summary.totalPrincipal)}
                </h3>
                <p className="text-muted small mb-0">
                  Total borrowed amount
                </p>
              </div>
            </motion.div>
          </div>

          <div className="col-md-4 mb-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="card border-0 shadow-sm h-100"
            >
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-danger text-white" 
                         style={{ width: '40px', height: '40px' }}>
                      <Wallet size={20} />
                    </div>
                    <span className="fw-medium">Outstanding Balance</span>
                  </div>
                  <Wallet className="text-muted" size={18} />
                </div>
                <h3 className="fw-bold mb-1">
                  {formatCurrency(summary.totalBalance)}
                </h3>
                <p className="text-muted small mb-0">
                  Total amount owed
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger">
              {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={() => loadLoans(currentPage)}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loans Table */}
      <div className="row">
        <div className="col-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card border-0 shadow-sm"
          >
            <div className="card-header bg-light border-0 py-3">
              <h6 className="fw-bold mb-0">Loan Details</h6>
            </div>
            <div className="card-body">
              {loans.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Loan Type</th>
                          <th>Principal</th>
                          <th>Balance</th>
                          <th>Interest Rate</th>
                          <th>Term</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loans.map((loan) => (
                          <tr key={loan._id}>
                            <td className="text-capitalize">{loan.loanType}</td>
                            <td>{formatCurrency(loan.principal)}</td>
                            <td className="fw-bold">{formatCurrency(loan.balance)}</td>
                            <td>{loan.interestRate}%</td>
                            <td>{loan.termMonths} months</td>
                            <td>{getStatusBadge(loan.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <nav>
                        <ul className="pagination">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>
                          
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            return (
                              <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                <button 
                                  className="page-link"
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          })}
                          
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <CreditCard size={48} className="text-muted" />
                  </div>
                  <h5 className="text-muted">No loans found</h5>
                  <p className="text-muted">
                    You haven't taken any loans yet. Contact the cooperative office to apply for a loan.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoansPage;
