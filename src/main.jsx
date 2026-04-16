import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./hooks/useAuth";
import LifeOS from "./App.jsx";

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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <LifeOS />
    </AuthProvider>
  </StrictMode>,
);
