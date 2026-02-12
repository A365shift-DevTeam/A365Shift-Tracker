// Helper script to create .env file
// Run: node setup-env.js

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('🔧 Backend .env Setup Wizard\n');
console.log('This will help you create your server/.env file.\n');

async function setup() {
  const env = {};

  // Cloudinary
  console.log('📁 Cloudinary Configuration:');
  env.CLOUDINARY_CLOUD_NAME = await question('Cloud Name: ');
  env.CLOUDINARY_API_KEY = await question('API Key: ');
  env.CLOUDINARY_API_SECRET = await question('API Secret: ');
  console.log('');

  // Firebase
  console.log('🔥 Firebase Service Account:');
  console.log('Get this from: Firebase Console → Settings → Service Accounts → Generate New Private Key');
  console.log('Paste the ENTIRE JSON as a SINGLE LINE:');
  env.FIREBASE_SERVICE_ACCOUNT = await question('Service Account JSON: ');
  console.log('');

  // Frontend URL
  env.FRONTEND_URL = await question('Frontend URL (default: http://localhost:5175): ') || 'http://localhost:5175';
  
  // Port
  env.PORT = await question('Server Port (default: 3001): ') || '3001';

  // Create .env content
  const envContent = `# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=${env.CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${env.CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${env.CLOUDINARY_API_SECRET}

# Firebase Service Account
FIREBASE_SERVICE_ACCOUNT=${env.FIREBASE_SERVICE_ACCOUNT}

# Frontend URL (for CORS)
FRONTEND_URL=${env.FRONTEND_URL}

# Server Port
PORT=${env.PORT}
`;

  // Write to .env
  fs.writeFileSync('.env', envContent);
  console.log('\n✅ .env file created successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review server/.env to make sure all values are correct');
  console.log('   2. Run: npm start');
  console.log('   3. Check http://localhost:3001/api/health\n');

  rl.close();
}

setup().catch(console.error);
