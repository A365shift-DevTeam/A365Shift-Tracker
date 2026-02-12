# 🔧 How to Create server/.env File

Your `.env` file is empty. Here's how to create it:

## Option 1: Use the Setup Script (Easiest)

```bash
cd server
node setup-env.js
```

Follow the prompts to enter your credentials.

## Option 2: Create Manually

Create `server/.env` file with this content:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase Service Account (paste entire JSON as single line)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

# Frontend URL
FRONTEND_URL=http://localhost:5175

# Server Port
PORT=3001
```

## Where to Get Credentials:

### Cloudinary:
1. Go to https://cloudinary.com/console
2. Dashboard → Copy **Cloud Name**
3. Settings → Security → Copy **API Key** and **API Secret**

### Firebase:
1. Go to https://console.firebase.google.com/
2. Select your project
3. Settings → Project Settings → Service Accounts
4. Click **Generate New Private Key**
5. Copy the entire JSON and paste as ONE LINE in `.env`

## After Creating .env:

```bash
cd server
npm start
```

The server should start successfully! ✅
