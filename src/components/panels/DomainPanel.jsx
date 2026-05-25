import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Check, Plus } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { CATEGORIES } from "../../data/categories";
import { getTodayStr, getDayQuests, daysBetween } from "../../utils";

export default function DomainPanel({ domainId, state, save, onClose, onOpenPanel }) {
  const domain = CATEGORIES.find((c) => c.id === domainId);
  const color = DOMAIN_COLORS[domainId] || TOKENS.color.text;
  const today = getTodayStr();
  const dayNumber = state.startDate ? daysBetween(state.startDate) + 1 : 1;

  const quests = useMemo(() => {
    const all = getDayQuests(dayNumber, state.customQuests, state);
    return all.filter((q) => q.category === domainId);
  }, [dayNumber, state, domainId]);

  const completedIds = state.completedQuests?.[today] || [];

  const toggleQuest = useCallback((questId) => {
    const todayCompleted = [...(state.completedQuests?.[today] || [])];
    const idx = todayCompleted.indexOf(questId);

    if (idx >= 0) {
      todayCompleted.splice(idx, 1);
    } else {
      todayCompleted.push(questId);
    }

    const quest = quests.find((q) => q.id === questId);
    const xpDelta = quest ? (idx >= 0 ? -quest.xp : quest.xp) : 0;

    save({
      ...state,
      xp: Math.max(0, (state.xp || 0) + xpDelta),
      lifetimeXp: Math.max(0, (state.lifetimeXp || 0) + (xpDelta > 0 ? xpDelta : 0)),
      completedQuests: {
        ...state.completedQuests,
        [today]: todayCompleted,
      },
    });
  }, [state, save, today, quests]);

  const allDone = quests.length > 0 && quests.every((q) => completedIds.includes(q.id));

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={styles.panel}
    >
      {/* Header */}
      <div style={{ ...styles.header, borderBottomColor: `${color}30` }}>
        <button onClick={onClose} style={styles.backBtn} aria-label="Close">
          <ChevronLeft size={20} color={TOKENS.color.text} />
        </button>
        <div style={{ ...styles.domainIcon, background: `${color}14` }}>
          <span style={{ fontSize: 22 }}>{domain?.icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.domainLabel}>{domain?.label}</div>
          <div style={styles.domainSub}>
            {quests.filter((q) => completedIds.includes(q.id)).length} of {quests.length} complete
          </div>
        </div>
        {onOpenPanel && (
          <button onClick={() => onOpenPanel("custom-quests")} style={styles.addBtn}>
            <Plus size={16} color={TOKENS.color.textSecondary} />
          </button>
        )}
      </div>

      {/* Quest list */}
      <div style={styles.questList}>
        {quests.length === 0 && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 36 }}>{domain?.icon}</span>
            <div style={styles.emptyTitle}>No quests today</div>
            <div style={styles.emptySub}>
              Add a custom quest to start tracking {domain?.label?.toLowerCase()} habits.
            </div>
            {onOpenPanel && (
              <button onClick={() => onOpenPanel("custom-quests")} style={{ ...styles.emptyBtn, borderColor: color, color }}>
                + Add quest
              </button>
            )}
          </div>
        )}
        {quests.map((quest) => {
          const done = completedIds.includes(quest.id);
          return (
            <button
              key={quest.id}
              onClick={() => toggleQuest(quest.id)}
              style={{
                ...styles.questRow,
                background: done ? `${color}08` : TOKENS.color.surfaceElevated,
                borderColor: done ? `${color}20` : TOKENS.color.border,
              }}
            >
              <div style={{
                ...styles.checkbox,
                background: done ? color : "transparent",
                borderColor: done ? color : TOKENS.color.textTertiary,
              }}>
                {done && <Check size={14} color="#fff" strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  ...styles.questText,
                  textDecoration: done ? "line-through" : "none",
                  opacity: done ? 0.5 : 1,
                }}>
                  {quest.text}
                </div>
                <div style={styles.questXp}>+{quest.xp} XP</div>
              </div>
            </button>
          );
        })}
      </div>

      {allDone && (
        <div style={{ ...styles.doneBanner, background: `${color}10`, color }}>
          All {domain?.label} protocols complete
        </div>
      )}
    </motion.div>
  );
}

const styles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    maxWidth: 480,
    background: TOKENS.color.bg,
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    boxShadow: TOKENS.shadow.xl,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${TOKENS.space[5]}px ${TOKENS.space[5]}px`,
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    flexShrink: 0,
  },
  addBtn: {
    background: TOKENS.color.surface,
    border: "none",
    cursor: "pointer",
    padding: 8,
    borderRadius: TOKENS.radius.sm,
    flexShrink: 0,
  },
  domainIcon: {
    width: 44,
    height: 44,
    borderRadius: TOKENS.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  domainLabel: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  domainSub: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 1,
  },
  questList: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
    display: "flex",
    flexDirection: "column",
    gap: TOKENS.space[3],
  },
  questRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[4],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: TOKENS.color.border,
    cursor: "pointer",
    textAlign: "left",
    transition: TOKENS.transition.fast,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: TOKENS.radius.sm,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: TOKENS.color.textTertiary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: TOKENS.transition.fast,
  },
  questText: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.medium,
    color: TOKENS.color.text,
    transition: TOKENS.transition.fast,
  },
  questXp: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: TOKENS.space[3],
    padding: TOKENS.space[8],
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  emptySub: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    maxWidth: 240,
    lineHeight: 1.5,
  },
  emptyBtn: {
    marginTop: TOKENS.space[2],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[5]}px`,
    background: "transparent",
    border: "1.5px solid",
    borderRadius: TOKENS.radius.full,
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
  doneBanner: {
    margin: TOKENS.space[5],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    borderRadius: TOKENS.radius.lg,
    textAlign: "center",
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
  },
};
