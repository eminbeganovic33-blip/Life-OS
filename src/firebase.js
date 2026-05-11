import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase is optional — app works in local-only mode without config
export const firebaseConfigured = !!firebaseConfig.apiKey;
// FCM background push requires a VAPID key — optional too
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || null;
// Expose raw config so the FCM service worker can be registered with it
export { firebaseConfig };

let app = null;
let auth = null;
let googleProvider = null;
let facebookProvider = null;
let db = null;

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  facebookProvider = new FacebookAuthProvider();
  db = getFirestore(app);
}

export { auth, googleProvider, facebookProvider, db };
export default app;
