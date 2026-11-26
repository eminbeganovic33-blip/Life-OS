import { createContext, useContext, useState, useEffect } from "react";
import { firebaseConfigured, loadFirebase } from "../firebase";

const AuthContext = createContext(null);

function friendlyAuthError(err) {
  const code = err?.code || "";
  if (code === "auth/unauthorized-domain") {
    return "This domain isn't authorised in Firebase. Add it under Authentication → Settings → Authorised domains in the Firebase Console.";
  }
  if (code === "auth/popup-blocked") {
    return "Popup was blocked. Trying redirect sign-in instead — you'll be taken to Google and returned here.";
  }
  if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Email or password is incorrect.";
  }
  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists.";
  }
  if (code === "auth/weak-password") {
    return "Password must be at least 6 characters.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error — check your connection and try again.";
  }
  return err?.message || "Something went wrong. Please try again.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Starts false when Firebase isn't configured, so no synchronous setState
  // is needed in the effect below.
  const [loading, setLoading] = useState(firebaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!firebaseConfigured) return;
    let cancelled = false;
    let unsubscribe = () => {};
    // Fallback: never leave the splash spinner up on a flaky connection or
    // misconfigured domain.
    const timeout = setTimeout(() => setLoading(false), 4000);

    loadFirebase()
      .then((fb) => {
        if (cancelled || !fb) return;
        // Handle result from signInWithRedirect
        fb.authApi.getRedirectResult(fb.auth)
          .then((result) => { if (result?.user) setUser(result.user); })
          .catch((err) => setError(friendlyAuthError(err)));
        unsubscribe = fb.authApi.onAuthStateChanged(fb.auth, (firebaseUser) => {
          clearTimeout(timeout);
          setUser(firebaseUser);
          setLoading(false);
        });
      })
      .catch(() => { clearTimeout(timeout); setLoading(false); });

    return () => { cancelled = true; clearTimeout(timeout); unsubscribe(); };
  }, []);

  // Run an auth call with the lazily loaded SDK, mapping errors to copy.
  async function withAuth(fn, { rethrow = true } = {}) {
    setError(null);
    try {
      const fb = await loadFirebase();
      if (!fb) throw Object.assign(new Error("Accounts aren't available in this version of Life OS."), { code: "app/no-firebase" });
      return await fn(fb);
    } catch (err) {
      const msg = friendlyAuthError(err);
      setError(msg);
      if (rethrow) throw new Error(msg);
    }
  }

  const login = (email, password) =>
    withAuth((fb) => fb.authApi.signInWithEmailAndPassword(fb.auth, email, password));

  const signup = (email, password, displayName) =>
    withAuth(async (fb) => {
      const { user: newUser } = await fb.authApi.createUserWithEmailAndPassword(fb.auth, email, password);
      if (displayName) await fb.authApi.updateProfile(newUser, { displayName });
    });

  // Redirect (no popup) — works on mobile, PWA, and when popups are blocked
  const loginWithGoogle = () =>
    withAuth((fb) => fb.authApi.signInWithRedirect(fb.auth, fb.googleProvider));

  const loginWithFacebook = () =>
    withAuth((fb) => fb.authApi.signInWithRedirect(fb.auth, fb.facebookProvider));

  const logout = () => withAuth((fb) => fb.authApi.signOut(fb.auth), { rethrow: false });

  const resetPassword = (email) =>
    withAuth((fb) => fb.authApi.sendPasswordResetEmail(fb.auth, email));

  const updateDisplayName = (name) =>
    withAuth(async (fb) => {
      await fb.authApi.updateProfile(fb.auth.currentUser, { displayName: name });
      setUser({ ...fb.auth.currentUser });
    }, { rethrow: false });

  const value = {
    user, loading, error,
    login, signup, loginWithGoogle, loginWithFacebook,
    logout, resetPassword, updateDisplayName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
