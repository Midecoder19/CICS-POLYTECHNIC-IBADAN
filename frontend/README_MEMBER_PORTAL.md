# Member Portal - Cooperative ERP System

## Overview
The Member Portal is a clean, functional web interface designed specifically for cooperative members to access their account information, view loans, track transactions, and manage their profile. The portal is completely separate from the staff/admin dashboard and provides a read-only experience focused on member needs.

## Features

### 🔐 Authentication
- **Separate Login Flow**: Members use a dedicated login page (`/member/login`)
- **Member ID + Password**: Authentication using member number and password
- **Secure Access**: JWT-based authentication with automatic token management
- **Role Isolation**: Members cannot access staff routes or admin APIs

### 📊 Dashboard
- **Welcome Interface**: Personalized greeting with member name and ID
- **Summary Cards**: Quick overview of loan balance, contributions, and loan amounts
- **Quick Actions**: Easy navigation to loans, ledger, and profile pages
- **Recent Activity**: Latest transactions and loan activities

### 💳 Loans Management
- **Loan Overview**: View all active loans with key details
- **Loan Cards**: Clean display of loan type, principal, balance, and status
- **Status Indicators**: Visual status badges (Active, Paid, Overdue)
- **Loan Summary**: Total principal, balance, and active loan count

### 📈 Transaction Ledger
- **Complete History**: View all financial transactions
- **Transaction Types**: Contributions, loan disbursements, payments, interest, etc.
- **Balance Tracking**: Running balance for each transaction
- **Date Sorting**: Chronological transaction history
- **Summary Statistics**: Total debits, credits, and current balance

### 👤 Profile Management
- **Member Details**: Read-only display of personal information
- **Account Status**: Active/inactive status and verification details
- **Contact Information**: Email, phone, and address details
- **Society Information**: Associated cooperative details

## Technical Implementation

### Backend
- **Models**: `User` (existing), `Loan`, `Ledger` (new)
- **API Endpoints**:
  - `POST /api/member/auth/login` - Member authentication
  - `GET /api/member/profile` - Member profile data
  - `GET /api/member/loans` - Member loans list
  - `GET /api/member/ledger` - Transaction history
- **Response Format**: Standardized `{ success, data, message }` format
- **Security**: JWT authentication with member role validation

### Frontend
- **React Components**: Modern, responsive UI with Framer Motion animations
- **Routing**: Protected member routes with automatic redirects
- **Styling**: Custom CSS with mobile-first responsive design
- **State Management**: React hooks with API service layer

### Database
- **Loan Model**: Stores loan details linked to members
- **Ledger Model**: Transaction history with balance tracking
- **Demo Data**: Seed script for testing with sample loans and transactions

## Usage Guide

### For Members
1. **Access Portal**: Navigate to `/member/login`
2. **Login**: Use your Member ID and password
3. **Explore Dashboard**: View summary cards and quick actions
4. **Check Loans**: Review loan details and balances
5. **View Transactions**: Track all financial activities
6. **Update Profile**: View personal and account information

### Demo Credentials
- **Student Demo**: Member ID `STU2024001`, Password `demo123`
- **Teacher Demo**: Member ID `TEA2024001`, Password `demo123`
- **Staff Demo**: Member ID `STF2024001`, Password `demo123`

### For Administrators
1. **Create Members**: Use existing user management or demo script
2. **Seed Data**: Run `node backend/scripts/seed-member-data.js`
3. **Monitor Access**: Members are isolated from staff interfaces

## File Structure

```
backend/
├── models/
│   ├── Loan.js          # Loan data model
│   └── Ledger.js        # Transaction ledger model
├── controllers/
│   └── memberController.js  # Member API logic
├── routes/
│   └── member.js        # Member API routes
└── scripts/
    └── seed-member-data.js  # Demo data seeder

frontend/
├── src/
│   ├── services/
│   │   └── MemberService.js    # API service layer
│   ├── components/
│   │   └── MemberRoute.jsx     # Route protection
│   └── pages/Member/
│       ├── MemberLogin.jsx     # Login page
│       ├── MemberDashboard.jsx # Main dashboard
│       ├── LoansPage.jsx       # Loans view
│       ├── LedgerPage.jsx      # Transactions view
│       ├── ProfilePage.jsx     # Profile view
│       └── MemberDashboard.css # Shared styles
```

## Security Features
- **Role-Based Access**: Members cannot access admin/staff routes
- **Token-Based Auth**: Secure JWT authentication
- **Route Guards**: Automatic redirects for unauthorized access
- **API Protection**: Backend validation for member-only endpoints
- **Data Isolation**: Members only see their own data

## Mobile Responsiveness
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Touch-Friendly**: Optimized for touch interactions
- **Card Layout**: Mobile-optimized card-based interface
- **Readable Tables**: Horizontal scrolling for transaction tables

## Future Enhancements
- **Loan Applications**: Online loan request forms
- **Payment Integration**: Online payment processing
- **Document Upload**: Secure document submission
- **Notifications**: Email/SMS alerts for important updates
- **Advanced Reporting**: Detailed financial reports

## Support
For technical support or questions about the Member Portal:
- Contact the cooperative IT department
- Check the main system documentation
- Review API logs for debugging information
