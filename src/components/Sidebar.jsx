import React, { useState, memo } from "react";
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
} from "phosphor-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useFormContext } from "../contexts/FormContext.jsx";
import "../components/Sidebar.css";

const Sidebar = memo(({ onSelectSection, onCollapse, currentView, currentSection }) => {
  const { logout } = useAuth();
  const { hasUnsavedChanges } = useFormContext();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    common: false,
    account: false,
    stock: false,
  });

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
    closeMobileSidebar(); // Close sidebar on mobile after selection
  };

  const commonSubsections = [
    { key: "society", title: "Society Information" },
    { key: "financial", title: "Financial Period" },
    { key: "backup", title: "Backup Data" },
    { key: "restore", title: "Restore Data" },
    { key: "security", title: "Security Settings" },
    { key: "default", title: "Default Parameters" },
  ];

  const accountSubsections = [
    { key: "usermanagement", title: "User Management" },
    { key: "roles", title: "Roles" },
    { key: "permissions", title: "Permissions" },
    { key: "organization", title: "Organization" },
    { key: "branch", title: "Branch" },
    { key: "department", title: "Department" },
    { key: "bank", title: "Bank" },
    { key: "paycomponent", title: "Pay Component" },
    { key: "transtype", title: "Transaction Type" },
    { key: "loancategory", title: "Loan Category" },
    { key: "journalcategory", title: "Journal Category" },
    { key: "memberloanmaster", title: "Member Loan Master" },
    { key: "savingsrequestdata", title: "Savings Request Data" },
  ];

  const stockSubsections = [
    { key: "maintain", title: "Maintain", subItems: [
      { key: "storeinfo", title: "Store Information" },
      { key: "essential", title: "Essential Commodity" },
      { key: "supplierinfo", title: "Supplier Information" },
      { key: "supplierbalance", title: "Supplier Opening Balance" },
      { key: "productsetup", title: "Product Setup", subItems: [
        { key: "productinfo", title: "Product Information" },
        { key: "productbalance", title: "Product Opening Balance" }
      ] }
    ]},
    { key: "task", title: "Task", subItems: [
      { key: "lpo", title: "Local Purchase Order" },
      { key: "receipt", title: "Stock Receipt Voucher" },
      { key: "sales", title: "Stock Sales/Issues Voucher" }
    ]},
    { key: "reports", title: "Reports" },
  ];

  return (
    <div>
      {/* Mobile overlay toggle button */}
      <button className="mobile-sidebar-toggle" onClick={toggleMobileSidebar} tabIndex="0">
        <List size={24} />
      </button>

      {/* Mobile overlay background */}
      {isMobileOpen && <div className="mobile-overlay" onClick={closeMobileSidebar}></div>}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${isMobileOpen ? "open" : ""}`}>
        <div className="logo-area">
          <h2>{!collapsed && "Routers"}</h2>
          <button className="toggle-btn" onClick={toggleCollapse} tabIndex="0">
            {collapsed ? <List size={22} /> : <X size={22} />}
          </button>
        </div>

      <div className="sidebar-menu">
        <button className="sidebar-link active" tabIndex="0">
          <House size={20} />
          <span>Dashboard</span>
        </button>

        {/* Common Menu */}
        <div className={`sidebar-menu-group ${expandedMenus.common ? "expanded" : ""}`}>
          <button className="sidebar-link" onClick={() => toggleMenu("common")} tabIndex="0">
            <UserCircle size={20} />
            <span>Common</span>
            {!collapsed && (expandedMenus.common ? <CaretDown size={16} /> : <CaretRight size={16} />)}
          </button>
          {expandedMenus.common && !collapsed && (
            <div className="submenu">
              {commonSubsections.map((sub) => (
                <button
                  key={sub.key}
                  className="submenu-link"
                  onClick={() => handleSubmenuClick("common", sub.key)}
                >
                  {sub.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account Menu */}
        <div className={`sidebar-menu-group ${expandedMenus.account ? "expanded" : ""}`}>
          <button className="sidebar-link" onClick={() => toggleMenu("account")} tabIndex="0">
            <ChartBar size={20} />
            <span>Account</span>
            {!collapsed && (expandedMenus.account ? <CaretDown size={16} /> : <CaretRight size={16} />)}
          </button>
          {expandedMenus.account && !collapsed && (
            <div className="submenu">
              {accountSubsections.map((sub) => (
                <button
                  key={sub.key}
                  className="submenu-link"
                  onClick={() => handleSubmenuClick("account", sub.key)}
                >
                  {sub.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stock Menu */}
        <div className={`sidebar-menu-group ${expandedMenus.stock ? "expanded" : ""}`}>
          <button className="sidebar-link" onClick={() => toggleMenu("stock")} tabIndex="0">
            <Gear size={20} />
            <span>Stock</span>
            {!collapsed && (expandedMenus.stock ? <CaretDown size={16} /> : <CaretRight size={16} />)}
          </button>
          {expandedMenus.stock && !collapsed && (
            <div className="submenu">
              {stockSubsections.map((sub) => (
                <div key={sub.key}>
                  {sub.subItems ? (
                    <div className="submenu-group">
                      <div className="submenu-link with-icon clickable-parent">
                        <button
                          className="submenu-link-main"
                          onClick={() => handleSubmenuClick("stock", sub.key)}
                        >
                          {sub.title}
                        </button>
                        <button
                          className="submenu-toggle-btn"
                          onClick={() => toggleMenu(`stock-${sub.key}`)}
                        >
                          <CaretRight
                            size={14}
                            className={`submenu-toggle-icon ${expandedMenus[`stock-${sub.key}`] ? 'rotated' : ''}`}
                          />
                        </button>
                      </div>
                      {expandedMenus[`stock-${sub.key}`] && (
                        <div className="sub-submenu">
                          {sub.subItems.map((subItem) => (
                            <div key={subItem.key}>
                              {subItem.subItems ? (
                                <div className="submenu-group">
                                  <button
                                    className="sub-submenu-link with-icon"
                                    onClick={() => toggleMenu(`stock-${sub.key}-${subItem.key}`)}
                                  >
                                    {subItem.title}
                                    <CaretRight
                                      size={12}
                                      className={`submenu-toggle-icon ${expandedMenus[`stock-${sub.key}-${subItem.key}`] ? 'rotated' : ''}`}
                                    />
                                  </button>
                                  {expandedMenus[`stock-${sub.key}-${subItem.key}`] && (
                                    <div className="sub-sub-submenu">
                                      {subItem.subItems.map((subSubItem) => (
                                        <button
                                          key={subSubItem.key}
                                          className="sub-sub-submenu-link"
                                          onClick={() => handleSubmenuClick("stock", subSubItem.key)}
                                        >
                                          {subSubItem.title}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  className="sub-submenu-link"
                                  onClick={() => handleSubmenuClick("stock", subItem.key)}
                                >
                                  {subItem.title}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      className="submenu-link"
                      onClick={() => handleSubmenuClick("stock", sub.key)}
                    >
                      {sub.title}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => {
            if (hasUnsavedChanges()) {
              const confirmLogout = window.confirm('You have unsaved changes. Do you want to save them before logging out?');
              if (confirmLogout) {
                // User chose to save, but since we can't save automatically, just alert
                alert('Please save your changes first.');
                return;
              }
            }
            logout();
            window.location.href = '/login';
          }}
          tabIndex="0"
        >
          <SignOut size={18} /> <span>Logout</span>
        </button>
      </div>
    </aside>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
