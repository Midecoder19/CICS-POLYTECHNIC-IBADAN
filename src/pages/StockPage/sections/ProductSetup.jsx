import React from "react";
import { withRouter } from "../../../utils/withRouter.jsx";
import { motion } from "framer-motion";
import { Tag, Bank } from "phosphor-react";

// Import sub-section components
import ProductInformation from "./ProductInformation";
import ProductOpeningBalance from "./ProductOpeningBalance";

class ProductSetup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "product", // "product", "info", "balance"
    };
  }

  handleTileClick = (section) => {
    this.setState({ view: section });
  };

  renderSection = () => {
    const { view } = this.state;
    switch (view) {
      case "info":
        return <ProductInformation />;
      case "balance":
        return <ProductOpeningBalance />;
      default:
        return null;
    }
  };

  render() {
    const { view } = this.state;

    const tiles = [
      {
        key: "info",
        title: "Product Information",
        desc: "Manage product details and purchase information.",
        icon: <Tag size={36} />,
        color: "#3b82f6",
      },
      {
        key: "balance",
        title: "Product Opening Balance",
        desc: "Set and manage product opening balances.",
        icon: <Bank size={36} />,
        color: "#10b981",
      },
    ];

    return (
      <div className="section-page">
        {view === "product" ? (
          <div>
            <h2>📦 Product Setup</h2>
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
              onClick={() => this.setState({ view: "product" })}
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
              Back to Product Setup
            </button>
            {this.renderSection()}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(ProductSetup);
