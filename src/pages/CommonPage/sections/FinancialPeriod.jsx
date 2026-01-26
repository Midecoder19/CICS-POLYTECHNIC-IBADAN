import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import "../../../styles/FinancialPeriod.css";

class FinancialPeriod extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      noOfPeriods: 12,
      beginDate: "2024-01-01",
      periods: [],
    };
  }

  componentDidMount() {
    // Demo: Generate periods locally
    this.generatePeriods();

    // TODO: Uncomment for real API
    // this.fetchFinancialPeriods();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.noOfPeriods !== this.state.noOfPeriods || prevState.beginDate !== this.state.beginDate) {
      // Demo: Regenerate periods locally
      this.generatePeriods();

      // TODO: Uncomment for real API
      // this.updateFinancialPeriods();
    }
  }

  generatePeriods = () => {
    // Demo: Local period generation
    const start = new Date(this.state.beginDate);
    if (isNaN(start)) return;

    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    const generated = [];
    for (let i = 0; i < Number(this.state.noOfPeriods); i++) {
      const startDate = new Date(start.getFullYear(), i, 1);
      const endDate = new Date(start.getFullYear(), i + 1, 0);

      generated.push({
        id: i + 1,
        description: months[i % 12] || `PERIOD ${i + 1}`,
        begin: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
        status: i === 0 ? "OPEN" : "CLOSE",
      });
    }
    this.setState({ periods: generated });
  };

  // TODO: Uncomment for real API
  // async fetchFinancialPeriods() {
  //   try {
  //     const response = await fetch('/api/financial-periods');
  //     const data = await response.json();
  //     this.setState({ periods: data.periods, noOfPeriods: data.noOfPeriods, beginDate: data.beginDate });
  //   } catch (error) {
  //     console.error('Error fetching financial periods:', error);
  //   }
  // }

  // TODO: Uncomment for real API
  // async updateFinancialPeriods() {
  //   try {
  //     const response = await fetch('/api/financial-periods', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ noOfPeriods: this.state.noOfPeriods, beginDate: this.state.beginDate })
  //     });
  //     const data = await response.json();
  //     this.setState({ periods: data.periods });
  //   } catch (error) {
  //     console.error('Error updating financial periods:', error);
  //   }
  // }

  handleStatusChange = (id, newStatus) => {
    this.setState({
      periods: this.state.periods.map(p => (p.id === id ? { ...p, status: newStatus } : p))
    });
  };

  handleOpenAll = () => this.setState({ periods: this.state.periods.map(p => ({ ...p, status: "OPEN" })) });
  handleCloseAll = () => this.setState({ periods: this.state.periods.map(p => ({ ...p, status: "CLOSE" })) });

  handleNoOfPeriodsChange = (e) => {
    this.setState({ noOfPeriods: e.target.value });
  };

  handleBeginDateChange = (e) => {
    this.setState({ beginDate: e.target.value });
  };

  render() {
    return (
      <div className="financial-container">
        <div className="financial-header">
          <h2>Financial Period</h2>
          <button className="back-btn" onClick={() => this.props.navigate("/common")}>⬅ Back</button>
        </div>

        <div className="financial-card">
          {/* PERIOD DATES */}
          <div className="period-dates">
            <h4>Period Dates</h4>
            <div className="period-inputs">
              <label>
                No of Periods:
                <input
                  type="number"
                  value={this.state.noOfPeriods}
                  min="1"
                  max="12"
                  onChange={this.handleNoOfPeriodsChange}
                />
              </label>

              <label>
                Begin Date:
                <input
                  type="date"
                  value={this.state.beginDate}
                  onChange={this.handleBeginDateChange}
                />
              </label>
            </div>
          </div>

          {/* PERIOD TABLE */}
          <div className="period-table">
            <table>
              <thead>
                <tr>
                  <th>Period No</th>
                  <th>Description</th>
                  <th>Begin Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {this.state.periods.length > 0 ? (
                  this.state.periods.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.description}</td>
                      <td>{p.begin}</td>
                      <td>{p.end}</td>
                      <td>
                        <select
                          value={p.status}
                          onChange={(e) => this.handleStatusChange(p.id, e.target.value)}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="CLOSE">CLOSE</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No periods generated</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ACTION BUTTONS */}
          <div className="financial-buttons">
            <button onClick={this.handleOpenAll}>Open All</button>
            <button onClick={this.handleCloseAll}>Close All</button>
            <button className="primary">OK</button>
            <button className="cancel" onClick={() => this.props.navigate("/common")}>Close</button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(FinancialPeriod);
