import { useState, useMemo } from "react";
import { Lightbulb, BookOpen, GraduationCap, Brain } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { BOOKS } from "../../data/bookLibrary";
import AcademyPanel from "../panels/AcademyPanel";
import BookLibraryPanel from "../panels/BookLibraryPanel";
import KnowledgePanel from "../panels/KnowledgePanel";
import EmbeddedPanelHost from "../shared/EmbeddedPanelHost";

const TABS = [
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "books",   label: "Books",   icon: BookOpen },
  { id: "guides",  label: "Guides",  icon: Brain },
];

export default function LearnScreen({ state, save }) {
  const [tab, setTab] = useState("courses");

  // Daily insight: rotate a book insight based on day of year
  const dailyInsight = useMemo(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    // Surface books from the user's active domain categories where possible
    const allInsights = BOOKS.flatMap((b) => (b.insights || []).map((ins, i) => ({
      bookTitle: b.title,
      bookId: b.id,
      bookColor: b.coverColor,
      bookIcon: b.icon,
      title: ins.title,
      content: ins.content,
      idx: i,
    })));
    if (allInsights.length === 0) return null;
    return allInsights[dayOfYear % allInsights.length];
  }, []);

  const insightKey = dailyInsight ? `${dailyInsight.bookId}-${dailyInsight.idx}` : null;
  const insightRead = !!(insightKey && state.readInsights?.[insightKey]);

  function toggleInsightRead() {
    if (!insightKey) return;
    const next = { ...(state.readInsights || {}) };
    if (next[insightKey]) delete next[insightKey];
    else next[insightKey] = Date.now();
    save({ ...state, readInsights: next });
  }

  return (
    <div style={styles.screen}>
      {/* Daily Insight (skipped if the book library has no insights) */}
      {dailyInsight && (
      <div style={{
        ...styles.insightCard,
        background: `linear-gradient(135deg, ${dailyInsight.bookColor}14 0%, ${dailyInsight.bookColor}05 100%)`,
        borderColor: `${dailyInsight.bookColor}30`,
      }}>
        <div style={styles.insightHeader}>
          <Lightbulb size={14} color={dailyInsight.bookColor} />
          <span style={{ ...styles.insightLabel, color: dailyInsight.bookColor }}>
            DAILY INSIGHT · {dailyInsight.bookTitle}
          </span>
        </div>
        <div style={styles.insightTitle}>{dailyInsight.title}</div>
        <div style={styles.insightBody}>{dailyInsight.content}</div>
        <button
          onClick={toggleInsightRead}
          style={{
            ...styles.insightBtn,
            background: insightRead ? `${dailyInsight.bookColor}30` : dailyInsight.bookColor,
            color: insightRead ? dailyInsight.bookColor : "#fff",
          }}
        >
          {insightRead ? "✓ Marked as read" : "Mark as read"}
        </button>
      </div>
      )}

      {/* Sub-nav */}
      <div style={styles.tabs}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...styles.tab,
                background: isActive ? TOKENS.color.text : "transparent",
                color: isActive ? "#fff" : TOKENS.color.textSecondary,
              }}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active sub-content */}
      <div style={styles.subContent}>
        <EmbeddedPanelHost>
          {tab === "courses" && <AcademyPanel state={state} save={save} onClose={() => {}} />}
          {tab === "books"   && <BookLibraryPanel state={state} save={save} onClose={() => {}} />}
          {tab === "guides"  && <KnowledgePanel onClose={() => {}} />}
        </EmbeddedPanelHost>
      </div>
    </div>
  );
}

const styles = {
  screen: { padding: TOKENS.space[5], paddingBottom: 0 },
  insightCard: {
    padding: TOKENS.space[5],
    borderRadius: TOKENS.radius.lg,
    border: "1px solid",
    marginBottom: TOKENS.space[5],
  },
  insightHeader: { display: "flex", alignItems: "center", gap: 6, marginBottom: TOKENS.space[3] },
  insightLabel: { fontSize: 10, fontWeight: 900, letterSpacing: 0.6 },
  insightTitle: {
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text, marginBottom: TOKENS.space[2],
  },
  insightBody: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    lineHeight: 1.6, marginBottom: TOKENS.space[4],
  },
  insightBtn: {
    width: "100%", padding: "10px",
    border: "none", borderRadius: TOKENS.radius.md,
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
  tabs: {
    display: "flex", gap: TOKENS.space[2],
    padding: 4,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.full,
    marginBottom: TOKENS.space[5],
  },
  tab: {
    flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "8px 12px", border: "none",
    borderRadius: TOKENS.radius.full,
    cursor: "pointer",
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    transition: TOKENS.transition.fast,
  },
  subContent: { minHeight: 200 },
};
