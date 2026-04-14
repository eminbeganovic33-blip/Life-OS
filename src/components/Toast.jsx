import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, Trophy, Flame, X } from "lucide-react";

/**
 * Toast notification system — global feedback for saves, achievements, errors.
 * Usage: const toast = useToast(); toast.show("Saved!", "success");
 */

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: { icon: CheckCircle, color: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.2)" },
  error: { icon: AlertTriangle, color: "#EF4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.2)" },
  warning: { icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.2)" },
  info: { icon: Info, color: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.2)" },
  trophy: { icon: Trophy, color: "#FBBF24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.2)" },
  streak: { icon: Flame, color: "#F97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.2)" },
};

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success", duration = 3000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ctx = { show, dismiss };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op if outside provider
    return { show: () => {}, dismiss: () => {} };
  }
  return ctx;
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={containerStyle}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { id, message, type, duration } = toast;
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;
  const IconComp = config.icon;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{
        ...toastStyle,
        background: config.bg,
        borderColor: config.border,
      }}
    >
      <IconComp size={16} color={config.color} strokeWidth={2} style={{ flexShrink: 0 }} />
      <span style={{ ...toastText, color: config.color }}>{message}</span>
      <button
        onClick={() => onDismiss(id)}
        style={dismissBtn}
        aria-label="Dismiss"
      >
        <X size={12} color="rgba(255,255,255,0.35)" />
      </button>
    </motion.div>
  );
}

// ── Styles ──

const containerStyle = {
  position: "fixed",
  top: 12,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  zIndex: 9999,
  padding: "0 16px",
  pointerEvents: "none",
};

const toastStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  borderRadius: 12,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "transparent",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  pointerEvents: "auto",
};

const toastText = {
  flex: 1,
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.3,
  fontFamily: "'Inter','SF Pro Display',system-ui,sans-serif",
};

const dismissBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  opacity: 0.6,
};
