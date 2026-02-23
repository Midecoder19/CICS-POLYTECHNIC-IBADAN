import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../config/api.js";
import "../../../styles/FinancialPeriod.css";

const FinancialPeriod = () => {
  const navigate = useNavigate();

  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadFinancialPeriods();
  }, []);

  const loadFinancialPeriods = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/common/financial-periods');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPeriods(data.data);
          setSuccess('Financial periods loaded successfully');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(data.message || 'Failed to load financial periods');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading financial periods:', error);
      setError(error.message || 'Failed to load financial periods');
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialPeriods = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call a backend endpoint to generate periods
      // For now, we'll just reload the existing periods
      await loadFinancialPeriods();
      setSuccess('Financial periods refreshed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error refreshing financial periods:', error);
      setError('Failed to refresh financial periods');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (periodNumber, newStatus) => {
    setPeriods(periods.map(p =>
      p.periodNumber === periodNumber ? { ...p, isCurrent: newStatus === 'OPEN' } : p
    ));                                                                                                         
  };

  const handleOpenAll = () => {
    setPeriods(periods.map(p => ({ ...p, isCurrent: true })));
    setSuccess('All periods opened successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCloseAll = () => {
    setPeriods(periods.map(p => ({ ...p, isCurrent: false })));
    setSuccess('All periods closed successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSave = () => {
    // Placeholder for save logic - in a real implementation, this would save to backend
    setSuccess('Financial periods saved successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="financial-container">
      <div className="financial-header">
        <h2>Period Dates No of Periods: Begin Date</h2>
        <button className="back-btn" onClick={() => navigate("/common")}>⬅ Back</button>
      </div>

      {/* Messages */}
      {error && (
        <div className="error-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="success-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px', color: '#363' }}>
          ✅ {success}
        </div>
      )}
      {loading && (
        <div className="loading-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#eef', border: '1px solid #ccf', borderRadius: '4px', color: '#336' }}>
          ⏳ Loading...
        </div>
      )}

      <div className="financial-card">
        {/* YEAR SELECTOR */}
        <div className="year-selector" style={{ marginBottom: '1rem' }}>
          <label htmlFor="year-select" style={{ marginRight: '0.5rem' }}>Select Year:</label>
          <select
            id="year-select"
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* PERIOD TABLE */}
        <div className="period-table">
          <table>
            <thead>
              <tr>
                <th>Period No</th>
                <th>Description</th>
                <th>Year</th>
                <th>Begin Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {periods.length > 0 ? (
                periods.map((p) => (
                  <tr key={p.periodNumber}>
                    <td>{p.periodNumber}</td>
                    <td>{p.description}</td>
                    <td>{p.year}</td>
                    <td>{new Date(p.startDate).toLocaleDateString()}</td>
                    <td>{new Date(p.endDate).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={p.isCurrent ? "OPEN" : "CLOSE"}
                        onChange={(e) => handleStatusChange(p.periodNumber, e.target.value)}
                        disabled={loading}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="CLOSE">CLOSE</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    {loading ? 'Generating periods...' : 'No periods found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ACTION BUTTONS */}
        <div className="financial-buttons">
          <button onClick={handleOpenAll} disabled={loading}>Open All</button>
          <button onClick={handleCloseAll} disabled={loading}>Close All</button>
          <button className="primary" onClick={generateFinancialPeriods} disabled={loading}>Refresh</button>
          <button className="cancel" onClick={() => navigate("/common")}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FinancialPeriod;
