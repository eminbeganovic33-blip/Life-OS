import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BookOpen, Check, Search, Trash2, Flame, Sparkles } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { getTodayStr } from "../../utils";
import { useToast } from "../shared/Toast";
import { track } from "../../firebase";

const MOODS = [
  { val: 1, emoji: "😣", label: "Awful", color: "#EF4444" },
  { val: 2, emoji: "😔", label: "Bad",   color: "#F97316" },
  { val: 3, emoji: "😐", label: "Meh",   color: "#F59E0B" },
  { val: 4, emoji: "🙂", label: "Okay",  color: "#84CC16" },
  { val: 5, emoji: "😊", label: "Good",  color: "#22C55E" },
  { val: 6, emoji: "🤩", label: "Great", color: "#10B981" },
];

// Rotating reflective prompts — reduces blank-page friction.
const PROMPTS = [
  "What went well today?",
  "What drained your energy?",
  "One thing you're grateful for…",
  "What will tomorrow's you thank you for?",
  "What did you learn today?",
  "How did you handle a hard moment?",
  "What are you proud of right now?",
  "What's one thing you'd do differently?",
];

// Count consecutive days (ending today or yesterday) with a journal entry or mood.
function getJournalStreak(journal = {}, moods = {}) {
  const has = (d) => !!(journal[d]?.text || moods[d]);
  const fmt = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  let streak = 0;
  const cursor = new Date();
  // Allow today to be empty without breaking the streak — start from today,
  // but if today is empty, begin counting from yesterday.
  if (!has(fmt(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (has(fmt(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function JournalPanel({ state, save, onClose }) {
  const today = getTodayStr();
  const toast = useToast();
  const [view, setView] = useState("write");
  const [editDate, setEditDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const existing = state.journal?.[editDate] || {};
  const [mood, setMood] = useState(state.moods?.[editDate] || null);
  const [text, setText] = useState(existing.text || "");
  const [saved, setSaved] = useState(false);

  const journalStreak = useMemo(
    () => getJournalStreak(state.journal, state.moods),
    [state.journal, state.moods]
  );

  const prompt = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return PROMPTS[dayOfYear % PROMPTS.length];
  }, []);

  const isEditingExisting = !!(existing.text || state.moods?.[editDate]);

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
    track("journal_saved", { has_text: !!text.trim(), has_mood: mood != null, editing: isEditingExisting });
    // Confirm + leave the screen so saving feels resolved, not stuck.
    const isToday = editDate === today;
    toast.show(
      isEditingExisting ? "Entry updated" : "Journal saved — see you tomorrow ✍️",
      { type: "xp", duration: 2400 }
    );
    setTimeout(() => {
      // After editing a past entry, return to the history list; otherwise close to Today.
      if (!isToday) {
        setSaved(false);
        setView("history");
      } else {
        onClose();
      }
    }, 800);
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
        {/* Date + journaling streak */}
        <div style={styles.metaRow}>
          <span style={styles.dateTag}>{dateLabel}</span>
          {journalStreak > 0 && (
            <span style={styles.streakChip}>
              <Flame size={12} color="#F97316" fill="#F97316" />
              {journalStreak} day{journalStreak > 1 ? "s" : ""} journaling
            </span>
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionLabel}>How are you feeling?</div>
          <div style={styles.moodRow}>
            {MOODS.map((m) => {
              const active = mood === m.val;
              return (
                <button
                  key={m.val}
                  onClick={() => { setMood(m.val); setSaved(false); }}
                  style={{
                    ...styles.moodBtn,
                    background: active ? `${m.color}14` : "transparent",
                    boxShadow: active ? `inset 0 0 0 2px ${m.color}` : "inset 0 0 0 1px transparent",
                    transform: active ? "translateY(-2px)" : "none",
                  }}
                >
                  <span style={{ fontSize: 26, filter: active ? "none" : "grayscale(0.3)", opacity: active ? 1 : 0.85 }}>{m.emoji}</span>
                  <span style={{
                    fontSize: TOKENS.font.size.xs,
                    color: active ? m.color : TOKENS.color.textTertiary,
                    fontWeight: active ? TOKENS.font.weight.bold : TOKENS.font.weight.medium,
                  }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.promptRow}>
            <Sparkles size={13} color={TOKENS.color.brand} />
            <span style={styles.promptText}>{prompt}</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setSaved(false); }}
            placeholder="Write freely… no one's reading but you."
            style={styles.textarea}
            rows={9}
          />
          <div style={styles.charCount}>{text.length > 0 ? `${text.length} characters` : ""}</div>
        </div>
      </div>

      {/* Pinned save footer — removes the awkward dead space */}
      <div style={styles.footer}>
        <button
          onClick={handleSave}
          disabled={(!mood && !text) || saved}
          style={{
            ...styles.saveBtn,
            opacity: (!mood && !text) ? 0.4 : 1,
            cursor: (!mood && !text) ? "default" : "pointer",
            background: saved ? TOKENS.color.success : TOKENS.color.text,
          }}
        >
          {saved ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Check size={18} /> Saved
            </span>
          ) : isEditingExisting ? "Update entry" : "Save entry"}
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
    paddingRight: TOKENS.space[5],
    paddingBottom: TOKENS.space[5],
    paddingLeft: TOKENS.space[5],
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
  metaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: TOKENS.space[5],
  },
  dateTag: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  streakChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    color: "#F97316",
    background: "rgba(249,115,22,0.10)",
    padding: "4px 10px",
    borderRadius: TOKENS.radius.full,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
  },
  promptRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: TOKENS.space[3],
  },
  promptText: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.brand,
  },
  charCount: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    textAlign: "right",
    marginTop: 6,
    minHeight: 14,
  },
  footer: {
    paddingTop: TOKENS.space[5],
    paddingRight: TOKENS.space[5],
    paddingLeft: TOKENS.space[5],
    paddingBottom: `max(${TOKENS.space[5]}px, env(safe-area-inset-bottom))`,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: TOKENS.color.border,
    background: TOKENS.color.bg,
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
    gap: 5,
    padding: "10px 6px",
    border: "none",
    borderRadius: TOKENS.radius.md,
    cursor: "pointer",
    transition: TOKENS.transition.fast,
    flex: 1,
  },
  textarea: {
    width: "100%",
    padding: TOKENS.space[4],
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: TOKENS.color.border,
    background: TOKENS.color.surface,
    fontSize: TOKENS.font.size.md,
    fontFamily: "inherit",
    color: TOKENS.color.text,
    resize: "none",
    outline: "none",
    lineHeight: 1.65,
    boxSizing: "border-box",
    minHeight: 200,
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
    paddingTop: TOKENS.space[4],
    paddingBottom: TOKENS.space[4],
    paddingLeft: TOKENS.space[4],
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
