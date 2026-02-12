// ──────────────────────────────────────────────────────────────
// Secure Cloudinary Upload API Server
// ──────────────────────────────────────────────────────────────
// This server handles signed Cloudinary uploads with Firebase Auth verification
// Run: npm install && npm start
// Port: 3001 (or set PORT env variable)

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ──────────────────────────────────────────────────────────────
// Firebase Admin Setup (for verifying auth tokens)
// ──────────────────────────────────────────────────────────────
// Get your Firebase service account key:
// 1. Firebase Console → Project Settings → Service Accounts
// 2. Click "Generate New Private Key"
// 3. Save as server/firebase-service-account.json
// 4. Or set FIREBASE_SERVICE_ACCOUNT env variable

let firebaseInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.warn('⚠️  Firebase Admin not configured. Auth verification disabled.');
    console.warn('   Set FIREBASE_SERVICE_ACCOUNT env variable or create firebase-service-account.json');
  }
} catch (error) {
  console.warn('⚠️  Firebase Admin initialization failed:', error.message);
  firebaseInitialized = false;
}

// ──────────────────────────────────────────────────────────────
// Cloudinary Configuration
// ──────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ──────────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────────
// Allow multiple frontend URLs for development (Vite can use different ports)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5175',
  'http://localhost:5173', // Common Vite port
  'http://localhost:5174', // Alternative Vite port
  'http://localhost:5175', // Default
  'http://localhost:3000', // Common React port
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      // Log blocked origin for debugging
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use(express.json());

// Multer for handling file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ──────────────────────────────────────────────────────────────
// Verify Firebase Auth Token
// ──────────────────────────────────────────────────────────────
async function verifyAuthToken(req, res, next) {
  if (!firebaseInitialized) {
    return res.status(503).json({ 
      error: 'Authentication service not configured',
      message: 'Firebase Admin is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT in .env'
    });
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    next();
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ──────────────────────────────────────────────────────────────
// Upload Endpoint (Signed & Secure)
// ──────────────────────────────────────────────────────────────
app.post('/api/upload', verifyAuthToken, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      console.error('❌ No file provided in request');
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.user.uid;
    const folder = req.body.folder || 'timesheet-attachments';
    const userFolder = `${folder}/${userId}`;

    console.log(`📁 Uploading to folder: ${userFolder}`);
    console.log(`📄 File: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

    // Upload to Cloudinary with signed request
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: userFolder,
          resource_type: 'auto', // Auto-detect: image, video, raw (PDFs, docs)
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'],
          max_file_size: 10 * 1024 * 1024, // 10MB
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Upload successful:', result.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      url: uploadResult.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      publicId: uploadResult.public_id
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message 
    });
  }
});

// ──────────────────────────────────────────────────────────────
// Delete Endpoint (Signed & Secure)
// ──────────────────────────────────────────────────────────────
app.delete('/api/delete/:publicId', verifyAuthToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    const userId = req.user.uid;

    // Verify the file belongs to this user (check folder path)
    if (!publicId.includes(`/${userId}/`)) {
      return res.status(403).json({ error: 'Unauthorized: File does not belong to user' });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto'
    });

    if (result.result === 'ok') {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Delete failed', 
      message: error.message 
    });
  }
});

// ──────────────────────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  let firebaseStatus = false;
  try {
    if (firebaseInitialized) {
      firebaseStatus = !!getAuth();
    }
  } catch (error) {
    firebaseStatus = false;
  }

  res.json({ 
    status: 'ok', 
    cloudinary: !!cloudinary.config().cloud_name,
    firebase: firebaseStatus
  });
});

// ──────────────────────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  let firebaseStatus = 'Disabled';
  try {
    if (firebaseInitialized) {
      firebaseStatus = getAuth() ? 'Enabled' : 'Disabled';
    }
  } catch (error) {
    firebaseStatus = 'Disabled';
  }

  console.log(`\n✅ Server started successfully!`);
  console.log(`🚀 Secure Upload API running on http://localhost:${PORT}`);
  console.log(`📁 Cloudinary: ${cloudinary.config().cloud_name || 'Not configured'}`);
  console.log(`🔐 Firebase Auth: ${firebaseStatus}`);
  
  if (!firebaseInitialized) {
    console.log('\n📝 To enable authentication:');
    console.log('   1. Get Firebase Service Account JSON from Firebase Console');
    console.log('   2. Add FIREBASE_SERVICE_ACCOUNT to server/.env');
    console.log('   3. Restart the server\n');
  }
  
  if (!cloudinary.config().cloud_name) {
    console.log('\n📝 To enable Cloudinary:');
    console.log('   1. Get credentials from Cloudinary Dashboard');
    console.log('   2. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to server/.env');
    console.log('   3. Restart the server\n');
  }
  
  console.log(`\n📡 Ready to accept requests!\n`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use!`);
    console.error(`   Please stop the process using port ${PORT} or change PORT in .env\n`);
    console.error(`   To find and kill the process:`);
    console.error(`   netstat -ano | findstr :${PORT}`);
    console.error(`   taskkill /F /PID <process_id>\n`);
  } else {
    console.error('\n❌ Server error:', error);
  }
  process.exit(1);
});
