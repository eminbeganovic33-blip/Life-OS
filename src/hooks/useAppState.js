import { useState, useEffect, useCallback, useRef } from "react";
import { defaultState, reconcileStreaks, migrateActiveQuests } from "../utils";
import { STATE_KEY, sanitizeState, stash } from "../utils/backup";

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

  // Latest committed state, so functional saves issued in the same tick (e.g.
  // two mount effects) compose instead of the second overwriting the first.
  // Written synchronously wherever state is replaced: child effects (AppShell
  // mount effects) run BEFORE this hook's own effects, so an effect-synced
  // ref would still be null when they call save(fn).
  const latestRef = useRef(null);

  // Set when stored data exists but can't be loaded. The app then shows a
  // recovery screen and never writes STATE_KEY until the user chooses.
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    (async () => {
      let raw = null;
      try {
        const res = await storage.get(STATE_KEY);
        raw = res?.value || null;
        if (raw) {
          const parsed = JSON.parse(raw);
          // Coerce onto the current schema; a wrong-typed field used to
          // throw here and drop the user into a fresh onboarding, whose
          // first save overwrote their real history.
          const { state: clean, fixed } = sanitizeState(parsed && typeof parsed === "object" ? parsed : {});
          if (fixed.length) stash(raw); // keep the pre-coercion original
          // Migrate legacy activeQuests shape to library-based shape (idempotent)
          let p = migrateActiveQuests(clean);
          // Reconcile streaks on load
          p = reconcileStreaks(p);
          latestRef.current = p; // before any child effect can call save(fn)
          setState(p);
          if (!p.onboarded) setShowOnboarding(true);
        } else {
          const fresh = defaultState();
          latestRef.current = fresh;
          setState(fresh);
          setShowOnboarding(true);
        }
      } catch (err) {
        if (raw) {
          stash(raw); // the original blob stays recoverable whatever happens next
          setLoadError({ raw, message: err?.message || String(err) });
        } else {
          const fresh = defaultState();
          latestRef.current = fresh;
          setState(fresh);
          setShowOnboarding(true);
        }
      }
      setLoading(false);
    })();
  }, []);

  /** Recovery screen → "Start fresh": the raw blob is already quarantined. */
  const startFresh = useCallback(() => {
    const fresh = defaultState();
    latestRef.current = fresh;
    setLoadError(null);
    setState(fresh);
    setShowOnboarding(true);
    storage.set(STATE_KEY, JSON.stringify(fresh)).catch(() => {});
  }, []);


  /**
   * save(nextState) or save(prev => nextState). Prefer the functional form in
   * effects and async callbacks: `save({...state, x})` uses a render-time
   * snapshot and silently drops any write made since that render.
   */
  const save = useCallback(async (next) => {
    if (typeof next === "function" && !latestRef.current) return; // nothing loaded yet — never write a partial state
    const s = typeof next === "function" ? next(latestRef.current) : next;
    latestRef.current = s;
    setState(s);
    try {
      await storage.set(STATE_KEY, JSON.stringify(s));
    } catch {}
  }, []);

  return { state, loading, save, showOnboarding, setShowOnboarding, loadError, startFresh };
}
