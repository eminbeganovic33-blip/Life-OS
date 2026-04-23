import { motion } from "framer-motion";
import { S } from "../../styles/theme";
import { LEVELS } from "../../data";
import { getArc } from "../../utils/arcs";

export default function LevelUpModal({ levelIndex, onDismiss, currentDay }) {
  const level = LEVELS[levelIndex];
  if (!level) return null;
  const arc = currentDay ? getArc(currentDay) : null;

  // Perks that unlock at each level
  const LEVEL_PERKS = {
    1: "Academy courses: Sleep Optimization, Strength Training Basics",
    2: "Academy course: Hydration Science",
    3: "Academy course: Dopamine Detox Protocol",
    4: "Academy course: Advanced Breathwork",
    5: "All courses unlocked. You've mastered the fundamentals.",
    6: "Mythic status. Your discipline is rare.",
    7: "Transcended. You have completed the ultimate transformation.",
  };

  const perk = LEVEL_PERKS[levelIndex];

  return (
    <motion.div
      style={S.overlay}
      onClick={onDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={levelUpCard}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.7, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.1 }}
      >
        <div style={glowBg} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.3 }}
          style={{ fontSize: 56, position: "relative", zIndex: 2, marginBottom: 4 }}
        >
          {levelIndex >= 6 ? "👑" : levelIndex >= 4 ? "⚔️" : "🔓"}
        </motion.div>
        <div style={badge}>LEVEL UP</div>
        <div style={titleStyle}>
          Lv.{levelIndex + 1} {level.name}
        </div>
        <div style={xpReqStyle}>{level.xpReq} XP reached</div>
        {perk && (
          <div style={perkBox}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.5, marginBottom: 4 }}>
              Unlocked
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>{perk}</div>
          </div>
        )}
        {arc && (
          <div style={{ ...perkBox, background: `${arc.color}10`, border: `1px solid ${arc.color}25`, marginTop: 0 }}>
            <span style={{ fontSize: 16 }}>{arc.icon}</span>
            <div style={{ fontSize: 11, fontWeight: 700, color: arc.color, marginTop: 4 }}>{arc.name} Arc</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2, lineHeight: 1.4 }}>{arc.subtitle}</div>
          </div>
        )}
        <button style={{ ...S.motBtn, position: "relative", zIndex: 10 }} onClick={(e) => { e.stopPropagation(); onDismiss(); }}>Continue →</button>
      </motion.div>
    </motion.div>
  );
}

const levelUpCard = {
  maxWidth: 340,
  width: "100%",
  padding: 32,
  borderRadius: 24,
  background: "linear-gradient(145deg,#0F0F28,#1A1038)",
  border: "1px solid rgba(124,92,252,0.25)",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 20px 80px rgba(124,92,252,0.2)",
};

const glowBg = {
  position: "absolute",
  top: "-50%",
  left: "-50%",
  width: "200%",
  height: "200%",
  background: "radial-gradient(circle,rgba(124,92,252,0.12) 0%,transparent 60%)",
  animation: "pulse 3s ease infinite",
};

const badge = {
  display: "inline-block",
  padding: "4px 16px",
  borderRadius: 16,
  background: "linear-gradient(135deg,rgba(124,92,252,0.2),rgba(236,72,153,0.15))",
  color: "#EC4899",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 2,
  marginBottom: 12,
  position: "relative",
  zIndex: 2,
};

const titleStyle = {
  fontSize: 26,
  fontWeight: 900,
  background: "linear-gradient(135deg,#7C5CFC,#EC4899)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  position: "relative",
  zIndex: 2,
  letterSpacing: -0.5,
};

const xpReqStyle = {
  fontSize: 13,
  opacity: 0.4,
  marginTop: 4,
  marginBottom: 16,
  position: "relative",
  zIndex: 2,
};

const perkBox = {
  padding: "12px 16px",
  borderRadius: 12,
  background: "rgba(124,92,252,0.08)",
  border: "1px solid rgba(124,92,252,0.12)",
  marginBottom: 20,
  position: "relative",
  zIndex: 2,
  textAlign: "center",
};
