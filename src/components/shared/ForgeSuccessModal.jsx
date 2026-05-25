import { motion, AnimatePresence } from "framer-motion";
import { Shield, Award } from "lucide-react";
import { TOKENS } from "../../styles/tokens";

const FORGE_LABELS = {
  smoking: "Smoking", alcohol: "Alcohol", vaping: "Vaping",
  caffeine: "Caffeine", sugar: "Sugar", social_media: "Social Media",
  gambling: "Gambling", porn: "Porn", doomscrolling: "Doomscrolling",
  junkfood: "Junk Food", weed: "Weed",
};

const FORGE_EMOJIS = {
  smoking: "🚬", alcohol: "🍺", vaping: "💨",
  caffeine: "☕", sugar: "🍬", social_media: "📲",
  gambling: "🎰", porn: "⚡", doomscrolling: "📱",
  junkfood: "🍔", weed: "🌿",
};

export default function ForgeSuccessModal({ habitId, days, onDismiss }) {
  const label = FORGE_LABELS[habitId] || habitId;
  const emoji = FORGE_EMOJIS[habitId] || "🛡️";
  const milestoneLabel = days >= 90 ? "3 Months"
    : days >= 60 ? "2 Months"
    : days >= 30 ? "1 Month"
    : days >= 21 ? "3 Weeks"
    : days >= 14 ? "2 Weeks"
    : days >= 7 ? "1 Week"
    : `${days} Days`;

  const message = days >= 30
    ? "Your brain has rewired significantly. The habit loop is breaking down. Keep going — you're building a new identity."
    : days >= 14
      ? "Two weeks of freedom. Your body is healing and your willpower is growing stronger every day."
      : "The hardest part is over. You've proven you can resist. Each day gets easier from here.";

  // Tier-based accent
  const accent = days >= 90 ? "#FBBF24" : days >= 30 ? "#EC4899" : days >= 14 ? "#F97316" : "#22C55E";

  return (
    <AnimatePresence>
      <motion.div
        style={styles.overlay}
        onClick={onDismiss}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          style={styles.card}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
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
            <Shield size={40} color="#fff" strokeWidth={2.2} />
          </motion.div>

          <div style={{ ...styles.kicker, color: accent }}>FREEDOM MILESTONE</div>
          <div style={styles.title}>{milestoneLabel}</div>
          <div style={styles.subtitle}><span style={{ fontSize: 18 }}>{emoji}</span> {label} free</div>

          <div style={styles.messageBox}>
            <div style={styles.message}>{message}</div>
          </div>

          <div style={{
            ...styles.xpChip,
            background: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`,
            boxShadow: `0 8px 24px ${accent}40`,
          }}>
            <Award size={14} color="#fff" /> {days} days strong
          </div>

          <button
            onClick={onDismiss}
            style={{ ...styles.btn }}
          >
            Keep Going
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: 16,
  },
  card: {
    position: "relative",
    maxWidth: 340, width: "100%",
    padding: "56px 28px 28px",
    borderRadius: TOKENS.radius.xl,
    background: "#fff",
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
  subtitle: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textSecondary,
    marginTop: 4, marginBottom: TOKENS.space[5],
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  },
  messageBox: {
    background: TOKENS.color.surface, borderRadius: 14,
    padding: "14px 16px", marginBottom: TOKENS.space[5],
  },
  message: {
    fontSize: 13, color: TOKENS.color.textSecondary, lineHeight: 1.6,
  },
  xpChip: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: TOKENS.radius.full,
    color: "#fff", fontSize: TOKENS.font.size.sm, fontWeight: 900,
    letterSpacing: 0.4, marginBottom: TOKENS.space[5],
  },
  btn: {
    width: "100%", padding: 14,
    borderRadius: TOKENS.radius.lg, border: "none",
    background: TOKENS.color.text, color: "#fff",
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
};
