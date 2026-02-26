# Polyibadan Cooperative Society Management System - Project Flow Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [User Roles](#user-roles)
4. [Application Flow](#application-flow)
5. [Authentication Flow](#authentication-flow)
6. [Backend API Routes](#backend-api-routes)
7. [Database Models](#database-models)
8. [Frontend Pages](#frontend-pages)
9. [Key Business Workflows](#key-business-workflows)

---

## 1. System Overview

This is a **Cooperative Society Management System** designed for managing:
- Member registrations and accounts
- Stock/inventory management (products, suppliers, sales)
- Financial accounting (loans, ledgers, transactions)
- Society/organization management

The system has two separate portals:
1. **Admin Portal** - For staff and administrators to manage the entire system
2. **Member Portal** - For cooperative members to view their accounts and make transactions

---

## 2. Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs, helmet, express-rate-limit
- **Utilities:** Nodemailer (email), Twilio (SMS)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **UI Libraries:** Material UI, TailwindCSS, Framer Motion
- **Icons:** Phosphor Icons, Lucide React, Tabler Icons
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios

---

## 3. User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | System administrator | Full access to all features |
| `staff` | Cooperative staff | Most features, limited admin functions |
| `member` | Cooperative member | Member portal only (view own account) |

---

## 4. Application Flow

```
                                    ┌─────────────────────────────────────────┐
                                    │            MongoDB Database            │
                                    │  (Users, Members, Products, Stock,    │
                                    │   Loans, Ledgers, Financial Periods)  │
                                    └───────────────┬─────────────────────────┘
                                                    │
                                    ┌───────────────▼─────────────────────────┐
                                    │          Backend Server (Port 5000)    │
                                    │  • Express.js REST API                 │
                                    │  • JWT Authentication                 │
                                    │  • Business Logic Controllers         │
                                    │  • MongoDB Models                     │
                                    └───────────────┬─────────────────────────┘
                                                    │
                    ┌────────────────────────────────┴────────────────────────────────┐
                    │                                                                 │
        ┌───────────▼──────────┐                                    ┌───────────────▼──────────┐
        │   Admin/Staff        │                                    │      Member             │
        │   Frontend (Vite)    │                                    │   Frontend (Vite)      │
        │   (Port 5173)       │                                    │   (Port 5173)          │
        │                      │                                    │                        │
        │   • Dashboard       │                                    │   • Member Dashboard   │
        │   • Stock Management │◄───────────────────────────────────►   • Loans              │
        │   • Account Setup   │       API Calls (Authenticated)    │   • Ledger             │
        │   • Reports         │                                    │   • Profile            │
        └─────────────────────┘                                    └────────────────────────┘
```

---

## 5. Authentication Flow

### Staff/Admin Registration & Login

```
1. Admin manually creates staff accounts via User Management
   ↓
2. Staff visits /login page
   ↓
3. Enters username/email and password
   ↓
4. Backend validates credentials against User collection
   ↓
5. If valid: Returns JWT token + user data (role: 'admin' or 'staff')
   ↓
6. Frontend stores token in localStorage
   ↓
7. Redirects to /dashboard
```

### Member Registration (Activation)

```
1. Admin imports members into the system (via Excel/CSV)
   ↓
2. Each member receives their Member ID
   ↓
3. Member visits /signup page
   ↓
4. Enters: Member ID + Email + Password
   ↓
5. Backend validates member exists in system
   ↓
6. Creates user account with role: 'member'
   ↓
7. Sends verification email/SMS with OTP
   ↓
8. Member verifies email/phone
   ↓
9. Redirects to /member/dashboard
```

### Password Reset Flow

```
1. User clicks "Forgot Password" on login page
   ↓
2. Enters email address
   ↓
3. Backend generates reset token + sends email/SMS
   ↓
4. User clicks reset link in email
   ↓
5. Navigates to /reset-password/:token
   ↓
6. Enters new password
   ↓
7. Backend validates token and updates password
```

---

## 6. Backend API Routes

| Route | Controller | Purpose |
|-------|------------|---------|
| `/api/auth/*` | authController.js | Login, register, password reset |
| `/api/member/*` | memberController.js | Member CRUD operations |
| `/api/member/auth/*` | memberAuthController.js | Member-specific auth |
| `/api/dashboard/*` | dashboardController.js | Dashboard statistics |
| `/api/common/*` | Various | Financial periods, backups, defaults |
| `/api/common/society/*` | societyController.js | Society info |
| `/api/stock/sales/*` | stockSalesController.js | Stock sales transactions |
| `/api/account/*` | organizationController.js | Organization settings |
| `/api/health` | - | Health check endpoint |

### Key API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user (staff or activate member)
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify` - Verify email/phone

**Members:**
- `GET /api/member/all` - Get all members
- `POST /api/member/create` - Create new member
- `PUT /api/member/update/:id` - Update member
- `DELETE /api/member/delete/:id` - Delete member
- `GET /api/member/:id` - Get single member

**Stock:**
- `GET /api/stock/sales/products` - Get all products
- `POST /api/stock/sales/create` - Create sales transaction
- `GET /api/stock/sales/all` - Get all sales

**Dashboard:**
- `GET /api/dashboard/stats` - Get dashboard statistics

---

## 7. Database Models

### Core Models

| Model | File | Purpose |
|-------|------|---------|
| User | User.js | Staff/admin user accounts |
| Security | Security.js | Member security/activation data |
| Society | Society.js | Organization/society information |
| Organization | Organization.js | Company settings |
| FinancialPeriod | FinancialPeriod.js | Accounting periods |
| DefaultParameter | DefaultParameter.js | System default values |

### Stock/Inventory Models

| Model | File | Purpose |
|-------|------|---------|
| Product | Product.js | Product catalog |
| Supplier | Supplier.js | Supplier information |
| StockReceipt | StockReceipt.js | Stock incoming records |
| StockSales | StockSales.js | Stock outgoing/sales |
| StockBalance | StockBalance.js | Current stock levels |
| EssentialCommodity | EssentialCommodity.js | Essential commodities |
| StoreInformation | StoreInformation.js | Store details |
| ProductOpeningBalance | ProductOpeningBalance.js | Opening stock |

### Financial Models

| Model | File | Purpose |
|-------|------|---------|
| Ledger | Ledger.js | Account ledger entries |
| Loan | Loan.js | Member loans |
| Backup | Backup.js | Database backups |

### Account Models

| Model | File | Purpose |
|-------|------|---------|
| Branch | (in common) | Organization branches |
| Department | (in common) | Departments |
| Bank | (in common) | Bank accounts |
| LoanCategory | (in common) | Loan types |
| TransType | (in common) | Transaction types |

---

## 8. Frontend Pages

### Public Routes (No Login Required)
| Route | Page | Purpose |
|-------|------|---------|
| `/login` | Login.jsx | User login |
| `/signup` | Login.jsx | Member activation |
| `/verify` | Verification.jsx | Email/phone verification |
| `/reset-password/:token` | ResetPassword.jsx | Password reset |
| `/member/activation` | MemberActivation.jsx | Member account activation |

### Admin/Staff Routes (Protected - admin/staff only)
| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard` | Dashboard.jsx | Main admin dashboard |
| `/dashboard/stock/*` | StockPage/* | Stock management |
| `/dashboard/account/*` | AccountPage/* | Account settings |
| `/dashboard/common/*` | CommonPage/* | Common settings |

### Member Routes (Protected - member only)
| Route | Page | Purpose |
|-------|------|---------|
| `/member/dashboard` | MemberDashboard.jsx | Member's account overview |
| `/member/loans` | LoansPage.jsx | View active loans |
| `/member/ledger` | LedgerPage.jsx | Transaction history |
| `/member/profile` | ProfilePage.jsx | Member profile |

---

## 9. Key Business Workflows

### A. Stock Management Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     STOCK MANAGEMENT FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

1. SETUP PHASE
   ├── Add Store Information (Location, Name)
   ├── Add Suppliers (Name, Contact, Bank Details)
   ├── Add Products (Name, SKU, Category, Unit)
   └── Set Opening Balances (Initial Stock)

2. RECEIVING STOCK (Stock Receipt)
   ├── Create LPO (Local Purchase Order)
   ├── Receive goods against LPO
   └── Update Stock Balance

3. SELLING STOCK (Stock Sales)
   ├── Select Customer/Member
   ├── Add products to cart
   ├── Calculate totals
   └── Process sale → Update Stock Balance

4. MONITORING
   ├── View current stock levels
   ├── Check low stock alerts
   └── Generate reports
```

### B. Member Management Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MEMBER MANAGEMENT FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

1. MEMBER CREATION
   ├── Admin imports members via Excel/CSV
   │   └── OR manually creates member
   ├── System generates Member Number
   └── Member record created (inactive)

2. MEMBER ACTIVATION
   ├── Member visits signup page
   ├── Enters Member ID + Email + Password
   ├── System verifies member exists
   ├── Creates login credentials
   └── Member can now login

3. MEMBER OPERATIONS
   ├── View account balance
   ├── Apply for loans
   ├── Purchase stock (at member price)
   └── View transaction history
```

### C. Loan Management Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LOAN MANAGEMENT FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

1. LOAN SETUP (Admin)
   ├── Define Loan Categories (Interest rates, max amount)
   └── Set eligibility criteria

2. LOAN APPLICATION (Member)
   ├── Member applies for loan
   ├── Selects loan type
   ├── Specifies amount
   └── Submits application

3. LOAN PROCESSING (Admin)
   ├── Review application
   ├── Check credit history
   ├── Approve/Reject
   └── Disburse funds (if approved)

4. LOAN REPAYMENT
   ├── Member makes payments
   ├── System tracks installments
   └── Updates loan balance
```

### D. Financial Period Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   FINANCIAL PERIOD FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

1. PERIOD SETUP (Admin)
   ├── Create Financial Period
   │   ├── Name (e.g., "2024")
   │   ├── Start Date
   │   └── End Date
   └── Set as Active Period

2. DURING PERIOD
   ├── All transactions recorded in current period
   ├── Can run period-end reports
   └── Cannot delete closed periods

3. PERIOD CLOSING
   ├── Run closing reports
   ├── Archive period
   └── Create new period for next year
```

### E. Backup & Restore Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKUP & RESTORE FLOW                            │
└─────────────────────────────────────────────────────────────────────┘

1. MANUAL BACKUP
   ├── Admin clicks "Create Backup"
   ├── System exports all data to JSON
   └── Downloads as backup file

2. AUTOMATED BACKUP (if configured)
   ├── System runs scheduled backups
   └── Stores backup files

3. RESTORE
   ├── Admin uploads backup file
   ├── System validates backup
   ├── Confirms overwrite current data
   └── Restores all records
```

---

## 10. System Architecture Summary

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW                                   │
└──────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐     ┌──────────────┐     ┌─────────────────┐
    │  User    │────►│   Frontend   │────►│   API Request   │
    │ Browser  │     │   (React)    │     │   (Axios)       │
    └──────────┘     └──────────────┘     └────────┬────────┘
                                                    │
                                                    ▼
    ┌──────────┐     ┌──────────────┐     ┌─────────────────┐
    │  View    │◄────│   Frontend   │◄────│   API Response  │
    │ Response │     │   (React)    │     │   (JSON)        │
    └──────────┘     └──────────────┘     └─────────────────┘
                                                    │
                                                    ▼
                                          ┌─────────────────┐
                                          │   Backend       │
                                          │   Express.js    │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │   MongoDB       │
                                          │   Database      │
                                          └─────────────────┘
```

---

## 11. Environment Setup

### Required Environment Variables

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/polyibadan
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

**Backend:**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 12. Quick Reference for Team Explanation



1. **Two Portals:**
   - **Admin Portal** (`/dashboard`) - For staff to manage everything
   - **Member Portal** (`/member/dashboard`) - For members to check their account

2. **Three User Types:**
   - Admin - Full access
   - Staff - Limited admin access
   - Member - Can only view own account

3. **Main Features:**
   - Stock Management (Products, Suppliers, Sales)
   - Member Management (Registration, Loans)
   - Account Setup (Branches, Departments, Banks)
   - Financial Periods (Yearly accounting)
   - Backup/Restore (Data safety)

4. **Data Flow:**
   - User → React Frontend → REST API → Express → MongoDB

---


*Project: Polyibadan Cooperative Society Management System*
