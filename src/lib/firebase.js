// ╔══════════════════════════════════════════════════════════════╗
// ║  ORVA — Firebase Config                                      ║
// ║  Currently: orva-online (test project)                       ║
// ║                                                              ║
// ║  To switch to PRODUCTION (orva-bd):                          ║
// ║    1. .env         → comment TEST block, uncomment PROD      ║
// ║    2. This file    → no changes needed (reads from .env)     ║
// ╚══════════════════════════════════════════════════════════════╝

import { initializeApp } from 'firebase/app';
import { getDatabase }   from 'firebase/database';
import { getAuth }       from 'firebase/auth';

// ── Active config (pulled from .env) ─────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ── Guard: missing databaseURL ────────────────────────────────────
if (!firebaseConfig.databaseURL) {
  console.error(
    '\n🔴 ORVA: VITE_FIREBASE_DATABASE_URL is missing from .env\n' +
    'Firebase Console → Realtime Database → copy the URL at the top\n'
  );
}

// ── Init ─────────────────────────────────────────────────────────
const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let db = null;
try {
  if (firebaseConfig.databaseURL) db = getDatabase(app);
} catch (e) {
  console.error('Firebase Database init failed:', e.message);
}

export { db };
export default app;
