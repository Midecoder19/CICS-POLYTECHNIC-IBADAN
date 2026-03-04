# LAN Deployment Guide

This document explains how to configure the application for use on a Local Area Network (LAN).

## Current Configuration

The project is now configured for LAN deployment. Here's what you need to know:

### Backend Server (Already Configured)
- **Port**: 3003
- **Host**: 0.0.0.0 (accepts connections from any IP)
- **CORS**: Accepts requests from any origin (including IP addresses)
- **MongoDB**: Uses localhost:27017 (or your configured MongoDB URI)

### Frontend Configuration

For LAN access, you need to set the API URL to point to the server's IP address.

#### Option 1: Using .env.lan file (Recommended)

1. Copy `.env.lan` to `.env`:
   ```bash
   copy .env.lan .env
   ```

2. Edit `.env` and replace the IP address:
   ```
   VITE_API_URL=http://192.168.1.100:3003/api
   ```
   (Replace `192.168.1.100` with your server's actual IP address)

3. Restart the frontend server

#### Option 2: Using Command Line

Set the environment variable when starting the frontend:
```bash
# Windows
set VITE_API_URL=http://192.168.1.100:3003/api
npm run dev

# Linux/Mac
VITE_API_URL=http://192.168.1.100:3003/api npm run dev
```

## Quick Setup

### Step 1: Find Your Server's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (usually 192.168.x.x)

**Linux/Mac:**
```bash
ip addr show
```
or
```bash
ifconfig
```

### Step 2: Configure Frontend

Edit `frontend/.env`:
```
VITE_API_URL=http://YOUR_SERVER_IP:3003/api
```

### Step 3: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Access from Other Computers

Open a browser on any computer in the network and navigate to:
```
http://YOUR_SERVER_IP:3000
```

Replace `YOUR_SERVER_IP` with the actual IP address of the computer running the frontend.

## Network Requirements

1. **Firewall**: Ensure both ports 3000 and 3003 are allowed through Windows Firewall
2. **Same Network**: All devices must be on the same local network
3. **MongoDB**: If MongoDB is not on the same machine, update `backend/.env` with the MongoDB URI

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console, ensure:
1. Backend is running on port 3003
2. The IP address in `.env` matches the server's actual IP

### Connection Timeout
If requests timeout:
1. Verify the server is running: `http://SERVER_IP:3003/api/health`
2. Check firewall settings
3. Ensure all devices are on the same network

### Can't Access MongoDB from Remote
Update `backend/.env`:
```
MONGODB_URI=mongodb://192.168.1.x:27017/polyibadan
```

## Security Note

This configuration allows CORS from any origin for development convenience. For production, you should restrict this in `backend/server.js` to only your specific frontend URL.
