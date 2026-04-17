import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./hooks/useAuth";
import LifeOS from "./App.jsx";

// Register service worker for PWA / offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      // A new SW has been found and is waiting — prompt the user
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New version waiting to activate
            window.dispatchEvent(new CustomEvent("swUpdateAvailable", { detail: reg }));
          }
        });
      });
    }).catch(() => {});

    // Reload the page after the new SW takes over (skipWaiting triggered by user)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
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
