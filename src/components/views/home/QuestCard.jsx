import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, findGuideForQuest } from "../../../data";
import { getQuestTier } from "../../../utils";
import { CategoryIcon } from "../../Icon";
import { Flame, AlertTriangle } from "lucide-react";
import QuestGuidePanel from "../../QuestGuidePanel";

// Burst ring shown briefly when a quest is completed
function SparkleRing({ color }) {
  return (
    <motion.div
      style={{
        position: "absolute", inset: 0, borderRadius: "inherit",
        border: `2px solid ${color || "#22C55E"}`,
        pointerEvents: "none",
      }}
      initial={{ opacity: 0.8, scale: 1 }}
      animate={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    />
  );
}

const QuestCard = React.memo(function QuestCard({
  quest, done, isDark, colors, ts,
  categoryStreaks, categoryMastery, focusQuest, swipeHint, activeGuide,
  onCheck, onUncheck, onSwipeHintShow, onSwipeHintClear,
  onToggleGuide, onNavigate, onOpenCustomQuest, onRemoveCustomQuest,
  onRetireActiveQuest,
  onTouchStart, onTouchEnd, currentDay,
}) {
  const q = quest;
  const cat = CATEGORIES.find((c) => c.id === q.category);
  const tier = getQuestTier(q.text);
  const isShowingHint = swipeHint === q.id;
  const streak = categoryStreaks[q.category] || 0;
  const mastery = categoryMastery?.[q.category] || null;
  const isFocus = focusQuest?.id === q.id && !done;
  const [sparkle, setSparkle] = useState(false);
  // H9/G7: inline retire confirmation instead of window.confirm()
  const [confirmingRetire, setConfirmingRetire] = useState(false);

  function handleClick() {
    if (done) {
      onSwipeHintShow(q.id);
    } else {
      setSparkle(true);
      setTimeout(() => setSparkle(false), 500);
      onCheck(q.id, q.xp);
    }
  }

  return (
    <React.Fragment>
      <motion.div
        layout
        initial={false}
        animate={{
          scale: done ? [1, 1.03, 1] : 1,
          opacity: done ? 0.55 : 1,
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          ...ts.questCard,
          borderLeft: `3px solid ${done ? "rgba(34,197,94,0.5)" : cat?.color || "#555"}`,
          background: isFocus && !done
            ? `linear-gradient(135deg, ${cat?.color}08, ${cat?.color}03)`
            : ts.questCard.background,
          position: "relative",
          overflow: "hidden",
        }}
        onClick={handleClick}
        onTouchStart={(e) => onTouchStart(e, q)}
        onTouchEnd={(e) => onTouchEnd(e, q)}
      >
        {/* Sparkle ring on completion */}
        <AnimatePresence>
          {sparkle && <SparkleRing key="sparkle" color={cat?.color} />}
        </AnimatePresence>

        {/* Undo overlay */}
        {isShowingHint && (
          <div
            style={ts.undoOverlay}
            onClick={(e) => {
              e.stopPropagation();
              onSwipeHintClear();
              onUncheck(q.id, q.xp);
            }}
          >
            <span style={ts.undoIcon}>↩</span>
            <span style={ts.undoText}>Tap to undo</span>
          </div>
        )}

        <div style={ts.questLeft}>
          {/* Checkbox */}
          <div
            role="checkbox"
            aria-checked={done}
            aria-label={`${done ? "Completed" : "Mark complete"}: ${q.text}`}
            style={{
              ...ts.checkbox,
              background: done ? (cat?.color || "#22C55E") : "transparent",
              borderColor: done ? (cat?.color || "#22C55E") : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"),
              boxShadow: done ? `0 0 8px ${cat?.color}40` : "none",
            }}
          >
            {done && <span style={{ fontSize: 10, color: "#fff" }}>✓</span>}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              ...ts.questText,
              textDecoration: done ? "line-through" : "none",
              opacity: done ? 0.7 : 1,
            }}>
              {q.text}
            </div>
            {/* H2/H3: Compact meta row — category + one status badge max, tier badge removed (XP value conveys difficulty) */}
            <div style={{ ...ts.questMeta, flexWrap: "nowrap", overflow: "hidden" }}>
              <CategoryIcon id={q.category} size={12} color={cat?.color} style={{ flexShrink: 0 }} />
              <span style={{ color: cat?.color, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{cat?.label}</span>
              {/* Show at most one status badge: FOCUS > mastery > streak */}
              {isFocus && !done && (
                <span style={{ ...ts.focusBadge, flexShrink: 0 }}>FOCUS</span>
              )}
              {!isFocus && mastery && !done && (
                <span
                  title={`${mastery.completions} ${q.category} completions`}
                  style={{
                    fontSize: 9, fontWeight: 800, color: mastery.color,
                    background: `${mastery.color}15`, border: `1px solid ${mastery.color}35`,
                    padding: "1px 5px", borderRadius: 4, textTransform: "uppercase",
                    letterSpacing: 0.4, flexShrink: 0,
                  }}
                >
                  {mastery.level}
                </span>
              )}
              {!isFocus && !mastery && streak > 0 && !done && (
                <span style={{ ...ts.streakPill, color: cat?.color, borderColor: `${cat?.color}30`, display: "inline-flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                  <Flame size={9} color={cat?.color} />{streak}d
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={ts.questRight}>
          <span style={{ ...ts.questXp, color: done ? "#22C55E" : (cat?.color || "#7C5CFC") }}>
            {done ? "✓" : `+${q.xp}`}
          </span>
          {done && !isShowingHint && (
            <span style={{ fontSize: 9, opacity: 0.18, display: "block", textAlign: "center", marginTop: 3, letterSpacing: 0.5 }}>← undo</span>
          )}
          {/* Action links */}
          {/* H11: Larger touch targets for action links */}
          <div style={{ ...ts.questActions, gap: 4 }}>
            {findGuideForQuest(q.text) && !done && (
              <span
                style={{ ...ts.actionLink, padding: "4px 6px", borderRadius: 6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleGuide(q.id, findGuideForQuest(q.text));
                }}
              >
                {activeGuide?.questId === q.id ? "Hide" : "Guide"}
              </span>
            )}
            {q.category === "exercise" && !done && (
              <span
                style={{ ...ts.actionLink, padding: "4px 6px", borderRadius: 6 }}
                onClick={(e) => { e.stopPropagation(); onNavigate?.("dojo"); }}
              >
                Dojo
              </span>
            )}
            {/* H9/G7: inline retire confirmation — no window.confirm() */}
            {q.aqId && !done && onRetireActiveQuest && !confirmingRetire && (
              <span
                title="Retire this quest"
                style={{ ...ts.actionLink, color: "#EF4444", opacity: 0.5, padding: "4px 6px", borderRadius: 6 }}
                onClick={(e) => { e.stopPropagation(); setConfirmingRetire(true); }}
              >
                Retire
              </span>
            )}
            {q.isCustom && !done && (
              <span
                style={{ ...ts.actionLink, color: "#EF4444", padding: "4px 6px", borderRadius: 6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  const prefix = `custom-${q.category}-`;
                  const suffix = `-${currentDay}`;
                  let rawId = q.id;
                  if (rawId.startsWith(prefix)) rawId = rawId.slice(prefix.length);
                  if (rawId.endsWith(suffix)) rawId = rawId.slice(0, -suffix.length);
                  onRemoveCustomQuest(rawId);
                }}
              >
                ✕
              </span>
            )}
          </div>
        </div>
      </motion.div>
      {/* H9: Inline retire confirmation — replaces window.confirm() */}
      {confirmingRetire && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            margin: "0 0 2px",
            borderRadius: 8,
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.18)",
          }}
        >
          <AlertTriangle size={13} color="#EF4444" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#EF4444", flex: 1, lineHeight: 1.4 }}>
            Retire this quest? It won't return unless you re-add it.
          </span>
          <button
            style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); onRetireActiveQuest(q.aqId); setConfirmingRetire(false); }}
          >
            Yes, retire
          </button>
          <button
            style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px" }}
            onClick={(e) => { e.stopPropagation(); setConfirmingRetire(false); }}
          >
            Cancel
          </button>
        </motion.div>
      )}
      {activeGuide?.questId === q.id && (
        <QuestGuidePanel
          guide={activeGuide.guide}
          onAddQuest={() => { if (onOpenCustomQuest) onOpenCustomQuest(); }}
        />
      )}
    </React.Fragment>
  );
});

export default QuestCard;
