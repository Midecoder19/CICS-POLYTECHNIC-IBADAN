import React from "react";
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

  render() {
    const { theme } = this.state;

    const tiles = [
      {
        key: "maintain",
        title: "Maintain",
        desc: "Manage general stock settings and configurations.",
        icon: <Package size={28} />,
        color: "#2563eb",
      },
      {
        key: "task",
        title: "Task",
        desc: "View and manage pending stock tasks efficiently.",
        icon: <ClipboardCheck size={28} />,
        color: "#16a34a",
      },
      {
        key: "srv",
        title: "SRV",
        desc: "Manage Stock Receipt Vouchers for inventory intake.",
        icon: <ClipboardCheck size={28} />,
        color: "#dc2626",
      },
      {
        key: "reports",
        title: "Reports",
        desc: "Generate and analyze detailed stock reports.",
        icon: <ChartBar size={28} />,
        color: "#f59e0b",
      },
    ];

    return (
      <div className="stock-dashboard-container">
        {/* ===== HEADER ===== */}
        <header className="stock-dashboard-header">
          <div className="header-left">
            <h1>Stock Dashboard</h1>
            <p>Quickly access Maintain, Task, and Reports sections.</p>
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
                <p>{tile.desc}</p>-
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(StockPage);
