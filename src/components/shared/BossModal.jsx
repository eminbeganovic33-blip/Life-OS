import { motion } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";
import { TOKENS } from "../../styles/tokens";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 30 + Math.random() * 40,
  y: 20 + Math.random() * 60,
  size: 3 + Math.random() * 4,
  delay: Math.random() * 0.6,
  color: i % 3 === 0 ? "#FBBF24" : i % 3 === 1 ? "#F97316" : "#EC4899",
}));

export default function BossModal({ bossDay, onDismiss, state }) {
  const isFinal = bossDay === 66;
  const totalQuestsDone = Object.values(state?.completedQuests || {})
    .reduce((s, arr) => s + (arr?.length || 0), 0);
  const totalDays = Object.keys(state?.completedDays || {}).length;
  const bestStreak = state?.bestStreak || state?.streak || 0;
  const totalXp = state?.xp || 0;

  const title = isFinal ? "JOURNEY COMPLETE" : "BOSS DEFEATED";
  const subtitle = isFinal
    ? "66 days. The full transformation. You've earned Mastery Mode."
    : "Day 21 conquered. You crushed the '3-week wall' that stops most people.";
  const xpReward = isFinal ? 500 : 100;
  const icon = isFinal ? "👑" : "⚔️";
  const unlocks = isFinal
    ? ["♾️ Mastery Mode unlocked", "📚 All courses unlocked", "🏆 Prestige badge earned"]
    : ["🏋️ New exercises unlocked", "📚 Advanced courses unlocked", "🔓 Category mastery active"];

  return (
    <motion.div
      style={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "fixed", left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: "50%",
            background: p.color, pointerEvents: "none", zIndex: 9998,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.8, 1.2, 0], y: [-10, -60 - Math.random() * 60] }}
          transition={{ delay: p.delay, duration: 1.6, ease: "easeOut" }}
        />
      ))}

      <motion.div
        style={styles.card}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.75, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.25 }}
          style={{ fontSize: 60, marginBottom: 8 }}
        >
          {icon}
        </motion.div>

        <div style={styles.xpBadge}>
          <Zap size={12} color="#F97316" /> +{xpReward} XP
        </div>

        <div style={styles.title}>{title}</div>
        <div style={styles.subtitle}>{subtitle}</div>

        <div style={styles.statsBox}>
          <div style={styles.statsLabel}>Your Journey</div>
          <StatRow label="Days Completed" value={totalDays} />
          <StatRow label="Quests Done" value={totalQuestsDone} />
          <StatRow label="Best Streak" value={`${bestStreak} days`} />
          <StatRow label="Total XP" value={totalXp.toLocaleString()} />
        </div>

        <div style={styles.unlockBox}>
          {unlocks.map((u, i) => (
            <div key={i} style={styles.unlockItem}>{u}</div>
          ))}
        </div>

        <button onClick={onDismiss} style={styles.btn}>
          {isFinal ? "Enter Mastery Mode" : "Claim Rewards"}
          <ChevronRight size={16} style={{ marginLeft: 4 }} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={styles.statRow}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 9999, padding: 16,
  },
  card: {
    maxWidth: 360, width: "100%", padding: "28px 24px", borderRadius: 24,
    background: TOKENS.color.bg, border: `1px solid ${TOKENS.color.border}`,
    textAlign: "center", position: "relative", overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
  },
  xpBadge: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 14px",
    borderRadius: 20, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)",
    color: "#F97316", fontSize: 13, fontWeight: 800, marginBottom: 12,
  },
  title: {
    fontSize: 22, fontWeight: 900, letterSpacing: 2, color: TOKENS.color.text, marginBottom: 8,
  },
  subtitle: {
    fontSize: 13, color: TOKENS.color.textSecondary, lineHeight: 1.6, marginBottom: 16,
  },
  statsBox: {
    background: TOKENS.color.surface, borderRadius: 14, padding: "12px 16px",
    marginBottom: 12, textAlign: "left",
  },
  statsLabel: {
    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
    color: TOKENS.color.textTertiary, marginBottom: 4,
  },
  statRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "7px 0", borderBottom: `1px solid ${TOKENS.color.border}`,
  },
  statLabel: { fontSize: 12, color: TOKENS.color.textSecondary },
  statValue: { fontSize: 14, fontWeight: 800, color: TOKENS.color.text },
  unlockBox: {
    background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.1)",
    borderRadius: 12, padding: "10px 16px", marginBottom: 20, textAlign: "left",
  },
  unlockItem: { fontSize: 12, lineHeight: 1.9, color: TOKENS.color.textSecondary },
  btn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "100%", padding: "14px 24px", borderRadius: 14,
    background: TOKENS.color.text, color: "#fff",
    fontSize: 15, fontWeight: 900, border: "none", cursor: "pointer",
  },
};
