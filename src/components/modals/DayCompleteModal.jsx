import { motion } from "framer-motion";
import { S } from "../../styles/theme";
import { CATEGORIES } from "../../data";
import { getDayQuests, getLevel, getLevelIndex } from "../../utils";
import { CategoryIcon } from "../Icon";
import { Trophy, Flame, Star, Zap, ChevronRight } from "lucide-react";

/**
 * Day completion celebration screen.
 * Shows a recap of the completed day with stats, streaks, and category breakdown.
 */
export default function DayCompleteModal({ state, completedDay, onDismiss }) {
  if (!state || !completedDay) return null;

  const quests = getDayQuests(completedDay, state.customQuests, state);
  const level = getLevel(state.xp);
  const levelIdx = getLevelIndex(state.xp);
  const streak = state.streak || 0;

  // Count completed categories
  const completedQuests = state.completedQuests[completedDay] || [];
  const categoryBreakdown = CATEGORIES.map((cat) => {
    const catQuests = quests.filter((q) => q.category === cat.id);
    const catCompleted = catQuests.filter((q) => completedQuests.includes(q.id));
    return { ...cat, total: catQuests.length, done: catCompleted.length };
  }).filter((c) => c.total > 0);

  // XP earned today (approximate from quests)
  const xpEarned = quests.reduce((sum, q) => sum + (q.xp || 0), 0);

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

  return (
    <motion.div
      style={overlay}
      onClick={onDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        style={card}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
      >
        {/* Glow background */}
        <div style={glowBg} />

        {/* Trophy icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.25 }}
          style={trophyContainer}
        >
          <div style={trophyGlow} />
          <Trophy size={36} color="#FBBF24" strokeWidth={1.5} />
        </motion.div>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div style={badge}>DAY COMPLETE</div>
        </motion.div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <div style={title}>Day {completedDay} Conquered</div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          style={statsRow}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div style={statBox} variants={fadeUp}>
            <Flame size={16} color="#F97316" />
            <div style={statValue}>{streak}</div>
            <div style={statLabel}>Streak</div>
          </motion.div>
          <motion.div style={statBox} variants={fadeUp}>
            <Star size={16} color="#FBBF24" />
            <div style={statValue}>{state.xp.toLocaleString()}</div>
            <div style={statLabel}>Total XP</div>
          </motion.div>
          <motion.div style={statBox} variants={fadeUp}>
            <Zap size={16} color="#7C5CFC" />
            <div style={statValue}>Lv.{levelIdx + 1}</div>
            <div style={statLabel}>{level.name}</div>
          </motion.div>
        </motion.div>

        {/* Category breakdown */}
        <motion.div
          style={categorySection}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <div style={sectionLabel}>Quest Breakdown</div>
          <div style={categoryGrid}>
            {categoryBreakdown.map((cat) => (
              <motion.div key={cat.id} style={catPill} variants={fadeUp}>
                <CategoryIcon id={cat.id} size={13} color={cat.color} />
                <span style={catName}>{cat.name}</span>
                <span style={catCheck}>✓</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Streak message */}
        {streak >= 3 && (
          <motion.div
            style={streakMsg}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            {streak >= 21 ? "🔥 Legendary discipline!" :
             streak >= 14 ? "⚡ Unstoppable force!" :
             streak >= 7 ? "💪 On fire — one full week!" :
             "✨ Keep the momentum going!"}
          </motion.div>
        )}

        {/* CTA */}
        <motion.button
          style={ctaBtn}
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>Continue to Day {completedDay + 1}</span>
          <ChevronRight size={16} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Styles ──

const overlay = {
  ...S.overlay,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const card = {
  maxWidth: 360,
  width: "calc(100% - 48px)",
  padding: "32px 24px 24px",
  borderRadius: 24,
  background: "linear-gradient(145deg, #0F1225, #161234)",
  border: "1px solid rgba(124,92,252,0.2)",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,92,252,0.08)",
};

const glowBg = {
  position: "absolute",
  top: "-40%",
  left: "-30%",
  width: "160%",
  height: "160%",
  background: "radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.08) 0%, rgba(124,92,252,0.04) 40%, transparent 70%)",
  pointerEvents: "none",
};

const trophyContainer = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(249,115,22,0.08))",
  border: "1px solid rgba(251,191,36,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 16px",
  position: "relative",
  zIndex: 2,
};

const trophyGlow = {
  position: "absolute",
  inset: -8,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
  pointerEvents: "none",
};

const badge = {
  display: "inline-block",
  padding: "4px 14px",
  borderRadius: 100,
  background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))",
  color: "#22C55E",
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 2,
  marginBottom: 8,
  position: "relative",
  zIndex: 2,
};

const title = {
  fontSize: 24,
  fontWeight: 800,
  background: "linear-gradient(135deg, #E8ECF4, #A78BFA)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  position: "relative",
  zIndex: 2,
  marginBottom: 20,
  letterSpacing: -0.5,
};

const statsRow = {
  display: "flex",
  gap: 8,
  justifyContent: "center",
  marginBottom: 20,
  position: "relative",
  zIndex: 2,
};

const statBox = {
  flex: 1,
  padding: "12px 8px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
};

const statValue = {
  fontSize: 17,
  fontWeight: 700,
  color: "#E8ECF4",
};

const statLabel = {
  fontSize: 10,
  color: "rgba(255,255,255,0.4)",
  fontWeight: 500,
};

const categorySection = {
  position: "relative",
  zIndex: 2,
  marginBottom: 16,
};

const sectionLabel = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "rgba(255,255,255,0.35)",
  marginBottom: 10,
};

const categoryGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  justifyContent: "center",
};

const catPill = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 10px",
  borderRadius: 100,
  background: "rgba(34,197,94,0.08)",
  border: "1px solid rgba(34,197,94,0.12)",
  fontSize: 11,
  fontWeight: 500,
};

const catName = {
  color: "rgba(255,255,255,0.7)",
};

const catCheck = {
  color: "#22C55E",
  fontSize: 10,
  fontWeight: 700,
};

const streakMsg = {
  fontSize: 13,
  color: "rgba(255,255,255,0.6)",
  marginBottom: 16,
  position: "relative",
  zIndex: 2,
  padding: "8px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.03)",
};

const ctaBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  width: "100%",
  padding: "13px 20px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg, #22C55E, #16A34A)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  position: "relative",
  zIndex: 10,
  letterSpacing: -0.2,
  boxShadow: "0 4px 20px rgba(34,197,94,0.25)",
};
