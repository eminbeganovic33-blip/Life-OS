import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, setDoc, runTransaction } from "firebase/firestore";
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

  // If more than 1 day has passed since last activity, check for streak freeze
  if (missedDays > 1) {
    const freezes = s.streakFreezes || 0;
    if (freezes > 0 && missedDays <= 2) {
      // Use a freeze — preserve streak, consume one freeze
      s = {
        ...s,
        streakFreezes: freezes - 1,
        streakFreezeUsedDate: today,
        streakFreezeLog: [...(s.streakFreezeLog || []), { date: today, streakPreserved: s.streak }],
      };
    } else {
      // No freezes available or too many days missed — break streak
      s = { ...s, streak: 0 };
    }
  }

  // Award streak freezes: 1 freeze earned per 7-day streak milestone (max 3)
  const MAX_FREEZES = 3;
  const currentFreezes = s.streakFreezes || 0;
  const lastFreezeAwardedAt = s.lastFreezeAwardedAtStreak || 0;
  if (s.streak > 0 && s.streak >= lastFreezeAwardedAt + 7 && currentFreezes < MAX_FREEZES) {
    const newMilestone = Math.floor(s.streak / 7) * 7;
    if (newMilestone > lastFreezeAwardedAt) {
      s = {
        ...s,
        streakFreezes: Math.min(currentFreezes + 1, MAX_FREEZES),
        lastFreezeAwardedAtStreak: newMilestone,
      };
    }
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

  // Track latest state for flushing on unload + last known remote version
  const latestStateRef = useRef(null);
  const lastVersionRef = useRef(0);
  const isWritingRef = useRef(false);

  // Flush pending Firestore writes on visibility change and page close.
  // `visibilitychange`/`pagehide` are more reliable than `beforeunload`,
  // especially on mobile Safari and Chrome.
  useEffect(() => {
    function flushToFirestore() {
      if (debounceRef.current && user && latestStateRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
        try {
          const ref = doc(db, "users", user.uid, "data", "state");
          // Bump version optimistically — best effort during unload
          const payload = { ...latestStateRef.current, _version: (lastVersionRef.current || 0) + 1 };
          setDoc(ref, payload, { merge: true }).catch(() => {});
        } catch {}
      }
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") flushToFirestore();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushToFirestore);
    window.addEventListener("beforeunload", flushToFirestore);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushToFirestore);
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
            const fresh = defaultState();
            setState(fresh);
            if (!fresh.onboarded) setShowOnboarding(true);
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
          const data = snap.data();
          lastVersionRef.current = data._version || 0;
          let remote = { ...defaultState(), ...data };
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
            if (!fresh.onboarded) setShowOnboarding(true);
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
          const fresh = defaultState();
          setState(fresh);
          if (!fresh.onboarded) setShowOnboarding(true);
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
        if (isWritingRef.current) return; // skip overlap
        isWritingRef.current = true;
        try {
          const ref = doc(db, "users", user.uid, "data", "state");
          // Optimistic locking via Firestore transaction:
          // refuse to overwrite if remote version advanced beyond ours.
          await runTransaction(db, async (tx) => {
            const snap = await tx.get(ref);
            const remoteVersion = snap.exists() ? (snap.data()._version || 0) : 0;
            if (remoteVersion > lastVersionRef.current) {
              // Conflict: remote was updated by another tab/device.
              // Merge: take remote as base, layer our delta-style fields, then bump.
              const remoteData = snap.data() || {};
              const merged = { ...remoteData, ...latestStateRef.current };
              const nextVersion = remoteVersion + 1;
              tx.set(ref, { ...merged, _version: nextVersion }, { merge: true });
              lastVersionRef.current = nextVersion;
              // Sync local state to merged result so future writes see consistent base
              setState(merged);
              writeLocalStorage(merged);
              latestStateRef.current = merged;
            } else {
              const nextVersion = (lastVersionRef.current || 0) + 1;
              tx.set(ref, { ...latestStateRef.current, _version: nextVersion }, { merge: true });
              lastVersionRef.current = nextVersion;
            }
          });
        } catch {
          // Network/transaction failure — local state is still saved.
          // The next save attempt will retry with the latest data.
        } finally {
          isWritingRef.current = false;
        }
      }, DEBOUNCE_MS);
    },
    [user]
  );

  return { state, loading, save, showOnboarding, setShowOnboarding };
}
