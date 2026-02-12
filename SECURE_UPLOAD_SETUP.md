# 🔐 Secure File Upload Setup Guide

Your app now uses **signed Cloudinary uploads** with Firebase Authentication for maximum security!

## ✅ Security Features

- 🔒 **Firebase Auth Required** - Only logged-in users can upload
- 🔐 **Signed Uploads** - Server-side authentication (no exposed API secrets)
- 👤 **User-Specific Folders** - Files organized by user ID
- ✅ **File Validation** - Type and size checks on server
- 🗑️ **Secure Deletion** - Users can only delete their own files

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Configure Backend Environment

Create `server/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase Service Account (see Step 3)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5175

# Server Port
PORT=3001
```

### Step 3: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ **Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Copy the entire JSON content
7. Paste it as a **single-line string** in `server/.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
   ```

**Important:** Keep the entire JSON on one line, including escaped quotes and newlines (`\n`).

### Step 4: Get Cloudinary API Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy from Dashboard:
   - **Cloud Name** (e.g., `dxyz1234`)
   - **API Key** (visible in Dashboard)
   - **API Secret** (Dashboard → Settings → Security)

### Step 5: Start Backend Server

```bash
cd server
npm start
```

Server runs on `http://localhost:3001`

### Step 6: Configure Frontend (Optional)

If your backend runs on a different URL, add to `.env`:

```env
VITE_API_URL=http://localhost:3001
```

## 🧪 Test It

1. Start backend: `cd server && npm start`
2. Start frontend: `npm run dev`
3. Log in to your app
4. Go to Timesheet → Create Entry → Upload a file
5. ✅ File should upload securely!

## 📁 File Organization

Files are stored in Cloudinary as:
```
timesheet-attachments/{userId}/filename.pdf
```

Each user's files are isolated in their own folder.

## 🚨 Troubleshooting

### "Authentication required"
- Make sure you're logged in
- Check Firebase Auth is working

### "Upload failed (500)"
- Check backend server is running
- Verify `.env` file has all credentials
- Check backend console for errors

### "CORS error"
- Make sure `FRONTEND_URL` in `server/.env` matches your frontend URL
- Default: `http://localhost:5175`

### "Firebase Admin not configured"
- Make sure `FIREBASE_SERVICE_ACCOUNT` is set in `server/.env`
- Verify the JSON is valid (single line, escaped properly)

## 🌐 Production Deployment

When deploying:

1. **Backend:** Deploy `server/` folder to:
   - Heroku
   - Railway
   - Render
   - AWS/Google Cloud/Azure
   - Or any Node.js hosting

2. **Frontend:** Update `.env`:
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```

3. **Backend:** Update `server/.env`:
   ```env
   FRONTEND_URL=https://your-frontend-url.com
   ```

## 🔒 Security Notes

- ✅ API secrets are **never** exposed to the frontend
- ✅ All uploads require Firebase Authentication
- ✅ Users can only access/delete their own files
- ✅ File validation happens server-side
- ✅ Signed uploads prevent unauthorized access
