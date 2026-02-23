# Polyibadan Cooperative Management System - Comprehensive Code Review & LAN Deployment Documentation

**Document Version:** 1.0  
**Date:** February 21, 2026  
**System:** Polyibadan Cooperative Management System  
**Platform:** Windows 10 Local Area Network

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Code Inventory](#code-inventory)
3. [Identified Issues and Resolutions](#identified-issues-and-resolutions)
4. [Network Configuration Settings](#network-configuration-settings)
5. [Installation Instructions](#installation-instructions)
6. [LAN Access Procedures](#lan-access-procedures)
7. [Firewall Configuration](#firewall-configuration)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Security Considerations](#security-considerations)

---

## 1. Executive Summary

This document provides a comprehensive review of the Polyibadan Cooperative Management System codebase, identifying issues that could prevent successful execution and deployment on a Local Area Network (LAN). The system consists of:

- **Backend:** Node.js/Express API server (Port 5000)
- **Frontend:** React/Vite application (Port 3000)
- **Database:** MongoDB (Port 27017)

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend     │────────▶│   Backend API   │────────▶│    MongoDB      │
│   (React)      │         │   (Express)     │         │   Database      │
│   Port: 3000   │         │   Port: 5000    │         │   Port: 27017   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## 2. Code Inventory

### 2.1 Backend Components

| File/Directory | Purpose |
|---------------|---------|
| [`backend/server.js`](backend/server.js) | Main Express server entry point |
| [`backend/package.json`](backend/package.json) | Backend dependencies and scripts |
| [`backend/.env.example`](backend/.env.example) | Environment variable template |
| [`backend/controllers/`](backend/controllers/) | API route controllers |
| [`backend/models/`](backend/models/) | Mongoose data models |
| [`backend/routes/`](backend/routes/) | Express route definitions |
| [`backend/middleware/`](backend/middleware/) | Authentication middleware |
| [`backend/utils/`](backend/utils/) | Email and SMS services |
| [`backend/scripts/`](backend/scripts/) | Database and utility scripts |

### 2.2 Frontend Components

| File/Directory | Purpose |
|---------------|---------|
| [`frontend/src/config/api.js`](frontend/src/config/api.js) | API client configuration |
| [`frontend/src/services/AuthService.js`](frontend/src/services/AuthService.js) | Authentication service |
| [`frontend/src/contexts/AuthContext.jsx`](frontend/src/contexts/AuthContext.jsx) | Authentication context |
| [`frontend/src/pages/`](frontend/src/pages/) | React page components |
| [`frontend/vite.config.js`](frontend/vite.config.js) | Vite build configuration |

### 2.3 Configuration Scripts

| File | Purpose |
|------|---------|
| [`install.bat`](install.bat) | Initial installation script |
| [`start-server.bat`](start-server.bat) | Application startup script |
| [`configure-network.bat`](configure-network.bat) | LAN IP configuration |

---

## 3. Identified Issues and Resolutions

### 3.1 CRITICAL: Port Configuration Discrepancies

**Issue:** Multiple port inconsistencies exist across configuration files:

- [`backend/server.js:90-91`](backend/server.js:90) - Uses PORT 5000
- [`backend/.env.example:8`](backend/.env.example:8) - Shows PORT=3003
- [`start-server.bat:35`](start-server.bat:35) - References port 3003
- [`vite.config.js:7`](frontend/vite.config.js:7) - Uses port 3000

**Resolution:** 

1. Server correctly runs on port 5000 (no changes needed in server.js)
2. Update `.env.example` to reflect PORT=5000
3. Update `start-server.bat` comments to show correct ports:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### 3.2 CRITICAL: Hardcoded IP Addresses

**Issue:** Multiple hardcoded IP references found:

| File | Line | Issue |
|------|------|-------|
| [`frontend/src/config/api.js:8`](frontend/src/config/api.js:8) | STATIC_LAN_IP = 'http://192.168.18.12' |
| [`backend/utils/emailService.js:100`](backend/utils/emailService.js:100) | Fallback to localhost:3000 |
| [`backend/controllers/dashboardController.js:78,84`](backend/controllers/dashboardController.js:78) | Hardcoded IP 192.168.1.100 |
| [`backend/setup.js:810,816`](backend/setup.js:810) | Hardcoded IP 192.168.1.100 |

**Resolution:**

1. Update `frontend/src/config/api.js`:
   ```javascript
   const STATIC_LAN_IP = 'http://192.168.18.12'; // CHANGE THIS to your server's static IP
   const USE_STATIC_IP = true; // Enable for LAN use
   ```

2. Update `backend/utils/emailService.js`:
   ```javascript
   const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
   ```
   Should use the correct frontend port 3000 (this is correct, just needs to be set in .env)

3. Remove or make dynamic the hardcoded IPs in dashboardController.js (lines 78, 84) - these are sample data only

### 3.3 CRITICAL: configure-network.bat Port Error

**Issue:** [`configure-network.bat:35`](configure-network.bat:35) references port 5173 but frontend runs on port 3000.

**Resolution:** Update line 35 to:
```batch
echo 3. Navigate to: http://%IP%:3000
```

### 3.4 HIGH: Member Login Missing Activation Check

**Issue:** [`backend/controllers/memberController.js:22-53`](backend/controllers/memberController.js:22) - The member login function does NOT check if:
- Member account is activated (`activated: true`)
- Member status is approved (`status: 'approved'`)

This differs from the main authController.js login which properly checks these conditions.

**Resolution:** Add activation checks to memberController.js login:

```javascript
// After line 44 (user found check), add:
if (user.role === 'member') {
  if (!user.activated) {
    return res.status(401).json({
      success: false,
      message: 'Account not activated. Please complete signup process.'
    });
  }
  if (user.status !== 'approved') {
    return res.status(401).json({
      success: false,
      message: 'Account pending approval. Please contact administrator.'
    });
  }
}
```

### 3.5 HIGH: Default JWT Secrets in Code

**Issue:** Fallback JWT secrets exist in multiple files:

| File | Line | Default Value |
|------|------|---------------|
| [`backend/controllers/authController.js:11`](backend/controllers/authController.js:11) | 'your-secret-key' |
| [`backend/controllers/authController.js:19`](backend/controllers/authController.js:19) | 'your-refresh-secret-key' |
| [`backend/middleware/auth.js:14`](backend/middleware/auth.js:14) | 'your-secret-key' |

**Resolution:** 

1. Create proper `.env` file with strong secrets:
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   ```

2. In production, generate cryptographically secure secrets:
   ```javascript
   // Generate using Node.js:
   require('crypto').randomBytes(64).toString('hex')
   ```

### 3.6 MEDIUM: Duplicate API URL Configuration

**Issue:** Two different services use different API URL patterns:

- [`frontend/src/config/api.js`](frontend/src/config/api.js) - Uses apiClient with dynamic detection
- [`frontend/src/services/MemberAuthService.js:3`](frontend/src/services/MemberAuthService.js:3) - Uses axios with separate baseURL

**Resolution:** MemberAuthService.js should import from api.js:
```javascript
// Change from:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// To:
import { API_BASE_URL } from '../config/api';
```

### 3.7 MEDIUM: Inconsistent MongoDB Connection Strings

**Issue:** Multiple scripts use different connection patterns:

- Most use: `mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polyibadan')`
- Some scripts use separate host/port/db configuration

**Resolution:** All scripts should use the centralized MONGODB_URI environment variable consistently.

### 3.8 LOW: AuthContext Clears Storage on Mount

**Issue:** [`frontend/src/contexts/AuthContext.jsx:43-49`](frontend/src/contexts/AuthContext.jsx:43) - The useEffect clears ALL auth data on every app mount, forcing re-login on refresh.

**Resolution:** This appears intentional for security but may cause UX issues. Consider modifying to only clear on explicit logout or token expiration.

### 3.9 LOW: Email Verification Code Expiry Mismatch

**Issue:** 
- [`backend/controllers/authController.js:104`](backend/controllers/authController.js:104) - Sets expiry to 10 minutes
- [`backend/utils/emailService.js:77`](backend/utils/emailService.js:77) - Email template says "5 minutes"

**Resolution:** Update emailService.js to say "10 minutes" or reduce controller to 5 minutes.

---

## 4. Network Configuration Settings

### 4.1 Default Ports

| Service | Port | Protocol |
|---------|------|----------|
| Frontend (Vite Dev) | 3000 | HTTP |
| Backend API | 5000 | HTTP |
| MongoDB | 27017 | TCP |

### 4.2 Environment Variables

#### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/polyibadan

# Frontend URL (for email links)
FRONTEND_URL=http://192.168.18.12:3000

# JWT (generate secure values for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Email (Brevo/Sendinblue)
BREVO_SMTP_USER=your-brevo-smtp-user
BREVO_SMTP_PASSWORD=your-brevo-smtp-password
BREVO_FROM_EMAIL=noreply@polyibadan.com
BREVO_FROM_NAME=Polyibadan Cooperative

# WhatsApp
WHATSAPP_ENABLED=false
```

#### Frontend (.env)
```env
# API URL - CHANGE THIS to your server's LAN IP
VITE_API_URL=http://192.168.18.12:5000/api
```

### 4.3 LAN IP Configuration

To configure the system for LAN access:

1. Run `configure-network.bat` - automatically detects your IP
2. Or manually edit `frontend/.env` with your server's static IP:
   ```
   VITE_API_URL=http://[YOUR_SERVER_IP]:5000/api
   ```

---

## 5. Installation Instructions

### 5.1 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18.x or higher | LTS recommended |
| MongoDB | 6.0 or higher | Community Server |
| Windows | 10 or 11 | Required for batch scripts |

### 5.2 Quick Install

1. **Clone/Download** the application to your server computer

2. **Run installation:**
   ```cmd
   cd C:\path\to\polyibadan
   install.bat
   ```

3. **Configure network IP:**
   ```cmd
   configure-network.bat
   ```

4. **Start the application:**
   ```cmd
   start-server.bat
   ```

### 5.3 Manual Installation (if install.bat fails)

1. **Install Node.js:**
   - Download from https://nodejs.org/
   - Install with default options

2. **Install MongoDB:**
   - Download from https://www.mongodb.com/try/download/community
   - Install as Windows Service
   - Create data directory: `C:\data\db`

3. **Install backend dependencies:**
   ```cmd
   cd backend
   npm install
   ```

4. **Install frontend dependencies:**
   ```cmd
   cd frontend
   npm install
   ```

5. **Configure environment:**
   - Copy `backend/.env.example` to `backend/.env`
   - Update with your settings

6. **Start servers:**
   ```cmd
   # Terminal 1 - MongoDB
   net start MongoDB
   
   # Terminal 2 - Backend
   cd backend
   npm run dev
   
   # Terminal 3 - Frontend
   cd frontend
   npm run dev
   ```

---

## 6. LAN Access Procedures

### 6.1 Server Setup

1. **Determine your server's LAN IP:**
   ```cmd
   ipconfig
   ```
   Look for IPv4 Address under your active network adapter (e.g., 192.168.18.12)

2. **Update frontend configuration:**
   - Edit `frontend/.env`
   - Set: `VITE_API_URL=http://YOUR_SERVER_IP:5000/api`
   - Example: `VITE_API_URL=http://192.168.18.12:5000/api`

3. **Restart the servers** (or run `configure-network.bat`)

### 6.2 Client Access

1. **Ensure firewall allows connections:**
   - Port 3000 (Frontend)
   - Port 5000 (Backend API)

2. **From other devices on the same network:**
   - Open browser
   - Navigate to: `http://192.168.18.12:3000`
   - Login with your credentials

### 6.3 Troubleshooting LAN Access

| Issue | Solution |
|-------|----------|
| Can't access frontend | Check firewall rules for port 3000 |
| Can't login from LAN | Check CORS settings in server.js |
| API calls fail | Verify VITE_API_URL matches server IP |
| MongoDB connection fails | Ensure MongoDB is running and accessible |

---

## 7. Firewall Configuration

### 7.1 Windows Defender Firewall

Run these commands in Administrator PowerShell:

```powershell
# Allow Node.js through firewall
netsh advfirewall firewall add rule name="Polyibadan Frontend" dir=in action=allow protocol=tcp localport=3000
netsh advfirewall firewall add rule name="Polyibadan Backend" dir=in action=allow protocol=tcp localport=5000

# Or allow MongoDB (if accessing remotely - not recommended for LAN)
netsh advfirewall firewall add rule name="MongoDB" dir=in action=allow protocol=tcp localport=27017
```

### 7.2 Alternative: Turn Off Firewall (Not Recommended)

```powershell
# Disable firewall (temporary testing only)
netsh advfirewall set allprofiles state off
```

**Re-enable after testing:**
```powershell
netsh advfirewall set allprofiles state on
```

---

## 8. API Endpoints Reference

### 8.1 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/verify-email` | Email verification |
| POST | `/api/auth/forgot-password` | Password reset request |
| POST | `/api/auth/reset-password` | Password reset |
| POST | `/api/auth/refresh` | Token refresh |
| GET | `/api/auth/profile` | Get user profile |

### 8.2 Member Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/member/auth/login` | Member login |
| GET | `/api/member/profile` | Get member profile |
| GET | `/api/member/loans` | Get member loans |
| GET | `/api/member/ledger` | Get member ledger |

### 8.3 Common Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/common/society` | Society information |
| GET | `/api/common/financial-periods` | Financial periods |
| GET | `/api/common/store-information` | Store details |
| GET | `/api/common/suppliers` | Supplier list |
| GET | `/api/common/products` | Product list |

### 8.4 Stock Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stock/sales` | Stock sales |
| POST | `/api/stock/sales` | Create stock sale |

### 8.5 Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/activity` | Recent activity |

### 8.6 Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

---

## 9. Security Considerations

### 9.1 Production Recommendations

1. **Change default JWT secrets** - Generate secure random strings
2. **Enable HTTPS** - Use SSL certificates for encrypted communication
3. **Restrict CORS** - Limit to specific LAN IP addresses in production
4. **Secure MongoDB** - Enable authentication for production
5. **Environment separation** - Use different configs for dev/prod

### 9.2 Current Security Posture

| Feature | Status | Notes |
|---------|--------|-------|
| Password Hashing | ✅ Secure | Uses bcrypt with salt |
| JWT Authentication | ⚠️ Needs Work | Default secrets must be changed |
| CORS | ✅ Configured | Allows LAN IPs |
| Rate Limiting | ✅ Enabled | 1000 req/15min for dev |
| Helmet | ✅ Enabled | Security headers |
| Input Validation | ✅ Enabled | express-validator |

### 9.3 Known Security Gaps

1. Default JWT fallback secrets in code
2. Member login missing activation check
3. No HTTPS enforcement
4. MongoDB without authentication (localhost only)

---

## Appendix A: File Structure

```
polyibadan/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── middleware/     # Auth middleware
│   ├── utils/          # Email/SMS services
│   ├── scripts/        # Utility scripts
│   ├── server.js       # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── config/     # API config
│   │   ├── contexts/   # React contexts
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── components/ # Reusable components
│   ├── package.json
│   └── vite.config.js
├── install.bat         # Installation script
├── start-server.bat   # Startup script
├── configure-network.bat # LAN config
└── README.md
```

---

## Appendix B: Quick Reference Commands

```cmd
# Start MongoDB
net start MongoDB

# Start Backend
cd backend
npm run dev

# Start Frontend
cd frontend
npm run dev

# Build Frontend for Production
cd frontend
npm run build

# Check MongoDB Status
cd backend
node check-mongo.js

# Create Admin User
cd backend
node scripts/create-admin.js
```

---

**End of Document**
