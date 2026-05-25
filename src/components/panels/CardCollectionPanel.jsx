import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, Star, Sparkles } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { MOTIVATION_CARDS } from "../../data/constants";

const CAT_COLORS = {
  Discipline: "#EF4444",
  Focus:      "#F59E0B",
  Strength:   "#7C5CFC",
  Wisdom:     "#3B82F6",
  Confidence: "#EC4899",
};

const CAT_ICONS = {
  Discipline: "🔥",
  Focus:      "🎯",
  Strength:   "💪",
  Wisdom:     "🦉",
  Confidence: "👑",
};

export default function CardCollectionPanel({ state, onClose }) {
  const [filter, setFilter] = useState("all");
  const collected = state.collectedCards || {};
  const collectedIds = useMemo(() => new Set(Object.keys(collected)), [collected]);

  const categories = ["all", ...Array.from(new Set(MOTIVATION_CARDS.map((c) => c.category)))];

  const cards = useMemo(() => {
    return MOTIVATION_CARDS.map((c, i) => ({ ...c, id: `card-${i}` }))
      .filter((c) => filter === "all" || c.category === filter);
  }, [filter]);

  // Only count cards that exist (avoid stale IDs from before count changes)
  const validIds = new Set(MOTIVATION_CARDS.map((_, i) => `card-${i}`));
  const collectedCount = [...collectedIds].filter((id) => validIds.has(id)).length;
  const total = MOTIVATION_CARDS.length;
  const pct = (collectedCount / total) * 100;

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
        <Star size={20} color={TOKENS.color.text} />
        <span style={styles.title}>Card Collection</span>
      </div>

      <div style={styles.body}>
        <div style={styles.heroCard}>
          <div style={styles.heroLabel}>COLLECTED</div>
          <div style={styles.heroCount}>{collectedCount} <span style={styles.heroTotal}>/ {total}</span></div>
          <div style={styles.heroBar}>
            <div style={{ ...styles.heroFill, width: `${pct}%` }} />
          </div>
          <div style={styles.heroNote}>Complete a day to unlock a new card</div>
        </div>

        <div style={styles.catRow}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                ...styles.catChip,
                background: filter === cat ? TOKENS.color.text : TOKENS.color.surface,
                color: filter === cat ? "#fff" : TOKENS.color.textSecondary,
              }}
            >
              {cat === "all" ? "All" : `${CAT_ICONS[cat]} ${cat}`}
            </button>
          ))}
        </div>

        <div style={styles.grid}>
          {cards.map((c) => {
            const isCollected = collectedIds.has(c.id);
            const color = CAT_COLORS[c.category] || TOKENS.color.text;
            return (
              <div
                key={c.id}
                style={{
                  ...styles.card,
                  background: isCollected
                    ? `linear-gradient(135deg, ${color}14 0%, ${color}06 100%)`
                    : TOKENS.color.surface,
                  borderColor: isCollected ? `${color}40` : "transparent",
                }}
              >
                {!isCollected && (
                  <div style={styles.lockOverlay}>
                    <Lock size={20} color={TOKENS.color.textTertiary} />
                  </div>
                )}
                <div style={{
                  ...styles.catBadge,
                  background: isCollected ? color : TOKENS.color.border,
                  color: isCollected ? "#fff" : TOKENS.color.textTertiary,
                }}>
                  {CAT_ICONS[c.category]} {c.category}
                </div>
                <div style={{
                  ...styles.quote,
                  filter: isCollected ? "none" : "blur(6px)",
                  opacity: isCollected ? 1 : 0.5,
                }}>
                  "{c.quote}"
                </div>
                <div style={{
                  ...styles.author,
                  color: isCollected ? color : TOKENS.color.textTertiary,
                  filter: isCollected ? "none" : "blur(6px)",
                }}>
                  — {c.author}
                </div>
              </div>
            );
          })}
        </div>
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
  body: { flex: 1, overflowY: "auto", padding: TOKENS.space[5] },
  heroCard: {
    padding: TOKENS.space[5],
    background: "linear-gradient(135deg, rgba(124,92,252,0.08) 0%, rgba(236,72,153,0.04) 100%)",
    border: "1px solid rgba(124,92,252,0.12)",
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[5],
    textAlign: "center",
  },
  heroLabel: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary, letterSpacing: 1.2,
  },
  heroCount: {
    fontSize: 40, fontWeight: 900, color: TOKENS.color.text,
    letterSpacing: -1, marginTop: 4,
  },
  heroTotal: { fontSize: TOKENS.font.size.lg, color: TOKENS.color.textTertiary, fontWeight: TOKENS.font.weight.semibold },
  heroBar: {
    height: 6, background: "rgba(0,0,0,0.05)", borderRadius: 3,
    marginTop: TOKENS.space[3], overflow: "hidden",
  },
  heroFill: {
    height: "100%",
    background: "linear-gradient(90deg, #7C5CFC 0%, #EC4899 100%)",
    transition: "width 0.4s ease",
  },
  heroNote: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    marginTop: TOKENS.space[3], fontStyle: "italic",
  },
  catRow: {
    display: "flex", gap: TOKENS.space[2], marginBottom: TOKENS.space[5],
    overflowX: "auto", paddingBottom: 4,
  },
  catChip: {
    padding: "6px 12px", borderRadius: TOKENS.radius.full, border: "none",
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer", whiteSpace: "nowrap",
  },
  grid: { display: "flex", flexDirection: "column", gap: TOKENS.space[3] },
  card: {
    position: "relative",
    padding: TOKENS.space[5],
    borderRadius: TOKENS.radius.lg,
    border: "1px solid",
    overflow: "hidden",
  },
  lockOverlay: {
    position: "absolute", top: TOKENS.space[3], right: TOKENS.space[3],
  },
  catBadge: {
    display: "inline-block",
    fontSize: 10, fontWeight: 900, letterSpacing: 0.4,
    padding: "3px 8px", borderRadius: TOKENS.radius.full,
    textTransform: "uppercase",
    marginBottom: TOKENS.space[3],
  },
  quote: {
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.medium,
    color: TOKENS.color.text, lineHeight: 1.5, fontStyle: "italic",
  },
  author: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    marginTop: TOKENS.space[3], textAlign: "right",
  },
};
