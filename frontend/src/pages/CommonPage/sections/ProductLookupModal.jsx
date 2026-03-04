import React from "react";
import stockSalesService from "../../../services/StockSalesService";

class ProductLookupModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      query: "", 
      products: [], 
      loading: true, 
      error: null,
      stockBalances: {},
      productPrices: {} 
    };
  }

  componentDidMount() {
    this.loadProducts();
  }

  loadProducts = async () => {
    try {
      // Get societyId from props or fallback to localStorage
      let societyId = this.props.societyId;
      if (!societyId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          societyId = parsedUser?.society?._id || parsedUser?.society;
        }
      }
      
      if (!societyId) {
        this.setState({ error: 'Society not found', loading: false });
        return;
      }
      
      const result = await stockSalesService.getProducts(societyId);
      if (result.success) {
        this.setState({ products: result.data, loading: false });
        // Also load stock balances
        this.loadStockBalances();
      } else {
        this.setState({ error: result.message, loading: false });
      }
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  loadStockBalances = async () => {
    try {
      // Get societyId from props or fallback to localStorage
      let societyId = this.props.societyId;
      if (!societyId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          societyId = parsedUser?.society?._id || parsedUser?.society;
        }
      }
      
      if (!societyId) {
        console.warn('Society ID not available for stock balances');
        return;
      }
      
      const balancesResult = await stockSalesService.getStockBalances(societyId);
      if (balancesResult.success && balancesResult.data) {
        const balances = {};
        const prices = {};
        balancesResult.data.forEach(balance => {
          // Ensure consistent string key format
          const productId = balance.product?._id?.toString() || balance.product?.toString();
          balances[productId] = balance.quantityOnHand || 0;
          prices[productId] = balance.unitPrice || 0; // Store the latest unit price
        });
        this.setState({ stockBalances: balances, productPrices: prices });
      }
    } catch (error) {
      console.error('Error loading stock balances:', error);
    }
  };

  setQuery = (q) => this.setState({ query: q });

  filtered = () => {
    const q = (this.state.query || "").toLowerCase().trim();
    if (!q) return this.state.products;
    return this.state.products.filter((p) =>
      `${p.code || ''} ${p.description || ''} ${p.name || ''}`.toLowerCase().includes(q)
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
            <h5 className="mb-0 fw-semibold">🔑 Product Lookup</h5>
            <button
              className="btn btn-sm btn-light fw-semibold"
              onClick={onClose}
            >
              ✖ Close
            </button>
          </div>

          {/* Body */}
          <div className="card-body p-4">
            {loading && <div>Loading products...</div>}
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
                        <th style={{ width: "25%" }}>Product Code</th>
                        <th>Description</th>
                        <th style={{ width: "15%" }}>Price</th>
                        <th style={{ width: "15%" }}>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length ? (
                        rows.map((p) => {
                          const productId = p._id?.toString();
                          const stock = this.state.stockBalances[productId] || 0;
                          const price = this.state.productPrices[productId] || p.sellingPrice || p.price || 0;
                          return (
                          <tr
                            key={p._id}
                            onClick={() => {
                              onSelect({ 
                                ...p, 
                                availableStock: stock,
                                sellingPrice: price // Pass the receipt price
                              })
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{p.code}</td>
                            <td>{p.description || p.name}</td>
                            <td className="text-end" style={{ fontWeight: 'bold', color: '#28a745' }}>₦{price.toFixed(2)}</td>
                            <td className="text-end" style={{ fontWeight: 'bold', color: stock > 0 ? '#28a745' : '#dc3545' }}>
                              {stock}
                            </td>
                          </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-4">
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

export default ProductLookupModal;
