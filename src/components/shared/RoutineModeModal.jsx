import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Circle, ChevronRight, Zap } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { CATEGORIES } from "../../data/categories";

/**
 * 10C — Routine Mode
 * Full-screen step-through for a single time block (morning / evening / etc.)
 * Lets the user focus on one quest at a time without visual noise.
 */
export default function RoutineModeModal({ block, quests, completedIds, onToggle, onClose }) {
  // Index of the focused quest (cycles forward on check)
  const firstIncomplete = quests.findIndex((q) => !completedIds.includes(q.id));
  const [focusIdx, setFocusIdx] = useState(Math.max(0, firstIncomplete));

  const done = quests.filter((q) => completedIds.includes(q.id)).length;
  const total = quests.length;
  const allDone = done === total;
  const progress = total > 0 ? done / total : 0;

  const current = quests[focusIdx];
  const currentDone = current ? completedIds.includes(current.id) : false;

  function handleCheck() {
    if (!current) return;
    onToggle(current.id, current.xp);
    // Advance to the next incomplete quest
    const nextIdx = quests.findIndex(
      (q, i) => i > focusIdx && !completedIds.includes(q.id)
    );
    if (nextIdx !== -1) {
      setTimeout(() => setFocusIdx(nextIdx), 200);
    } else {
      // Wrap to first incomplete
      const wrapIdx = quests.findIndex((q) => !completedIds.includes(q.id));
      if (wrapIdx !== -1 && wrapIdx !== focusIdx) {
        setTimeout(() => setFocusIdx(wrapIdx), 200);
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        style={styles.sheet}
      >
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.blockLabel}>{block.icon && <block.icon size={14} color={block.accent} style={{ marginRight: 6, verticalAlign: "middle" }} />}{block.label} Routine</div>
            <div style={styles.blockSub}>{done} of {total} done</div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={20} color={TOKENS.color.textTertiary} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <motion.div
            style={styles.progressFill}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* All done state */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={styles.allDone}
            >
              <div style={styles.allDoneIcon}>🏆</div>
              <div style={styles.allDoneTitle}>{block.label} Complete</div>
              <div style={styles.allDoneSub}>Every protocol locked in. That's the work.</div>
              <button onClick={onClose} style={styles.doneBtn}>Close</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focused quest card */}
        {!allDone && current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            style={styles.focusCard}
          >
            {/* Category badge */}
            {(() => {
              const cat = CATEGORIES.find((c) => c.id === current.category);
              const color = DOMAIN_COLORS[current.category] || TOKENS.color.brand;
              return (
                <div style={{ ...styles.catBadge, background: `${color}18`, color }}>
                  {cat?.icon} {cat?.label}
                </div>
              );
            })()}

            <div style={styles.questTitle}>{current.text}</div>
            {current.why && <div style={styles.questWhy}>{current.why}</div>}

            <div style={styles.xpRow}>
              <Zap size={14} color="#FBBF24" fill="#FBBF24" />
              <span style={styles.xpLabel}>+{current.xp} XP</span>
            </div>

            <button
              onClick={handleCheck}
              style={{
                ...styles.checkBtn,
                background: currentDone
                  ? "linear-gradient(135deg, #10B981, #059669)"
                  : "linear-gradient(135deg, #7C5CFC, #EC4899)",
              }}
            >
              {currentDone ? (
                <>
                  <CheckCircle2 size={22} color="#fff" strokeWidth={2.5} />
                  <span>Uncheck</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={22} color="#fff" strokeWidth={2.5} />
                  <span>Mark done</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Quest list (all, tappable) */}
        <div style={styles.listSection}>
          <div style={styles.listLabel}>All quests in this block</div>
          {quests.map((q, i) => {
            const isDone = completedIds.includes(q.id);
            const isFocused = i === focusIdx;
            const cat = CATEGORIES.find((c) => c.id === q.category);
            const color = DOMAIN_COLORS[q.category] || TOKENS.color.brand;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setFocusIdx(i);
                  onToggle(q.id, q.xp);
                }}
                style={{
                  ...styles.listRow,
                  background: isFocused ? `${color}10` : "transparent",
                  borderColor: isFocused ? `${color}30` : TOKENS.color.border,
                }}
              >
                <div style={{
                  ...styles.listCheck,
                  background: isDone ? color : "transparent",
                  borderColor: isDone ? color : TOKENS.color.border,
                }}>
                  {isDone && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path d="M2 5 L4.5 7.5 L8 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ ...styles.listText, textDecoration: isDone ? "line-through" : "none", color: isDone ? TOKENS.color.textTertiary : TOKENS.color.text }}>
                    {cat?.icon} {q.text}
                  </div>
                </div>
                {isFocused && !isDone && <ChevronRight size={14} color={color} />}
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  backdrop: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    zIndex: 600,
    display: "flex", alignItems: "flex-end",
  },
  sheet: {
    width: "100%",
    maxHeight: "92dvh",
    background: TOKENS.color.surface,
    borderRadius: "24px 24px 0 0",
    overflowY: "auto",
    paddingBottom: 32,
  },
  header: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "20px 20px 12px",
  },
  blockLabel: {
    fontSize: 18, fontWeight: 700, color: TOKENS.color.text,
    display: "flex", alignItems: "center",
  },
  blockSub: {
    fontSize: 13, color: TOKENS.color.textTertiary, marginTop: 2,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    background: TOKENS.color.surfaceAlt, border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  progressTrack: {
    height: 4, background: TOKENS.color.border,
    margin: "0 20px 20px",
    borderRadius: 2, overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #7C5CFC, #EC4899)",
    borderRadius: 2,
  },
  focusCard: {
    margin: "0 16px 20px",
    padding: 20,
    background: TOKENS.color.surfaceAlt,
    borderRadius: 16,
    border: `1px solid ${TOKENS.color.border}`,
  },
  catBadge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
    padding: "3px 10px", borderRadius: 20,
    marginBottom: 12, textTransform: "uppercase",
  },
  questTitle: {
    fontSize: 22, fontWeight: 700,
    color: TOKENS.color.text, lineHeight: 1.3,
    marginBottom: 10,
  },
  questWhy: {
    fontSize: 13, color: TOKENS.color.textSecondary,
    lineHeight: 1.5, marginBottom: 14,
  },
  xpRow: {
    display: "flex", alignItems: "center", gap: 4,
    marginBottom: 16,
  },
  xpLabel: {
    fontSize: 13, fontWeight: 600, color: "#FBBF24",
  },
  checkBtn: {
    width: "100%", height: 52, borderRadius: 14,
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontSize: 16, fontWeight: 700, color: "#fff",
    boxShadow: "0 4px 14px rgba(124,92,252,0.30)",
  },
  allDone: {
    margin: "20px 16px",
    padding: 28,
    background: "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(5,150,105,0.06))",
    borderRadius: 20,
    border: "1px solid rgba(16,185,129,0.20)",
    textAlign: "center",
  },
  allDoneIcon: { fontSize: 40, marginBottom: 12 },
  allDoneTitle: {
    fontSize: 22, fontWeight: 800,
    color: "#10B981", marginBottom: 6,
  },
  allDoneSub: {
    fontSize: 14, color: TOKENS.color.textSecondary,
    lineHeight: 1.5, marginBottom: 20,
  },
  doneBtn: {
    padding: "12px 32px", borderRadius: 12,
    background: "#10B981", color: "#fff",
    border: "none", cursor: "pointer",
    fontSize: 15, fontWeight: 700,
  },
  listSection: {
    padding: "0 16px",
  },
  listLabel: {
    fontSize: 12, fontWeight: 600, letterSpacing: "0.08em",
    color: TOKENS.color.textTertiary, textTransform: "uppercase",
    marginBottom: 8,
  },
  listRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 12,
    padding: "10px 12px", borderRadius: 10,
    border: "1px solid transparent",
    marginBottom: 4, cursor: "pointer",
    background: "transparent", textAlign: "left",
  },
  listCheck: {
    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
    border: "2px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  listText: {
    fontSize: 14, fontWeight: 500,
  },
};
