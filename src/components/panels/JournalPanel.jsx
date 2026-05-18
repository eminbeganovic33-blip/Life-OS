import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, BookOpen } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { getTodayStr } from "../../utils";

const MOODS = [
  { val: 1, emoji: "😣", label: "Awful" },
  { val: 2, emoji: "😔", label: "Bad" },
  { val: 3, emoji: "😐", label: "Meh" },
  { val: 4, emoji: "🙂", label: "Okay" },
  { val: 5, emoji: "😊", label: "Good" },
  { val: 6, emoji: "🤩", label: "Great" },
];

export default function JournalPanel({ state, save, onClose }) {
  const today = getTodayStr();
  const existing = state.journal?.[today] || {};
  const [mood, setMood] = useState(state.moods?.[today] || null);
  const [text, setText] = useState(existing.text || "");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const updated = {
      ...state,
      journal: { ...state.journal, [today]: { text, ts: Date.now() } },
      moods: { ...state.moods, [today]: mood },
    };
    save(updated);
    setSaved(true);
    setTimeout(() => onClose(), 800);
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={styles.panel}
    >
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <BookOpen size={20} color={TOKENS.color.text} />
          <span style={styles.title}>Journal</span>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={20} color={TOKENS.color.textSecondary} />
        </button>
      </div>

      <div style={styles.body}>
        {/* Mood */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>How are you feeling?</div>
          <div style={styles.moodRow}>
            {MOODS.map((m) => (
              <button
                key={m.val}
                onClick={() => setMood(m.val)}
                style={{
                  ...styles.moodBtn,
                  background: mood === m.val ? TOKENS.color.surface : "transparent",
                  transform: mood === m.val ? "scale(1.15)" : "scale(1)",
                }}
              >
                <span style={{ fontSize: 28 }}>{m.emoji}</span>
                <span style={{
                  fontSize: TOKENS.font.size.xs,
                  color: mood === m.val ? TOKENS.color.text : TOKENS.color.textTertiary,
                  fontWeight: TOKENS.font.weight.medium,
                }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Entry */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>What's on your mind?</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write freely..."
            style={styles.textarea}
            rows={8}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!mood && !text}
          style={{
            ...styles.saveBtn,
            opacity: !mood && !text ? 0.4 : 1,
          }}
        >
          {saved ? "Saved ✓" : "Save entry"}
        </button>
      </div>
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
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottom: `1px solid ${TOKENS.color.border}`,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
  },
  title: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
  },
  section: {
    marginBottom: TOKENS.space[6],
  },
  sectionLabel: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
    marginBottom: TOKENS.space[3],
  },
  moodRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  moodBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "8px 6px",
    border: "none",
    borderRadius: TOKENS.radius.md,
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
  textarea: {
    width: "100%",
    padding: TOKENS.space[4],
    borderRadius: TOKENS.radius.md,
    border: `1px solid ${TOKENS.color.border}`,
    background: TOKENS.color.surface,
    fontSize: TOKENS.font.size.md,
    fontFamily: TOKENS.font.sans,
    color: TOKENS.color.text,
    resize: "none",
    outline: "none",
    lineHeight: 1.6,
  },
  saveBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    background: TOKENS.color.text,
    color: "#fff",
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
};
