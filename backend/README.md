# Polyibadan Backend API

Backend API for the Polyibadan Cooperative Management System built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Staff, Member)
  - Email and phone verification
  - Password reset functionality

- 📊 **Dashboard API**
  - User statistics and analytics
  - System health monitoring
  - Activity tracking

- 📧 **Email Service Integration**
  - Brevo (Sendinblue) SMTP
  - Verification emails
  - Password reset emails

- 📱 **SMS & WhatsApp Integration**
  - Twilio SMS service
  - WhatsApp messaging
  - Verification codes

- 🛡️ **Security**
  - Helmet.js for security headers
  - Rate limiting
  - Input validation
  - CORS protection

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Email service account (Brevo/Sendinblue)
- SMS service account (Twilio)

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory with the following content:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database
   MONGODB_URI=mongodb://localhost:27017/polyibadan

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret-key-different-from-jwt-secret

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # Brevo (Sendinblue) Email Configuration
   BREVO_SMTP_USER=your-brevo-smtp-user
   BREVO_SMTP_PASSWORD=your-brevo-smtp-password
   BREVO_FROM_EMAIL=noreply@polyibadan.com

   # Twilio SMS Configuration
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=+1234567890

   # WhatsApp Configuration (using Twilio)
   TWILIO_WHATSAPP_NUMBER=+1234567890
   WHATSAPP_ENABLED=true
   ```

4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/verify-email` | Email verification | No |
| POST | `/api/auth/verify-phone` | Phone verification | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/forgot-password` | Password reset request | No |
| POST | `/api/auth/reset-password` | Password reset | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Dashboard Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/stats` | Dashboard statistics | Yes |
| GET | `/api/dashboard/activity` | User activity | Yes |
| GET | `/api/dashboard/health` | System health | Yes (Admin) |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Server health status | No |

## Testing the API

### Sample Users (after running seed)

- **Admin**: `admin/admin123`
- **Staff**: `staff1/staff123`
- **Member**: `member1/member123`
- **Demo Admin**: `demo/demo`

### Test Authentication

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \\
     -H "Content-Type: application/json" \\
     -d '{
       "username": "testuser",
       "password": "password123",
       "email": "test@example.com",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \\
     -H "Content-Type: application/json" \\
     -d '{
       "username": "admin",
       "password": "admin123"
     }'
   ```

## Project Structure

```
backend/
├── config/              # Configuration files
├── controllers/         # Route controllers
│   ├── authController.js
│   └── dashboardController.js
├── middleware/          # Custom middleware
│   └── auth.js
├── models/             # MongoDB models
│   └── User.js
├── routes/             # API routes
│   ├── auth.js
│   └── dashboard.js
├── scripts/            # Utility scripts
│   └── seed.js
├── utils/              # Utility functions
│   ├── emailService.js
│   └── smsService.js
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Environment Variables

### Required Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/polyibadan` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BREVO_SMTP_USER` | Brevo SMTP username | - |
| `BREVO_SMTP_PASSWORD` | Brevo SMTP password | - |
| `BREVO_FROM_EMAIL` | Email sender address | `noreply@polyibadan.com` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | - |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | - |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp number | - |
| `WHATSAPP_ENABLED` | Enable WhatsApp features | `true` |

## Security Features

- **JWT Authentication**: Stateless authentication with access and refresh tokens
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Rate Limiting**: Prevents brute force attacks and API abuse
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configured to allow requests from specified origins
- **Security Headers**: Helmet.js provides security headers
- **Error Handling**: Proper error responses without sensitive information

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests with Jest
- `npm run seed` - Seed database with sample data

### Code Style

- Use ES6+ syntax
- Follow consistent naming conventions
- Add JSDoc comments for functions
- Handle errors appropriately
- Use async/await for asynchronous operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.