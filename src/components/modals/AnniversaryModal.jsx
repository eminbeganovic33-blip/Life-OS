import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Star, Zap, Trophy, X } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export const ANNIVERSARY_DAYS = [30, 100, 365];

const CONFIG = {
  30:  { emoji: "🔥", title: "30 Days In", color: "#F97316", gradient: "linear-gradient(135deg, #F97316, #EF4444)", sub: "One month of daily discipline." },
  100: { emoji: "⚡", title: "100 Days", color: "#FBBF24", gradient: "linear-gradient(135deg, #FBBF24, #F59E0B)", sub: "Triple digits. You're in rare company." },
  365: { emoji: "👑", title: "One Full Year", color: "#7C5CFC", gradient: "linear-gradient(135deg, #7C5CFC, #A78BFA)", sub: "365 days. You did the thing most people only talk about." },
};

export default function AnniversaryModal({ state, day, onDismiss }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cfg = CONFIG[day];
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onDismiss(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDismiss]);

  if (!cfg) return null;

  const totalCompleted = Object.keys(state.completedDays || {}).length;
  const completionRate = day > 0 ? Math.round((totalCompleted / day) * 100) : 0;

  function copyShareText() {
    const text = `Day ${day} on Life OS ✓\n${cfg.emoji} ${cfg.title}\n⚡ ${state.xp} XP · 🔥 ${state.bestStreak} day best streak · ${completionRate}% completion rate\nlife-os-app-ashen.vercel.app`;
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === overlayRef.current) onDismiss(); }}
        style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{
            width: "100%", maxWidth: 380,
            background: isDark ? "#12121A" : "#fff",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Hero banner */}
          <div style={{
            background: cfg.gradient,
            padding: "32px 24px 28px",
            textAlign: "center",
            position: "relative",
          }}>
            <button
              onClick={onDismiss}
              style={{
                position: "absolute", top: 14, right: 14,
                background: "rgba(255,255,255,0.15)", border: "none",
                borderRadius: 8, padding: 6, cursor: "pointer",
                display: "flex", alignItems: "center",
              }}
            >
              <X size={14} color="#fff" />
            </button>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{cfg.emoji}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>
              {cfg.title}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 6, fontWeight: 500 }}>
              {cfg.sub}
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}>
              <StatBox icon={<Zap size={16} color={cfg.color} />} val={state.xp} label="Total XP" color={cfg.color} isDark={isDark} />
              <StatBox icon={<Flame size={16} color="#F97316" />} val={state.bestStreak} label="Best streak" color="#F97316" isDark={isDark} />
              <StatBox icon={<Trophy size={16} color="#FBBF24" />} val={totalCompleted} label="Days completed" color="#FBBF24" isDark={isDark} />
              <StatBox icon={<Star size={16} color={cfg.color} />} val={`${completionRate}%`} label="Completion rate" color={cfg.color} isDark={isDark} />
            </div>

            {/* Share */}
            <button
              onClick={copyShareText}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "none",
                background: cfg.gradient,
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: 0.2,
              }}
            >
              Copy & Share
            </button>

            <button
              onClick={onDismiss}
              style={{
                marginTop: 8,
                marginBottom: 20,
                width: "100%",
                padding: "11px",
                borderRadius: 14,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                background: "transparent",
                color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Keep going →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatBox({ icon, val, label, color, isDark }) {
  return (
    <div style={{
      padding: "14px 12px",
      borderRadius: 14,
      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      {icon}
      <div style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: -0.5 }}>{val}</div>
      <div style={{ fontSize: 10, opacity: 0.4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}
