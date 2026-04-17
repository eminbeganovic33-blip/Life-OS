import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, X } from "lucide-react";
import { useTheme } from "../hooks";
import { TOKENS } from "../styles/theme";

const { space, radii, font, weight, transition } = TOKENS;

export default function InstallPrompt() {
  const { colors: C } = useTheme();
  const [installPrompt, setInstallPrompt] = useState(null); // beforeinstallprompt event
  const [updateReg, setUpdateReg] = useState(null);         // SW registration with waiting worker
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("installDismissed") === "1"
  );

  // Capture the PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Listen for SW update available
  useEffect(() => {
    const handler = (e) => setUpdateReg(e.detail);
    window.addEventListener("swUpdateAvailable", handler);
    return () => window.removeEventListener("swUpdateAvailable", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const handleUpdate = () => {
    if (updateReg?.waiting) {
      updateReg.waiting.postMessage("SKIP_WAITING");
    }
    setUpdateReg(null);
  };

  const handleDismissInstall = () => {
    sessionStorage.setItem("installDismissed", "1");
    setInstallPrompt(null);
    setDismissed(true);
  };

  const showInstall = installPrompt && !dismissed;
  const showUpdate = !!updateReg;
  const visible = showInstall || showUpdate;

  const banner = {
    position: "fixed",
    bottom: 80, // above bottom nav
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 32px)",
    maxWidth: 400,
    zIndex: 9000,
    borderRadius: radii.lg,
    background: C.surfaceElevated,
    border: `1px solid ${C.cardBorder}`,
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    padding: `${space.md}px ${space.lg}px`,
    display: "flex",
    alignItems: "center",
    gap: space.md,
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={showUpdate ? "update" : "install"}
          style={banner}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Icon */}
          <div style={{
            width: 36, height: 36, borderRadius: radii.md,
            background: C.accentGlow,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {showUpdate
              ? <RefreshCw size={16} color={C.accent} />
              : <Download size={16} color={C.accent} />
            }
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: font.sm, fontWeight: weight.semibold, color: C.text }}>
              {showUpdate ? "Update available" : "Add to Home Screen"}
            </div>
            <div style={{ fontSize: font.xs, color: C.textSecondary, marginTop: 2 }}>
              {showUpdate
                ? "Reload to get the latest version"
                : "Install Life OS for the best experience"
              }
            </div>
          </div>

          {/* Action */}
          <button
            onClick={showUpdate ? handleUpdate : handleInstall}
            style={{
              padding: `${space.xs}px ${space.md}px`,
              borderRadius: radii.pill,
              background: C.accent,
              color: "#fff",
              fontSize: font.xs,
              fontWeight: weight.semibold,
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              transition: transition.fast,
            }}
          >
            {showUpdate ? "Reload" : "Install"}
          </button>

          {/* Dismiss (install only) */}
          {showInstall && (
            <button
              onClick={handleDismissInstall}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: C.textSecondary, padding: space.xs, flexShrink: 0,
                display: "flex", alignItems: "center",
              }}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
