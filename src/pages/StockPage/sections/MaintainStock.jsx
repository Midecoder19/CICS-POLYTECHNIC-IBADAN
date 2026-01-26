import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { motion } from "framer-motion";
import { Storefront, Package, Truck, Archive } from "phosphor-react";
import "../../../styles/MaintainStock.css";

// Import sub-section components
import StoreInformation from "./StoreInformation";
import EssentialCommodity from "./EssentialCommodity";
import SupplierSetup from "./SupplierSetup";
import ProductSetup from "./ProductSetup";

class MaintainStock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "maintain", // "maintain", "storeinfo", "essential", "supplier", "product"
    };
  }

  handleTileClick = (section) => {
    this.setState({ view: section });
  };

  renderSection = () => {
    const { view } = this.state;
    switch (view) {
      case "storeinfo":
        return <StoreInformation />;
      case "essential":
        return <EssentialCommodity />;
      case "supplier":
        return <SupplierSetup />;
      case "product":
        return <ProductSetup />;
      default:
        return null;
    }
  };

  render() {
    const { view } = this.state;

    const tiles = [
      {
        key: "storeinfo",
        title: "Store Information",
        desc: "Manage store details and configurations.",
        icon: <Storefront size={36} />,
        color: "#3b82f6",
      },
      {
        key: "essential",
        title: "Essential Commodity",
        desc: "Handle essential commodity settings.",
        icon: <Package size={36} />,
        color: "#10b981",
      },
      {
        key: "supplier",
        title: "Supplier Setup",
        desc: "Configure supplier information and balances.",
        icon: <Truck size={36} />,
        color: "#f59e0b",
      },
      {
        key: "product",
        title: "Product Setup",
        desc: "Manage product information and opening balances.",
        icon: <Archive size={36} />,
        color: "#8b5cf6",
      },
    ];

    return (
      <div className="maintain-stock-page">
        {view === "maintain" ? (
          <div>
            <div className="page-header">
              <h2>📦 Maintain Stock</h2>
              <button
                className="back-btn"
                onClick={() => this.props.navigate("/dashboard")}
              >
                ⬅ Back to Dashboard
              </button>
            </div>

            <div className="maintain-grid">
              {tiles.map((tile, index) => (
                <motion.div
                  key={tile.key}
                  className="maintain-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => this.handleTileClick(tile.key)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="maintain-card-icon"
                    style={{
                      backgroundColor: `${tile.color}20`,
                      color: tile.color,
                    }}
                  >
                    {tile.icon}
                  </div>
                  <div className="maintain-card-info">
                    <h3>{tile.title}</h3>
                    <p>{tile.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {this.renderSection()}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(MaintainStock);
