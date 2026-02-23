# PolyIbadan Full-Stack Application Setup Guide

This guide will help you set up the PolyIbadan cooperative management system on a Windows server laptop for local network access.

## Prerequisites

- Windows 10 or 11
- Administrator privileges (for installation)
- Internet connection for downloading dependencies

## Quick Setup

### Step 1: Install Dependencies

Run the installation script as Administrator:

```batch
install.bat
```

This script will:
- Install Node.js (if not already installed)
- Install MongoDB (if not already installed)
- Install backend and frontend dependencies

### Step 2: Configure Network Access

Run the network configuration script:

```batch
configure-network.bat
```

This script will:
- Detect your laptop's local IP address
- Update the frontend configuration to use the IP address instead of localhost
- Display instructions for other devices to connect

### Step 3: Start the Application

Run the startup script:

```batch
start-server.bat
```

This script will:
- Start MongoDB service
- Start the backend server (port 3003)
- Start the frontend development server (port 3000)

## Manual Configuration

If you prefer manual setup:

### Environment Variables

#### Backend (.env)
The backend `.env` file is already configured with:
```
MONGODB_URI=mongodb://localhost:27017/polyibadan
PORT=3003
NODE_ENV=development
```

#### Frontend (.env)
Create/update `frontend/.env`:
```
VITE_API_URL=http://[YOUR_IP_ADDRESS]:3003/api
```

Replace `[YOUR_IP_ADDRESS]` with your laptop's IP address (found via `ipconfig`).

## Network Access Instructions

### For Other Devices on the Same Network:

1. **Find Server IP**: On the server laptop, run `ipconfig` in Command Prompt and note the IPv4 Address
2. **Access the Application**:
   - Frontend: `http://[SERVER_IP]:3000`
   - Backend API: `http://[SERVER_IP]:3003/api`
3. **Firewall Settings**: Ensure Windows Firewall allows connections on ports 3000 and 3003

### Example:
If your server IP is `192.168.1.100`:
- Frontend: `http://192.168.1.100:3000`
- Backend: `http://192.168.1.100:3003/api`

## Troubleshooting

### MongoDB Issues
- Check if MongoDB service is running: `net start MongoDB`
- Manual start: `mongod --dbpath "C:\data\db"`
- Use MongoDB Compass with connection string: `mongodb://localhost:27017/polyibadan`

### Port Conflicts
- Backend uses port 3003
- Frontend uses port 3000
- Check what's using ports: `netstat -ano | findstr :3003`

### Network Issues
- Verify all devices are on the same network
- Check firewall settings in Windows Security
- Try disabling firewall temporarily for testing

## Updating the Code

### Option 1: Using Git (Recommended)

```batch
# Pull latest changes
git pull origin main

# Install any new dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Restart services
start-server.bat
```

### Option 2: Replace Folders

1. Download the latest code as a ZIP file
2. Extract and replace the `backend/` and `frontend/` folders
3. Run `install.bat` to ensure dependencies are up to date
4. Run `configure-network.bat` if IP changed
5. Run `start-server.bat` to start services

## Application Architecture

- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React + Vite
- **Database**: MongoDB (local installation)
- **Ports**:
  - Frontend: 3000 (development server)
  - Backend: 3003 (API server)
  - MongoDB: 27017 (database)

## Security Notes

- This setup is for local network use only
- No authentication is required for basic access
- Database contains sensitive cooperative data
- Ensure network security when deploying

## Support

If you encounter issues:
1. Check the console output in the command windows
2. Verify all services are running
3. Check network connectivity between devices
4. Review firewall and antivirus settings
