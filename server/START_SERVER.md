# 🚀 How to Start the Backend Server

## Quick Start (Windows)

**Option 1: Double-click**
- Double-click `start-server.bat` in the `server` folder

**Option 2: Command Line**
```bash
cd server
npm start
```

**Option 3: Manual**
```bash
cd server
node server.js
```

## ✅ Verify Server is Running

1. **Check Health Endpoint:**
   - Open browser: http://localhost:3001/api/health
   - Should show: `{"status":"ok","cloudinary":true,"firebase":true}`

2. **Check Port:**
   ```bash
   netstat -ano | findstr :3001
   ```
   Should show: `LISTENING`

## 🔧 Troubleshooting

### Port Already in Use

If you see `EADDRINUSE: address already in use :::3001`:

1. **Find the process:**
   ```bash
   netstat -ano | findstr :3001
   ```

2. **Kill the process:**
   ```bash
   taskkill /F /PID <process_id>
   ```

3. **Or use the batch file:**
   - `start-server.bat` automatically kills old processes

### Server Not Responding

1. Check `server/.env` file exists and has all credentials
2. Verify Node.js is installed: `node --version`
3. Check server console for error messages

## 📝 Expected Output

When server starts successfully, you should see:

```
✅ Firebase Admin initialized successfully
🌐 CORS enabled for: http://localhost:5173, ...
✅ Server started successfully!
🚀 Secure Upload API running on http://localhost:3001
📁 Cloudinary: your_cloud_name
🔐 Firebase Auth: Enabled
📡 Ready to accept requests!
```

## 🛑 Stop Server

Press `Ctrl+C` in the terminal where server is running.
