import { useState, useEffect, useCallback } from "react";
import { defaultState, getTodayStr, daysBetween, reconcileStreaks } from "../utils";

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
