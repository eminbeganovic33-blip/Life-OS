import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { TOKENS } from "../styles/theme";

const T = TOKENS;

/**
 * Listens for the `sw-update-available` event (dispatched from main.jsx when
 * a new service worker has installed and is waiting). Shows a toast that
 * tells the waiting SW to skipWaiting — main.jsx reloads on controllerchange.
 */
export default function UpdateToast() {
  const { colors } = useTheme();
  const [registration, setRegistration] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onUpdate = (e) => {
      setRegistration(e.detail?.registration || null);
      setDismissed(false);
    };
    window.addEventListener("sw-update-available", onUpdate);
    return () => window.removeEventListener("sw-update-available", onUpdate);
  }, []);

  function refresh() {
    const waiting = registration?.waiting;
    if (waiting) {
      waiting.postMessage({ type: "SKIP_WAITING" });
      // main.jsx's controllerchange listener will reload the page
    } else {
      window.location.reload();
    }
  }

  const show = !!registration && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          style={{
            position: "fixed",
            top: T.space.lg,
            left: T.space.lg,
            right: T.space.lg,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: T.space.md,
            padding: `${T.space.md}px ${T.space.lg}px`,
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: T.radii.lg,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            backdropFilter: "blur(12px)",
          }}
          role="status"
          aria-live="polite"
        >
          <Sparkles size={18} color="#7C5CFC" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: T.font.sm, fontWeight: T.weight.bold, color: colors.text }}>
              New version available
            </div>
            <div style={{ fontSize: T.font.xs, color: colors.textSecondary }}>
              Refresh to get the latest.
            </div>
          </div>
          <button
            onClick={refresh}
            style={{
              padding: `${T.space.sm}px ${T.space.md}px`,
              borderRadius: T.radii.sm,
              border: "none",
              background: "#7C5CFC",
              color: "#fff",
              fontSize: T.font.xs,
              fontWeight: T.weight.bold,
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss update notification"
            style={{
              background: "transparent",
              border: "none",
              color: colors.textSecondary,
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
