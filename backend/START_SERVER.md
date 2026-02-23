# Starting the Backend Server

## Quick Start

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```
   admin login 
   username ---> admin
   password ---> routeritech

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

## Expected Output

When the server starts successfully, you should see:
```
🔄 Attempting to connect to MongoDB...
📍 MongoDB URI: mongodb://localhost:27017/polyibadan
✅ MongoDB connected successfully
🚀 Server running on port 3003
📝 Environment: development
📝 Health check: http://localhost:3003/api/health
```

## Troubleshooting

### Port Already in Use
If port 3003 is already in use, the server will automatically try the next available port (3004, 3005, etc.).

### MongoDB Connection Issues
- Make sure MongoDB is installed and running
- Check that MongoDB is running on `localhost:27017`
- If using MongoDB Atlas, update the `MONGODB_URI` in your `.env` file

### Connection Refused Error
- Ensure the backend server is running before starting the frontend
- Check that the server is running on the correct port (default: 3003)
- Verify the frontend API URL matches the backend port

## Environment Variables

Create a `.env` file in the backend directory with:
```
PORT=3003
MONGODB_URI=mongodb://localhost:27017/polyibadan
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

## Testing the Connection

Once the server is running, test it with:
```bash
curl http://localhost:3003/api/health
```

You should get a response like:
```json
{
  "status": "OK",
  "timestamp": "2026-01-25T...",
  "environment": "development"
}
```
