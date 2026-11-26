import { lazy } from "react";

/**
 * React.lazy with automatic one-time reload on chunk-load failure.
 *
 * A "Failed to fetch dynamically imported module" error almost always means the
 * user has the app open from a previous deploy and the hashed chunk filename no
 * longer exists on the server. A single full reload pulls the fresh index +
 * chunk manifest and fixes it — far better than dumping the user on an error
 * screen for something a refresh resolves.
 *
 * Guarded by sessionStorage so a genuinely-broken chunk (still failing after a
 * reload) falls through to the ErrorBoundary instead of looping forever.
 */
export function lazyWithRetry(factory) {
  return lazy(async () => {
    const key = "lifeos-chunk-reload";
    try {
      const mod = await factory();
      sessionStorage.removeItem(key); // loaded fine → reset the guard
      return mod;
    } catch (err) {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        // Keep Suspense in its fallback until the reload takes over.
        return new Promise(() => {});
      }
      throw err; // already retried once — let the ErrorBoundary handle it
    }
  });
}
