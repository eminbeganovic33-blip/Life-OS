import { motion, AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/tokens";

export default function XPToast({ xp, visible }) {
  return (
    <AnimatePresence>
      {visible && xp > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={styles.badge}
        >
          +{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  badge: {
    position: "fixed",
    top: "40%",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 28px",
    borderRadius: TOKENS.radius.full,
    background: "#111",
    color: "#fff",
    fontSize: TOKENS.font.size.xl,
    fontWeight: TOKENS.font.weight.heavy,
    zIndex: 600,
    pointerEvents: "none",
    boxShadow: TOKENS.shadow.xl,
  },
};
