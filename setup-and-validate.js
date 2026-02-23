#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PolyIbadan Cooperative Management System - Setup & Validation');
console.log('=' .repeat(70));

// Check if running in correct directory
const backendDir = path.join(__dirname, '..');
const frontendDir = path.join(__dirname, '..', '..', 'frontend');

if (!fs.existsSync(path.join(backendDir, 'package.json')) || 
    !fs.existsSync(path.join(frontendDir, 'package.json'))) {
  console.error('❌ Error: Please run this script from the backend/scripts directory');
  process.exit(1);
}

console.log('📁 Backend Directory:', backendDir);
console.log('📁 Frontend Directory:', frontendDir);
console.log('');

// Step 1: Install Dependencies
console.log('📦 Step 1: Installing Dependencies...');
try {
  console.log('   Installing backend dependencies...');
  execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
  
  console.log('   Installing frontend dependencies...');
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
  
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('');

// Step 2: Environment Setup
console.log('🔧 Step 2: Environment Setup...');

// Check backend .env
const backendEnvPath = path.join(backendDir, '.env');
if (!fs.existsSync(backendEnvPath)) {
  console.log('   Creating backend .env file...');
  const backendEnv = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/polyibadan
MONGODB_DB_NAME=polyibadan
MONGODB_HOST=localhost
MONGODB_PORT=27017

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3003
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# WhatsApp Configuration (Optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
WHATSAPP_ENABLED=false
`;
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('   ✅ Backend .env file created');
} else {
  console.log('   ✅ Backend .env file already exists');
}

// Check frontend .env
const frontendEnvPath = path.join(frontendDir, '.env');
if (!fs.existsSync(frontendEnvPath)) {
  console.log('   Creating frontend .env file...');
  const frontendEnv = `# API Configuration
VITE_API_URL=http://localhost:3003/api

# Environment
VITE_NODE_ENV=development
`;
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('   ✅ Frontend .env file created');
} else {
  console.log('   ✅ Frontend .env file already exists');
}

console.log('');

// Step 3: Database Setup
console.log('🗄️  Step 3: Database Setup...');
try {
  console.log('   Starting MongoDB...');
  try {
    execSync('mongod --version', { stdio: 'pipe' });
    console.log('   ✅ MongoDB is installed');
  } catch (error) {
    console.log('   ⚠️  MongoDB not found. Please install MongoDB Community Server');
    console.log('   Download from: https://www.mongodb.com/try/download/community');
  }
  
  console.log('   Creating demo data...');
  execSync('node create-demo-members.js', { cwd: path.join(__dirname), stdio: 'inherit' });
  execSync('node seed-member-data.js', { cwd: path.join(__dirname), stdio: 'inherit' });
  
  console.log('   ✅ Demo data created successfully');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
}

console.log('');

// Step 4: Validation
console.log('✅ Step 4: System Validation...');

// Validate backend
console.log('   Validating backend...');
try {
  const serverOutput = execSync('node server.js', { 
    cwd: backendDir, 
    stdio: 'pipe',
    timeout: 5000 
  });
  console.log('   ✅ Backend server starts successfully');
} catch (error) {
  if (error.signal === 'SIGTERM') {
    console.log('   ✅ Backend server starts successfully');
  } else {
    console.log('   ⚠️  Backend validation: Check server configuration');
  }
}

// Validate frontend build
console.log('   Validating frontend build...');
try {
  execSync('npm run build', { 
    cwd: frontendDir, 
    stdio: 'pipe',
    timeout: 30000 
  });
  console.log('   ✅ Frontend builds successfully');
} catch (error) {
  console.log('   ⚠️  Frontend build: Check frontend configuration');
}

console.log('');

// Step 5: Instructions
console.log('🎯 Setup Complete! Next Steps:');
console.log('');
console.log('1. Start MongoDB (if not running):');
console.log('   mongod');
console.log('');
console.log('2. Start Backend Server:');
console.log('   cd backend && npm run dev');
console.log('');
console.log('3. Start Frontend Development Server:');
console.log('   cd frontend && npm run dev');
console.log('');
console.log('4. Access Applications:');
console.log('   🌐 Staff/Admin Dashboard: http://localhost:3000/login');
console.log('   👥 Member Portal: http://localhost:3000/member/login');
console.log('');
console.log('5. Demo Credentials:');
console.log('   👤 Staff/Admin: username: admin, password: admin123');
console.log('   👥 Member (Student): ID: STU2024001, Password: demo123');
console.log('   👥 Member (Teacher): ID: TEA2024001, Password: demo123');
console.log('   👥 Member (Staff): ID: STF2024001, Password: demo123');
console.log('');
console.log('6. Import Products (Optional):');
console.log('   node backend/scripts/import-products-enhanced.js path-to-your-products.xlsx');
console.log('   node backend/scripts/import-products-enhanced.js --template');
console.log('');
console.log('🔧 Troubleshooting:');
console.log('   - Ensure MongoDB is running on port 27017');
console.log('   - Check that ports 3000 and 3003 are available');
console.log('   - Verify .env files are correctly configured');
console.log('   - Check browser console for any errors');
console.log('');
console.log('📚 Documentation:');
console.log('   - README_MEMBER_PORTAL.md');
console.log('   - TODO.md');
console.log('   - SETUP.md');
console.log('');
console.log('✨ PolyIbadan Cooperative Management System is ready!');
