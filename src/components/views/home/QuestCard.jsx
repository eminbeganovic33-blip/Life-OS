import React from "react";
import { motion } from "framer-motion";
import { CATEGORIES, findGuideForQuest } from "../../../data";
import { getQuestTier } from "../../../utils";
import { CategoryIcon } from "../../Icon";
import QuestGuidePanel from "../../QuestGuidePanel";

export default function QuestCard({
  quest, done, isDark, colors, ts,
  categoryStreaks, focusQuest, swipeHint, activeGuide,
  onCheck, onUncheck, onSwipeHintShow, onSwipeHintClear,
  onToggleGuide, onNavigate, onOpenCustomQuest, onRemoveCustomQuest,
  onTouchStart, onTouchEnd, currentDay,
}) {
  const q = quest;
  const cat = CATEGORIES.find((c) => c.id === q.category);
  const tier = getQuestTier(q.text);
  const isShowingHint = swipeHint === q.id;
  const streak = categoryStreaks[q.category] || 0;
  const isFocus = focusQuest?.id === q.id && !done;

  function handleClick() {
    if (done) {
      onSwipeHintShow(q.id);
    } else {
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
                <span style={{ ...ts.streakPill, color: cat?.color, borderColor: `${cat?.color}30` }}>
                  🔥{streak}d
                </span>
              )}
              {isFocus && !done && (
                <span style={ts.focusBadge}>FOCUS</span>
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
}
