import React, { useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Buildings, MapPin, Users, Bank, CreditCard, ArrowsLeftRight, FileText, BookOpen, CheckCircle, CurrencyDollar, User, Shield, Key } from "phosphor-react";
import "../../../styles/MaintainAccount.css";

// Lazy load section components
const Organization = lazy(() => import("./Organization"));
const Branch = lazy(() => import("./Branch"));
const Department = lazy(() => import("./Department"));
const BankComponent = lazy(() => import("./Bank"));
const PayComponent = lazy(() => import("./PayComponent"));
const TransType = lazy(() => import("./TransType"));
const LoanCategory = lazy(() => import("./LoanCategory"));
const JournalCategory = lazy(() => import("./JournalCategory"));
const MemberLoanMaster = lazy(() => import("./MemberLoanMaster"));
const SavingsRequestData = lazy(() => import("./SavingsRequestData"));

const MaintainAccount = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("maintain"); // "maintain", "usermanagement", "roles", "permissions", "organization", "branch", "department", "bank", "paycomponent", "transtype", "loancategory", "journalcategory", "memberloanmaster", "savingsrequestdata"

  const handleTileClick = (section) => {
    setView(section);
  };

  const renderSection = () => {
    switch (view) {
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
        return null;
    }
  };

  const tiles = [
    {
      key: "organization",
      title: "Organization",
      desc: "Manage organization details and settings.",
      icon: <Buildings size={36} />,
      color: "#8b5cf6",
    },
    {
      key: "branch",
      title: "Branch",
      desc: "Configure branch information.",
      icon: <MapPin size={36} />,
      color: "#ef4444",
    },
    {
      key: "department",
      title: "Department",
      desc: "Handle department configurations.",
      icon: <Users size={36} />,
      color: "#06b6d4",
    },
    {
      key: "bank",
      title: "Bank",
      desc: "Manage bank details and accounts.",
      icon: <Bank size={36} />,
      color: "#84cc16",
    },
    {
      key: "paycomponent",
      title: "Pay Component",
      desc: "Configure pay components.",
      icon: <CreditCard size={36} />,
      color: "#f97316",
    },
    {
      key: "transtype",
      title: "Transaction Type",
      desc: "Define transaction types.",
      icon: <ArrowsLeftRight size={36} />,
      color: "#ec4899",
    },
    {
      key: "loancategory",
      title: "Loan Category",
      desc: "Manage loan categories.",
      icon: <FileText size={36} />,
      color: "#6366f1",
    },
    {
      key: "journalcategory",
      title: "Journal Category",
      desc: "Configure journal categories.",
      icon: <BookOpen size={36} />,
      color: "#8b5cf6",
    },
    {
      key: "memberloanmaster",
      title: "Member Loan Master",
      desc: "Handle member loan master data.",
      icon: <CheckCircle size={36} />,
      color: "#10b981",
    },
    {
      key: "savingsrequestdata",
      title: "Savings Request Data",
      desc: "Manage savings request data.",
      icon: <CurrencyDollar size={36} />,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="maintain-account-page">
      {view === "maintain" ? (
        <div>
          <div className="page-header">
            <h2>📊 Maintain Account</h2>
            <button
              className="back-btn"
              onClick={() => navigate("/dashboard")}
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
        <Suspense fallback={<div>Loading...</div>}>
          {renderSection()}
        </Suspense>
      )}
    </div>
  );
};

export default MaintainAccount;
