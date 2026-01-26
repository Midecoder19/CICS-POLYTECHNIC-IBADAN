# Quick Start Guide

## ⚠️ Connection Refused Error Fix

If you're seeing `ERR_CONNECTION_REFUSED`, it means the **backend server is not running**.

## Steps to Fix

### 1. Start the Backend Server

Open a **new terminal/command prompt** and run:

```bash
cd backend
npm install  # Only needed first time or after adding dependencies
npm run dev
```

You should see:
```
🔄 Attempting to connect to MongoDB...
📍 MongoDB URI: mongodb://localhost:27017/polyibadan
✅ MongoDB connected successfully
🚀 Server running on port 3003
📝 Environment: development
📝 Health check: http://localhost:3003/api/health
```

### 2. Verify Backend is Running

Open your browser and go to:
```
http://localhost:3003/api/health
```

You should see:
```json
{"status":"OK","timestamp":"...","environment":"development"}
```

### 3. Start the Frontend (in a separate terminal)

Open **another terminal/command prompt** and run:

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

### 4. Test Registration

Now try registering again in the frontend. The connection should work!

---

## Troubleshooting

### Port Already in Use
If port 3003 is busy, the server will automatically try 3004, 3005, etc.
- Check the terminal output to see which port it's using
- Update `frontend/src/config/api.js` if needed to match the port

### MongoDB Not Running
If you see MongoDB connection errors:
- **Windows**: Make sure MongoDB service is running
- **Mac/Linux**: Start MongoDB with `mongod` or `brew services start mongodb-community`
- Or use MongoDB Atlas (cloud) and update `MONGODB_URI` in `.env`

### Still Getting Connection Refused?
1. ✅ Check backend server is running (step 1)
2. ✅ Check backend is on port 3003 (check terminal output)
3. ✅ Check frontend API URL matches backend port
4. ✅ Try restarting both servers
5. ✅ Check firewall/antivirus isn't blocking connections

---

## Development Workflow

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Keep both terminals open while developing!
