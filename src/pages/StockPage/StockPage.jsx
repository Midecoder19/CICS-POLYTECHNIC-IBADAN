import React, { Suspense, lazy } from "react";
import { withRouter } from "../../utils/withRouter.jsx";

import {
  Package,
  ClipboardCheck,
  ChartBar,
  Sun,
  Moon,
  ArrowLeftCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import "../../styles/StockPage.css";

// Lazy load section components
const MaintainStock = lazy(() => import("./sections/MaintainStock"));
const StoreInformation = lazy(() => import("./sections/StoreInformation"));
const EssentialCommodity = lazy(() => import("./sections/EssentialCommodity"));
const SupplierInformation = lazy(() => import("./sections/SupplierInformation"));
const SupplierOpeningBalance = lazy(() => import("./sections/SupplierOpeningBalance"));
const ProductSetup = lazy(() => import("./sections/ProductSetup"));
const ProductInformation = lazy(() => import("./sections/ProductInformation"));
const ProductOpeningBalance = lazy(() => import("./sections/ProductOpeningBalance"));
const LPO = lazy(() => import("./sections/LPO"));
const StockReceiptVoucher = lazy(() => import("./sections/StockReceiptVoucher"));
const StockSales = lazy(() => import("./sections/StockSales"));

class StockPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: localStorage.getItem("theme") || "light",
    };
  }

  componentDidMount() {
    document.body.setAttribute("data-theme", this.state.theme);
  }

  toggleTheme = () => {
    this.setState(
      (prev) => ({ theme: prev.theme === "light" ? "dark" : "light" }),
      () => {
        const { theme } = this.state;
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
      }
    );
  };

  handleBackToDashboard = () => {
    this.props.navigate("/dashboard");
  };

  handleNavigate = (section) => {
    this.props.navigate(`/stock/${section.toLowerCase()}`);
  };

  renderSection = () => {
    const { section } = this.props.params || {};

    if (!section) return null;

    switch (section.toLowerCase()) {
      case "maintain":
        return <MaintainStock />;
      case "storeinfo":
        return <StoreInformation />;
      case "essential":
        return <EssentialCommodity />;
      case "supplierinfo":
        return <SupplierInformation />;
      case "supplierbalance":
        return <SupplierOpeningBalance />;
      case "productsetup":
        return <ProductSetup />;
      case "productinfo":
        return <ProductInformation />;
      case "productbalance":
        return <ProductOpeningBalance />;
      case "lpo":
        return <LPO />;
      case "receipt":
        return <StockReceiptVoucher />;
      case "sales":
        return <StockSales />;
      default:
        return <div>Section not found</div>;
    }
  };

  render() {
    const { theme } = this.state;
    const { section } = this.props.params || {};

    const tiles = [
      {
        key: "maintain",
        title: "Maintain Stock",
        desc: "Manage general stock settings and configurations.",
        icon: <Package size={28} />,
        color: "#2563eb",
      },
      {
        key: "storeinfo",
        title: "Store Information",
        desc: "Manage store details and information.",
        icon: <ClipboardCheck size={28} />,
        color: "#16a34a",
      },
      {
        key: "essential",
        title: "Essential Commodity",
        desc: "Handle essential commodities and supplies.",
        icon: <ClipboardCheck size={28} />,
        color: "#dc2626",
      },
      {
        key: "supplierinfo",
        title: "Supplier Information",
        desc: "Manage supplier details and contacts.",
        icon: <ChartBar size={28} />,
        color: "#f59e0b",
      },
      {
        key: "supplierbalance",
        title: "Supplier Opening Balance",
        desc: "Set and manage supplier opening balances.",
        icon: <ChartBar size={28} />,
        color: "#8b5cf6",
      },
      {
        key: "productsetup",
        title: "Product Setup",
        desc: "Configure and setup products.",
        icon: <Package size={28} />,
        color: "#06b6d4",
      },
      {
        key: "productinfo",
        title: "Product Information",
        desc: "Manage detailed product information.",
        icon: <ClipboardCheck size={28} />,
        color: "#10b981",
      },
      {
        key: "productbalance",
        title: "Product Opening Balance",
        desc: "Set product opening balances.",
        icon: <ChartBar size={28} />,
        color: "#f97316",
      },
      {
        key: "lpo",
        title: "LPO",
        desc: "Manage Local Purchase Orders.",
        icon: <ClipboardCheck size={28} />,
        color: "#ec4899",
      },
      {
        key: "receipt",
        title: "Stock Receipt Voucher",
        desc: "Manage Stock Receipt Vouchers.",
        icon: <Package size={28} />,
        color: "#84cc16",
      },
      {
        key: "sales",
        title: "Stock Sales",
        desc: "Manage stock sales and point of sales.",
        icon: <Package size={28} />,
        color: "#22c55e",
      },
    ];

    // If we have a section parameter, render the section content
    if (section) {
      return (
        <Suspense fallback={<div>Loading...</div>}>
          {this.renderSection()}
        </Suspense>
      );
    }

    // Otherwise, render the main stock dashboard
    return (
      <div className="stock-dashboard-container">
        {/* ===== HEADER ===== */}
        <header className="stock-dashboard-header">
          <div className="header-left">
            <h1>Stock Management</h1>
            <p>Comprehensive stock management system with 10 specialized modules.</p>
          </div>

          <div className="header-right">
            <button className="theme-toggle" onClick={this.toggleTheme}>
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              <span>{theme === "light" ? "Dark" : "Light"} Mode</span>
            </button>

            <button className="back-btn" onClick={this.handleBackToDashboard}>
              <ArrowLeftCircle size={20} />
              {/* <span>Back to Dashboard</span> */}
            </button>
          </div>
        </header>

        {/* ===== TILES GRID ===== */}
        <div className="stock-dashboard-grid">
          {tiles.map((tile, index) => (
            <motion.div
              key={tile.key}
              className="stock-dashboard-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => this.handleNavigate(tile.key)}
            >
              <div
                className="dashboard-card-icon"
                style={{ backgroundColor: `${tile.color}15`, color: tile.color }}
              >
                {tile.icon}
              </div>
              <div className="dashboard-card-info">
                <h3>{tile.title}</h3>
                <p>{tile.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(StockPage);
