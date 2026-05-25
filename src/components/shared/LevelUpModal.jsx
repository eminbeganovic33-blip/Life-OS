import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUp, Crown } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { LEVELS } from "../../data/constants";

export default function LevelUpModal({ level, onDismiss }) {
  if (!level) return null;
  const lvlData = LEVELS?.[level] || {};
  // Tier-based hue: lower levels purple, mid pink, high gold.
  const accent = level >= 12 ? "#FBBF24" : level >= 6 ? "#EC4899" : "#7C5CFC";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        style={styles.overlay}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={styles.card}
        >
          {/* Halo */}
          <div style={{
            ...styles.halo,
            background: `radial-gradient(circle, ${accent}40 0%, ${accent}10 50%, transparent 70%)`,
          }} />
          <motion.div
            initial={{ scale: 0.4, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            style={{
              ...styles.badge,
              background: `linear-gradient(135deg, ${accent} 0%, ${accent}AA 100%)`,
              boxShadow: `0 16px 40px ${accent}50`,
            }}
          >
            {level >= 12
              ? <Crown size={40} color="#fff" strokeWidth={2.2} />
              : <ChevronsUp size={40} color="#fff" strokeWidth={2.4} />}
          </motion.div>

          <div style={{ ...styles.kicker, color: accent }}>LEVEL UP</div>
          <div style={styles.title}>Level {level + 1}</div>
          {lvlData.name && <div style={styles.name}>{lvlData.name}</div>}
          <div style={styles.body}>
            You've earned a new tier. Keep stacking the protocol.
          </div>

          <button
            onClick={onDismiss}
            style={{ ...styles.btn, background: accent }}
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 800,
    background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24,
  },
  card: {
    position: "relative",
    width: "100%", maxWidth: 340,
    background: "#fff",
    borderRadius: TOKENS.radius.xl,
    padding: "56px 28px 28px",
    textAlign: "center",
    overflow: "hidden",
  },
  halo: {
    position: "absolute", top: -60, left: "50%",
    transform: "translateX(-50%)",
    width: 240, height: 240, borderRadius: "50%",
    pointerEvents: "none",
  },
  badge: {
    width: 84, height: 84, borderRadius: 26,
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
    position: "relative", zIndex: 1,
  },
  kicker: {
    fontSize: 11, fontWeight: 900,
    letterSpacing: 1.5, marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    letterSpacing: -1,
  },
  name: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
    marginTop: 4,
  },
  body: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginTop: TOKENS.space[3],
    lineHeight: 1.5,
    maxWidth: 260,
    marginLeft: "auto", marginRight: "auto",
  },
  btn: {
    marginTop: TOKENS.space[6],
    width: "100%",
    padding: "14px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    color: "#fff",
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
  },
};
