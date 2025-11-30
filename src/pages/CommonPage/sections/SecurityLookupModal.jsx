import React from "react";

class SecurityLookupModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { query: "" };
  }

  setQuery = (q) => this.setState({ query: q });

  filtered = () => {
    const q = (this.state.query || "").toLowerCase().trim();
    if (!q) return this.props.items || [];
    return (this.props.items || []).filter((item) =>
      `${item.code} ${item.description}`.toLowerCase().includes(q)
    );
  };

  render() {
    const { onClose, onSelect, title } = this.props;
    const rows = this.filtered();

    return (
      <div
        className="lookup-overlay"
        onClick={onClose}
      >
        <div
          className="lookup-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "90%",
            maxWidth: 600,
          }}
        >
          {/* Header */}
          <div className="lookup-header">
            <h5>🔑 {title} Lookup</h5>
            <button
              className="close-btn"
              onClick={onClose}
            >
              ✖ Close
            </button>
          </div>

          {/* Body */}
          <div className="lookup-search">
            <input
              type="text"
              placeholder="Search by code or description..."
              value={this.state.query}
              onChange={(e) => this.setQuery(e.target.value)}
            />
            <span className="result-count">{rows.length} result(s)</span>
          </div>

          {/* Table */}
          <div className="lookup-table-container">
            <table className="lookup-table">
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((item, i) => (
                    <tr
                      key={i}
                      className="lookup-row"
                      onClick={() => onSelect(item)}
                    >
                      <td>{item.code}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="no-results">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="lookup-footer">
            💡 Tip: Click a row to autofill the form.
          </div>
        </div>
      </div>
    );
  }
}

export default SecurityLookupModal;
