import { useState, useEffect, useCallback } from "react";
import { defaultState } from "../utils";
import { getTodayStr, daysBetween } from "../utils";

// Storage adapter: tries window.storage first, falls back to localStorage
const storage = {
  async get(key) {
    try {
      if (window.storage?.get) {
        return await window.storage.get(key);
      }
    } catch {}
    try {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    } catch {}
    return null;
  },
  async set(key, value) {
    try {
      if (window.storage?.set) {
        await window.storage.set(key, value);
      }
    } catch {}
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
};

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

export function useAppState() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("life-os-state");
        if (res?.value) {
          let p = JSON.parse(res.value);
          p = { ...defaultState(), ...p };
          // Reconcile streaks on load
          p = reconcileStreaks(p);
          setState(p);
          if (!p.onboarded) setShowOnboarding(true);
        } else {
          setState(defaultState());
          setShowOnboarding(true);
        }
      } catch {
        setState(defaultState());
        setShowOnboarding(true);
      }
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (s) => {
    setState(s);
    try {
      await storage.set("life-os-state", JSON.stringify(s));
    } catch {}
  }, []);

  return { state, loading, save, showOnboarding, setShowOnboarding };
}
