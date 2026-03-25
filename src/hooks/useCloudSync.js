import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { defaultState } from "../utils/state";

const STORAGE_KEY = "life-os-state";
const DEBOUNCE_MS = 1000;

function readLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function useCloudSync(user) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const debounceRef = useRef(null);

  // Flush pending Firestore writes on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Load state when user changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (!user) {
        // No user — localStorage only (mirrors useAppState behavior)
        const local = readLocalStorage();
        if (!cancelled) {
          if (local) {
            setState({ ...defaultState(), ...local });
            if (!local.onboarded) setShowOnboarding(true);
          } else {
            setState(defaultState());
            setShowOnboarding(true);
          }
          setLoading(false);
        }
        return;
      }

      // User is logged in — try Firestore first
      try {
        const ref = doc(db, "users", user.uid, "data", "state");
        const snap = await getDoc(ref);

        if (cancelled) return;

        if (snap.exists()) {
          const remote = { ...defaultState(), ...snap.data() };
          setState(remote);
          writeLocalStorage(remote);
          if (!remote.onboarded) setShowOnboarding(true);
        } else {
          // No Firestore doc — check localStorage for migration
          const local = readLocalStorage();
          if (local) {
            const merged = { ...defaultState(), ...local };
            setState(merged);
            // Migrate to Firestore
            try {
              await setDoc(ref, merged, { merge: true });
            } catch {}
            if (!merged.onboarded) setShowOnboarding(true);
          } else {
            const fresh = defaultState();
            setState(fresh);
            setShowOnboarding(true);
          }
        }
      } catch {
        // Firestore failed — fall back to localStorage
        if (cancelled) return;
        const local = readLocalStorage();
        if (local) {
          setState({ ...defaultState(), ...local });
          if (!local.onboarded) setShowOnboarding(true);
        } else {
          setState(defaultState());
          setShowOnboarding(true);
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const save = useCallback(
    (newState) => {
      setState(newState);
      writeLocalStorage(newState);

      if (!user) return;

      // Debounce Firestore writes
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const ref = doc(db, "users", user.uid, "data", "state");
          await setDoc(ref, newState, { merge: true });
        } catch {}
      }, DEBOUNCE_MS);
    },
    [user]
  );

  return { state, loading, save, showOnboarding, setShowOnboarding };
}
