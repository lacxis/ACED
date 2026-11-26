import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

/**
 * Firebase web config is PUBLIC by design — these keys identify the project,
 * they are not secrets. Security is enforced entirely by the Realtime Database
 * rules (see database.rules.json), never by hiding this config.
 *
 * Values can be overridden per-environment via Vite env vars; otherwise the
 * committed ACED project config below is used, so every Netlify deploy preview
 * runs against the real Firebase with no extra setup.
 */
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FB_API_KEY ?? 'AIzaSyAso9aBx4r3wm9vLjwPOKL_9pPADgUKCuw',
  authDomain: env.VITE_FB_AUTH_DOMAIN ?? 'aced-attendance.firebaseapp.com',
  databaseURL: env.VITE_FB_DATABASE_URL ?? 'https://aced-attendance-default-rtdb.firebaseio.com',
  projectId: env.VITE_FB_PROJECT_ID ?? 'aced-attendance',
  storageBucket: env.VITE_FB_STORAGE_BUCKET ?? 'aced-attendance.firebasestorage.app',
  messagingSenderId: env.VITE_FB_MESSAGING_SENDER_ID ?? '761035694486',
  appId: env.VITE_FB_APP_ID ?? '1:761035694486:web:168baa3b39baa53688bdb7',
};

// Live unless explicitly disabled (VITE_FIREBASE_ENABLED=false) for a design-only preview.
export const FIREBASE_ENABLED =
  env.VITE_FIREBASE_ENABLED !== 'false' && !!firebaseConfig.databaseURL;

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Database = getDatabase(app);
