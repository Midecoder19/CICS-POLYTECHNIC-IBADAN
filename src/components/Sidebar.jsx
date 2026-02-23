import React, { useState, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  House,
  Gear,
  UserCircle,
  ChartBar,
  SignOut,
  List,
  X,
  CaretDown,
  CaretRight,
  Buildings,
  Users,
  Bank,
  ShoppingCart,
  Activity,
  Shield,
  Database,
  Moon,
  Sun,
} from "phosphor-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useFormContext } from "../contexts/FormContext.jsx";

const Sidebar = memo(({ onSelectSection, onCollapse, currentView, currentSection }) => {
  const { logout, user } = useAuth();
  const { hasUnsavedChanges } = useFormContext();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [expandedMenus, setExpandedMenus] = useState({
    common: false,
    account: false,
    "account-maintain": false,
    stock: false,
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      console.log('Applied dark theme');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      console.log('Applied light theme');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    console.log('Theme toggle clicked, current:', isDarkMode);
    setIsDarkMode(!isDarkMode);
  };

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapse) {
      onCollapse(newCollapsed);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleSubmenuClick = (menu, section) => {
    onSelectSection(menu, section);
    closeMobileSidebar();
  };

  const commonSubsections = [
    { key: "society", title: "Society Information", icon: <Buildings size={16} /> },
    { key: "financial", title: "Financial Period", icon: <Bank size={16} /> },
    { key: "backup", title: "Backup Data", icon: <Database size={16} /> },
    { key: "restore", title: "Restore Data", icon: <Database size={16} /> },
    { key: "security", title: "Security Settings", icon: <Shield size={16} /> },
    { key: "default", title: "Default Parameters", icon: <Gear size={16} /> },
  ];

  const accountSubsections = [
    { key: "maintain", title: "Maintain", icon: <Gear size={16} />, subItems: [
      { key: "organization", title: "Organization", icon: <Buildings size={14} /> },
      { key: "branch", title: "Branch", icon: <Buildings size={14} /> },
      { key: "department", title: "Department", icon: <Users size={14} /> },
      { key: "bank", title: "Bank", icon: <Bank size={14} /> },
      { key: "paycomponent", title: "Pay Component", icon: <Bank size={14} /> },
      { key: "transtype", title: "Transaction Type", icon: <Activity size={14} /> },
      { key: "loancategory", title: "Loan Category", icon: <Bank size={14} /> },
      { key: "journalcategory", title: "Journal Category", icon: <Activity size={14} /> },
      { key: "memberloanmaster", title: "Member Loan Master", icon: <Users size={14} /> },
      { key: "savingsrequestdata", title: "Savings Request Data", icon: <Bank size={14} /> },
    ]},
  ];

  const stockSubsections = [
    { key: "maintain", title: "Maintain", icon: <Gear size={16} />, subItems: [
      { key: "storeinfo", title: "Store Information", icon: <Buildings size={14} /> },
      { key: "essential", title: "Essential Commodity", icon: <ShoppingCart size={14} /> },
      { key: "supplierinfo", title: "Supplier Information", icon: <Users size={14} /> },
      { key: "supplierbalance", title: "Supplier Opening Balance", icon: <Bank size={14} /> },
      { key: "productsetup", title: "Product Setup", icon: <Gear size={14} />, subItems: [
        { key: "productinfo", title: "Product Information", icon: <ShoppingCart size={12} /> },
        { key: "productbalance", title: "Product Opening Balance", icon: <Bank size={12} /> }
      ] }
    ]},
    { key: "task", title: "Task", icon: <Activity size={16} />, subItems: [
      { key: "lpo", title: "Local Purchase Order", icon: <ShoppingCart size={14} /> },
      { key: "receipt", title: "Stock Receipt Voucher", icon: <Database size={14} /> },
      { key: "sales", title: "Stock Sales", icon: <ShoppingCart size={14} /> }
    ]},
    { key: "reports", title: "Reports", icon: <Activity size={16} /> },
  ];

  return (
    <>
      {/* Mobile overlay toggle button */}
      <button
        className="mobile-sidebar-toggle btn btn-primary rounded-circle shadow-lg d-md-none"
        onClick={toggleMobileSidebar}
        aria-label="Toggle sidebar"
      >
        <List size={20} />
      </button>

      {/* Mobile overlay background */}
      {isMobileOpen && (
        <div
          className="mobile-overlay position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 backdrop-blur-sm"
          onClick={closeMobileSidebar}
          style={{ zIndex: 1040 }}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-modern position-fixed start-0 top-0 h-100 bg-white shadow-lg d-flex flex-column ${
          isMobileOpen ? 'd-block' : 'd-none d-md-block'
        }`}
        style={{
          width: collapsed ? '5rem' : '18rem',
          zIndex: 1050,
          transition: 'width 0.3s ease-in-out'
        }}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header-modern p-4 border-bottom border-light">
          <div className="d-flex align-items-center justify-content-between">
            {!collapsed && (
              <div className="sidebar-logo">
                <h5 className="mb-0 fw-bold text-primary">Router Itech Limited</h5>
                <small className="text-muted">Cooperative System</small>
              </div>
            )}
            <button
              className="sidebar-collapse-btn btn btn-link text-muted p-1"
              onClick={toggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <List size={20} /> : <X size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="sidebar-nav flex-grow-1 p-3">
          {/* Dashboard Link */}
          <div className="sidebar-nav-item mb-3">
            <button
              className={`sidebar-nav-link w-100 d-flex align-items-center gap-3 px-3 py-3 rounded-3 text-start border-0 ${
                currentView === 'dashboard' ? 'active' : ''
              }`}
              onClick={() => handleSubmenuClick('dashboard', null)}
            >
              <div className="sidebar-nav-icon">
                <House size={20} />
              </div>
              {!collapsed && <span className="sidebar-nav-text fw-medium">Dashboard</span>}
            </button>
          </div>

          {/* Common Menu */}
          <div className="sidebar-nav-item mb-2">
            <button
              className={`sidebar-nav-link w-100 d-flex align-items-center gap-3 px-3 py-3 rounded-3 text-start border-0 ${
                currentView === 'common' ? 'active' : ''
              }`}
              onClick={() => toggleMenu("common")}
            >
              <div className="sidebar-nav-icon">
                <Gear size={20} />
              </div>
              {!collapsed && (
                <>
                  <span className="sidebar-nav-text fw-medium flex-grow-1">Common</span>
                  <div className={`sidebar-nav-arrow transition-all ${expandedMenus.common ? 'rotate-180' : ''}`}>
                    <CaretRight size={16} />
                  </div>
                </>
              )}
            </button>

            {expandedMenus.common && !collapsed && (
              <div className="sidebar-submenu-modern mt-2 ms-4">
                {commonSubsections.map((sub) => (
                  <button
                    key={sub.key}
                    className={`sidebar-submenu-item-modern w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-start border-0 mb-1 ${
                      currentView === 'common' && currentSection === sub.key ? 'active' : ''
                    }`}
                    onClick={() => handleSubmenuClick("common", sub.key)}
                  >
                    <div className="sidebar-submenu-icon text-muted">
                      {sub.icon}
                    </div>
                    <span className="sidebar-submenu-text small fw-medium">{sub.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Menu */}
          <div className="sidebar-nav-item mb-2">
            <button
              className={`sidebar-nav-link w-100 d-flex align-items-center gap-3 px-3 py-3 rounded-3 text-start border-0 ${
                currentView === 'account' ? 'active' : ''
              }`}
              onClick={() => toggleMenu("account")}
            >
              <div className="sidebar-nav-icon">
                <UserCircle size={20} />
              </div>
              {!collapsed && (
                <>
                  <span className="sidebar-nav-text fw-medium flex-grow-1">Account</span>
                  <div className={`sidebar-nav-arrow transition-all ${expandedMenus.account ? 'rotate-180' : ''}`}>
                    <CaretRight size={16} />
                  </div>
                </>
              )}
            </button>

            {expandedMenus.account && !collapsed && (
              <div className="sidebar-submenu-modern mt-2 ms-4">
                {accountSubsections.map((sub) => (
                  <div key={sub.key}>
                    {sub.subItems ? (
                      <div>
                        <button
                          className={`sidebar-submenu-item-modern w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-start border-0 mb-1 ${
                            currentView === 'account' && currentSection === sub.key ? 'active' : ''
                          }`}
                          onClick={() => handleSubmenuClick("account", sub.key)}
                        >
                          <div className="sidebar-submenu-icon text-muted">
                            {sub.icon}
                          </div>
                          <span className="sidebar-submenu-text small fw-medium flex-grow-1">{sub.title}</span>
                          <div
                            className={`sidebar-nav-arrow transition-all ${expandedMenus[`account-${sub.key}`] ? 'rotate-90' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(`account-${sub.key}`);
                            }}
                          >
                            <CaretRight size={14} />
                          </div>
                        </button>

                        {expandedMenus[`account-${sub.key}`] && (
                          <div className="sidebar-submenu-modern mt-1 ms-4">
                            {sub.subItems.map((subItem) => (
                              <button
                                key={subItem.key}
                                className={`sidebar-submenu-item-modern w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-start border-0 mb-1 ${
                                  currentView === 'account' && currentSection === subItem.key ? 'active' : ''
                                }`}
                                onClick={() => handleSubmenuClick("account", subItem.key)}
                              >
                                <div className="sidebar-submenu-icon text-muted">
                                  {subItem.icon}
                                </div>
                                <span className="sidebar-submenu-text small fw-medium">{subItem.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        className={`sidebar-submenu-item-modern w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-start border-0 mb-1 ${
                          currentView === 'account' && currentSection === sub.key ? 'active' : ''
                        }`}
                        onClick={() => handleSubmenuClick("account", sub.key)}
                      >
                        <div className="sidebar-submenu-icon text-muted">
                          {sub.icon}
                        </div>
                        <span className="sidebar-submenu-text small fw-medium">{sub.title}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock Menu - Admin Only */}
          {user?.role === 'admin' && (
            <div className="sidebar-nav-item mb-2">
              <button
                className={`sidebar-nav-link w-100 d-flex align-items-center gap-3 px-3 py-3 rounded-3 text-start border-0 ${
                  currentView === 'stock' ? 'active' : ''
                }`}
                onClick={() => toggleMenu("stock")}
              >
                <div className="sidebar-nav-icon">
                  <ChartBar size={20} />
                </div>
                {!collapsed && (
                  <>
                    <span className="sidebar-nav-text fw-medium flex-grow-1">Stock</span>
                    <div className={`sidebar-nav-arrow transition-all ${expandedMenus.stock ? 'rotate-180' : ''}`}>
                      <CaretRight size={16} />
                    </div>
                  </>
                )}
              </button>

              {expandedMenus.stock && !collapsed && (
                <div className="sidebar-submenu-modern mt-2 ms-4">
                  {stockSubsections.map((sub) => (
                    <div key={sub.key}>
                      {sub.subItems ? (
                        <div>
                          <button
                            className={`sidebar-submenu-item-modern w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-start border-0 mb-1 ${
                              currentView === 'stock' && currentSection === sub.key ? 'active' : ''
                            }`}
                            onClick={() => handleSubmenuClick("stock", sub.key)}
                          >
                            <div className="sidebar-submenu-icon text-muted">
                              {sub.icon}
                            </div>
                            <span className="sidebar-submenu-text small fw-medium flex-grow-1">{sub.title}</span>
                            <div
                              className={`sidebar-nav-arrow transition-all ${expandedMenus[`stock-${sub.key}`] ? 'rotate-90' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(`stock-${sub.key}`);
                              }}
                            >
                              <CaretRight size={14} />
                            </div>
                          </button>

                          {expandedMenus[`stock-${sub.key}`] && (
                            <div className="sidebar-submenu-modern mt-1 ms-4">
                              {sub.subItems.map((subItem) => (
                                <div key={subItem.key}>
                                  {subItem.subItems ? (
                                    <div>
                                      <button
                                        className={`sidebar-submenu-item-modern w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-start border-0 mb-1 ${
                                          currentView === 'stock' && currentSection === subItem.key ? 'active' : ''
                                        }`}
                                        onClick={() => toggleMenu(`stock-${sub.key}-${subItem.key}`)}
                                      >
                                        <div className="sidebar-submenu-icon text-muted">
                                          {subItem.icon}
                                        </div>
                                        <span className="sidebar-submenu-text small fw-medium flex-grow-1">{subItem.title}</span>
                                        <div className={`sidebar-nav-arrow transition-all ${expandedMenus[`stock-${sub.key}-${subItem.key}`] ? 'rotate-90' : ''}`}>
                                          <CaretRight size={12} />
                                        </div>
                                      </button>

                                      {expandedMenus[`stock-${sub.key}-${subItem.key}`] && (
                                        <div className="sidebar-submenu-modern mt-1 ms-4">
                                          {subItem.subItems.map((subSubItem) => (
                                            <button
                                              key={subSubItem.key}
                                              className={`sidebar-submenu-item-modern w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-start border-0 mb-1 ${
                                                currentView === 'stock' && currentSection === subSubItem.key ? 'active' : ''
                                              }`}
                                              onClick={() => handleSubmenuClick("stock", subSubItem.key)}
                                            >
                                              <div className="sidebar-submenu-icon text-muted">
                                                {subSubItem.icon}
                                              </div>
                                              <span className="sidebar-submenu-text small fw-medium">{subSubItem.title}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <button
                                      className={`sidebar-submenu-item-modern w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-start border-0 mb-1 ${
                                        currentView === 'stock' && currentSection === subItem.key ? 'active' : ''
                                      }`}
                                      onClick={() => handleSubmenuClick("stock", subItem.key)}
                                    >
                                      <div className="sidebar-submenu-icon text-muted">
                                        {subItem.icon}
                                      </div>
                                      <span className="sidebar-submenu-text small fw-medium">{subItem.title}</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          className={`sidebar-submenu-item-modern w-100 d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-start border-0 mb-1 ${
                            currentView === 'stock' && currentSection === sub.key ? 'active' : ''
                          }`}
                          onClick={() => handleSubmenuClick("stock", sub.key)}
                        >
                          <div className="sidebar-submenu-icon text-muted">
                            {sub.icon}
                          </div>
                          <span className="sidebar-submenu-text small fw-medium">{sub.title}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer-modern p-3 border-top border-light">
          <div className="user-info mb-3 text-center">
            {!collapsed && (
              <>
                <div className="user-avatar bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '40px', height: '40px' }}>
                  <Users size={20} />
                </div>
                <div className="user-details">
                  <div className="fw-semibold text-dark small">{user?.username || 'Admin'}</div>
                  <div className="text-muted small text-capitalize">{user?.role || 'Administrator'}</div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            className="sidebar-theme-btn w-100 d-flex align-items-center justify-content-center gap-2 px-3 py-2 rounded-3 border-0 mb-2 fw-medium"
            onClick={toggleTheme}
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#f8fafc',
              color: isDarkMode ? '#ffffff' : '#374151',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && (isDarkMode ? 'Light Mode' : 'Dark Mode')}
          </button>

          <button
            className="sidebar-logout-btn w-100 d-flex align-items-center justify-content-center gap-2 px-3 py-2 rounded-3 border-0 text-danger fw-medium"
            onClick={() => {
              if (hasUnsavedChanges()) {
                const confirmLogout = window.confirm('You have unsaved changes. Do you want to save them before logging out?');
                if (confirmLogout) {
                  alert('Please save your changes first.');
                  return;
                }
              }
              logout();
              window.location.href = '/login';
            }}
          >
            <SignOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
