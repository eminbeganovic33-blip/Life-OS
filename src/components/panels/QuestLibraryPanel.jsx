import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Search, Check, Plus, X, ChevronDown,
  Sun, Sunset, Moon, Zap, Sparkles, Pause, Play, Trash2,
} from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { CATEGORIES } from "../../data/categories";
import { QUEST_LIBRARY, getXpForDifficulty } from "../../data/questLibrary";

const TIME_ICONS = {
  morning: Sun, midday: Sunset, evening: Moon, anytime: Zap,
};
const DIFFICULTY_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard" };
const FREQ_LABEL = {
  daily: "Daily", weekdays: "Weekdays", "3x_week": "3×/week", weekly: "Weekly", monthly: "Monthly",
};

export default function QuestLibraryPanel({ state, save, onClose }) {
  const [tab, setTab] = useState("library"); // library | active
  const [filterCat, setFilterCat] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const activeQuests = state.activeQuests || [];
  const activeLibraryIds = useMemo(
    () => new Set(activeQuests.filter((aq) => aq.libraryId).map((aq) => aq.libraryId)),
    [activeQuests]
  );

  const filteredLibrary = useMemo(() => {
    return QUEST_LIBRARY.filter((q) => {
      if (filterCat !== "all" && q.category !== filterCat) return false;
      if (filterDiff !== "all" && q.difficulty !== filterDiff) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        const title = (q.title || "").toLowerCase();
        const why = (q.why || "").toLowerCase();
        if (!title.includes(s) && !why.includes(s)) return false;
      }
      return true;
    });
  }, [filterCat, filterDiff, search]);

  const activeQuestData = useMemo(() => {
    return activeQuests
      .map((aq) => {
        if (!aq.libraryId) return null;
        const lib = QUEST_LIBRARY.find((q) => q.id === aq.libraryId);
        if (!lib) return null;
        return { ...lib, _aq: aq };
      })
      .filter(Boolean);
  }, [activeQuests]);

  function addQuest(libraryQuest) {
    const newAq = {
      id: `aq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      libraryId: libraryQuest.id,
      addedAt: Date.now(),
      paused: false,
    };
    save({ ...state, activeQuests: [...activeQuests, newAq] });
  }

  function removeQuest(libraryId) {
    save({ ...state, activeQuests: activeQuests.filter((aq) => aq.libraryId !== libraryId) });
  }

  function togglePause(libraryId) {
    save({
      ...state,
      activeQuests: activeQuests.map((aq) =>
        aq.libraryId === libraryId ? { ...aq, paused: !aq.paused } : aq
      ),
    });
  }

  function toggleExpanded(id) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
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
        <button onClick={onClose} style={styles.backBtn} aria-label="Close">
          <ChevronLeft size={20} color={TOKENS.color.text} />
        </button>
        <Sparkles size={20} color={TOKENS.color.text} />
        <span style={styles.title}>Quests</span>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setTab("library")}
          style={{
            ...styles.tab,
            background: tab === "library" ? TOKENS.color.text : "transparent",
            color: tab === "library" ? "#fff" : TOKENS.color.textSecondary,
          }}
        >
          Browse · {QUEST_LIBRARY.length}
        </button>
        <button
          onClick={() => setTab("active")}
          style={{
            ...styles.tab,
            background: tab === "active" ? TOKENS.color.text : "transparent",
            color: tab === "active" ? "#fff" : TOKENS.color.textSecondary,
          }}
        >
          My Quests · {activeQuestData.length}
        </button>
      </div>

      <div style={styles.body}>
        {tab === "library" && (
          <>
            <div style={styles.searchBar}>
              <Search size={16} color={TOKENS.color.textTertiary} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search habits..."
                style={styles.searchInput}
              />
              {search && (
                <button onClick={() => setSearch("")} style={styles.clearSearch} aria-label="Clear search">
                  <X size={14} color={TOKENS.color.textTertiary} />
                </button>
              )}
            </div>

            <div style={styles.filterRow}>
              <button
                onClick={() => setFilterCat("all")}
                style={{ ...styles.filterChip,
                  background: filterCat === "all" ? TOKENS.color.text : TOKENS.color.surface,
                  color: filterCat === "all" ? "#fff" : TOKENS.color.textSecondary }}
              >
                All
              </button>
              {CATEGORIES.map((cat) => {
                const isActive = filterCat === cat.id;
                const c = DOMAIN_COLORS[cat.id] || TOKENS.color.text;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCat(isActive ? "all" : cat.id)}
                    style={{ ...styles.filterChip,
                      background: isActive ? c : TOKENS.color.surface,
                      color: isActive ? "#fff" : TOKENS.color.textSecondary }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                );
              })}
            </div>

            <div style={styles.diffRow}>
              {["all", "easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDiff(d)}
                  style={{ ...styles.diffChip,
                    background: filterDiff === d ? TOKENS.color.text : "transparent",
                    color: filterDiff === d ? "#fff" : TOKENS.color.textTertiary,
                    borderColor: filterDiff === d ? TOKENS.color.text : TOKENS.color.border }}
                >
                  {d === "all" ? "All" : DIFFICULTY_LABEL[d]}
                </button>
              ))}
            </div>

            <div style={styles.list}>
              {filteredLibrary.length === 0 ? (
                <div style={styles.emptyMatch}>No matches. Try fewer filters.</div>
              ) : (
                filteredLibrary.map((q) => {
                  const isActive = activeLibraryIds.has(q.id);
                  const isExpanded = expanded[q.id];
                  const c = DOMAIN_COLORS[q.category] || TOKENS.color.text;
                  const TimeIcon = TIME_ICONS[q.timeOfDay] || Zap;
                  return (
                    <div key={q.id} style={{
                      ...styles.questCard,
                      borderColor: isActive ? `${c}50` : "transparent",
                      background: isActive ? `${c}08` : TOKENS.color.surface,
                    }}>
                      <div style={styles.questHead}>
                        <div style={{ ...styles.questIcon, background: `${c}18` }}>
                          <span style={{ fontSize: 18 }}>{q.icon}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.questTitle}>{q.title}</div>
                          <div style={styles.questMeta}>
                            <span style={{ color: c, fontWeight: 700 }}>+{getXpForDifficulty(q.difficulty)} XP</span>
                            <span>·</span>
                            <TimeIcon size={10} />
                            <span>{q.timeOfDay}</span>
                            <span>·</span>
                            <span>{DIFFICULTY_LABEL[q.difficulty]}</span>
                            <span>·</span>
                            <span>{FREQ_LABEL[q.frequency]}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => isActive ? removeQuest(q.id) : addQuest(q)}
                          style={{
                            ...styles.actionBtn,
                            background: isActive ? "#22C55E" : c,
                            color: "#fff",
                          }}
                          aria-label={isActive ? "Remove from quests" : "Add to quests"}
                        >
                          {isActive ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                        </button>
                      </div>
                      <button onClick={() => toggleExpanded(q.id)} style={styles.whyToggle}>
                        <ChevronDown
                          size={12}
                          color={TOKENS.color.textTertiary}
                          style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                        />
                        <span>Why this works</span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ ...styles.whyBox, borderLeftColor: c }}>
                              {q.why}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {tab === "active" && (
          <div style={styles.list}>
            {activeQuestData.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>✨</div>
                <div style={styles.emptyTitle}>Your quest roster is empty</div>
                <div style={styles.emptyBody}>
                  Pick habits that fit your life. Start with 2-3 — add more as they stick.
                </div>
                <button onClick={() => setTab("library")} style={styles.emptyCta}>
                  Browse the library
                </button>
              </div>
            ) : (
              activeQuestData.map((q) => {
                const c = DOMAIN_COLORS[q.category] || TOKENS.color.text;
                const isPaused = q._aq.paused;
                const TimeIcon = TIME_ICONS[q.timeOfDay] || Zap;
                return (
                  <div key={q.id} style={{
                    ...styles.questCard,
                    opacity: isPaused ? 0.5 : 1,
                  }}>
                    <div style={styles.questHead}>
                      <div style={{ ...styles.questIcon, background: `${c}18` }}>
                        <span style={{ fontSize: 18 }}>{q.icon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.questTitle}>{q.title}</div>
                        <div style={styles.questMeta}>
                          <span style={{ color: c, fontWeight: 700 }}>+{getXpForDifficulty(q.difficulty)} XP</span>
                          <span>·</span>
                          <TimeIcon size={10} />
                          <span>{q.timeOfDay}</span>
                          {isPaused && <><span>·</span><span style={{ color: TOKENS.color.warning }}>Paused</span></>}
                        </div>
                      </div>
                      <button
                        onClick={() => togglePause(q.id)}
                        style={styles.iconBtn}
                        aria-label={isPaused ? "Resume" : "Pause"}
                      >
                        {isPaused ? <Play size={14} color={TOKENS.color.textSecondary} /> : <Pause size={14} color={TOKENS.color.textSecondary} />}
                      </button>
                      <button
                        onClick={() => removeQuest(q.id)}
                        style={styles.iconBtn}
                        aria-label="Remove"
                      >
                        <Trash2 size={14} color={TOKENS.color.danger} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1, borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  title: { fontSize: TOKENS.font.size.lg, fontWeight: TOKENS.font.weight.bold, color: TOKENS.color.text },
  tabs: {
    display: "flex", gap: TOKENS.space[2], padding: 4,
    margin: `${TOKENS.space[3]}px ${TOKENS.space[5]}px 0`,
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.full,
  },
  tab: {
    flex: 1, padding: "8px 12px", border: "none",
    borderRadius: TOKENS.radius.full, cursor: "pointer",
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    transition: TOKENS.transition.fast,
  },
  body: { flex: 1, overflowY: "auto", padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px` },
  searchBar: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.md,
    marginBottom: TOKENS.space[3],
  },
  searchInput: {
    flex: 1, background: "none", border: "none", outline: "none",
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.text,
    fontFamily: "inherit",
  },
  clearSearch: { background: "none", border: "none", cursor: "pointer", padding: 2 },
  filterRow: {
    display: "flex", gap: TOKENS.space[2],
    overflowX: "auto", paddingBottom: TOKENS.space[2],
    marginBottom: TOKENS.space[2],
  },
  filterChip: {
    padding: "5px 10px", borderRadius: TOKENS.radius.full, border: "none",
    fontSize: 11, fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer", whiteSpace: "nowrap",
  },
  diffRow: { display: "flex", gap: TOKENS.space[2], marginBottom: TOKENS.space[4] },
  diffChip: {
    flex: 1, padding: "4px 8px", borderRadius: TOKENS.radius.full,
    border: "1px solid",
    fontSize: 11, fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer", transition: TOKENS.transition.fast,
  },
  list: { display: "flex", flexDirection: "column", gap: TOKENS.space[3] },
  empty: {
    padding: `${TOKENS.space[9]}px ${TOKENS.space[5]}px`,
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 48, marginBottom: TOKENS.space[3], opacity: 0.6,
  },
  emptyTitle: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text, marginBottom: 6,
  },
  emptyBody: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textTertiary,
    lineHeight: 1.5,
    maxWidth: 280,
    marginLeft: "auto", marginRight: "auto",
    marginBottom: TOKENS.space[5],
  },
  emptyCta: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "10px 20px", borderRadius: TOKENS.radius.full,
    background: TOKENS.color.brand, color: "#fff",
    border: "none", cursor: "pointer",
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
  },
  emptyMatch: {
    padding: TOKENS.space[7],
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textTertiary,
    textAlign: "center", lineHeight: 1.6,
  },
  questCard: {
    padding: TOKENS.space[4],
    borderRadius: TOKENS.radius.lg,
    border: "1px solid",
    transition: TOKENS.transition.fast,
  },
  questHead: { display: "flex", alignItems: "center", gap: TOKENS.space[3] },
  questIcon: {
    width: 36, height: 36, borderRadius: TOKENS.radius.md,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  questTitle: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  questMeta: {
    fontSize: 10, color: TOKENS.color.textTertiary,
    display: "flex", alignItems: "center", gap: 4,
    marginTop: 3, fontWeight: TOKENS.font.weight.semibold,
    flexWrap: "wrap",
  },
  actionBtn: {
    width: 32, height: 32, borderRadius: 16,
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: TOKENS.transition.fast, flexShrink: 0,
  },
  iconBtn: {
    width: 28, height: 28, borderRadius: 14,
    border: "none", background: "transparent", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  whyToggle: {
    display: "flex", alignItems: "center", gap: 4,
    padding: `${TOKENS.space[2]}px 0 0`,
    background: "none", border: "none", cursor: "pointer",
    fontSize: 10, color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.bold,
    letterSpacing: 0.4,
  },
  whyBox: {
    marginTop: TOKENS.space[2],
    padding: `${TOKENS.space[2]}px ${TOKENS.space[3]}px`,
    background: "rgba(0,0,0,0.02)",
    borderLeft: "3px solid",
    borderRadius: 4,
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textSecondary,
    lineHeight: 1.5,
  },
};
