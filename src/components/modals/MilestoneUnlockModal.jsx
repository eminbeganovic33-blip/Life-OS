import { motion } from "framer-motion";
import { S } from "../../styles/theme";
import { Pencil, BarChart3, Star, Trophy, Zap, BookOpen } from "lucide-react";

const MILESTONES = {
  2: {
    badge: "DAY 2",
    badgeColor: "#38BDF8",
    title: "You came back.",
    subtitle: "That's how habits are built — one return at a time.",
    accentColor: "#38BDF8",
    gradient: "linear-gradient(145deg,#040C18,#0A1628)",
    glowColor: "rgba(56,189,248,0.12)",
    unlocks: [
      { Icon: Zap, label: "Streak multiplier active", desc: "Keep the chain going for bigger XP rewards." },
      { Icon: BarChart3, label: "Analytics unlocking", desc: "More data = deeper insights as you log daily." },
    ],
    cta: "Keep the chain →",
  },
  3: {
    badge: "DAY 3",
    badgeColor: "#7C5CFC",
    title: "3 days in. Locked in.",
    subtitle: "Research shows habits start forming after consistent early days. You're right on track.",
    accentColor: "#7C5CFC",
    gradient: "linear-gradient(145deg,#0F0A28,#160F3A)",
    glowColor: "rgba(124,92,252,0.12)",
    unlocks: [
      { Icon: Pencil, label: "Custom quests unlocked", desc: "Create personalized quests that fit your life." },
      { Icon: BookOpen, label: "More Academy content open", desc: "Tier 1 courses now fully available." },
    ],
    cta: "Build it your way →",
  },
  7: {
    badge: "WEEK 1",
    badgeColor: "#F59E0B",
    title: "One full week.",
    subtitle: "You've outpaced 80% of people who start a self-improvement app. This is rare.",
    accentColor: "#F59E0B",
    gradient: "linear-gradient(145deg,#150C00,#281800)",
    glowColor: "rgba(245,158,11,0.12)",
    unlocks: [
      { Icon: BarChart3, label: "Full Analytics suite ready", desc: "7 days of data = real pattern insights." },
      { Icon: Trophy, label: "Trophy board active", desc: "Milestones and achievements now tracking." },
      { Icon: Star, label: "Weekly challenges live", desc: "New challenge every week for bonus XP." },
    ],
    cta: "Claim Week 2 →",
  },
};

export default function MilestoneUnlockModal({ day, onDismiss }) {
  const m = MILESTONES[day];
  if (!m) return null;

  return (
    <motion.div
      style={S.overlay}
      onClick={onDismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={{ ...card, background: m.gradient, borderColor: `${m.accentColor}22` }}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.82, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.05 }}
      >
        {/* Glow bg */}
        <div style={{ ...glowBg, background: `radial-gradient(circle, ${m.glowColor} 0%, transparent 65%)` }} />

        {/* Badge */}
        <motion.div
          style={{ ...badge, background: `${m.accentColor}18`, color: m.accentColor, borderColor: `${m.accentColor}28` }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          {m.badge} COMPLETE
        </motion.div>

        {/* Title */}
        <motion.div
          style={{ ...title, color: m.accentColor }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          {m.title}
        </motion.div>

        {/* Subtitle */}
        <motion.div
          style={subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
        >
          {m.subtitle}
        </motion.div>

        {/* Unlocks */}
        <motion.div
          style={unlockSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <div style={unlockLabel}>Unlocked</div>
          {m.unlocks.map((u, i) => (
            <motion.div
              key={i}
              style={{ ...unlockRow, borderColor: `${m.accentColor}14` }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.36 + i * 0.07 }}
            >
              <div style={{ ...unlockIcon, background: `${m.accentColor}12`, border: `1px solid ${m.accentColor}20` }}>
                <u.Icon size={14} color={m.accentColor} strokeWidth={2} />
              </div>
              <div>
                <div style={unlockName}>{u.label}</div>
                <div style={unlockDesc}>{u.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          style={{ ...ctaBtn, background: m.accentColor, color: day === 7 ? "#000" : "#fff" }}
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
          whileTap={{ scale: 0.97 }}
        >
          {m.cta}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Styles ──

const card = {
  maxWidth: 340,
  width: "90%",
  padding: "28px 24px",
  borderRadius: 24,
  border: "1px solid",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 20px 80px rgba(0,0,0,0.4)",
};

const glowBg = {
  position: "absolute",
  top: "-40%",
  left: "-40%",
  width: "180%",
  height: "180%",
  pointerEvents: "none",
};

const badge = {
  display: "inline-block",
  padding: "4px 14px",
  borderRadius: 20,
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  marginBottom: 14,
  position: "relative",
  zIndex: 2,
  border: "1px solid",
};

const title = {
  fontSize: 24,
  fontWeight: 900,
  letterSpacing: -0.5,
  lineHeight: 1.15,
  marginBottom: 8,
  position: "relative",
  zIndex: 2,
};

const subtitle = {
  fontSize: 13,
  lineHeight: 1.6,
  opacity: 0.5,
  marginBottom: 20,
  position: "relative",
  zIndex: 2,
};

const unlockSection = {
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: "14px 14px 8px",
  marginBottom: 20,
  position: "relative",
  zIndex: 2,
  textAlign: "left",
};

const unlockLabel = {
  fontSize: 10,
  fontWeight: 700,
  opacity: 0.35,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 10,
};

const unlockRow = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  paddingBottom: 10,
  marginBottom: 6,
  borderBottom: "1px solid",
};

const unlockIcon = {
  width: 30,
  height: 30,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 1,
};

const unlockName = {
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 2,
};

const unlockDesc = {
  fontSize: 11,
  opacity: 0.4,
  lineHeight: 1.4,
};

const ctaBtn = {
  width: "100%",
  padding: "13px",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  position: "relative",
  zIndex: 2,
  border: "none",
};
