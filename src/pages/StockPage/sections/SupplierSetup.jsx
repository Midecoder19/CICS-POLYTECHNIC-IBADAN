import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { motion } from "framer-motion";
import { User, Bank } from "phosphor-react";

// Import sub-section components
import SupplierInformation from "./SupplierInformation";
import SupplierOpeningBalance from "./SupplierOpeningBalance";

class SupplierSetup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "supplier", // "supplier", "info", "balance"
    };
  }

  handleTileClick = (section) => {
    this.setState({ view: section });
  };

  renderSection = () => {
    const { view } = this.state;
    switch (view) {
      case "info":
        return <SupplierInformation />;
      case "balance":
        return <SupplierOpeningBalance />;
      default:
        return null;
    }
  };

  render() {
    const { view } = this.state;

    const tiles = [
      {
        key: "info",
        title: "Supplier Information",
        desc: "Manage supplier details and contacts.",
        icon: <User size={36} />,
        color: "#3b82f6",
      },
      {
        key: "balance",
        title: "Supplier Opening Balance",
        desc: "Set and manage opening balances.",
        icon: <Bank size={36} />,
        color: "#10b981",
      },
    ];

    return (
      <div className="section-page">
        {view === "supplier" ? (
          <div>
            <h2>🚚 Supplier Setup</h2>
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
            <button
              onClick={() => this.setState({ view: "supplier" })}
              style={{
                margin: "20px",
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Back to Supplier Setup
            </button>
            {this.renderSection()}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(SupplierSetup);
