import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gear, UserCircle, ChartBar, MagnifyingGlass, ArrowLeft, Activity, Users, TrendUp, Calendar, Clock, CheckCircle, CurrencyDollar } from "phosphor-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { useFormContext } from "../contexts/FormContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import "./Dashboard.css";

// Section components
import SocietyInfo from "./CommonPage/sections/SocietyInfo";
import FinancialPeriod from "./CommonPage/sections/FinancialPeriod";
import BackupData from "./CommonPage/sections/BackupData";
import Restore from "./CommonPage/sections/Restore";
import Security from "./CommonPage/sections/Security";
import DefaultParameter from "./CommonPage/sections/DefaultParameter";
import MaintainAccount from "./AccountPage/sections/MaintainAccount";
import Organization from "./AccountPage/sections/Organization";
import Branch from "./AccountPage/sections/Branch";
import Department from "./AccountPage/sections/Department";
import Bank from "./AccountPage/sections/Bank";
import PayComponent from "./AccountPage/sections/PayComponent";
import TransType from "./AccountPage/sections/TransType";
import LoanCategory from "./AccountPage/sections/LoanCategory";
import JournalCategory from "./AccountPage/sections/JournalCategory";
import MemberLoanMaster from "./AccountPage/sections/MemberLoanMaster";
import SavingsRequestData from "./AccountPage/sections/SavingsRequestData";
import MaintainStock from "./StockPage/sections/MaintainStock";
import StoreInformation from "./StockPage/sections/StoreInformation";
import EssentialCommodity from "./StockPage/sections/EssentialCommodity";
import SupplierInformation from "./StockPage/sections/SupplierInformation";
import SupplierOpeningBalance from "./StockPage/sections/SupplierOpeningBalance";
import ProductSetup from "./StockPage/sections/ProductSetup";
import ProductInformation from "./StockPage/sections/ProductInformation";
import ProductOpeningBalance from "./StockPage/sections/ProductOpeningBalance";
import LPO from "./StockPage/sections/LPO";
import StockReceiptVoucher from "./StockPage/sections/StockReceiptVoucher";
import StockSales from "./StockPage/sections/StockSales";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [error, setError] = useState(null);

  // Get URL parameters
  const { "*": sectionPath } = useParams();
  const location = useLocation();

  // Parse the section path to determine view and section
  const pathParts = sectionPath ? sectionPath.split('/') : [];
  const view = pathParts[0] || "dashboard";
  const selectedSection = pathParts[1] || null;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Error boundary for debugging
  useEffect(() => {
    const handleError = (event) => {
      console.error('Dashboard Error:', event.error);
      setError(event.error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const { hasUnsavedChanges } = useFormContext();
  const { user } = useAuth();

  // Enhanced debugging
  useEffect(() => {
    console.log('Dashboard Debug - User:', user);
    console.log('Dashboard Debug - View:', view);
    console.log('Dashboard Debug - Selected Section:', selectedSection);
    console.log('Dashboard Debug - User Role:', user?.role);
    console.log('Dashboard Debug - Path:', sectionPath);
  }, [user, view, selectedSection, sectionPath]);

  // Calculate margin based on screen size and sidebar state
  const getMarginLeft = () => {
    if (windowWidth <= 768) return 0; // No margin on mobile
    if (windowWidth <= 1024) return sidebarCollapsed ? 80 : 200; // Tablet
    return sidebarCollapsed ? 80 : 240; // Desktop
  };

  // Statistics data for the dashboard - Single color scheme (Professional Blue)
  const stats = [
    {
      title: "Total Members",
      value: "2,847",
      change: "+12.5%",
      changeType: "positive",
      icon: <Users size={24} />,
      color: "#1e40af"
    },
    {
      title: "Active Loans",
      value: "₦45.2M",
      change: "+8.2%",
      changeType: "positive",
      icon: <CurrencyDollar size={24} />,
      color: "#1e40af"
    },
    {
      title: "Monthly Savings",
      value: "₦12.8M",
      change: "+15.3%",
      changeType: "positive",
      icon: <TrendUp size={24} />,
      color: "#1e40af"
    },
    {
      title: "Platform Health",
      value: "98.5%",
      change: "System OK",
      changeType: "positive",
      icon: <Activity size={24} />,
      color: "#1e40af"
    }
  ];

  const quickActions = [
    {
      title: "New Member",
      desc: "Register a new member",
      icon: <Users size={20} />,
      color: "#1e40af",
      action: () => handleTileClick("account", "maintain")
    },
    {
      title: "Process Loan",
      desc: "Create new loan application",
      icon: <CurrencyDollar size={20} />,
      color: "#1e40af",
      action: () => handleTileClick("account", "memberloanmaster")
    },
    {
      title: "Stock Update",
      desc: "Update inventory",
      icon: <ChartBar size={20} />,
      color: "#1e40af",
      action: () => handleTileClick("stock", "maintain")
    }
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle tile click to switch to section view
  const handleTileClick = (newView, section = null) => {
    if (hasUnsavedChanges()) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      );
      if (!confirmLeave) return;
    }
    // Navigate to the appropriate route within dashboard
    if (newView === "dashboard") {
      navigate("/dashboard");
    } else if (section) {
      navigate(`/dashboard/${newView}/${section}`);
    } else {
      navigate(`/dashboard/${newView}`);
    }
  };

  // Handle sidebar collapse
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Handle section selection from sidebar
  const handleSectionSelect = (view, section) => {
    handleTileClick(view, section);
  };

  // Use useNavigate hook
  const navigate = useNavigate();

  const allTiles = [
    // Main category tiles - role-based access
    {
      key: "common",
      view: "common",
      title: "Common Settings",
      desc: "System configuration, financial periods, backup & security settings.",
      color: "#1e40af",
      icon: <Gear size={36} />,
      sections: 6,
      features: ["Society Info", "Financial Periods", "Backup/Restore", "Security", "Parameters"],
      roles: ['admin', 'staff', 'member'] // Available to admin, staff, and members
    },
    {
      key: "account",
      view: "account",
      title: "Account Management",
      desc: "Complete financial operations, member accounts, and loan management.",
      color: "#1e40af",
      icon: <UserCircle size={36} />,
      sections: 11,
      features: ["Organization", "Branches", "Loans", "Savings", "Reports"],
      roles: ['admin'] // Only available to admin
    },
    {
      key: "stock",
      view: "stock",
      title: "Stock Management",
      desc: "Inventory control, supplier management, and stock operations.",
      color: "#1e40af",
      icon: <ChartBar size={36} />,
      sections: 10,
      features: ["Store Info", "Products", "Suppliers", "LPO", "Receipts"],
      roles: ['admin', 'staff', 'member'] // Available to admin, staff, and members
    },
  ];

  const filteredTiles = allTiles.filter(
    (tile) => {
      // Role-based access control using roles array
      const userRole = user?.role;
      
      // If no user, don't show any tiles
      if (!userRole) {
        return false;
      }
      
      const hasAccess = tile.roles.includes(userRole);

      // Also filter by search query
      const matchesSearch = searchQuery === '' ||
                           tile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tile.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tile.features.some(feature =>
                             feature.toLowerCase().includes(searchQuery.toLowerCase())
                           );

      return hasAccess && matchesSearch;
    }
  );

  // Function to render section components
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
          return null;
      }
    } else if (view === "account") {
      switch (selectedSection) {
        case "maintain":
          return <MaintainAccount />;
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
          return null;
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
          return null;
      }
    }
    return null;
  };

  // Function to get sub-tiles for each view - Consistent color scheme
  const getSubTiles = (view) => {
    if (view === "common") {
      return [
        { key: "society", title: "Society Info", desc: "Manage society information.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "financial", title: "Financial Period", desc: "Set financial periods.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "backup", title: "Backup Data", desc: "Backup system data.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "restore", title: "Restore Data", desc: "Restore system data.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "security", title: "Security", desc: "Manage security settings.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "default", title: "Default Parameter", desc: "Set default parameters.", color: "#1e40af", icon: <Gear size={24} /> },
      ];
    } else if (view === "account") {
      return [
        { key: "maintain", title: "Maintain Account", desc: "Maintain account details.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "organization", title: "Organization", desc: "Manage organization.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "branch", title: "Branch", desc: "Manage branches.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "department", title: "Department", desc: "Manage departments.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "bank", title: "Bank", desc: "Manage banks.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "paycomponent", title: "Pay Component", desc: "Manage pay components.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "transtype", title: "Transaction Type", desc: "Define transaction types.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "loancategory", title: "Loan Category", desc: "Manage loan categories.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "journalcategory", title: "Journal Category", desc: "Manage journal categories.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "memberloanmaster", title: "Member Loan Master", desc: "Manage member loans.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "savingsrequestdata", title: "Savings Request Data", desc: "Handle savings requests.", color: "#1e40af", icon: <Gear size={24} /> },
      ];
    } else if (view === "stock") {
      return [
        { key: "maintain", title: "Maintain Stock", desc: "Maintain stock details.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "storeinfo", title: "Store Information", desc: "Manage store info.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "essential", title: "Essential Commodity", desc: "Handle essentials.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "supplierinfo", title: "Supplier Information", desc: "Manage suppliers.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "supplierbalance", title: "Supplier Opening Balance", desc: "Set supplier balances.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "productsetup", title: "Product Setup", desc: "Setup products.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "productbalance", title: "Product Opening Balance", desc: "Set product balances.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "productinfo", title: "Product Information", desc: "Manage product info.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "lpo", title: "LPO", desc: "Manage LPOs.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "receipt", title: "Stock Receipt Voucher", desc: "Handle receipts.", color: "#1e40af", icon: <Gear size={24} /> },
        { key: "stocksales", title: "Stock Sales", desc: "Manage stock sales.", color: "#1e40af", icon: <Gear size={24} /> },
      ];
    }
    return [];
  };

  return (
    <div className="dashboard-container">
      {/* Error Display */}
      {error && (
        <div className="alert alert-danger m-3">
          <strong>Error:</strong> {error}
          <button 
            className="btn btn-sm btn-outline-light ms-2" 
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <Sidebar
        onSelectSection={handleSectionSelect}
        onCollapse={handleSidebarCollapse}
        currentView={view}
        currentSection={selectedSection}
      />

      <div
        className="dashboard-content"
        style={{ marginLeft: getMarginLeft() }}
      >
        <Topbar />

        <main className="flex-fill" style={{ padding: '12px 12px 0 12px' }}>
          {view === "dashboard" || !view ? (
            <>
              {/* Combined Dashboard Hero Section */}
              <div className="dashboard-hero-section">
                <div className="dashboard-hero-container">
                  <div className="dashboard-hero-overlay">
                    <div className="dashboard-hero-content">
                      <div className="hero-text-section">
                        <h1 className="hero-title">Dashboard Overview</h1>
                        <p className="hero-subtitle">Transform your cooperative society with powerful management tools and real-time insights.</p>
                        <h2 className="hero-management-title">Advanced Cooperative Management</h2>
                        <p className="hero-management-desc">Streamline operations, boost productivity, and drive growth with our comprehensive suite of tools</p>
                        <div className="dashboard-features">
                          <span className="feature-badge">
                            <CheckCircle size={16} />
                            Real-time Analytics
                          </span>
                          <span className="feature-badge">
                            <CheckCircle size={16} />
                            Secure Transactions
                          </span>
                          <span className="feature-badge">
                            <CheckCircle size={16} />
                            Automated Reports
                          </span>
                          <span className="feature-badge">
                            <CheckCircle size={16} />
                            Member Management
                          </span>
                        </div>
                      </div>
                      <div className="hero-search-section">
                        <div className="dashboard-search">
                          <MagnifyingGlass size={20} className="text-muted" />
                          <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-hero-bg"></div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className={`row g-4 mb-5 statistics-grid ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                {stats.map((stat, index) => (
                  <div key={index} className={`stat-col ${sidebarCollapsed ? 'col-xl-4 col-lg-4 col-md-6' : 'col-xl-4 col-md-6'}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                    >
                      <div className="dashboard-tile stat-card">
                        <div className="stat-bg position-absolute top-0 end-0 opacity-5">
                          <div className="bg-primary rounded-circle" style={{ width: '80px', height: '80px', marginTop: '-40px', marginRight: '-40px' }}></div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="stat-icon bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                            {stat.icon}
                          </div>
                          <div className={`stat-change badge ${stat.changeType === 'positive' ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${stat.changeType === 'positive' ? 'text-success' : 'text-danger'} fw-semibold px-2 py-1`}>
                            {stat.change}
                          </div>
                        </div>
                        <h3 className="stat-value fw-bold text-dark mb-1">{stat.value}</h3>
                        <p className="stat-title text-muted mb-0 small fw-medium">{stat.title}</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mb-5">
                <h2 className="h4 fw-bold text-dark mb-4">Quick Actions</h2>
                <p className="text-muted mb-4">Access frequently used features instantly</p>

                <div className="row g-3 justify-content-center">
                  {quickActions.map((action, index) => (
                    <div key={index} className="col-xl-4 col-md-6 col-sm-12">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                      >
                        <div
                          className="dashboard-tile cursor-pointer hover-lift"
                          onClick={action.action}
                          style={{ transition: 'all 0.3s ease' }}
                        >
                          <div className="action-icon bg-primary bg-opacity-10 text-primary rounded-3 p-3 mb-3 d-inline-flex">
                            {action.icon}
                          </div>
                          <h6 className="action-title fw-semibold text-dark mb-2">{action.title}</h6>
                          <p className="action-desc text-muted small mb-0">{action.desc}</p>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module Tiles */}
              <div>
                <div className="text-center mb-5">
                  <h2 className="h3 fw-bold text-dark mb-3">Management Modules</h2>
                  <p className="text-muted mb-4">Professional tools for cooperative society management</p>
                  {user?.role === 'staff' && (
                    <div className="alert alert-info d-inline-block mb-4">
                      <small className="fw-medium">
                        <span className="me-2">👤</span>
                        Staff Access: Common Settings & Stock Management
                      </small>
                    </div>
                  )}
                </div>

                <div className="row g-4 justify-content-center module-tiles-row">
                  {filteredTiles.map((tile, index) => (
                    <div key={tile.key} className="col-xl-4 col-lg-4 col-md-6">
                      <motion.div
                        className="h-100"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                      >
                        <div
                          className="dashboard-tile cursor-pointer position-relative overflow-hidden module-card h-100"
                          onClick={() => handleTileClick(tile.view)}
                          style={{ minHeight: '380px' }}
                        >
                          {/* Background Gradient */}
                          <div className="module-gradient-bg position-absolute top-0 end-0 opacity-10">
                            <div
                              className="rounded-circle"
                              style={{
                                width: '150px',
                                height: '150px',
                                marginTop: '-75px',
                                marginRight: '-75px',
                                background: `linear-gradient(135deg, #1e40af20, #1e40af10)`
                              }}
                            ></div>
                          </div>

                          {/* Main Content */}
                          <div className="position-relative z-index-2">
                            {/* Icon Section */}
                            <div className="text-center mb-4">
                              <div
                                className="module-icon-wrapper d-inline-flex align-items-center justify-content-center rounded-4 shadow-lg"
                                style={{
                                  width: '90px',
                                  height: '90px',
                                  background: `linear-gradient(135deg, #1e40af15, #1e40af25)`,
                                  color: '#1e40af',
                                  border: `3px solid #1e40af30`
                                }}
                              >
                                {React.cloneElement(tile.icon, { size: 42 })}
                              </div>
                            </div>

                            {/* Title and Description */}
                            <div className="text-center mb-4">
                              <h5 className="module-title fw-bold text-dark mb-3 fs-4">{tile.title}</h5>
                              <p className="module-desc text-muted mb-0 lh-base px-2">{tile.desc}</p>
                            </div>

                            {/* Features Preview */}
                            <div className="mb-4">
                              <div className="d-flex flex-wrap justify-content-center gap-1">
                                {tile.features.slice(0, 3).map((feature, idx) => (
                                  <span
                                    key={idx}
                                    className="badge feature-badge"
                                    style={{
                                      backgroundColor: `${tile.color}15`,
                                      color: tile.color,
                                      border: `1px solid ${tile.color}25`
                                    }}
                                  >
                                    {feature}
                                  </span>
                                ))}
                                {tile.features.length > 3 && (
                                  <span className="badge bg-light text-muted">
                                    +{tile.features.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Footer with Stats */}
                            <div className="d-flex justify-content-between align-items-center pt-3 border-top border-light">
                              <div className="d-flex align-items-center">
                                <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2">
                                  {tile.sections} Sections
                                </span>
                              </div>
                              <div className="text-end">
                                <small className="text-muted fw-medium">
                                  {tile.roles.includes('staff') && tile.roles.includes('admin') ? 'All Roles' :
                                   tile.roles.includes('admin') ? 'Admin Only' : 'Staff Access'}
                                </small>
                              </div>
                            </div>
                          </div>

                          {/* Hover Effect Overlay */}
                          <div className="module-hover-overlay position-absolute top-0 start-0 w-100 h-100 opacity-0">
                            <div className="d-flex align-items-center justify-content-center h-100">
                              <div className="text-center">
                                <div className="mb-3">
                                  <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      background: `linear-gradient(135deg, ${tile.color}, ${tile.color}dd)`,
                                      color: 'white'
                                    }}
                                  >
                                    <ArrowLeft size={24} style={{ transform: 'rotate(180deg)' }} />
                                  </div>
                                </div>
                                <h6 className="text-white fw-bold mb-0">Explore {tile.title}</h6>
                                <small className="text-white-50">Click to access</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : selectedSection ? (
            <div className="flex-fill">
              {/* Render the selected section component */}
              {renderSection()}
            </div>
          ) : (
            <div className="flex-fill">
              {/* Back Button */}
              <div className="mb-4">
                <button
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  onClick={() => handleTileClick("dashboard")}
                >
                  <ArrowLeft size={16} />
                  Back to Dashboard
                </button>
              </div>

              {/* Sub-module Tiles */}
              <div className="row g-4">
                {getSubTiles(view).map((subTile) => (
                  <div key={subTile.key} className="col-xl-3 col-md-4 col-sm-6">
                    <div
                      className="dashboard-tile cursor-pointer"
                      onClick={() => handleTileClick(view, subTile.key)}
                      style={{ transition: 'transform 0.2s ease-in-out' }}
                    >
                      <div className="text-center">
                        <div
                          className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2 shadow-sm"
                          style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: `${subTile.color}20`,
                            color: subTile.color
                          }}
                        >
                          {React.cloneElement(subTile.icon, { size: 24 })}
                        </div>
                        <h6 className="card-title fw-semibold text-dark mb-1 small">{subTile.title}</h6>
                        <p className="card-text text-muted mb-0" style={{ fontSize: '0.75rem' }}>{subTile.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <div style={{ padding: '0 0 12px 0' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
