import React from "react";
import stockSalesService from "../../../services/StockSalesService";

class StoreLookupModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { query: "", stores: [], loading: true, error: null };
  }

  componentDidMount() {
    this.loadStores();
  }

  loadStores = async () => {
    try {
      const result = await stockSalesService.getStores(this.props.societyId);
      if (result.success) {
        this.setState({ stores: result.data, loading: false });
      } else {
        this.setState({ error: result.message, loading: false });
      }
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  setQuery = (q) => this.setState({ query: q });

  filtered = () => {
    const q = (this.state.query || "").toLowerCase().trim();
    if (!q) return this.state.stores;
    return this.state.stores.filter((s) =>
      `${s.code} ${s.name}`.toLowerCase().includes(q)
    );
  };

  render() {
    const { onClose, onSelect } = this.props;
    const rows = this.filtered();
    const { loading, error } = this.state;

    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(6px)",
          zIndex: 1060,
        }}
      >
        <div
          className="card shadow-lg border-0"
          style={{
            width: "90%",
            maxWidth: 600,
            borderRadius: "1rem",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3 px-4">
            <h5 className="mb-0 fw-semibold">🔑 Store Lookup</h5>
            <button
              className="btn btn-sm btn-light fw-semibold"
              onClick={onClose}
            >
              ✖ Close
            </button>
          </div>

          {/* Body */}
          <div className="card-body p-4">
            {loading && <div>Loading stores...</div>}
            {error && <div className="text-danger">Error: {error}</div>}
            {!loading && !error && (
              <>
                {/* Search bar */}
                <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm flex-grow-1"
                    placeholder="Search by code or description..."
                    value={this.state.query}
                    onChange={(e) => this.setQuery(e.target.value)}
                  />
                  <span className="text-muted small">{rows.length} result(s)</span>
                </div>

                {/* Table */}
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light position-sticky top-0">
                      <tr>
                        <th style={{ width: "30%" }}>Store Code</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length ? (
                        rows.map((s) => (
                          <tr
                            key={s._id}
                            onClick={() => onSelect(s)}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{s.storeCode}</td>
                            <td>{s.name}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="text-center text-muted py-4">
                            No results found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="card-footer bg-light text-center text-muted small py-2">
            💡 Tip: Click a row to autofill the form.
          </div>
        </div>
      </div>
    );
  }
}

export default StoreLookupModal;
