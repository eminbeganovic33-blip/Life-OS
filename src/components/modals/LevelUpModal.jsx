import { motion } from "framer-motion";
import { useTheme } from "../../hooks";
import { LEVELS } from "../../data";
import { Sparkles, ChevronRight } from "lucide-react";

// Floating star particles
const STARS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 10 + Math.random() * 80,
  delay: Math.random() * 0.8,
  size: 4 + Math.random() * 6,
  color: i % 4 === 0 ? "#FBBF24" : i % 4 === 1 ? "#7C5CFC" : i % 4 === 2 ? "#EC4899" : "#3B82F6",
}));

// Perks unlocked at each level (indexed by levelIndex 0-7)
const LEVEL_PERKS = {
  1: { text: "Sleep Optimization + Strength Training Basics in Academy", icon: "📚" },
  2: { text: "Hydration Science course unlocked", icon: "💧" },
  3: { text: "Dopamine Detox Protocol unlocked", icon: "🧠" },
  4: { text: "Advanced Breathwork course unlocked", icon: "🌬️" },
  5: { text: "All courses unlocked — you've mastered the fundamentals", icon: "🏆" },
  6: { text: "Mythic status. Your discipline is rare.", icon: "⚔️" },
  7: { text: "Transcended. The ultimate transformation complete.", icon: "👑" },
};

export default function LevelUpModal({ levelIndex, onDismiss }) {
  const { colors } = useTheme();
  const level = LEVELS[levelIndex];
  if (!level) return null;

  const perk = LEVEL_PERKS[levelIndex];
  const isElite = levelIndex >= 5;
  const isMythic = levelIndex >= 6;

  const accentColor = isMythic ? "#FBBF24" : isElite ? "#EC4899" : "#7C5CFC";
  const accentColorB = isMythic ? "#F97316" : isElite ? "#7C5CFC" : "#EC4899";

  return (
    <motion.div
      style={overlay}
      onClick={onDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Star particles */}
      {STARS.map((s) => (
        <motion.div
          key={s.id}
          style={{
            position: "fixed",
            left: `${s.x}%`,
            top: "70%",
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.color,
            pointerEvents: "none",
            zIndex: 9998,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          }}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1, 0],
            y: [0, -200 - Math.random() * 200],
            x: [(Math.random() - 0.5) * 80],
          }}
          transition={{ delay: s.delay, duration: 1.8, ease: "easeOut" }}
        />
      ))}

      <motion.div
        style={card}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.72, rotate: -4, y: 30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.08 }}
      >
        {/* Glow */}
        <motion.div
          style={{
            position: "absolute",
            top: "-50%", left: "-30%",
            width: "160%", height: "160%",
            background: `radial-gradient(circle at 50% 40%, ${accentColor}14 0%, ${accentColorB}08 50%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: 1,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Emoji icon */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.22 }}
          style={{ fontSize: 58, position: "relative", zIndex: 2, marginBottom: 6 }}
        >
          {isMythic ? "👑" : isElite ? "⚔️" : "🔓"}
        </motion.div>

        {/* LEVEL UP badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 18 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 16px",
            borderRadius: 20,
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColorB}14)`,
            border: `1px solid ${accentColor}30`,
            color: accentColor,
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 10,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Sparkles size={11} />
          Level Up
        </motion.div>

        {/* Level name */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            fontSize: 26,
            fontWeight: 900,
            background: `linear-gradient(135deg, ${accentColor}, ${accentColorB})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            position: "relative",
            zIndex: 2,
            letterSpacing: -0.5,
            lineHeight: 1.1,
          }}
        >
          Lv.{levelIndex + 1} {level.name}
        </motion.div>

        {/* XP reached */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.4 }}
          style={{
            fontSize: 12,
            opacity: 0.4,
            color: "#fff",
            marginTop: 4,
            marginBottom: 14,
            position: "relative",
            zIndex: 2,
          }}
        >
          {level.xpReq.toLocaleString()} XP reached
        </motion.div>

        {/* Perk box */}
        {perk && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: `rgba(255,255,255,0.04)`,
              border: `1px solid ${accentColor}18`,
              marginBottom: 20,
              position: "relative",
              zIndex: 2,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{perk.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.4, color: "#fff", marginBottom: 6 }}>
              Unlocked
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.7)" }}>
              {perk.text}
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "14px 24px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${accentColor}, ${accentColorB})`,
            color: isMythic ? "#0D0D22" : "#fff",
            fontSize: 15,
            fontWeight: 900,
            border: "none",
            cursor: "pointer",
            letterSpacing: 0.4,
            boxShadow: `0 8px 24px ${accentColor}30`,
            position: "relative",
            zIndex: 2,
          }}
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        >
          Continue
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
  padding: 16,
};

const card = {
  maxWidth: 340,
  width: "100%",
  padding: "28px 24px",
  borderRadius: 24,
  background: "linear-gradient(160deg, #0F0F28 0%, #1A1038 60%, #110820 100%)",
  border: "1px solid rgba(124,92,252,0.2)",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 24px 80px rgba(124,92,252,0.18), 0 8px 32px rgba(0,0,0,0.6)",
};
