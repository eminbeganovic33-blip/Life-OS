import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, findGuideForQuest } from "../../../data";
import { getQuestTier } from "../../../utils";
import { CategoryIcon } from "../../Icon";
import { Flame } from "lucide-react";
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
            <div style={ts.questMeta}>
              <CategoryIcon id={q.category} size={12} color={cat?.color} />
              <span style={{ color: cat?.color, fontSize: 10, fontWeight: 600 }}>{cat?.label}</span>
              {streak > 0 && !done && (
                <span style={{ ...ts.streakPill, color: cat?.color, borderColor: `${cat?.color}30`, display: "inline-flex", alignItems: "center", gap: 2 }}>
                  <Flame size={9} color={cat?.color} />{streak}d
                </span>
              )}
              {isFocus && !done && (
                <span style={ts.focusBadge}>FOCUS</span>
              )}
              {mastery && !done && (
                <span
                  title={`${mastery.completions} ${q.category} completions · next: ${mastery.nextLevel || "Max"}`}
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: mastery.color,
                    background: `${mastery.color}15`,
                    border: `1px solid ${mastery.color}35`,
                    padding: "1px 5px",
                    borderRadius: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {mastery.level}
                </span>
              )}
              <span style={{ ...ts.tierBadge, color: tier.color, borderColor: `${tier.color}30` }}>
                {tier.label}
              </span>
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
          <div style={ts.questActions}>
            {findGuideForQuest(q.text) && !done && (
              <span
                style={ts.actionLink}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleGuide(q.id, findGuideForQuest(q.text));
                }}
              >
                {activeGuide?.questId === q.id ? "Hide" : "Guide"}
              </span>
            )}
            {q.category === "exercise" && !done && (
              <span style={ts.actionLink} onClick={(e) => { e.stopPropagation(); onNavigate?.("dojo"); }}>
                Dojo
              </span>
            )}
            {q.aqId && !done && onRetireActiveQuest && (
              <span
                title="Retire this quest"
                style={{ ...ts.actionLink, color: "#EF4444", opacity: 0.5 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Retire this quest? It won't come back unless you add it again.")) {
                    onRetireActiveQuest(q.aqId);
                  }
                }}
              >
                Retire
              </span>
            )}
            {q.isCustom && (
              <span
                style={{ ...ts.actionLink, color: "#EF4444" }}
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
