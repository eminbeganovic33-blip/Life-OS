import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./hooks/useAuth";
import LifeOS from "./App.jsx";

// Sentry — only in production with a DSN (add VITE_SENTRY_DSN to Vercel env
// vars). Loaded on demand so local-only users don't download it at all.
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: "production",
      release: `life-os@${import.meta.env.VITE_APP_VERSION || "1.0.0"}`,
      tracesSampleRate: 0.2,
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "Non-Error promise rejection",
        "NetworkError",
        "Load failed",
      ],
    });
    window.__lifeosSentry = Sentry; // ErrorBoundary reports render crashes here
  }).catch(() => {});
}

// ── Service worker: register, detect updates, reload on controller change ──
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // If there's already a waiting worker on load, surface it right away
        if (reg.waiting && navigator.serviceWorker.controller) {
          window.__lifeosSwWaiting = reg; // AppShell may not be mounted yet
          window.dispatchEvent(
            new CustomEvent("sw-update-available", { detail: { registration: reg } })
          );
        }

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // A new SW is installed and waiting — tell the app to show the update prompt
              window.__lifeosSwWaiting = reg;
              window.dispatchEvent(
                new CustomEvent("sw-update-available", { detail: { registration: reg } })
              );
            }
          });
        });

        // Check for updates every 30 min while the tab is open
        setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
      })
      .catch(() => {});

    // A new version only takes control after the user taps "Update" (AppShell
    // sends SKIP_WAITING) — then reload once so the page matches its assets.
    // Never on the very first visit: there was no previous controller, nothing
    // is stale, and reloading wiped half-filled onboarding.
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}

// Android TWA back-button: pop the panel/modal stack instead of exiting the app.
// When there's nothing to pop, let the OS handle it (app goes to background).
window.addEventListener("popstate", () => {
  // Dispatch a custom event; AppShell listens and closes the top panel.
  window.dispatchEvent(new CustomEvent("android-back"));
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <LifeOS />
    </AuthProvider>
  </StrictMode>,
);
