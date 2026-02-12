# 🔐 Step-by-Step Guide: Secure Signed File Uploads

Complete walkthrough to set up secure file uploads with Firebase Auth + Cloudinary signed uploads.

---

## 📋 Prerequisites

- ✅ Node.js installed (v18+)
- ✅ Firebase project created
- ✅ Cloudinary account (free tier works)
- ✅ Your React app running

---

## 🎯 Step 1: Install Backend Dependencies

**Location:** `server/` folder

```bash
# Navigate to server folder
cd server

# Install all required packages
npm install
```

**Expected output:**
```
added 150 packages in 30s
```

**What this installs:**
- `express` - Web server
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `cloudinary` - Cloudinary SDK
- `firebase-admin` - Firebase Admin SDK
- `multer` - File upload handling

---

## 🔑 Step 2: Get Cloudinary API Credentials

### 2.1 Go to Cloudinary Dashboard

1. Visit: https://cloudinary.com/console
2. **Log in** (or create free account)

### 2.2 Copy Your Credentials

From the **Dashboard** page, copy:

1. **Cloud Name** 
   - Example: `dxyz1234`
   - Found at top of dashboard

2. **API Key**
   - Click **Settings** (⚙️ gear icon)
   - Go to **Security** tab
   - Copy **API Key**

3. **API Secret**
   - Same **Security** tab
   - Click **Reveal** next to API Secret
   - Copy the secret (keep it safe!)

**📝 Note these down:**
```
Cloud Name: dxyz1234
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
```

---

## 🔥 Step 3: Get Firebase Service Account Key

### 3.1 Open Firebase Console

1. Visit: https://console.firebase.google.com/
2. **Select your project**

### 3.2 Navigate to Service Accounts

1. Click **⚙️ Settings** (top left)
2. Click **Project Settings**
3. Go to **Service Accounts** tab

### 3.3 Generate Private Key

1. Click **Generate New Private Key** button
2. **Confirm** the dialog
3. A JSON file will **download automatically**

### 3.4 Prepare the JSON

**Option A: Single-line format (Recommended)**

1. Open the downloaded JSON file
2. Copy **entire content**
3. Remove all line breaks (make it one line)
4. Escape quotes if needed

**Example:**
```json 
{"type":"service_account","project_id":"your-project","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@your-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40your-project.iam.gserviceaccount.com"}
```

**Option B: Use a JSON file (Alternative)**

If single-line is too complex, you can:
1. Save the JSON file as `server/firebase-service-account.json`
2. Update `server.js` to read from file instead

---

## 📝 Step 4: Create Backend Environment File

### 4.1 Create `.env` File

**Location:** `server/.env`

```bash
cd server
touch .env
# or create manually: server/.env
```

### 4.2 Add Configuration

Open `server/.env` and paste:

```env
# ──────────────────────────────────────────────────────────────
# Cloudinary Configuration
# ──────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# ──────────────────────────────────────────────────────────────
# Firebase Service Account (from Step 3)
# ──────────────────────────────────────────────────────────────
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# ──────────────────────────────────────────────────────────────
# Frontend URL (for CORS)
# ──────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5175

# ──────────────────────────────────────────────────────────────
# Server Port
# ──────────────────────────────────────────────────────────────
PORT=3001
```

### 4.3 Replace Placeholders

**Replace these values:**

1. `your_cloud_name_here` → Your Cloudinary Cloud Name
2. `your_api_key_here` → Your Cloudinary API Key
3. `your_api_secret_here` → Your Cloudinary API Secret
4. `{"type":"service_account"...}` → Your Firebase Service Account JSON (one line)

**Example `.env` file:**
```env
CLOUDINARY_CLOUD_NAME=dxyz1234
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"my-app-12345","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@my-app-12345.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40my-app-12345.iam.gserviceaccount.com"}
FRONTEND_URL=http://localhost:5175
PORT=3001
```

---

## 🚀 Step 5: Start Backend Server

### 5.1 Navigate to Server Folder

```bash
cd server
```

### 5.2 Start the Server

```bash
npm start
```

**Expected output:**
```
🚀 Secure Upload API running on http://localhost:3001
📁 Cloudinary: dxyz1234
🔐 Firebase Auth: Enabled
```

### 5.3 Verify Server is Running

Open browser: http://localhost:3001/api/health

**Expected response:**
```json
{
  "status": "ok",
  "cloudinary": true,
  "firebase": true
}
```

**✅ If you see this, backend is ready!**

**❌ If you see errors:**
- Check `.env` file has all values
- Verify Firebase Service Account JSON is valid
- Check Cloudinary credentials are correct

---

## 🎨 Step 6: Configure Frontend (Optional)

### 6.1 Check Frontend `.env`

If your backend runs on a different URL, add to root `.env`:

```env
VITE_API_URL=http://localhost:3001
```

**Default:** Frontend automatically uses `http://localhost:3001`

### 6.2 Verify Frontend Code

The frontend is already configured! Check:
- ✅ `src/services/storageService.js` - Uses backend API
- ✅ `src/pages/Timesheet/TimesheetModal.jsx` - Calls upload function

---

## 🧪 Step 7: Test the Upload

### 7.1 Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 7.2 Test Upload Flow

1. **Open app:** http://localhost:5175
2. **Log in** with your Firebase account
3. **Navigate to:** Timesheet page
4. **Click:** "Add Entry" or edit existing entry
5. **Upload file:** Click file upload field
6. **Select file:** Choose an image or PDF (max 10MB)
7. **Wait for upload:** Progress bar should show
8. **Verify:** File appears with preview

**✅ Success indicators:**
- File uploads without errors
- File preview shows correctly
- File URL is saved in database
- No console errors

**❌ Troubleshooting:**
- Check backend console for errors
- Verify you're logged in
- Check file size (max 10MB)
- Verify backend is running

---

## 🔍 Step 8: Verify Security

### 8.1 Check File Organization

In Cloudinary Dashboard → Media Library:

**Files should be organized as:**
```
timesheet-attachments/
  └── {userId}/
      ├── file1.pdf
      ├── image1.jpg
      └── document1.docx
```

### 8.2 Test Authentication

**Try uploading without logging in:**
- Should show: "Authentication required"

**Try accessing another user's file:**
- Should be blocked by server

---

## 🌐 Step 9: Production Deployment (When Ready)

### 9.1 Deploy Backend

**Options:**
- **Heroku:** `git push heroku main`
- **Railway:** Connect GitHub repo
- **Render:** Create Web Service
- **AWS/Google Cloud/Azure:** Use their Node.js hosting

**Update `.env` on server:**
```env
FRONTEND_URL=https://your-frontend-domain.com
PORT=3001  # or use their default port
```

### 9.2 Update Frontend

**Update root `.env`:**
```env
VITE_API_URL=https://your-backend-domain.com
```

**Rebuild frontend:**
```bash
npm run build
```

---

## 📊 Quick Reference Checklist

- [ ] Step 1: Installed backend dependencies (`cd server && npm install`)
- [ ] Step 2: Got Cloudinary credentials (Cloud Name, API Key, API Secret)
- [ ] Step 3: Got Firebase Service Account JSON
- [ ] Step 4: Created `server/.env` with all credentials
- [ ] Step 5: Started backend server (`npm start`)
- [ ] Step 6: Verified backend health endpoint works
- [ ] Step 7: Tested file upload in app
- [ ] Step 8: Verified files are organized by user ID

---

## 🆘 Common Issues & Solutions

### Issue: "Firebase Admin not configured"
**Solution:** Check `FIREBASE_SERVICE_ACCOUNT` in `.env` is valid JSON (one line)

### Issue: "Cloudinary upload failed"
**Solution:** Verify Cloudinary credentials in `.env` are correct

### Issue: "CORS error"
**Solution:** Check `FRONTEND_URL` in `server/.env` matches your frontend URL

### Issue: "Authentication required"
**Solution:** Make sure you're logged in to the app

### Issue: "File too large"
**Solution:** Maximum file size is 10MB (can be changed in `server.js`)

### Issue: Backend won't start
**Solution:** 
- Check all `.env` values are set
- Verify Node.js version (v18+)
- Check port 3001 is not in use

---

## 📚 Additional Resources

- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Firebase Admin SDK:** https://firebase.google.com/docs/admin/setup
- **Backend API Docs:** See `server/README.md`

---

## ✅ You're Done!

Your secure file upload system is now set up! Files are:
- ✅ Authenticated (Firebase Auth required)
- ✅ Signed (server-side security)
- ✅ Organized (user-specific folders)
- ✅ Validated (type and size checks)

**Need help?** Check the troubleshooting section or review the error messages in your console.
