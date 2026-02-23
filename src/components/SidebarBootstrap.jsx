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

const Sidebar = memo(({ onSelectSection, onCollapse, currentView, currentSection }) => {
  const { logout, user } = useAuth();
  const { hasUnsavedChanges } = useFormContext();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    common: false,
    account: false,
    "account-maintain": false,
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
    { key: "maintain", title: "Maintain", subItems: [
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
    ]},
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
    <>
      {/* Mobile overlay toggle button */}
      <button
        className="btn btn-primary d-md-none position-fixed top-50 start-0 translate-middle-y ms-2"
        onClick={toggleMobileSidebar}
        style={{ zIndex: 1050 }}
      >
        <List size={20} />
      </button>

      {/* Mobile overlay background */}
      {isMobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 1040 }}
          onClick={closeMobileSidebar}
        ></div>
      )}

      <nav
        className={`bg-white border-end vh-100 d-flex flex-column ${isMobileOpen ? 'position-fixed start-0 top-0' : 'd-none d-md-flex'} ${collapsed ? 'collapsed' : ''}`}
        style={{
          width: collapsed ? '80px' : '280px',
          zIndex: 1045,
          transition: 'width 0.3s ease'
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <h5 className={`mb-0 fw-bold text-primary ${collapsed ? 'd-none' : ''}`}>Payroll</h5>
          <button
            className="btn btn-link p-0 text-muted"
            onClick={toggleCollapse}
          >
            {collapsed ? <List size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Menu */}
        <div className="flex-fill overflow-auto p-2">
          {/* Dashboard */}
          <button className="btn btn-link w-100 text-start d-flex align-items-center gap-3 p-3 mb-1 rounded text-decoration-none">
            <House size={20} />
            <span className={collapsed ? 'd-none' : ''}>Dashboard</span>
          </button>

          {/* Common Menu */}
          <div className="mb-2">
            <button
              className="btn btn-link w-100 text-start d-flex align-items-center justify-content-between p-3 rounded text-decoration-none"
              onClick={() => toggleMenu("common")}
            >
              <div className="d-flex align-items-center gap-3">
                <UserCircle size={20} />
                <span className={collapsed ? 'd-none' : ''}>Common</span>
              </div>
              {!collapsed && (
                expandedMenus.common ? <CaretDown size={16} /> : <CaretRight size={16} />
              )}
            </button>
            {expandedMenus.common && !collapsed && (
              <div className="ms-4 mt-1">
                {commonSubsections.map((sub) => (
                  <button
                    key={sub.key}
                    className="btn btn-link w-100 text-start p-2 ps-3 text-decoration-none small"
                    onClick={() => handleSubmenuClick("common", sub.key)}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Menu */}
          <div className="mb-2">
            <button
              className="btn btn-link w-100 text-start d-flex align-items-center justify-content-between p-3 rounded text-decoration-none"
              onClick={() => toggleMenu("account")}
            >
              <div className="d-flex align-items-center gap-3">
                <ChartBar size={20} />
                <span className={collapsed ? 'd-none' : ''}>Account</span>
              </div>
              {!collapsed && (
                expandedMenus.account ? <CaretDown size={16} /> : <CaretRight size={16} />
              )}
            </button>
            {expandedMenus.account && !collapsed && (
              <div className="ms-4 mt-1">
                {accountSubsections.map((sub) => (
                  <div key={sub.key}>
                    {sub.subItems ? (
                      <div>
                        <button
                          className="btn btn-link w-100 text-start d-flex align-items-center justify-content-between p-2 ps-3 text-decoration-none"
                          onClick={() => handleSubmenuClick("account", sub.key)}
                        >
                          <span className="small">{sub.title}</span>
                          <CaretRight
                            size={14}
                            className={`transition-transform ${expandedMenus[`account-${sub.key}`] ? 'rotate-90' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(`account-${sub.key}`);
                            }}
                          />
                        </button>
                        {expandedMenus[`account-${sub.key}`] && (
                          <div className="ms-4 mt-1">
                            {sub.subItems.map((subItem) => (
                              <button
                                key={subItem.key}
                                className="btn btn-link w-100 text-start p-1 ps-3 text-decoration-none small"
                                onClick={() => handleSubmenuClick("account", subItem.key)}
                              >
                                {subItem.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        className="btn btn-link w-100 text-start p-2 ps-3 text-decoration-none small"
                        onClick={() => handleSubmenuClick("account", sub.key)}
                      >
                        {sub.title}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock Menu */}
          {user?.role === 'admin' && (
            <div className="mb-2">
              <button
                className="btn btn-link w-100 text-start d-flex align-items-center justify-content-between p-3 rounded text-decoration-none"
                onClick={() => toggleMenu("stock")}
              >
                <div className="d-flex align-items-center gap-3">
                  <Gear size={20} />
                  <span className={collapsed ? 'd-none' : ''}>Stock</span>
                </div>
                {!collapsed && (
                  expandedMenus.stock ? <CaretDown size={16} /> : <CaretRight size={16} />
                )}
              </button>
              {expandedMenus.stock && !collapsed && (
                <div className="ms-4 mt-1">
                  {stockSubsections.map((sub) => (
                    <div key={sub.key}>
                      {sub.subItems ? (
                        <div>
                          <button
                            className="btn btn-link w-100 text-start d-flex align-items-center justify-content-between p-2 ps-3 text-decoration-none"
                            onClick={() => handleSubmenuClick("stock", sub.key)}
                          >
                            <span className="small">{sub.title}</span>
                            <CaretRight
                              size={14}
                              className={`transition-transform ${expandedMenus[`stock-${sub.key}`] ? 'rotate-90' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(`stock-${sub.key}`);
                              }}
                            />
                          </button>
                          {expandedMenus[`stock-${sub.key}`] && (
                            <div className="ms-4 mt-1">
                              {sub.subItems.map((subItem) => (
                                <div key={subItem.key}>
                                  {subItem.subItems ? (
                                    <div>
                                      <button
                                        className="btn btn-link w-100 text-start d-flex align-items-center justify-content-between p-1 ps-3 text-decoration-none small"
                                        onClick={() => toggleMenu(`stock-${sub.key}-${subItem.key}`)}
                                      >
                                        <span>{subItem.title}</span>
                                        <CaretRight
                                          size={12}
                                          className={`transition-transform ${expandedMenus[`stock-${sub.key}-${subItem.key}`] ? 'rotate-90' : ''}`}
                                        />
                                      </button>
                                      {expandedMenus[`stock-${sub.key}-${subItem.key}`] && (
                                        <div className="ms-4 mt-1">
                                          {subItem.subItems.map((subSubItem) => (
                                            <button
                                              key={subSubItem.key}
                                              className="btn btn-link w-100 text-start p-1 ps-3 text-decoration-none small"
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
                                      className="btn btn-link w-100 text-start p-1 ps-3 text-decoration-none small"
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
                          className="btn btn-link w-100 text-start p-2 ps-3 text-decoration-none small"
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
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto p-2 border-top">
          <button
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
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
            <SignOut size={16} />
            <span className={collapsed ? 'd-none' : ''}>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
