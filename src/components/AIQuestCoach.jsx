import { useState, useEffect, useRef } from "react";
import { chatWithCoach } from "../utils/ai";
import { getDayQuests } from "../utils";

export default function AIQuestCoach({ state, onAddQuest }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [error, setError] = useState(false);
  const hasFetched = useRef(false);
  const cacheRef = useRef(null);

  const day = state?.currentDay || 0;
  const completedQuests = state?.completedQuests || {};

  // Only show after day 5
  const hasEnoughDays = day >= 5;

  // Check >60% completion rate over last 3 days
  const recentCompletionRate = (() => {
    if (!hasEnoughDays) return 0;
    let totalQuests = 0;
    let totalCompleted = 0;
    for (let d = day; d >= Math.max(1, day - 2); d--) {
      const dayQuests = getDayQuests(d, state?.customQuests);
      const dayCompleted = completedQuests[d] || [];
      totalQuests += dayQuests.length;
      totalCompleted += dayCompleted.length;
    }
    return totalQuests > 0 ? totalCompleted / totalQuests : 0;
  })();

  const shouldShow = hasEnoughDays && recentCompletionRate > 0.6;

  // Build context about what the user has been completing
  function buildQuestContext() {
    const recentDays = [];
    for (let d = day; d >= Math.max(1, day - 4); d--) {
      const dayQuests = getDayQuests(d, state?.customQuests);
      const dayCompleted = completedQuests[d] || [];
      const completedTexts = dayQuests
        .filter((q) => dayCompleted.includes(q.id))
        .map((q) => `${q.text} [${q.category}]`);
      const skippedTexts = dayQuests
        .filter((q) => !dayCompleted.includes(q.id))
        .map((q) => `${q.text} [${q.category}]`);
      recentDays.push({
        day: d,
        completed: completedTexts,
        skipped: skippedTexts,
      });
    }
    return recentDays;
  }

  useEffect(() => {
    if (!shouldShow || hasFetched.current) return;
    if (cacheRef.current) {
      setSuggestions(cacheRef.current);
      return;
    }

    hasFetched.current = true;
    setLoading(true);
    setError(false);

    const context = buildQuestContext();
    const prompt = `Analyze this user's recent quest completion history and suggest 2-3 "level-up" quests — harder or enhanced versions of things they're already doing well at.

Recent quest history (last 5 days):
${context.map((d) => `Day ${d.day}:\n  Completed: ${d.completed.join(", ") || "none"}\n  Skipped: ${d.skipped.join(", ") || "none"}`).join("\n")}

Rules:
- Each suggestion must reference a specific quest they've been completing consistently
- The upgrade should be a natural next step (slightly harder, or a complementary habit)
- Return ONLY a valid JSON array with 2-3 items, each having:
  - "current": the quest they're already doing (short text)
  - "upgrade": the suggested harder version (short, actionable text)
  - "category": one of "sleep", "water", "exercise", "mind", "screen", "shower"
  - "why": one sentence explaining why this is a good next step
- No markdown fences, just the JSON array`;

    chatWithCoach(prompt, state)
      .then((raw) => {
        if (!raw) {
          setError(true);
          setLoading(false);
          return;
        }
        try {
          const cleaned = raw
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed
              .filter((s) => s.current && s.upgrade && s.category && s.why)
              .slice(0, 3);
            cacheRef.current = valid;
            setSuggestions(valid);
          } else {
            setError(true);
          }
        } catch {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [shouldShow]);

  if (!shouldShow) return null;
  if (error && !suggestions) return null;
  if (!loading && !suggestions) return null;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.title}>Level Up Your Quests</span>
        <span style={s.badge}>AI</span>
      </div>

      {loading && (
        <div style={s.loadingRow}>
          <span style={s.spinner} />
          <span style={s.loadingText}>Analyzing your progress...</span>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div style={s.cardList}>
          {suggestions.map((sug, i) => {
            const isApplied = appliedIds.has(i);
            return (
              <div key={i} style={s.card}>
                <div style={s.cardBody}>
                  <div style={s.progression}>
                    <span style={s.currentQuest}>{sug.current}</span>
                    <span style={s.arrow}>{"->"}</span>
                    <span style={s.upgradeQuest}>{sug.upgrade}</span>
                  </div>
                  <div style={s.why}>{sug.why}</div>
                </div>
                <button
                  style={{
                    ...s.applyBtn,
                    opacity: isApplied ? 0.4 : 1,
                    cursor: isApplied ? "default" : "pointer",
                  }}
                  onClick={() => {
                    if (isApplied) return;
                    onAddQuest?.(sug.upgrade, sug.category);
                    setAppliedIds((prev) => new Set([...prev, i]));
                  }}
                  disabled={isApplied}
                >
                  {isApplied ? "Added" : "Apply"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  container: {
    margin: "10px 14px 0",
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(124,92,252,0.05), rgba(124,92,252,0.02))",
    border: "1px solid rgba(124,92,252,0.1)",
    padding: "12px 14px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: "#E2E2EE",
    letterSpacing: 0.2,
  },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 4,
    background: "rgba(124,92,252,0.2)",
    color: "#7C5CFC",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0",
  },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(124,92,252,0.2)",
    borderTopColor: "#7C5CFC",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
  },
  loadingText: {
    fontSize: 12,
    color: "rgba(226,226,238,0.5)",
    fontStyle: "italic",
  },
  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  progression: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  currentQuest: {
    fontSize: 12,
    color: "rgba(226,226,238,0.5)",
    textDecoration: "line-through",
  },
  arrow: {
    fontSize: 11,
    color: "rgba(124,92,252,0.6)",
    fontWeight: 700,
    flexShrink: 0,
  },
  upgradeQuest: {
    fontSize: 12,
    fontWeight: 600,
    color: "#E2E2EE",
  },
  why: {
    fontSize: 11,
    color: "rgba(226,226,238,0.4)",
    lineHeight: 1.4,
  },
  applyBtn: {
    padding: "6px 12px",
    borderRadius: 7,
    border: "1px solid rgba(124,92,252,0.25)",
    background: "rgba(124,92,252,0.1)",
    color: "#7C5CFC",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.15s",
    whiteSpace: "nowrap",
  },
};
