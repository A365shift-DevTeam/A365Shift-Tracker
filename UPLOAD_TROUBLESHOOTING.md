# 🔧 Upload Error Troubleshooting Guide

## "Failed to fetch" Error - Quick Fixes

### ✅ Step 1: Check Backend Server is Running

```bash
cd server
npm start
```

**Expected output:**
```
🚀 Secure Upload API running on http://localhost:3001
📁 Cloudinary: your_cloud_name
🔐 Firebase Auth: Enabled
```

### ✅ Step 2: Verify Backend Health

Open in browser: http://localhost:3001/api/health

**Should return:**
```json
{"status":"ok","cloudinary":true,"firebase":true}
```

**If you see errors:**
- Check `server/.env` file has all credentials
- Verify Cloudinary credentials are correct
- Verify Firebase Service Account JSON is valid

### ✅ Step 3: Check You're Logged In

- Make sure you're logged into the app
- The upload requires Firebase Authentication
- Try logging out and logging back in

### ✅ Step 4: Check Browser Console

Open browser DevTools (F12) → Console tab

**Look for:**
- Network errors
- CORS errors
- Authentication errors

**Common errors:**

1. **"Cannot connect to upload server"**
   - Backend not running → Start with `cd server && npm start`
   - Wrong URL → Check `VITE_API_URL` in `.env`

2. **"CORS error"**
   - Check `FRONTEND_URL` in `server/.env` matches your frontend URL
   - Default: `http://localhost:5175`

3. **"Authentication required"**
   - Make sure you're logged in
   - Try logging out and back in

4. **"Backend server is not responding"**
   - Backend crashed → Check server console for errors
   - Port conflict → Change `PORT` in `server/.env`

### ✅ Step 5: Check Server Logs

When you upload, check the backend console for:

**Good logs:**
```
📤 Upload request received
📁 Uploading to folder: timesheet-attachments/user123
📄 File: document.pdf (245.32 KB)
✅ Upload successful: timesheet-attachments/user123/document
```

**Error logs:**
```
❌ Cloudinary upload error: ...
❌ Upload error: ...
```

### ✅ Step 6: Verify Configuration

**Check `server/.env`:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FRONTEND_URL=http://localhost:5175
PORT=3001
```

**Check frontend `.env` (optional):**
```env
VITE_API_URL=http://localhost:3001
```

## 🔍 Common Issues & Solutions

### Issue: "Failed to fetch" immediately
**Solution:** Backend not running or wrong URL

### Issue: "Authentication required"
**Solution:** Log in to the app

### Issue: "Upload failed (500)"
**Solution:** Check backend console for Cloudinary errors

### Issue: "File too large"
**Solution:** Maximum file size is 10MB

### Issue: CORS error in browser console
**Solution:** Update `FRONTEND_URL` in `server/.env` to match your frontend URL

## 📞 Still Having Issues?

1. Check backend console for detailed error messages
2. Check browser console (F12) for frontend errors
3. Verify all credentials in `server/.env` are correct
4. Make sure backend server is running before uploading
