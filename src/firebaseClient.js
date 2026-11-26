// The Firebase SDK, loaded on demand by loadFirebase() in ./firebase.js.
// Kept out of the main bundle so local-only users (no Firebase config — the
// current production build) never download or parse it.
//
// Firestore is intentionally not included: nothing reads or writes it (cloud
// sync was removed in May 2026). Re-add it together with security rules when
// sync comes back.
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

export function init(config) {
  const app = initializeApp(config);
  const auth = getAuth(app);
  let analytics = null;
  let analyticsPromise = null;

  return {
    app,
    auth,
    googleProvider: new GoogleAuthProvider(),
    facebookProvider: new FacebookAuthProvider(),
    authApi: {
      onAuthStateChanged,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signInWithRedirect,
      getRedirectResult,
      signOut,
      sendPasswordResetEmail,
      updateProfile,
    },
    // Analytics is initialised only after the user opts in (see track()), with
    // automatic page views off; opting out calls setAnalyticsCollectionEnabled
    // (false) so the SDK's automatic events stop too, not just ours.
    async enableAnalytics() {
      if (!analyticsPromise) {
        analyticsPromise = import("firebase/analytics").then(async (m) => {
          if (!(await m.isSupported())) return null;
          analytics = m.initializeAnalytics(app, { config: { send_page_view: false } });
          return { analytics, logEvent: m.logEvent, setEnabled: (on) => m.setAnalyticsCollectionEnabled(analytics, on) };
        });
      }
      const a = await analyticsPromise;
      a?.setEnabled(true);
      return a;
    },
    async disableAnalytics() {
      if (!analyticsPromise) return; // never initialised — nothing is collecting
      const a = await analyticsPromise;
      a?.setEnabled(false);
    },
    async logEvent(name, params) {
      const a = await this.enableAnalytics();
      if (a) a.logEvent(a.analytics, name, params);
    },
  };
}
