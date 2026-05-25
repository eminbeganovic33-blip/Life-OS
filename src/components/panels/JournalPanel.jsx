import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen, Check, Search, Trash2 } from "lucide-react";
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
  const [view, setView] = useState("write");
  const [editDate, setEditDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const existing = state.journal?.[editDate] || {};
  const [mood, setMood] = useState(state.moods?.[editDate] || null);
  const [text, setText] = useState(existing.text || "");
  const [saved, setSaved] = useState(false);

  const pastEntries = useMemo(() => {
    const journal = state.journal || {};
    const moods = state.moods || {};
    const dates = new Set([...Object.keys(journal), ...Object.keys(moods)]);
    return [...dates]
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        text: journal[date]?.text || "",
        mood: moods[date] || null,
        isToday: date === today,
      }));
  }, [state.journal, state.moods, today]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return pastEntries;
    const q = searchQuery.toLowerCase();
    return pastEntries.filter((e) =>
      (e.text || "").toLowerCase().includes(q) || (e.date || "").includes(q)
    );
  }, [pastEntries, searchQuery]);

  function handleSave() {
    const updated = {
      ...state,
      journal: { ...state.journal, [editDate]: { text, ts: Date.now() } },
      moods: { ...state.moods, [editDate]: mood },
    };
    save(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function openEntry(date) {
    setEditDate(date);
    const entry = state.journal?.[date] || {};
    setText(entry.text || "");
    setMood(state.moods?.[date] || null);
    setSaved(false);
    setView("write");
  }

  function deleteEntry(date) {
    const newJournal = { ...state.journal };
    const newMoods = { ...state.moods };
    delete newJournal[date];
    delete newMoods[date];
    save({ ...state, journal: newJournal, moods: newMoods });
    setDeleteConfirm(null);
  }

  if (view === "history") {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button onClick={() => setView("write")} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <span style={styles.title}>Past Entries</span>
          <div style={{ flex: 1 }} />
        </div>

        <div style={styles.searchBar}>
          <Search size={16} color={TOKENS.color.textTertiary} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.body}>
          {filteredEntries.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyText}>
                {searchQuery ? "No matching entries" : "No entries yet"}
              </div>
              <div style={styles.emptySub}>
                {searchQuery ? "Try a different search term" : "Write your first journal entry today"}
              </div>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const moodData = entry.mood ? MOODS.find((m) => m.val === entry.mood) : null;
              const isDateKey = /^\d{4}-\d{2}-\d{2}$/.test(entry.date);
              const dateObj = isDateKey ? new Date(entry.date + "T12:00:00") : null;
              const dateLabel = entry.isToday
                ? "Today"
                : dateObj && !isNaN(dateObj)
                  ? dateObj.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })
                  : `Day ${entry.date}`;
              return (
                <div key={entry.date} style={styles.entryCard}>
                  <button onClick={() => openEntry(entry.date)} style={styles.entryBtn}>
                    <div style={styles.entryHeader}>
                      <span style={styles.entryDate}>{dateLabel}</span>
                      {moodData && <span style={{ fontSize: 18 }}>{moodData.emoji}</span>}
                    </div>
                    {entry.text && (
                      <div style={styles.entryPreview}>
                        {entry.text.length > 120 ? entry.text.slice(0, 120) + "..." : entry.text}
                      </div>
                    )}
                  </button>
                  {deleteConfirm === entry.date ? (
                    <div style={styles.deleteRow}>
                      <span style={styles.deleteLabel}>Delete this entry?</span>
                      <button onClick={() => deleteEntry(entry.date)} style={styles.deleteYes}>Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} style={styles.deleteNo}>Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(entry.date)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={14} color={TOKENS.color.textTertiary} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    );
  }

  const isToday = editDate === today;
  const dateLabel = isToday
    ? "Today"
    : new Date(editDate + "T12:00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" });

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
          <button onClick={onClose} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <BookOpen size={20} color={TOKENS.color.text} />
          <span style={styles.title}>Journal</span>
        </div>
        <button
          onClick={() => setView("history")}
          style={styles.historyBtn}
        >
          Past entries
        </button>
      </div>

      <div style={styles.body}>
        <div style={styles.dateTag}>{dateLabel}</div>

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

        <div style={styles.section}>
          <div style={styles.sectionLabel}>What's on your mind?</div>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setSaved(false); }}
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
            background: saved ? TOKENS.color.success : TOKENS.color.text,
          }}
        >
          {saved ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Check size={18} /> Saved
            </span>
          ) : "Save entry"}
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
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
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
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  historyBtn: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.brand,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 8px",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    margin: `${TOKENS.space[4]}px ${TOKENS.space[5]}px 0`,
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.text,
    fontFamily: "inherit",
  },
  dateTag: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textSecondary,
    marginBottom: TOKENS.space[5],
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: TOKENS.color.border,
    background: TOKENS.color.surface,
    fontSize: TOKENS.font.size.md,
    fontFamily: "inherit",
    color: TOKENS.color.text,
    resize: "none",
    outline: "none",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },
  saveBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    color: "#fff",
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
  entryCard: {
    position: "relative",
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[3],
    overflow: "hidden",
  },
  entryBtn: {
    width: "100%",
    textAlign: "left",
    padding: TOKENS.space[4],
    paddingRight: 44,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  entryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryDate: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  entryPreview: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginTop: 6,
    lineHeight: 1.4,
  },
  deleteBtn: {
    position: "absolute",
    top: TOKENS.space[4],
    right: TOKENS.space[4],
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    opacity: 0.5,
  },
  deleteRow: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    padding: `${TOKENS.space[2]}px ${TOKENS.space[4]}px ${TOKENS.space[3]}px`,
  },
  deleteLabel: {
    flex: 1,
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.danger,
    fontWeight: TOKENS.font.weight.medium,
  },
  deleteYes: {
    padding: "4px 12px",
    borderRadius: TOKENS.radius.md,
    border: "none",
    background: TOKENS.color.danger,
    color: "#fff",
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
  deleteNo: {
    padding: "4px 12px",
    borderRadius: TOKENS.radius.md,
    border: "none",
    background: TOKENS.color.surface,
    color: TOKENS.color.textSecondary,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.medium,
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: TOKENS.space[9],
  },
  emptyText: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  emptySub: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textTertiary,
    marginTop: 4,
  },
};
