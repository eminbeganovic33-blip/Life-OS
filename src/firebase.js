// Lightweight Firebase facade. The SDK itself lives in ./firebaseClient.js and
// is only downloaded when Firebase is configured AND something needs it
// (auth state, sign-in, or opted-in analytics).

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
export { firebaseConfig };

let clientPromise = null;

/** Resolve the initialised Firebase client, or null when not configured. */
export function loadFirebase() {
  if (!firebaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("./firebaseClient")
      .then((m) => m.init(firebaseConfig))
      .catch((err) => { clientPromise = null; throw err; });
  }
  return clientPromise;
}

// Usage analytics are opt-in (privacy policy + GDPR): nothing is sent, and the
// analytics SDK isn't even loaded, until the user turns it on in Me → Settings.
let analyticsConsent = false;
export function setAnalyticsConsent(allowed) {
  const was = analyticsConsent;
  analyticsConsent = !!allowed;
  // Withdrawing consent must stop the SDK's own automatic collection as well.
  if (was && !analyticsConsent && firebaseConfigured && clientPromise) {
    clientPromise.then((fb) => fb?.disableAnalytics()).catch(() => {});
  }
}

/**
 * Log an analytics event. No-op unless: production build, Firebase configured,
 * and the user opted in. Usage: track("quest_added", { category: "sleep" })
 */
export function track(eventName, params = {}) {
  if (!import.meta.env.PROD || !firebaseConfigured || !analyticsConsent) return;
  loadFirebase().then((fb) => fb?.logEvent(eventName, params)).catch(() => {});
}
