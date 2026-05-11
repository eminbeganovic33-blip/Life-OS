import { useEffect } from "react";

/**
 * Bind Escape key to a callback. No-op when callback is falsy.
 * Re-binds on every render so the latest closure is captured.
 *
 * Usage:
 *   useEscapeKey(onDismiss);
 */
export function useEscapeKey(callback) {
  useEffect(() => {
    if (typeof callback !== "function") return;
    const onKey = (e) => { if (e.key === "Escape") callback(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [callback]);
}
