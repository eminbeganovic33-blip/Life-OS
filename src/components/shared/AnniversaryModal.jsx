import { motion } from "framer-motion";
import { X } from "lucide-react";
import { TOKENS } from "../../styles/tokens";

export const ANNIVERSARY_DAYS = [30, 100, 365];

const CONFIG = {
  30: {
    title: "30 Days In",
    sub: "One full month of showing up.",
    body: "You've crossed the habit-formation threshold. The actions that felt forced now feel familiar. Your brain has rewired around this version of you.",
    color: "#7C5CFC",
    emoji: "🌱",
  },
  100: {
    title: "100 Days",
    sub: "Triple digits.",
    body: "Most people quit before now. You didn't. The compounding effects of 100 daily decisions are measurable in your body, your mind, your life.",
    color: "#EC4899",
    emoji: "💎",
  },
  365: {
    title: "One Year",
    sub: "A full revolution.",
    body: "365 days of choosing the harder right over the easier wrong. You are not who you were last year. This is identity-level transformation.",
    color: "#FBBF24",
    emoji: "👑",
  },
};

export default function AnniversaryModal({ day, onDismiss }) {
  if (!day || !CONFIG[day]) return null;
  const c = CONFIG[day];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.overlay}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        style={{
          ...styles.modal,
          background: `linear-gradient(135deg, ${c.color}15 0%, #FFFFFF 50%)`,
          border: `2px solid ${c.color}40`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          ...styles.halo,
          background: `radial-gradient(circle, ${c.color}40 0%, ${c.color}10 50%, transparent 70%)`,
        }} />
        <button onClick={onDismiss} style={styles.close} aria-label="Close">
          <X size={20} color={TOKENS.color.textTertiary} />
        </button>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.2 }}
          style={{
            ...styles.iconWrap,
            background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}80 100%)`,
            boxShadow: `0 16px 40px ${c.color}50`,
            position: "relative", zIndex: 1,
          }}
        >
          <span style={{ fontSize: 56 }}>{c.emoji}</span>
        </motion.div>
        <div style={{ ...styles.day, color: c.color }}>DAY {day}</div>
        <div style={styles.title}>{c.title}</div>
        <div style={styles.sub}>{c.sub}</div>
        <div style={styles.body}>{c.body}</div>
        <button onClick={onDismiss} style={{ ...styles.btn, background: c.color }}>
          Keep going
        </button>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 500, padding: TOKENS.space[5],
  },
  modal: {
    position: "relative",
    width: "100%", maxWidth: 380,
    padding: TOKENS.space[7],
    borderRadius: 24,
    textAlign: "center",
    boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  halo: {
    position: "absolute", top: -80, left: "50%",
    transform: "translateX(-50%)",
    width: 280, height: 280, borderRadius: "50%",
    pointerEvents: "none",
  },
  close: {
    position: "absolute", top: 12, right: 12,
    background: "none", border: "none", cursor: "pointer", padding: 6,
  },
  iconWrap: {
    width: 112, height: 112, borderRadius: 28,
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: `0 auto ${TOKENS.space[5]}px`,
  },
  day: {
    fontSize: 11, fontWeight: 900, letterSpacing: 1.4,
  },
  title: {
    fontSize: 32, fontWeight: 900, color: TOKENS.color.text,
    letterSpacing: -0.5, marginTop: TOKENS.space[2],
  },
  sub: {
    fontSize: TOKENS.font.size.md,
    color: TOKENS.color.textSecondary,
    fontWeight: TOKENS.font.weight.semibold,
    marginTop: TOKENS.space[2],
  },
  body: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    lineHeight: 1.6,
    marginTop: TOKENS.space[5],
  },
  btn: {
    width: "100%", padding: "14px",
    color: "#fff", fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    border: "none", borderRadius: TOKENS.radius.lg,
    cursor: "pointer", marginTop: TOKENS.space[6],
  },
};
