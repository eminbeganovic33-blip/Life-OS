import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Inbox as InboxIcon, Trash2, Check, BookOpen, Sparkles } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { CATEGORIES } from "../../data/categories";
import { getTodayStr } from "../../utils";

// Same auto-assigned XP tiers as CustomQuestPanel — keep quest creation consistent.
const CATEGORY_XP = {
  sleep: 20, exercise: 25, mind: 20, nutrition: 15, work: 20,
  reading: 15, creative: 15, finance: 15, social: 10,
  water: 10, screen: 10, shower: 10,
};

// Triage panel for quick-capture notes (Phase 9A).
// Each open note can become a quest, go to the journal, be marked done, or deleted.
export default function InboxPanel({ state, save, onClose }) {
  const inbox = state.inbox || [];
  const openItems = useMemo(
    () => inbox.filter((i) => i.status === "open"),
    [inbox]
  );
  // Which item is currently showing its category picker.
  const [pickingFor, setPickingFor] = useState(null);

  const setStatus = useCallback((id, status) => {
    save({
      ...state,
      inbox: (state.inbox || []).map((i) => (i.id === id ? { ...i, status } : i)),
    });
  }, [state, save]);

  const remove = useCallback((id) => {
    save({ ...state, inbox: (state.inbox || []).filter((i) => i.id !== id) });
  }, [state, save]);

  const makeQuest = useCallback((item, category) => {
    const xp = CATEGORY_XP[category] || 15;
    const quest = {
      id: `custom-${category}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: item.text.slice(0, 100),
      category,
      xp,
      isCustom: true,
    };
    save({
      ...state,
      customQuests: [...(state.customQuests || []), quest],
      inbox: (state.inbox || []).map((i) => (i.id === item.id ? { ...i, status: "done" } : i)),
    });
    setPickingFor(null);
  }, [state, save]);

  const toJournal = useCallback((item) => {
    const today = getTodayStr();
    const existing = state.journal?.[today]?.text || "";
    const merged = existing ? `${existing}\n${item.text}` : item.text;
    save({
      ...state,
      journal: { ...(state.journal || {}), [today]: { text: merged, ts: Date.now() } },
      inbox: (state.inbox || []).map((i) => (i.id === item.id ? { ...i, status: "done" } : i)),
    });
  }, [state, save]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={styles.panel}
    >
      <div style={styles.header}>
        <button onClick={onClose} style={styles.backBtn} data-panel-back aria-label="Close">
          <ChevronLeft size={20} color={TOKENS.color.text} />
        </button>
        <InboxIcon size={20} color={TOKENS.color.text} />
        <div style={styles.headerTitle}>Inbox</div>
        {openItems.length > 0 && <span style={styles.count}>{openItems.length}</span>}
      </div>

      <div style={styles.content}>
        {openItems.length === 0 && (
          <div style={styles.empty}>
            <InboxIcon size={28} color={TOKENS.color.textTertiary} />
            <div style={styles.emptyTitle}>Inbox zero</div>
            <div style={styles.emptyBody}>
              Tap the <strong>+</strong> button anytime to capture a thought in one tap.
              Sort it here when you're ready.
            </div>
          </div>
        )}

        {openItems.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={styles.cardText}>{item.text}</div>

            {pickingFor === item.id ? (
              <div style={styles.pickerWrap}>
                <div style={styles.pickerLabel}>
                  <Sparkles size={12} color={TOKENS.color.brand} /> Add as quest in…
                </div>
                <div style={styles.chipRow}>
                  {CATEGORIES.map((cat) => {
                    const color = DOMAIN_COLORS[cat.id] || TOKENS.color.text;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => makeQuest(item, cat.id)}
                        style={{ ...styles.chip, borderColor: `${color}55`, color }}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setPickingFor(null)} style={styles.cancelPick}>
                  Cancel
                </button>
              </div>
            ) : (
              <div style={styles.actions}>
                <button onClick={() => setPickingFor(item.id)} style={styles.actionPrimary}>
                  <Sparkles size={13} /> Make quest
                </button>
                <button onClick={() => toJournal(item)} style={styles.action}>
                  <BookOpen size={13} color={TOKENS.color.textSecondary} /> Journal
                </button>
                <button onClick={() => setStatus(item.id, "done")} style={styles.action}>
                  <Check size={13} color={TOKENS.color.success} /> Done
                </button>
                <button onClick={() => remove(item.id)} style={styles.iconBtn} aria-label="Delete">
                  <Trash2 size={15} color={TOKENS.color.danger} />
                </button>
              </div>
            )}
          </div>
        ))}
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
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1, borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  headerTitle: {
    fontSize: TOKENS.font.size.lg, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  count: {
    marginLeft: "auto", minWidth: 22, height: 22, padding: "0 7px",
    borderRadius: 11, background: TOKENS.color.brand, color: "#fff",
    fontSize: TOKENS.font.size.xs, fontWeight: 900,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  content: { flex: 1, overflowY: "auto", padding: TOKENS.space[5] },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", gap: TOKENS.space[2],
    padding: `${TOKENS.space[8]}px ${TOKENS.space[5]}px`,
  },
  emptyTitle: {
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text, marginTop: TOKENS.space[2],
  },
  emptyBody: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    lineHeight: 1.5, maxWidth: 300,
  },
  card: {
    padding: TOKENS.space[4],
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[3],
  },
  cardText: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.text,
    lineHeight: 1.45, fontWeight: TOKENS.font.weight.medium,
  },
  actions: {
    display: "flex", alignItems: "center", gap: TOKENS.space[2],
    marginTop: TOKENS.space[3], flexWrap: "wrap",
  },
  actionPrimary: {
    display: "flex", alignItems: "center", gap: 5,
    padding: "7px 12px", borderRadius: TOKENS.radius.md, border: "none",
    background: TOKENS.color.brand, color: "#fff",
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
  action: {
    display: "flex", alignItems: "center", gap: 5,
    padding: "7px 12px", borderRadius: TOKENS.radius.md,
    border: `1px solid ${TOKENS.color.border}`, background: "transparent",
    color: TOKENS.color.textSecondary,
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer",
  },
  iconBtn: {
    marginLeft: "auto", background: "none", border: "none",
    cursor: "pointer", padding: 6,
  },
  pickerWrap: { marginTop: TOKENS.space[3] },
  pickerLabel: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary, textTransform: "uppercase",
    letterSpacing: 0.5, marginBottom: TOKENS.space[2],
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: TOKENS.space[2] },
  chip: {
    padding: "6px 12px", borderRadius: TOKENS.radius.full,
    borderWidth: 1, borderStyle: "solid", background: "transparent",
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer",
  },
  cancelPick: {
    marginTop: TOKENS.space[3], background: "none", border: "none",
    color: TOKENS.color.textTertiary, fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold, cursor: "pointer", padding: 0,
  },
};
