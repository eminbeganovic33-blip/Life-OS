import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { AuthProvider } from "./hooks/useAuth";
import LifeOS from "./App.jsx";

// Sentry — only active in production. Add VITE_SENTRY_DSN to Vercel env vars.
// Get your DSN at: https://sentry.io → New Project → Browser JavaScript
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
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
}

// ── Service worker: register, detect updates, reload on controller change ──
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // If there's already a waiting worker on load, surface it right away
        if (reg.waiting && navigator.serviceWorker.controller) {
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
              // A new SW is installed and waiting — tell the app to show the update toast
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

    // When the new SW takes control, reload once so users see fresh assets
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
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
