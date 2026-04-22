import { useMemo, useState } from "react";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { CATEGORIES, QUESTS_TEMPLATE, getQuestTimeOfDay } from "../../data";

// ── Add a core quest to your active roster (Phase 5E #11) ──
// Shows every catalog quest, grouped by category, filtered to exclude
// anything already active or previously retired.
export default function AddActiveQuestModal({ activeQuests, retiredQuestIds, onAdd, onClose }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");

  const activeSet = useMemo(
    () => new Set((activeQuests || []).map((q) => `${q.category}-${q.questIndex}`)),
    [activeQuests]
  );
  const retiredSet = useMemo(() => new Set(retiredQuestIds || []), [retiredQuestIds]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORIES.map((cat) => {
      const all = QUESTS_TEMPLATE[cat.id] || [];
      const items = all
        .map((text, idx) => ({ text, idx, key: `${cat.id}-${idx}` }))
        .filter(({ key }) => !activeSet.has(key) && !retiredSet.has(key))
        .filter(({ text }) => !q || text.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q));
      return { cat, items };
    }).filter((g) => g.items.length > 0);
  }, [query, activeSet, retiredSet]);

  function handlePick(cat, idx) {
    onAdd({
      id: (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `aq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category: cat,
      questIndex: idx,
      timeOfDay: getQuestTimeOfDay(cat, idx),
      addedAt: Date.now(),
    });
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div
        style={{ ...S.modalBox, maxHeight: "80vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={S.modalHeader}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>Add a Quest</span>
          <span style={S.modalClose} onClick={onClose}>✕</span>
        </div>

        <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 10, lineHeight: 1.5 }}>
          Pick a quest to add to your daily roster. Start small, build up — retire
          quests that no longer fit and they won't come back.
        </div>

        <input
          type="text"
          placeholder="Search quests…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            color: colors.text,
            fontSize: 13,
            marginBottom: 10,
            outline: "none",
          }}
        />

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
          {grouped.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 10px", opacity: 0.5, fontSize: 13 }}>
              No quests match — try a different search, or unretire a quest from settings.
            </div>
          ) : grouped.map(({ cat, items }) => (
            <div key={cat.id} style={{ marginBottom: 14 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 11, fontWeight: 800, letterSpacing: 0.4,
                textTransform: "uppercase", color: cat.color, marginBottom: 6,
              }}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </div>
              {items.map(({ text, idx }) => (
                <button
                  key={idx}
                  onClick={() => handlePick(cat.id, idx)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    marginBottom: 4,
                    borderRadius: 10,
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                    color: colors.text,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    lineHeight: 1.35,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1 }}>{text}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: cat.color,
                      background: `${cat.color}14`, padding: "2px 6px", borderRadius: 6,
                      flexShrink: 0, textTransform: "capitalize",
                    }}>
                      {getQuestTimeOfDay(cat.id, idx)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
