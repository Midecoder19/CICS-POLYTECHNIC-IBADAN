import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Bank } from "phosphor-react";
import "../../../styles/StoreInformation.css";

// Import sub-section components
import ProductInformation from "./ProductInformation";
import ProductOpeningBalance from "./ProductOpeningBalance";

const ProductSetup = () => {
  const [view, setView] = useState("product"); // "product", "info", "balance"

  const handleTileClick = (section) => {
    setView(section);
  };

  const renderSection = () => {
    switch (view) {
      case "info":
        return <ProductInformation />;
      case "balance":
        return <ProductOpeningBalance />;
      default:
        return null;
    }
  };

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
                onClick={() => handleTileClick(tile.key)}
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
            onClick={() => setView("product")}
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
          {renderSection()}
        </div>
      )}
    </div>
  );
};

export default ProductSetup;
