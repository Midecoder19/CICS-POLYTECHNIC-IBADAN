import React, { useState, lazy, Suspense } from "react";
import { withRouter } from "../utils/withRouter.jsx";
import { motion } from "framer-motion";
import { Gear, UserCircle, ChartBar, MagnifyingGlass } from "phosphor-react";
import Sidebar from "../components/Sidebar";
import "../pages/Dashboard.css";
import { useFormContext } from "../contexts/FormContext.jsx";

// Lazy load section components for better performance
const SocietyInfo = lazy(() => import("./CommonPage/sections/SocietyInfo"));
const FinancialPeriod = lazy(() => import("./CommonPage/sections/FinancialPeriod"));
const BackupData = lazy(() => import("./CommonPage/sections/BackupData"));
const Restore = lazy(() => import("./CommonPage/sections/Restore"));
const Security = lazy(() => import("./CommonPage/sections/Security"));
const DefaultParameter = lazy(() => import("./CommonPage/sections/DefaultParameter"));
const UserManagement = lazy(() => import("./AccountPage/sections/UserManagement"));
const Roles = lazy(() => import("./AccountPage/sections/Roles"));
const Permissions = lazy(() => import("./AccountPage/sections/Permissions"));
const Organization = lazy(() => import("./AccountPage/sections/Organization"));
const Branch = lazy(() => import("./AccountPage/sections/Branch"));
const Department = lazy(() => import("./AccountPage/sections/Department"));
const Bank = lazy(() => import("./AccountPage/sections/Bank"));
const PayComponent = lazy(() => import("./AccountPage/sections/PayComponent"));
const TransType = lazy(() => import("./AccountPage/sections/TransType"));
const LoanCategory = lazy(() => import("./AccountPage/sections/LoanCategory"));
const JournalCategory = lazy(() => import("./AccountPage/sections/JournalCategory"));
const MemberLoanMaster = lazy(() => import("./AccountPage/sections/MemberLoanMaster"));
const SavingsRequestData = lazy(() => import("./AccountPage/sections/SavingsRequestData"));
const StoreInformation = lazy(() => import("./StockPage/sections/StoreInformation"));
const EssentialCommodity = lazy(() => import("./StockPage/sections/EssentialCommodity"));
const SupplierInformation = lazy(() => import("./StockPage/sections/SupplierInformation"));
const SupplierOpeningBalance = lazy(() => import("./StockPage/sections/SupplierOpeningBalance"));
const ProductSetup = lazy(() => import("./StockPage/sections/ProductSetup"));
const MaintainStock = lazy(() => import("./StockPage/sections/MaintainStock"));
const ProductOpeningBalance = lazy(() => import("./StockPage/sections/ProductOpeningBalance"));
const ProductInformation = lazy(() => import("./StockPage/sections/ProductInformation"));
const LPO = lazy(() => import("./StockPage/sections/LPO"));
const StockReceiptVoucher = lazy(() => import("./StockPage/sections/StockReceiptVoucher"));

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("dashboard"); // "dashboard", "common", "account", "stock"
  const [selectedSection, setSelectedSection] = useState(null); // e.g., "society", "usermanagement", etc.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { hasUnsavedChanges } = useFormContext();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle tile click to switch to section view
  const handleTileClick = (tileName) => {
    if (hasUnsavedChanges()) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      );
      if (!confirmLeave) return;
    }
    const lower = tileName.toLowerCase();
    setView(lower);
    if (lower === "common") {
      setSelectedSection("society");
    } else if (lower === "account") {
      setSelectedSection("usermanagement");
    } else if (lower === "stock") {
      setSelectedSection("maintain");
    } else {
      setSelectedSection(null);
    }
  };

  // Handle sidebar submenu selection
  const handleSelectSection = (menu, section) => {
    if (hasUnsavedChanges()) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      );
      if (!confirmLeave) return;
    }
    setView(menu);
    setSelectedSection(section);
  };

  // Handle sidebar collapse state
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Render the selected section component
  const renderSection = () => {
    if (view === "common") {
      switch (selectedSection) {
        case "society":
          return <SocietyInfo />;
        case "financial":
          return <FinancialPeriod />;
        case "backup":
          return <BackupData />;
        case "restore":
          return <Restore />;
        case "security":
          return <Security />;
        case "default":
          return <DefaultParameter />;
        default:
          return <div>Select a Common section from the sidebar.</div>;
      }
    } else if (view === "account") {
      switch (selectedSection) {
        case "usermanagement":
          return <UserManagement />;
        case "roles":
          return <Roles />;
        case "permissions":
          return <Permissions />;
        case "organization":
          return <Organization />;
        case "branch":
          return <Branch />;
        case "department":
          return <Department />;
        case "bank":
          return <Bank />;
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
          return <div>Select an Account section from the sidebar.</div>;
      }
    } else if (view === "stock") {
      switch (selectedSection) {
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
        case "maintainstock":
          return <MaintainStock />;
        case "productbalance":
          return <ProductOpeningBalance />;
        case "productinfo":
          return <ProductInformation />;
        case "lpo":
          return <LPO />;
        case "receipt":
          return <StockReceiptVoucher />;
        default:
          return <div>Select a Stock section from the sidebar.</div>;
      }
    }
    return null;
  };

  const tiles = [
    {
      name: "Common",
      icon: <Gear size={36} />,
      desc: "Manage system configurations and settings.",
      color: "#3b82f6",
    },
    {
      name: "Account",
      icon: <UserCircle size={36} />,
      desc: "View and manage accounts and users.",
      color: "#10b981",
    },
    {
      name: "Stock",
      icon: <ChartBar size={36} />,
      desc: "Track stock levels and analytics.",
      color: "#f59e0b",
    },
  ];

  const filteredTiles = tiles.filter(
    (tile) =>
      tile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <Sidebar
        onSelectSection={handleSelectSection}
        onCollapse={handleSidebarCollapse}
        currentView={view}
        currentSection={selectedSection}
      />

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {view === "dashboard" ? (
          <div>
            {/* === Header Section === */}
            <div className="common-dashboard-header">
              <div>
                <h1>Dashboard</h1>
                <p>Welcome back, Admin 👋</p>
              </div>

              <div className="header-right">
                <div className="search-bar">
                  <MagnifyingGlass size={18} />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    tabIndex="0"
                  />
                </div>
              </div>
            </div>

            {/* === Tiles Section === */}
            <div className="common-dashboard-grid">
              {filteredTiles.map((tile, index) => (
                <motion.div
                  key={index}
                  className="common-dashboard-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleTileClick(tile.name)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="dashboard-card-icon"
                    style={{
                      backgroundColor: `${tile.color}20`,
                      color: tile.color,
                    }}
                  >
                    {tile.icon}
                  </div>
                  <div className="dashboard-card-info">
                    <h3>{tile.name}</h3>
                    <p>{tile.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Back to Dashboard Button */}
            <button
              onClick={() => {
                if (hasUnsavedChanges()) {
                  const confirmLeave = window.confirm(
                    "You have unsaved changes. Are you sure you want to leave this page?"
                  );
                  if (!confirmLeave) return;
                }
                setView("dashboard");
                setSelectedSection(null);
              }}
              style={{
                margin: "1rem",
                padding: "0.5rem 1rem",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text)",
                cursor: "pointer",
              }}
              tabIndex="0"
            >
              Back to Dashboard
            </button>

            {/* Render Selected Section with Suspense for lazy loading */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 'calc(100vh - 200px)' }}>
              <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
                {renderSection()}
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withRouter(Dashboard);
