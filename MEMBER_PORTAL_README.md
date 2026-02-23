# PolyIbadan Cooperative Management System - Member Portal

## Overview

The Member Portal is a clean, functional web application designed specifically for cooperative members to manage their accounts, view loans, and track transactions. It provides a secure, user-friendly interface with role-based access control.

## Features

### 🔐 Authentication
- **Member Login**: Secure login using Member ID and password
- **Session Management**: Automatic token-based authentication
- **Auto-redirect**: Redirects authenticated users to dashboard
- **Security**: JWT-based authentication with automatic logout on token expiry

### 📊 Dashboard
- **Personal Information**: Member name, ID, contact details
- **Financial Summary**: Total loans, outstanding balance, net balance
- **Quick Actions**: Easy navigation to loans, ledger, and profile
- **Recent Activity**: Latest loans and transactions at a glance

### 💳 Loans Management
- **Loan Overview**: View all active and historical loans
- **Loan Details**: Principal amount, balance, interest rate, term, status
- **Summary Statistics**: Total loans, active loans, total balance
- **Pagination**: Navigate through multiple pages of loan history

### 📊 Transaction Ledger
- **Complete History**: View all transactions and contributions
- **Running Balance**: Real-time balance calculation
- **Transaction Types**: Contributions, loan disbursements, payments, interest
- **Search & Filter**: Easy navigation through transaction history
- **Summary Cards**: Total credits, debits, and net balance

### 👤 Profile Management
- **Read-Only Profile**: Secure view of personal information
- **Contact Details**: Email, phone number, member since date
- **Account Status**: Current account status and activation information
- **Society Information**: Associated cooperative society details

## Technical Implementation

### Frontend (React)
- **Framework**: React 18 with hooks
- **Routing**: React Router v6 with protected routes
- **UI Library**: Bootstrap 5 for responsive design
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for modern iconography
- **State Management**: Context API for authentication state

### Backend API
- **Base URL**: `http://localhost:3003/api` (configurable)
- **Authentication**: JWT-based with refresh tokens
- **Response Format**: Standardized `{ success, data, message }`
- **Error Handling**: Comprehensive error responses and user feedback

### Security Features
- **Role-Based Access**: Members can only access member routes
- **Route Guards**: `MemberRoute` component protects member pages
- **Token Management**: Automatic token refresh and logout
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for LAN access

## API Endpoints

### Authentication
```
POST /api/member/auth/login
GET  /api/member/profile
```

### Member Data
```
GET /api/member/loans?page=1&limit=10
GET /api/member/ledger?page=1&limit=20
```

## Usage Instructions

### 1. Member Login
1. Navigate to `http://localhost:3000/member/login`
2. Enter Member ID (e.g., STU2024001)
3. Enter password (e.g., demo123)
4. Click "Login" to access your dashboard

### 2. Demo Credentials
For testing and demonstration purposes:

| Member Type | Member ID | Password |
|-------------|------------|----------|
| Student | STU2024001 | demo123 |
| Teacher | TEA2024001 | demo123 |
| Staff | STF2024001 | demo123 |

### 3. Navigation
- **Dashboard**: `/member/dashboard` - Overview and quick actions
- **Loans**: `/member/loans` - View loan history and details
- **Ledger**: `/member/ledger` - Transaction history and balance
- **Profile**: `/member/profile` - Personal information

## File Structure

### Frontend Components
```
src/
├── pages/Member/
│   ├── MemberLogin.jsx          # Member login page
│   ├── MemberDashboard.jsx       # Member dashboard
│   ├── LoansPage.jsx           # Loans management
│   ├── LedgerPage.jsx          # Transaction ledger
│   └── ProfilePage.jsx         # Member profile
├── contexts/
│   └── MemberAuthContext.jsx   # Member auth context
├── components/
│   └── MemberRoute.jsx          # Route guard component
└── services/
    └── MemberAuthService.js   # Member API service
```

### Backend Controllers
```
backend/
├── controllers/
│   └── memberAuthController.js  # Member auth controller
├── middleware/
│   └── memberAuth.js           # Member auth middleware
└── routes/
    └── memberAuth.js           # Member auth routes
```

### Data Models
```
backend/models/
├── User.js                   # Member information
├── Loan.js                  # Loan details
└── Ledger.js                # Transaction records
```

## Configuration

### Environment Variables
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3003/api
VITE_NODE_ENV=development

# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/polyibadan
JWT_SECRET=your-jwt-secret-key
PORT=3003
```

### CORS Configuration
The application is configured for LAN deployment:
- Allows localhost and local IP addresses
- Configurable frontend URL
- Secure CORS policies

## Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Database Setup
```bash
# Start MongoDB
mongod

# Seed demo data
npm run seed-members
npm run seed-member-data
```

## Deployment

### LAN Deployment
1. **Backend**: Deploy on server with Node.js
2. **Frontend**: Build and serve static files
3. **Database**: MongoDB server on network
4. **Configuration**: Update environment variables for production

### Production URLs
- **Frontend**: `http://[SERVER_IP]:3000`
- **Backend API**: `http://[SERVER_IP]:3003/api`
- **Member Portal**: `http://[SERVER_IP]:3000/member/login`

## Browser Support

### Modern Browsers (Recommended)
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized performance for mobile devices

## Troubleshooting

### Common Issues
1. **Login Issues**
   - Verify member ID and password
   - Check if member account is activated
   - Ensure backend server is running

2. **API Errors**
   - Check backend logs
   - Verify CORS configuration
   - Ensure MongoDB is accessible

3. **Routing Issues**
   - Clear browser cache
   - Check network connectivity
   - Verify API base URL

### Debug Mode
Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## Support

### Documentation
- API documentation available at `/api/health`
- Error responses include descriptive messages
- Console logging for debugging

### Contact
For technical support and issues:
- Check backend logs for detailed error information
- Verify network connectivity between frontend and backend
- Ensure all environment variables are correctly configured

## Security Notes

- All member data is encrypted in transit
- Passwords are hashed using bcrypt
- JWT tokens have configurable expiration
- Automatic logout on session expiry
- Input validation prevents common attacks

---

**Note**: This Member Portal is part of the larger PolyIbadan Cooperative Management System. It is designed to work seamlessly with the staff/admin dashboard while maintaining strict separation of member and administrative functions.
