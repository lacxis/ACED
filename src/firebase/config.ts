import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const env = import.meta.env;
export const FIREBASE_ENABLED =
  env.VITE_FIREBASE_ENABLED === 'true' && !!env.VITE_FB_API_KEY;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Database | undefined;

if (FIREBASE_ENABLED) {
  app = initializeApp({
    apiKey: env.VITE_FB_API_KEY,
    authDomain: env.VITE_FB_AUTH_DOMAIN,
    databaseURL: env.VITE_FB_DATABASE_URL,
    projectId: env.VITE_FB_PROJECT_ID,
    storageBucket: env.VITE_FB_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FB_MESSAGING_SENDER_ID,
    appId: env.VITE_FB_APP_ID,
  });
  auth = getAuth(app);
  db = getDatabase(app);
}
export { app, auth, db };
