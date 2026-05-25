import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen, Check, Search, Trophy } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { BOOKS, BOOK_CATEGORIES } from "../../data/bookLibrary";
import { useToast } from "../shared/Toast";
import { feedback } from "../../utils/audio";

export default function BookLibraryPanel({ state, save, onClose }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [justFinished, setJustFinished] = useState(null);
  const toast = useToast();
  const celebratedRef = useRef(new Set());

  const readInsights = state.readInsights || {};

  const filteredBooks = useMemo(() => {
    let list = category === "all" ? BOOKS : BOOKS.filter((b) => b.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((b) =>
        (b.title || "").toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, query]);

  function getReadCount(book) {
    return (book.insights || []).filter((_, i) => readInsights[`${book.id}-${i}`]).length;
  }

  function toggleInsight(bookId, idx) {
    const key = `${bookId}-${idx}`;
    const next = { ...readInsights };
    const wasRead = !!next[key];
    if (wasRead) delete next[key];
    else next[key] = Date.now();

    // Check if this toggle just completed the book (final unread insight)
    let xpBonus = 0;
    if (!wasRead) {
      const book = BOOKS.find((b) => b.id === bookId);
      if (book) {
        const totalInsights = book.insights.length;
        const readNow = book.insights.filter((_, i) => next[`${bookId}-${i}`]).length;
        const alreadyAwarded = !!(state.bookXpAwarded || {})[bookId];
        if (readNow === totalInsights && !alreadyAwarded && !celebratedRef.current.has(bookId)) {
          celebratedRef.current.add(bookId);
          xpBonus = 30;
          feedback("levelUp");
          toast.show(`📖 ${book.title} read · +${xpBonus} XP`, { type: "xp", duration: 3000 });
          setTimeout(() => setJustFinished(book), 400);
        }
      }
    }

    save({
      ...state,
      readInsights: next,
      xp: (state.xp || 0) + xpBonus,
      lifetimeXp: (state.lifetimeXp || 0) + xpBonus,
      bookXpAwarded: xpBonus > 0 ? { ...(state.bookXpAwarded || {}), [bookId]: true } : state.bookXpAwarded,
    });
  }

  // Book-complete celebration
  if (justFinished) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button
            onClick={() => { setJustFinished(null); setSelectedBook(null); }}
            style={styles.backBtn}
            data-panel-back
            aria-label="Close"
          >
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <BookOpen size={20} color={TOKENS.color.text} />
          <span style={styles.title}>Book Complete</span>
        </div>
        <div style={styles.bookCompleteHero}>
          <motion.div
            initial={{ scale: 0.4, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            style={{
              ...styles.bookCompleteCover,
              background: justFinished.coverColor,
              boxShadow: `0 12px 36px ${justFinished.coverColor}50`,
            }}
          >
            <span style={{ fontSize: 56 }}>{justFinished.icon}</span>
          </motion.div>
          <div style={{ ...styles.bookCompleteKicker, color: justFinished.coverColor }}>BOOK COMPLETE</div>
          <div style={styles.bookCompleteTitle}>{justFinished.title}</div>
          <div style={styles.bookCompleteAuthor}>by {justFinished.author}</div>
          <div style={styles.bookCompleteBody}>
            {justFinished.insights.length} key insights read. Take one back to your life today.
          </div>
          <div style={{
            ...styles.bookCompleteXpChip,
            background: `linear-gradient(135deg, ${justFinished.coverColor} 0%, ${justFinished.coverColor}CC 100%)`,
            boxShadow: `0 8px 24px ${justFinished.coverColor}40`,
          }}>
            <Trophy size={14} color="#fff" /> +30 XP earned
          </div>
          <button
            onClick={() => { setJustFinished(null); setSelectedBook(null); }}
            style={styles.bookCompleteContinue}
          >
            Back to Library
          </button>
        </div>
      </motion.div>
    );
  }

  // Book detail view
  if (selectedBook) {
    const book = BOOKS.find((b) => b.id === selectedBook);
    if (!book) {
      setSelectedBook(null);
      return null;
    }
    const readCount = getReadCount(book);
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button onClick={() => setSelectedBook(null)} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <span style={styles.title}>Book</span>
        </div>

        <div style={styles.body}>
          <div style={{ ...styles.bookHero, background: `${book.coverColor}12` }}>
            <div style={{ ...styles.coverIcon, background: book.coverColor }}>
              <span style={{ fontSize: 40 }}>{book.icon}</span>
            </div>
            <div style={styles.bookTitle}>{book.title}</div>
            <div style={styles.bookAuthor}>by {book.author}</div>
            <div style={styles.bookMeta}>
              {book.readTime} · {readCount} of {book.insights.length} insights read
            </div>
            {/* Hero progress bar */}
            <div style={styles.heroProgressOuter}>
              <div style={{
                ...styles.heroProgressInner,
                width: `${(readCount / book.insights.length) * 100}%`,
                background: book.coverColor,
              }} />
            </div>
          </div>

          <div style={styles.description}>{book.description}</div>

          <div style={styles.insightsSection}>
            <div style={styles.sectionLabel}>Key Insights</div>
            {book.insights.map((ins, i) => {
              const isRead = !!readInsights[`${book.id}-${i}`];
              return (
                <button
                  key={i}
                  onClick={() => toggleInsight(book.id, i)}
                  style={{
                    ...styles.insightCard,
                    borderColor: isRead ? book.coverColor : "transparent",
                  }}
                >
                  <div style={styles.insightHeader}>
                    <div style={styles.insightTitle}>{ins.title}</div>
                    <div style={{
                      ...styles.readBadge,
                      background: isRead ? book.coverColor : TOKENS.color.surface,
                      borderColor: isRead ? book.coverColor : TOKENS.color.border,
                    }}>
                      {isRead && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>
                  <div style={styles.insightContent}>{ins.content}</div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // List view
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
        <BookOpen size={20} color={TOKENS.color.text} />
        <span style={styles.title}>Library</span>
      </div>

      <div style={styles.searchBar}>
        <Search size={16} color={TOKENS.color.textTertiary} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books..."
          style={styles.searchInput}
        />
      </div>

      <div style={styles.catRow}>
        {BOOK_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              ...styles.catChip,
              background: category === cat.id ? TOKENS.color.text : TOKENS.color.surface,
              color: category === cat.id ? "#fff" : TOKENS.color.textSecondary,
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div style={styles.body}>
        {filteredBooks.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📚</div>
            <div style={styles.emptyTitle}>No books match</div>
            <div style={styles.emptyBody}>Try a different category or clear your search.</div>
          </div>
        ) : (
          filteredBooks.map((book) => {
            const readCount = getReadCount(book);
            const totalInsights = book.insights.length;
            const isDone = readCount > 0 && readCount === totalInsights;
            const inProgress = readCount > 0 && !isDone;
            const pct = Math.round((readCount / totalInsights) * 100);
            return (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book.id)}
                style={{
                  ...styles.bookRow,
                  background: isDone
                    ? `linear-gradient(135deg, ${book.coverColor}14 0%, ${book.coverColor}05 100%)`
                    : inProgress
                      ? `linear-gradient(135deg, ${book.coverColor}08 0%, ${book.coverColor}02 100%)`
                      : TOKENS.color.surface,
                  border: isDone
                    ? `1px solid ${book.coverColor}40`
                    : inProgress
                      ? `1px solid ${book.coverColor}20`
                      : "1px solid transparent",
                }}
              >
                <div style={{ ...styles.bookIcon, background: book.coverColor }}>
                  <span style={{ fontSize: 22 }}>{book.icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={styles.rowTitle}>{book.title}</div>
                  <div style={styles.rowAuthor}>{book.author} · {book.readTime}</div>
                  {/* Insight dots — always shown for at-a-glance progress */}
                  <div style={styles.insightDotsRow}>
                    {Array.from({ length: totalInsights }).map((_, i) => {
                      const read = !!readInsights[`${book.id}-${i}`];
                      return (
                        <div
                          key={i}
                          style={{
                            ...styles.insightDot,
                            background: read ? book.coverColor : TOKENS.color.border,
                            flex: 1,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div style={styles.bookMetaRow}>
                    {isDone ? (
                      <span style={{
                        ...styles.bookCompleteBadge,
                        background: `${book.coverColor}18`,
                        color: book.coverColor,
                      }}>
                        <Check size={11} strokeWidth={3} /> READ · {totalInsights} INSIGHTS
                      </span>
                    ) : inProgress ? (
                      <span style={styles.bookProgressMeta}>
                        <span style={{ color: book.coverColor, fontWeight: 700 }}>{pct}%</span>
                        <span style={{ color: TOKENS.color.textTertiary }}> · {readCount} of {totalInsights} read</span>
                      </span>
                    ) : (
                      <span style={styles.bookNotStartedMeta}>{totalInsights} insights</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
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
  title: {
    fontSize: TOKENS.font.size.lg, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  searchBar: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    margin: `${TOKENS.space[4]}px ${TOKENS.space[5]}px 0`,
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.md,
  },
  searchInput: {
    flex: 1, background: "none", border: "none", outline: "none",
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.text,
    fontFamily: "inherit",
  },
  catRow: {
    display: "flex", gap: TOKENS.space[2], padding: `${TOKENS.space[3]}px ${TOKENS.space[5]}px`,
    overflowX: "auto", flexShrink: 0,
  },
  catChip: {
    padding: "6px 12px", borderRadius: TOKENS.radius.full, border: "none",
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer", whiteSpace: "nowrap",
  },
  body: { flex: 1, overflowY: "auto", padding: `${TOKENS.space[2]}px ${TOKENS.space[5]}px ${TOKENS.space[5]}px` },
  empty: {
    textAlign: "center", padding: `${TOKENS.space[9]}px ${TOKENS.space[5]}px`,
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
    maxWidth: 280, marginLeft: "auto", marginRight: "auto",
  },
  bookRow: {
    display: "flex", alignItems: "flex-start", gap: TOKENS.space[3],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[3],
    cursor: "pointer", width: "100%", textAlign: "left",
    transition: "border-color 0.2s, background 0.2s",
  },
  bookIcon: {
    width: 48, height: 48, borderRadius: TOKENS.radius.md,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  rowTitle: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  rowAuthor: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary, marginTop: 2,
  },
  rowMeta: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.semibold, flexShrink: 0,
  },
  progressBar: {
    height: 3, background: TOKENS.color.border, borderRadius: 2,
    marginTop: 6, overflow: "hidden",
  },
  progressFill: { height: "100%", transition: "width 0.3s ease" },
  insightDotsRow: {
    display: "flex", gap: 3, marginTop: 10, marginBottom: 6,
  },
  insightDot: {
    height: 4, borderRadius: 2, transition: "background 0.3s ease",
  },
  bookMetaRow: {
    marginTop: 4, fontSize: 11, fontWeight: TOKENS.font.weight.semibold,
  },
  bookCompleteBadge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 8px", borderRadius: TOKENS.radius.full,
    fontSize: 10, fontWeight: 900, letterSpacing: 0.6,
  },
  bookProgressMeta: { fontSize: 11, letterSpacing: 0.2 },
  bookNotStartedMeta: {
    fontSize: 11, color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.medium,
  },
  bookCompleteHero: {
    flex: 1,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: `${TOKENS.space[8]}px ${TOKENS.space[5]}px`,
    textAlign: "center",
  },
  bookCompleteCover: {
    width: 110, height: 110, borderRadius: TOKENS.radius.lg,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: TOKENS.space[5],
  },
  bookCompleteKicker: {
    fontSize: 11, fontWeight: 900,
    letterSpacing: 1.5, marginBottom: TOKENS.space[2],
  },
  bookCompleteTitle: {
    fontSize: 28, fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text, letterSpacing: -0.5,
    marginBottom: 4,
  },
  bookCompleteAuthor: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textTertiary,
    marginBottom: TOKENS.space[4], fontWeight: TOKENS.font.weight.medium,
  },
  bookCompleteBody: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    lineHeight: 1.6, marginBottom: TOKENS.space[5],
    maxWidth: 320,
  },
  bookCompleteXpChip: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: TOKENS.radius.full,
    color: "#fff", fontSize: TOKENS.font.size.sm, fontWeight: 900,
    letterSpacing: 0.4, marginBottom: TOKENS.space[6],
  },
  bookCompleteContinue: {
    padding: "12px 24px", borderRadius: TOKENS.radius.full,
    background: TOKENS.color.text, color: "#fff",
    border: "none", cursor: "pointer",
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
  },

  bookHero: {
    padding: TOKENS.space[5], borderRadius: TOKENS.radius.lg,
    textAlign: "center", marginBottom: TOKENS.space[5],
  },
  coverIcon: {
    width: 80, height: 80, borderRadius: TOKENS.radius.lg,
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: `0 auto ${TOKENS.space[3]}px`,
  },
  bookTitle: {
    fontSize: TOKENS.font.size.xl, fontWeight: 900, color: TOKENS.color.text,
  },
  bookAuthor: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary, marginTop: 4,
  },
  bookMeta: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    marginTop: 8, fontWeight: TOKENS.font.weight.semibold,
  },
  heroProgressOuter: {
    marginTop: 14,
    height: 6, borderRadius: 3,
    background: "rgba(0,0,0,0.06)",
    overflow: "hidden",
    maxWidth: 260, marginLeft: "auto", marginRight: "auto",
  },
  heroProgressInner: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.4s ease",
  },
  description: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    lineHeight: 1.6, marginBottom: TOKENS.space[6],
  },
  insightsSection: { marginTop: TOKENS.space[3] },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary, textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: TOKENS.space[3],
  },
  insightCard: {
    width: "100%", textAlign: "left", padding: TOKENS.space[4],
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.lg,
    border: "2px solid transparent", cursor: "pointer",
    marginBottom: TOKENS.space[3], transition: TOKENS.transition.fast,
  },
  insightHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: TOKENS.space[2],
  },
  insightTitle: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  readBadge: {
    width: 20, height: 20, borderRadius: "50%",
    border: "2px solid", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  insightContent: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    lineHeight: 1.6,
  },
};
