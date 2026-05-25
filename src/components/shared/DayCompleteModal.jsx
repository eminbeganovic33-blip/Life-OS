import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { TOKENS } from "../../styles/tokens";

export default function DayCompleteModal({ day, xpEarned, streak, onDismiss }) {
  if (!day) return null;

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
          {/* Gradient halo behind the badge */}
          <div style={styles.halo} />
          <motion.div
            initial={{ scale: 0.4, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            style={styles.badge}
          >
            <Sparkles size={36} color="#fff" strokeWidth={2.4} />
          </motion.div>

          <div style={styles.kicker}>DAY COMPLETE</div>
          <div style={styles.title}>Day {day} sealed</div>
          <div style={styles.sub}>You showed up. That's the protocol.</div>

          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <div style={{ ...styles.statVal, color: "#7C5CFC" }}>+{xpEarned}</div>
              <div style={styles.statLabel}>XP earned</div>
            </div>
            <div style={styles.stat}>
              <div style={{ ...styles.statVal, color: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Flame size={20} color="#F97316" fill="#F97316" /> {streak}
              </div>
              <div style={styles.statLabel}>day streak</div>
            </div>
          </div>

          <button onClick={onDismiss} style={styles.btn}>Continue</button>
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
    width: 220, height: 220, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,92,252,0.20) 0%, rgba(236,72,153,0.05) 50%, transparent 70%)",
    pointerEvents: "none",
  },
  badge: {
    width: 80, height: 80, borderRadius: 24,
    background: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 16px 40px rgba(124,92,252,0.40)",
    position: "relative", zIndex: 1,
  },
  kicker: {
    fontSize: 11, fontWeight: 900,
    color: "#7C5CFC", letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginTop: 6,
  },
  statsRow: {
    display: "flex", gap: TOKENS.space[3],
    marginTop: TOKENS.space[6],
  },
  stat: {
    flex: 1,
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
  },
  statVal: {
    fontSize: TOKENS.font.size.xl,
    fontWeight: 900,
  },
  statLabel: {
    fontSize: 10,
    color: TOKENS.color.textTertiary,
    marginTop: 4,
    fontWeight: TOKENS.font.weight.semibold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  btn: {
    marginTop: TOKENS.space[6],
    width: "100%",
    padding: "14px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    background: TOKENS.color.text,
    color: "#fff",
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
};
