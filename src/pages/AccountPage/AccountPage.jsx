import React, { Suspense, lazy } from "react";
import { withRouter } from "../../utils/withRouter.jsx";
import {
  Building2,
  MapPin,
  Users,
  Landmark,
  CreditCard,
  ArrowsLeftRight,
  FileText,
  BookOpen,
  CheckCircle,
  CurrencyDollar,
  User,
  Shield,
  Key,
  Sun,
  Moon,
  ArrowLeftCircle,
} from "lucide-react";
import "./AccountPage.css";

// Lazy load section components
const Organization = lazy(() => import("./sections/Organization"));
const Branch = lazy(() => import("./sections/Branch"));
const Department = lazy(() => import("./sections/Department"));
const BankComponent = lazy(() => import("./sections/Bank"));
const PayComponent = lazy(() => import("./sections/PayComponent"));
const TransType = lazy(() => import("./sections/TransType"));
const LoanCategory = lazy(() => import("./sections/LoanCategory"));
const JournalCategory = lazy(() => import("./sections/JournalCategory"));
const MemberLoanMaster = lazy(() => import("./sections/MemberLoanMaster"));
const SavingsRequestData = lazy(() => import("./sections/SavingsRequestData"));

class AccountPage extends React.Component {
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

  handleBackToDashboard = () => {
    this.props.navigate("/dashboard");
  };

  renderSection = () => {
    const { section } = this.props.params || {};

    if (!section) return null;

    switch (section.toLowerCase()) {
      case "organization":
        return <Organization />;
      case "branch":
        return <Branch />;
      case "department":
        return <Department />;
      case "bank":
        return <BankComponent />;
      case "paycomponent":
        return <PayComponent />;
      case "transtype":
        return <TransType />;
      case "loancategory":
        return <LoanCategory />;
      case "journalcategory":
        return <JournalCategory />;
      case "memberloanmaster":
        return <MemberLoanMaster />;
      case "savingsrequestdata":
        return <SavingsRequestData />;
      default:
        return <div>Section not found</div>;
    }
  };

  render() {
    const { theme } = this.state;
    const { section } = this.props.params || {};

    const cards = [
      {
        key: "organization",
        title: "Organization",
        desc: "Manage organization details and settings.",
        icon: <Building2 size={28} strokeWidth={1.8} />,
        path: "/account/organization",
        color: "#8b5cf6",
      },
      {
        key: "branch",
        title: "Branch",
        desc: "Configure branch information.",
        icon: <MapPin size={28} strokeWidth={1.8} />,
        path: "/account/branch",
        color: "#ef4444",
      },
      {
        key: "department",
        title: "Department",
        desc: "Handle department configurations.",
        icon: <Users size={28} strokeWidth={1.8} />,
        path: "/account/department",
        color: "#06b6d4",
      },
      {
        key: "bank",
        title: "Bank",
        desc: "Manage bank details and accounts.",
        icon: <Bank size={28} strokeWidth={1.8} />,
        path: "/account/bank",
        color: "#84cc16",
      },
      {
        key: "paycomponent",
        title: "Pay Component",
        desc: "Configure pay components.",
        icon: <CreditCard size={28} strokeWidth={1.8} />,
        path: "/account/paycomponent",
        color: "#f97316",
      },
      {
        key: "transtype",
        title: "Transaction Type",
        desc: "Define transaction types.",
        icon: <ArrowsLeftRight size={28} strokeWidth={1.8} />,
        path: "/account/transtype",
        color: "#ec4899",
      },
      {
        key: "loancategory",
        title: "Loan Category",
        desc: "Manage loan categories.",
        icon: <FileText size={28} strokeWidth={1.8} />,
        path: "/account/loancategory",
        color: "#6366f1",
      },
      {
        key: "journalcategory",
        title: "Journal Category",
        desc: "Configure journal categories.",
        icon: <BookOpen size={28} strokeWidth={1.8} />,
        path: "/account/journalcategory",
        color: "#8b5cf6",
      },
      {
        key: "memberloanmaster",
        title: "Member Loan Master",
        desc: "Handle member loan master data.",
        icon: <CheckCircle size={28} strokeWidth={1.8} />,
        path: "/account/memberloanmaster",
        color: "#10b981",
      },
      {
        key: "savingsrequestdata",
        title: "Savings Request Data",
        desc: "Manage savings request data.",
        icon: <CurrencyDollar size={28} strokeWidth={1.8} />,
        path: "/account/savingsrequestdata",
        color: "#f59e0b",
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

    // Otherwise, render the main account dashboard
    return (
      <div className="account-dashboard-container">
        {/* ===== HEADER ===== */}
        <header className="account-dashboard-header">
          <div className="header-left">
            <h1>Account Management</h1>
            <p>Complete financial operations, member accounts, and loan management.</p>
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

        {/* ===== CARDS GRID ===== */}
        <div className="account-dashboard-grid">
          {cards.map((card) => (
            <div
              key={card.key}
              className="account-dashboard-card"
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

export default withRouter(AccountPage);
