import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ESM __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the path to the service account key
const serviceAccountPath = join(__dirname, '../../firebase/development-service-account.json');
console.log(serviceAccountPath)

// Read and parse the key
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
