import { useState } from "react";
import { motion } from "framer-motion";
import { X, Trophy, Target } from "lucide-react";
import { computeWeeklySummary } from "../../utils/notifications";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useTheme } from "../../hooks/useTheme";

/**
 * Weekly review ritual. MVP: shows last 7 days' completion + best category +
 * mood avg, asks user to pick ONE focus for the next week. Stored on
 * state.weeklyReviews keyed by ISO week so we don't re-prompt within a week.
 */
export default function WeeklyReviewModal({ state, save, onClose }) {
  const { colors } = useTheme();
  useEscapeKey(onClose);
  const [focus, setFocus] = useState("");
  const summary = computeWeeklySummary(state);
  const isoWeek = getIsoWeek(new Date());

  const handleSave = () => {
    if (!focus.trim()) {
      onClose();
      return;
    }
    const reviews = state.weeklyReviews || {};
    save({
      ...state,
      weeklyReviews: {
        ...reviews,
        [isoWeek]: {
          reviewedAt: new Date().toISOString(),
          focus: focus.trim().slice(0, 200),
          summary: { totalQuests: summary.totalQuests, completionRate: summary.completionRate, bestCategory: summary.bestCategory?.id },
        },
      },
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.bgGrad1 || "#0F0A1F",
          border: `1px solid ${colors.cardBorder || "rgba(255,255,255,0.08)"}`,
          borderRadius: 16, maxWidth: 380, width: "100%",
          display: "flex", flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", borderBottom: `1px solid ${colors.cardBorder || "rgba(255,255,255,0.06)"}`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: colors.text }}>Weekly Review</div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", padding: 4, display: "flex" }}
          ><X size={18} /></button>
        </div>

        <div style={{ padding: "16px 18px", overflowY: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7C5CFC", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
            Look Back
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            <Stat label="Quests done" value={summary.totalQuests} accent="#7C5CFC" />
            <Stat label="Completion" value={`${summary.completionRate}%`} accent="#22C55E" />
            <Stat label="Best category" value={summary.bestCategory?.label || "—"} accent="#F59E0B" />
            <Stat label="Mood avg" value={summary.moodAvg ? `${summary.moodAvg}/5` : "—"} accent="#EC4899" />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: "#7C5CFC", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
            Look Forward
          </div>
          <div style={{ fontSize: 13, color: colors.text, opacity: 0.85, marginBottom: 8, lineHeight: 1.5 }}>
            One thing you'll focus on this coming week.
          </div>
          <textarea
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. Show up for dojo even when tired"
            rows={3}
            maxLength={200}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${colors.cardBorder || "rgba(255,255,255,0.08)"}`,
              borderRadius: 8, padding: "10px 12px",
              fontSize: 13, color: colors.text, resize: "none",
              fontFamily: "inherit", outline: "none",
            }}
          />
          <div style={{ fontSize: 10, color: colors.textSecondary, opacity: 0.5, textAlign: "right", marginTop: 4 }}>
            {focus.length}/200
          </div>
        </div>

        <div style={{
          display: "flex", gap: 8, padding: 14,
          borderTop: `1px solid ${colors.cardBorder || "rgba(255,255,255,0.06)"}`,
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px", borderRadius: 8,
              background: "transparent",
              border: `1px solid ${colors.cardBorder || "rgba(255,255,255,0.1)"}`,
              color: colors.textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >Skip</button>
          <button
            onClick={handleSave}
            style={{
              flex: 2, padding: "10px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg,#7C5CFC,#6D28D9)",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >Save Review</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 10,
      background: `${accent}10`,
      border: `1px solid ${accent}25`,
    }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 9, opacity: 0.5, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

// ISO week string "2026-W18" — used as the dedup key so a review only
// triggers once per calendar week regardless of journey day numbers.
export function getIsoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
