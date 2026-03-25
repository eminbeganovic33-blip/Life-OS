import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { defaultState } from "../utils/state";
import { getTodayStr, daysBetween } from "../utils";

const STORAGE_KEY = "life-os-state";
const DEBOUNCE_MS = 1000;

function reconcileStreaks(s) {
  const today = getTodayStr();
  const lastActive = s.lastActiveDate;
  if (!lastActive || lastActive === today) return s;

  const missedDays = daysBetween(lastActive);

  // If more than 1 day has passed since last activity, break streaks
  if (missedDays > 1) {
    s = { ...s, streak: 0 };
  }

  // Break lifting streak if more than 1 day since last lift
  if (s.lastLiftDate) {
    const liftGap = daysBetween(s.lastLiftDate);
    if (liftGap > 1) {
      s = { ...s, liftingStreak: 0 };
    }
  }

  return s;
}

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

  // Track latest state for flushing on unload
  const latestStateRef = useRef(null);

  // Flush pending Firestore writes on unmount and page close
  useEffect(() => {
    function flushToFirestore() {
      if (debounceRef.current && user && latestStateRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
        // Best-effort sync — use sendBeacon-style approach
        try {
          const ref = doc(db, "users", user.uid, "data", "state");
          setDoc(ref, latestStateRef.current, { merge: true }).catch(() => {});
        } catch {}
      }
    }

    window.addEventListener("beforeunload", flushToFirestore);
    return () => {
      window.removeEventListener("beforeunload", flushToFirestore);
      flushToFirestore();
    };
  }, [user]);

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
            let merged = { ...defaultState(), ...local };
            merged = reconcileStreaks(merged);
            setState(merged);
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
          let remote = { ...defaultState(), ...snap.data() };
          remote = reconcileStreaks(remote);
          setState(remote);
          writeLocalStorage(remote);
          if (!remote.onboarded) setShowOnboarding(true);
        } else {
          // No Firestore doc — check localStorage for migration
          const local = readLocalStorage();
          if (local) {
            let merged = { ...defaultState(), ...local };
            merged = reconcileStreaks(merged);
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
          let merged = { ...defaultState(), ...local };
          merged = reconcileStreaks(merged);
          setState(merged);
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
      latestStateRef.current = newState;

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
