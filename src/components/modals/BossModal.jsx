import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks";
import { Trophy, Star, Zap, Shield, ChevronRight } from "lucide-react";

// Randomised particles that burst outward on mount
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 30 + Math.random() * 40,
  y: 20 + Math.random() * 60,
  size: 3 + Math.random() * 4,
  delay: Math.random() * 0.6,
  color: i % 3 === 0 ? "#FBBF24" : i % 3 === 1 ? "#F97316" : "#EC4899",
}));

function StatRow({ label, value, color = "#7C5CFC" }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "7px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <span style={{ fontSize: 12, opacity: 0.55, color: "#fff" }}>{label}</span>
      <motion.span
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{ fontSize: 14, fontWeight: 800, color }}
      >
        {value}
      </motion.span>
    </div>
  );
}

export default function BossModal({ bossDay, onProgress, state }) {
  const { colors } = useTheme();
  const isFinal = bossDay === 66;

  // Journey stats
  const totalQuestsDone = Object.values(state?.completedQuests || {})
    .reduce((s, arr) => s + (arr?.length || 0), 0);
  const totalDays = Object.keys(state?.completedDays || {}).length;
  const bestStreak = state?.bestStreak || state?.streak || 0;
  const totalXp = state?.xp || 0;

  const title = isFinal ? "JOURNEY COMPLETE" : "BOSS DEFEATED";
  const subtitle = isFinal
    ? "66 days. The full transformation. You've earned Mastery Mode — the journey never ends."
    : "Day 21 conquered. You crushed the '3-week wall' that stops most people. New powers unlocked.";

  const xpReward = isFinal ? 500 : 100;
  const icon = isFinal ? "👑" : "⚔️";

  const unlocks = isFinal
    ? ["♾️ Mastery Mode — Day counter continues to 999+", "📚 All remaining courses unlocked", "🏆 Prestige badge earned"]
    : ["🏋️ 8 new Dojo exercises unlocked", "📚 Advanced Academy courses unlocked", "🔓 Category mastery tracking active"];

  return (
    <motion.div
      style={overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Particle burst */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "fixed",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            pointerEvents: "none",
            zIndex: 9998,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.8, 1.2, 0],
            y: [-10, -60 - Math.random() * 60],
            x: [(Math.random() - 0.5) * 40],
          }}
          transition={{ delay: p.delay, duration: 1.6, ease: "easeOut" }}
        />
      ))}

      {/* Boss card */}
      <motion.div
        style={card}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.75, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
      >
        {/* Animated radial glow */}
        <motion.div
          style={glowBg}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.25 }}
          style={{ fontSize: 60, position: "relative", zIndex: 2, marginBottom: 8 }}
        >
          {icon}
        </motion.div>

        {/* XP badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 18 }}
          style={xpBadge}
        >
          <Zap size={12} color="#FBBF24" />
          +{xpReward} XP
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={titleStyle}
        >
          {title}
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={subtitleStyle}
        >
          {subtitle}
        </motion.div>

        {/* Stats recap */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={statsBox}
        >
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.4, color: "#fff", marginBottom: 4 }}>
            Your Journey
          </div>
          <StatRow label="Days Completed" value={totalDays} color="#22C55E" />
          <StatRow label="Quests Completed" value={totalQuestsDone.toLocaleString()} color="#7C5CFC" />
          <StatRow label="Best Streak" value={`${bestStreak} days`} color="#F97316" />
          <StatRow label="Total XP" value={totalXp.toLocaleString()} color="#FBBF24" />
        </motion.div>

        {/* Unlocks */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={unlockBox}
        >
          {unlocks.map((u, i) => (
            <div key={i} style={{ fontSize: 12, lineHeight: 1.9, opacity: 0.75, color: "#fff" }}>{u}</div>
          ))}
        </motion.div>

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          whileTap={{ scale: 0.96 }}
          style={btn}
          onClick={(e) => { e.stopPropagation(); onProgress(); }}
        >
          {isFinal ? "Enter Mastery Mode" : "Claim Rewards"}
          <ChevronRight size={16} style={{ marginLeft: 4 }} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.88)",
  backdropFilter: "blur(12px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "16px",
};

const card = {
  maxWidth: 360,
  width: "100%",
  padding: "28px 24px",
  borderRadius: 24,
  background: "linear-gradient(160deg, #0D0D22 0%, #150A2E 60%, #1A0D1A 100%)",
  border: "1px solid rgba(251,191,36,0.2)",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 24px 80px rgba(251,191,36,0.15), 0 8px 32px rgba(0,0,0,0.6)",
};

const glowBg = {
  position: "absolute",
  top: "-60%",
  left: "-30%",
  width: "160%",
  height: "160%",
  background: "radial-gradient(circle at 50% 40%, rgba(251,191,36,0.08) 0%, rgba(249,115,22,0.05) 40%, transparent 70%)",
  pointerEvents: "none",
  zIndex: 1,
};

const xpBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "4px 14px",
  borderRadius: 20,
  background: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(249,115,22,0.12))",
  border: "1px solid rgba(251,191,36,0.25)",
  color: "#FBBF24",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: 0.3,
  marginBottom: 12,
  position: "relative",
  zIndex: 2,
};

const titleStyle = {
  fontSize: 22,
  fontWeight: 900,
  letterSpacing: 2,
  background: "linear-gradient(135deg, #FBBF24, #F97316)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: 8,
  position: "relative",
  zIndex: 2,
  lineHeight: 1.1,
};

const subtitleStyle = {
  fontSize: 13,
  color: "rgba(255,255,255,0.55)",
  lineHeight: 1.6,
  marginBottom: 16,
  position: "relative",
  zIndex: 2,
};

const statsBox = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  padding: "12px 16px",
  marginBottom: 12,
  textAlign: "left",
  position: "relative",
  zIndex: 2,
};

const unlockBox = {
  background: "rgba(249,115,22,0.05)",
  border: "1px solid rgba(249,115,22,0.1)",
  borderRadius: 12,
  padding: "10px 16px",
  marginBottom: 20,
  textAlign: "left",
  position: "relative",
  zIndex: 2,
};

const btn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "14px 24px",
  borderRadius: 14,
  background: "linear-gradient(135deg, #FBBF24, #F97316)",
  color: "#0D0D22",
  fontSize: 15,
  fontWeight: 900,
  border: "none",
  cursor: "pointer",
  letterSpacing: 0.5,
  boxShadow: "0 8px 24px rgba(251,191,36,0.3)",
  position: "relative",
  zIndex: 2,
};
