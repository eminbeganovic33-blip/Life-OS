import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/tokens";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message, opts = {}) => {
    const id = ++idRef.current;
    const duration = opts.duration || 2500;
    setToasts((prev) => [...prev, { id, message, type: opts.type || "info" }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={styles.container}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                ...styles.toast,
                background: t.type === "xp" ? "#111" : t.type === "error" ? TOKENS.color.danger : TOKENS.color.text,
              }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { show: () => {} };
  return ctx;
}

const styles = {
  container: {
    position: "fixed",
    bottom: 88,
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    zIndex: 500,
    pointerEvents: "none",
  },
  toast: {
    padding: "10px 20px",
    borderRadius: TOKENS.radius.full,
    color: "#fff",
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    boxShadow: TOKENS.shadow.lg,
    pointerEvents: "auto",
  },
};
