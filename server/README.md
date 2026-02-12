# Secure Upload API Server

This backend API provides **signed Cloudinary uploads** with Firebase Authentication verification.

## 🔐 Security Features

- ✅ **Firebase Auth Verification** - Only authenticated users can upload
- ✅ **Signed Cloudinary Uploads** - Server-side authentication prevents unauthorized uploads
- ✅ **User-Specific Folders** - Files organized by user ID (`timesheet-attachments/{userId}/`)
- ✅ **File Type Validation** - Only allowed formats accepted
- ✅ **File Size Limits** - 10MB maximum per file
- ✅ **Secure File Deletion** - Users can only delete their own files

## 🚀 Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**Required:**
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key (from Dashboard)
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret (from Dashboard)
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON (see below)

### 3. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ **Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Copy the entire JSON content
7. Paste it as a **single-line string** in `.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
   ```

### 4. Get Cloudinary API Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your:
   - **Cloud Name** (e.g., `dxyz1234`)
   - **API Key** (from Dashboard)
   - **API Secret** (from Dashboard → Settings → Security)

### 5. Start the Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server runs on `http://localhost:3001`

## 📡 API Endpoints

### `POST /api/upload`
Upload a file securely.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Body:** `multipart/form-data`
- `file`: The file to upload
- `folder`: (optional) Folder name (default: `timesheet-attachments`)

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "fileName": "document.pdf",
  "fileType": "application/pdf",
  "fileSize": 1024000,
  "publicId": "timesheet-attachments/user123/document"
}
```

### `DELETE /api/delete/:publicId`
Delete a file securely.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### `GET /api/health`
Health check endpoint.

## 🔒 Security Notes

- The API verifies Firebase Auth tokens before allowing uploads
- Files are stored in user-specific folders
- Users can only delete their own files
- All uploads are signed server-side (no client-side API secrets exposed)
