import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Trash2, Sparkles } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { CATEGORIES } from "../../data/categories";

// XP is auto-assigned by category effort tier. No more user-gaming.
const CATEGORY_XP = {
  sleep: 20, exercise: 25, mind: 20, nutrition: 15, work: 20,
  reading: 15, creative: 15, finance: 15, social: 10,
  water: 10, screen: 10, shower: 10,
};

// 6-8 universal templates per category. Tap to insert.
const SUGGESTIONS = {
  sleep: [
    "Lights out by 10:30 PM", "No screens 1 hour before bed",
    "Read for 20 minutes before sleep", "Track sleep with journal",
    "Wake without snoozing", "Set consistent wake time",
  ],
  water: [
    "Drink water before coffee", "Carry water bottle all day",
    "Glass of water after every meal", "Electrolytes in morning",
  ],
  exercise: [
    "20 push-ups before shower", "10-minute mobility flow",
    "Walk after lunch", "100 squats throughout day",
    "Sprint intervals (4×30s)", "Stretch before bed",
    "Take stairs, not elevator", "Plank for 90 seconds",
  ],
  mind: [
    "10 minutes of meditation", "5 minutes of breathwork",
    "Write 3 gratitudes", "Mindful single-task block (45min)",
    "Journal 3 wins from yesterday", "Cold exposure for 2 minutes",
  ],
  screen: [
    "No phone first hour awake", "No phone last hour before bed",
    "Phone in another room while working", "Greyscale mode all day",
    "Delete one time-waster app", "Airplane mode during deep work",
  ],
  shower: [
    "Cold shower finish (30s)", "Brush teeth twice",
    "Floss every night", "Stretch in shower",
  ],
  nutrition: [
    "Protein with breakfast (30g+)", "No food after 8 PM",
    "Vegetables at every meal", "Skip processed sugar today",
    "Log all meals", "Eat one whole-food meal",
  ],
  reading: [
    "Read 10 pages", "Read 20 minutes",
    "Highlight one insight", "Read non-fiction before sleep",
    "Listen to audiobook on commute", "Re-read favorite chapter",
  ],
  work: [
    "45-minute deep work block", "Inbox to zero",
    "Plan tomorrow before logging off", "Single most-important task first",
    "No meetings before 11 AM", "Time-block your day",
  ],
  social: [
    "Call someone you care about", "Send a thank-you message",
    "Compliment a stranger", "Connect with one new person",
    "Reach out to old friend", "Have a meaningful conversation",
  ],
  finance: [
    "Log every purchase today", "Review weekly spending",
    "Cancel one unused subscription", "Transfer to savings",
    "Read finance article", "Track net worth",
  ],
  creative: [
    "30 minutes of focused creating", "Sketch for 15 minutes",
    "Write 200 words", "Make one piece of content",
    "Play an instrument", "Photograph something beautiful",
  ],
};

export default function CustomQuestPanel({ state, save, onClose }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]?.id || "");
  const customQuests = state.customQuests || [];

  const suggestions = useMemo(() => SUGGESTIONS[category] || [], [category]);
  const existingTexts = useMemo(
    () => new Set(customQuests.filter((q) => q && typeof q.text === "string").map((q) => q.text.toLowerCase())),
    [customQuests]
  );
  const availableSuggestions = useMemo(
    () => suggestions.filter((s) => !existingTexts.has(s.toLowerCase())),
    [suggestions, existingTexts]
  );

  const addQuest = useCallback((questText) => {
    const trimmed = (questText || text).trim();
    if (!trimmed) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const xp = CATEGORY_XP[category] || 15;
    const quest = { id, text: trimmed, category, xp, isCustom: true };
    save({ ...state, customQuests: [...customQuests, quest] });
    setText("");
  }, [text, category, customQuests, state, save]);

  const removeQuest = useCallback((questId) => {
    save({ ...state, customQuests: customQuests.filter((q) => q.id !== questId) });
  }, [customQuests, state, save]);

  const xpPreview = CATEGORY_XP[category] || 15;
  const accent = DOMAIN_COLORS[category] || TOKENS.color.brand;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={styles.panel}
    >
      <div style={styles.header}>
        <button onClick={onClose} style={styles.backBtn} aria-label="Close">
          <ChevronLeft size={20} color={TOKENS.color.text} />
        </button>
        <Plus size={20} color={TOKENS.color.text} />
        <div style={styles.headerTitle}>Custom Quests</div>
      </div>

      <div style={styles.content}>
        <div style={styles.form}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your own quest..."
            style={styles.input}
            maxLength={100}
            onKeyDown={(e) => e.key === "Enter" && addQuest()}
          />

          <div style={styles.fieldLabel}>Category</div>
          <div style={styles.chipRow}>
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.id;
              const catColor = DOMAIN_COLORS[cat.id] || TOKENS.color.text;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    ...styles.chip,
                    background: isActive ? catColor : TOKENS.color.surface,
                    color: isActive ? "#fff" : TOKENS.color.textSecondary,
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              );
            })}
          </div>

          <div style={{ ...styles.xpHint, color: accent }}>
            Auto: +{xpPreview} XP per completion
          </div>

          <button
            onClick={() => addQuest()}
            disabled={!text.trim()}
            style={{
              ...styles.addBtn,
              background: text.trim() ? accent : TOKENS.color.surface,
              color: text.trim() ? "#fff" : TOKENS.color.textTertiary,
              cursor: text.trim() ? "pointer" : "default",
            }}
          >
            Add Quest
          </button>
        </div>

        {availableSuggestions.length > 0 && (
          <div style={styles.suggestSection}>
            <div style={styles.suggestHeader}>
              <Sparkles size={14} color={accent} />
              <span style={styles.sectionLabel}>Suggested for {CATEGORIES.find((c) => c.id === category)?.label}</span>
            </div>
            <div style={styles.suggestionGrid}>
              {availableSuggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => addQuest(sug)}
                  style={styles.suggestionChip}
                >
                  <Plus size={12} color={accent} />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {customQuests.length > 0 && (
          <div style={styles.questSection}>
            <div style={styles.sectionLabel}>Your custom quests</div>
            {customQuests.map((q) => {
              const cat = CATEGORIES.find((c) => c.id === q.category);
              const catColor = DOMAIN_COLORS[q.category] || TOKENS.color.text;
              return (
                <div key={q.id} style={styles.questRow}>
                  <div style={{ ...styles.questAccent, background: catColor }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.questText}>{q.text}</div>
                    <div style={styles.questMeta}>
                      <span>{cat?.icon} {cat?.label}</span>
                      <span style={{ ...styles.xpPill, color: catColor }}>+{q.xp || CATEGORY_XP[q.category] || 15} XP</span>
                    </div>
                  </div>
                  <button onClick={() => removeQuest(q.id)} style={styles.deleteBtn} aria-label="Delete">
                    <Trash2 size={16} color={TOKENS.color.danger} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const styles = {
  panel: {
    position: "fixed", top: 0, right: 0, bottom: 0,
    width: "100%", maxWidth: 480, background: TOKENS.color.bg,
    zIndex: 200, display: "flex", flexDirection: "column",
    boxShadow: TOKENS.shadow.xl,
  },
  header: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[5]}px`,
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1, borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  headerTitle: {
    fontSize: TOKENS.font.size.lg, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  content: { flex: 1, overflowY: "auto", padding: TOKENS.space[5] },
  form: { marginBottom: TOKENS.space[7] },
  input: {
    width: "100%", padding: "14px 16px",
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1, borderStyle: "solid", borderColor: TOKENS.color.border,
    background: TOKENS.color.surface, fontSize: TOKENS.font.size.md,
    color: TOKENS.color.text, outline: "none", boxSizing: "border-box",
  },
  fieldLabel: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary, textTransform: "uppercase",
    letterSpacing: 0.8, marginTop: TOKENS.space[5], marginBottom: TOKENS.space[3],
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: TOKENS.space[2] },
  chip: {
    padding: "6px 12px", borderRadius: TOKENS.radius.full, border: "none",
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer", transition: TOKENS.transition.fast,
  },
  xpHint: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    marginTop: TOKENS.space[4], textAlign: "right",
  },
  addBtn: {
    marginTop: TOKENS.space[4], width: "100%", padding: "14px",
    borderRadius: TOKENS.radius.lg, border: "none",
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.bold,
    transition: TOKENS.transition.fast,
  },
  suggestSection: { marginBottom: TOKENS.space[7] },
  suggestHeader: {
    display: "flex", alignItems: "center", gap: 6, marginBottom: TOKENS.space[3],
  },
  suggestionGrid: {
    display: "flex", flexDirection: "column", gap: TOKENS.space[2],
  },
  suggestionChip: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.lg,
    border: "none", cursor: "pointer", textAlign: "left",
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.text,
    fontWeight: TOKENS.font.weight.medium,
    transition: TOKENS.transition.fast,
  },
  questSection: { marginTop: TOKENS.space[4] },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary, textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  questRow: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.lg,
    marginTop: TOKENS.space[3], overflow: "hidden", position: "relative",
  },
  questAccent: {
    width: 3, alignSelf: "stretch", borderRadius: 2,
  },
  questText: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.medium,
    color: TOKENS.color.text,
  },
  questMeta: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    marginTop: 2,
  },
  xpPill: {
    fontSize: 10, fontWeight: 800, letterSpacing: 0.4,
  },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", padding: 6 },
};
