import { Gear, UserCircle, ChartBar, Users, CurrencyDollar, TrendUp, Buildings, Activity } from "phosphor-react";
import { lazy } from "react";

// Lazy load section components
const SocietyInfo = lazy(() => import("./CommonPage/sections/SocietyInfo"));
const FinancialPeriod = lazy(() => import("./CommonPage/sections/FinancialPeriod"));
const BackupData = lazy(() => import("./CommonPage/sections/BackupData"));
const Restore = lazy(() => import("./CommonPage/sections/Restore"));
const Security = lazy(() => import("./CommonPage/sections/Security"));
const DefaultParameter = lazy(() => import("./CommonPage/sections/DefaultParameter"));
const Organization = lazy(() => import("./AccountPage/sections/Organization"));
const Branch = lazy(() => import("./AccountPage/sections/Branch"));
const Department = lazy(() => import("./AccountPage/sections/Department"));
const Bank = lazy(() => import("./AccountPage/sections/Bank"));
const PayComponent = lazy(() => import("./AccountPage/sections/PayComponent"));
const TransType = lazy(() => import("./AccountPage/sections/TransType"));
const LoanCategory = lazy(() => import("./AccountPage/sections/LoanCategory"));
const JournalCategory = lazy(() => import("./AccountPage/sections/JournalCategory"));
// const MemberLoanMaster = lazy(() => import("./AccountPage/sections/MemberLoanMaster"));
const SavingsRequestData = lazy(() => import("./AccountPage/sections/SavingsRequestData"));
const MaintainAccount = lazy(() => import("./AccountPage/sections/MaintainAccount"));
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


export const stats = [
    // {
    //   title: "Total Members",
    //   value: "2,847",
    //   change: "+12.5%",
    //   changeType: "positive",
    //   icon: <Users size={24} />,
    //   color: "primary"
    // },
    {
      title: "Active Loans",
      value: "₦45.2M",
      change: "+8.2%",
      changeType: "positive",
      icon: <CurrencyDollar size={24} />,
      color: "success"
    },
    {
      title: "Monthly Savings",
      value: "₦12.8M",
      change: "+15.3%",
      changeType: "positive",
      icon: <TrendUp size={24} />,
      color: "info"
    },
    {
      title: "Stock Value",
      value: "₦8.9M",
      change: "+5.7%",
      changeType: "positive",
      icon: <Buildings size={24} />,
      color: "warning"
    }
  ];

  export const quickActions = (handleTileClick) => [
    // {
    //   title: "New Member",
    //   desc: "Register a new member",
    //   icon: <Users size={20} />,
    //   color: "primary",
    //   action: () => handleTileClick("account", "maintain")
    // },
    // {
    //   title: "Process Loan",
    //   desc: "Create new loan application",
    //   icon: <CurrencyDollar size={20} />,
    //   color: "success",
    //   action: () => handleTileClick("account", "memberloanmaster")
    // },
    {
      title: "Stock Update",
      desc: "Update inventory",
      icon: <Buildings size={20} />,
      color: "warning",
      action: () => handleTileClick("stock", "maintain")
    },
    {
      title: "Reports",
      desc: "Generate financial reports",
      icon: <Activity size={20} />,
      color: "info",
      action: () => handleTileClick("common", "financial")
    }
  ];

export const allTiles = [
    { key: "common", view: "common", title: "Common", desc: "Common system settings and configurations.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "account", view: "account", title: "Account", desc: "Account management and financial operations.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
    { key: "stock", view: "stock", title: "Stock", desc: "Inventory and stock management.", color: "#F59E0B", icon: <ChartBar size={36} /> },
];

const commonSubTiles = [
    { key: "society", title: "Society Info", desc: "Manage society information.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "financial", title: "Financial Period", desc: "Set financial periods.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
    { key: "backup", title: "Backup Data", desc: "Backup system data.", color: "#F59E0B", icon: <ChartBar size={36} /> },
    { key: "restore", title: "Restore Data", desc: "Restore system data.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "security", title: "Security", desc: "Manage security settings.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
    { key: "default", title: "Default Parameter", desc: "Set default parameters.", color: "#F59E0B", icon: <ChartBar size={36} /> },
];

const accountSubTiles = [
    { key: "maintain", title: "Maintain Account", desc: "Maintain account details.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "organization", title: "Organization", desc: "Manage organization.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
    { key: "branch", title: "Branch", desc: "Manage branches.", color: "#F59E0B", icon: <ChartBar size={36} /> },
    { key: "department", title: "Department", desc: "Manage departments.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "bank", title: "Bank", desc: "Manage banks.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
    { key: "paycomponent", title: "Pay Component", desc: "Manage pay components.", color: "#F59E0B", icon: <ChartBar size={36} /> },
    { key: "transtype", title: "Transaction Type", desc: "Define transaction types.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "loancategory", title: "Loan Category", desc: "Manage loan categories.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
    { key: "journalcategory", title: "Journal Category", desc: "Manage journal categories.", color: "#F59E0B", icon: <ChartBar size={36} /> },
    // { key: "memberloanmaster", title: "Member Loan Master", desc: "Manage member loans.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "savingsrequestdata", title: "Savings Request Data", desc: "Handle savings requests.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
];

const stockSubTiles = [
    { key: "maintain", title: "Maintain Stock", desc: "Maintain stock details.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "storeinfo", title: "Store Information", desc: "Manage store info.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
    { key: "essential", title: "Essential Commodity", desc: "Handle essentials.", color: "#F59E0B", icon: <ChartBar size={36} /> },
    { key: "supplierinfo", title: "Supplier Information", desc: "Manage suppliers.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "supplierbalance", title: "Supplier Opening Balance", desc: "Set supplier balances.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
    { key: "productsetup", title: "Product Setup", desc: "Setup products.", color: "#F59E0B", icon: <ChartBar size={36} /> },
    { key: "productbalance", title: "Product Opening Balance", desc: "Set product balances.", color: "#2DD4BF", icon: <Gear size={36} /> },
    { key: "productinfo", title: "Product Information", desc: "Manage product info.", color: "#0F3D3E", icon: <UserCircle size={36} /> },
    { key: "lpo", title: "LPO", desc: "Manage LPOs.", color: "#F59E0B", icon: <ChartBar size={36} /> },
    { key: "receipt", title: "Stock Receipt Voucher", desc: "Handle receipts.", color: "#2DD4BF", icon: <Gear size={36} /> },
];

export const subTiles = {
    common: commonSubTiles,
    account: accountSubTiles,
    stock: stockSubTiles,
};

export const sectionComponents = {
    common: {
        society: <SocietyInfo />,
        financial: <FinancialPeriod />,
        backup: <BackupData />,
        restore: <Restore />,
        security: <Security />,
        default: <DefaultParameter />,
    },
    account: {
        organization: <Organization />,
        branch: <Branch />,
        department: <Department />,
        bank: <Bank />,
        paycomponent: <PayComponent />,
        transtype: <TransType />,
        loancategory: <LoanCategory />,
        journalcategory: <JournalCategory />,
        // memberloanmaster: <MemberLoanMaster />,
        savingsrequestdata: <SavingsRequestData />,
        maintain: <MaintainAccount />,
    },
    stock: {
        storeinfo: <StoreInformation />,
        essential: <EssentialCommodity />,
        supplierinfo: <SupplierInformation />,
        supplierbalance: <SupplierOpeningBalance />,
        productsetup: <ProductSetup />,
        maintain: <MaintainStock />,
        productbalance: <ProductOpeningBalance />,
        productinfo: <ProductInformation />,
        lpo: <LPO />,
        receipt: <StockReceiptVoucher />,
    }
};
