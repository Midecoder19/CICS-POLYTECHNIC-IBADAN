import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import memberService from '../../services/MemberAuthService';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import './MemberDashboard.css';

const LedgerPage = () => {
  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useMemberAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadLedger(currentPage);
  }, [currentPage]);

  const loadLedger = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await memberService.getLedger(page, 20);

      if (response.success) {
        setLedger(response.data.ledger);
        setSummary(response.data.summary);
        setTotalPages(Math.ceil(response.data.summary.totalEntries / 20));
      } else {
        setError(response.message || 'Failed to load ledger');
      }
    } catch (err) {
      setError(err.message || 'Failed to load ledger');
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading && ledger.length === 0) {
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
                <h2 className="fw-bold mb-0">Transaction Ledger</h2>
                <p className="text-muted mb-0">
                  View your complete transaction history
                </p>
              </div>
            </div>
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => loadLedger(currentPage)}
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
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-success text-white"
                         style={{ width: '40px', height: '40px' }}>
                      <TrendingUp size={20} />
                    </div>
                    <span className="fw-medium">Total Credit</span>
                  </div>
                  <TrendingUp className="text-muted" size={18} />
                </div>
                <h3 className="fw-bold mb-1">
                  {formatCurrency(summary.totalCredit)}
                </h3>
                <p className="text-muted small mb-0">
                  Total contributions
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
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-danger text-white"
                         style={{ width: '40px', height: '40px' }}>
                      <TrendingDown size={20} />
                    </div>
                    <span className="fw-medium">Total Debit</span>
                  </div>
                  <TrendingDown className="text-muted" size={18} />
                </div>
                <h3 className="fw-bold mb-1">
                  {formatCurrency(summary.totalDebit)}
                </h3>
                <p className="text-muted small mb-0">
                  Total withdrawals
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
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-info text-white"
                         style={{ width: '40px', height: '40px' }}>
                      <TrendingUp size={20} />
                    </div>
                    <span className="fw-medium">Net Balance</span>
                  </div>
                  <TrendingUp className="text-muted" size={18} />
                </div>
                <h3 className="fw-bold mb-1">
                  {formatCurrency(summary.netBalance)}
                </h3>
                <p className="text-muted small mb-0">
                  Credit - Debit
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
                onClick={() => loadLedger(currentPage)}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="row">
        <div className="col-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card border-0 shadow-sm"
          >
            <div className="card-header bg-light border-0 py-3">
              <h6 className="fw-bold mb-0">Transaction History</h6>
            </div>
            <div className="card-body">
              {ledger.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th className="text-end">Debit</th>
                          <th className="text-end">Credit</th>
                          <th className="text-end">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.map((entry, index) => (
                          <tr key={entry._id}>
                            <td className="small">{formatDate(entry.date)}</td>
                            <td className="small">{entry.description}</td>
                            <td className="text-end">
                              {entry.debit > 0 ? (
                                <span className="text-danger fw-bold">
                                  {formatCurrency(entry.debit)}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="text-end">
                              {entry.credit > 0 ? (
                                <span className="text-success fw-bold">
                                  {formatCurrency(entry.credit)}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="text-end fw-bold">
                              {formatCurrency(entry.balance)}
                            </td>
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
                    <TrendingUp size={48} className="text-muted" />
                  </div>
                  <h5 className="text-muted">No transactions found</h5>
                  <p className="text-muted">
                    No transaction history available. Your transactions will appear here once you start using the cooperative services.
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

export default LedgerPage;
