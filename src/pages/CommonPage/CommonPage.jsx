import React from "react";
import { withRouter } from "../../utils/withRouter.jsx";
import {
  Building2,
  Calendar,
  DatabaseBackup,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Moon,
  ArrowLeftCircle,
} from "lucide-react";
import "./CommonPage.css";

class CommonPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: localStorage.getItem("theme") || "light",
    };
  }

  componentDidMount() {
    document.body.setAttribute("data-theme", this.state.theme);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.theme !== this.state.theme) {
      document.body.setAttribute("data-theme", this.state.theme);
    }
  }

  toggleTheme = () => {
    const newTheme = this.state.theme === "light" ? "dark" : "light";
    this.setState({ theme: newTheme });
    localStorage.setItem("theme", newTheme);
  };

  // ✅ Replaces logout — now navigates back to main dashboard
  handleBackToDashboard = () => {
    this.props.navigate("/dashboard");
  };

  render() {
    const cards = [
      {
        key: "society",
        title: "Society Information",
        desc: "Manage your society profile, address, and contact details.",
        icon: <Building2 size={28} strokeWidth={1.8} />,
        path: "/common/society",
        color: "#2563eb",
      },
      {
        key: "financial",
        title: "Financial Period",
        desc: "Manage your fiscal year and opening balances.",
        icon: <Calendar size={28} strokeWidth={1.8} />,
        path: "/common/financial",
        color: "#0ea5e9",
      },
      {
        key: "backup",
        title: "Backup Data",
        desc: "Safeguard and store your important system data.",
        icon: <DatabaseBackup size={28} strokeWidth={1.8} />,
        path: "/common/backup",
        color: "#16a34a",
      },
      {
        key: "restore",
        title: "Restore Data",
        desc: "Restore lost or damaged files from backup.",
        icon: <DatabaseBackup size={28} strokeWidth={1.8} />,
        path: "/common/restore",
        color: "#15803d",
      },
      {
        key: "security",
        title: "Security Settings",
        desc: "Control access, passwords, and user roles.",
        icon: <ShieldCheck size={28} strokeWidth={1.8} />,
        path: "/common/security",
        color: "#f59e0b",
      },
      {
        key: "default",
        title: "Default Parameters",
        desc: "Configure default system preferences.",
        icon: <SlidersHorizontal size={28} strokeWidth={1.8} />,
        path: "/common/default",
        color: "#7c3aed",
      },
    ];

    return (
      <div className="common-dashboard-container">
        {/* ===== HEADER ===== */}
        <header className="common-dashboard-header">
          <div className="header-left">
            <h1>Common Dashboard</h1>
            <p>Access and manage all system configuration modules below.</p>
          </div>

          <div className="header-right">
            <button className="theme-toggle" onClick={this.toggleTheme}>
              {this.state.theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              <span>{this.state.theme === "light" ? "Dark" : "Light"} Mode</span>
            </button>

            {/* ✅ Replaced Logout with Back to Dashboard */}
            <button className="logout-btn" onClick={this.handleBackToDashboard}>
              <ArrowLeftCircle size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </header>

        {/* ===== GRID ===== */}
        <div className="common-dashboard-grid">
          {cards.map((card) => (
            <div
              key={card.key}
              className="common-dashboard-card"
              onClick={() => this.props.navigate(card.path)}
            >
              <div
                className="dashboard-card-icon"
                style={{ backgroundColor: `${card.color}15`, color: card.color }}
              >
                {card.icon}
              </div>
              <div className="dashboard-card-info">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(CommonPage);
