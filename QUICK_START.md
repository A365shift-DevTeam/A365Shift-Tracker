# ⚡ Quick Start: Signed File Uploads

## 🎯 5-Minute Setup

### 1️⃣ Install Backend
```bash
cd server
npm install
```

### 2️⃣ Get Credentials

**Cloudinary:**
- Dashboard → Copy Cloud Name, API Key, API Secret

**Firebase:**
- Console → Settings → Service Accounts → Generate Private Key
- Copy JSON (make it one line)

### 3️⃣ Create `server/.env`
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FRONTEND_URL=http://localhost:5175
PORT=3001
```

### 4️⃣ Start Backend
```bash
cd server
npm start
```

### 5️⃣ Test
- Open app → Login → Upload file in Timesheet ✅

---

## 📖 Full Guide
See `SETUP_GUIDE_SIGNED_UPLOADS.md` for detailed instructions.
