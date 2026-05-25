import { motion, AnimatePresence } from "framer-motion";
import { Sunrise } from "lucide-react";
import { TOKENS } from "../../styles/tokens";

export default function ComebackModal({ missedDays, onDismiss }) {
  if (!missedDays || missedDays <= 0) return null;

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
          {/* Soft warm halo — non-celebratory, just welcoming */}
          <div style={styles.halo} />
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
            style={styles.badge}
          >
            <Sunrise size={32} color="#fff" strokeWidth={2.2} />
          </motion.div>

          <div style={styles.kicker}>WELCOME BACK</div>
          <div style={styles.title}>You're here.</div>
          <div style={styles.sub}>
            {missedDays === 1
              ? "You missed yesterday. The protocol doesn't judge — it waits."
              : `You were away for ${missedDays} days. The work is right where you left it.`}
          </div>
          <div style={styles.quote}>
            "Fall seven times, stand up eight."
          </div>
          <button onClick={onDismiss} style={styles.btn}>Resume Protocol</button>
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
    background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(249,115,22,0.05) 50%, transparent 70%)",
    pointerEvents: "none",
  },
  badge: {
    width: 76, height: 76, borderRadius: 22,
    background: "linear-gradient(135deg, #FBBF24 0%, #F97316 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 12px 32px rgba(249,115,22,0.30)",
    position: "relative", zIndex: 1,
  },
  kicker: {
    fontSize: 11, fontWeight: 900,
    color: "#F97316", letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginTop: 8,
    lineHeight: 1.6,
  },
  quote: {
    fontSize: TOKENS.font.size.sm,
    fontStyle: "italic",
    color: TOKENS.color.textTertiary,
    marginTop: TOKENS.space[5],
    marginBottom: TOKENS.space[6],
  },
  btn: {
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
