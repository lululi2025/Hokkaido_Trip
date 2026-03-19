import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let app = null;
let auth = null;
let db = null;

export function initFirebase(config) {
  if (!config || config.apiKey === 'YOUR_API_KEY') return { app: null, auth: null, db: null };
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    return { app, auth, db };
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    return { app: null, auth: null, db: null };
  }
}

export { app as firebaseApp, auth as firebaseAuth, db as firebaseDb };
