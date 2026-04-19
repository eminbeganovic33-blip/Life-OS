import { useState } from "react";
import { useTheme } from "../hooks/useTheme";

const CATEGORY_COLORS = {
  sleep: "#7C5CFC",
  water: "#38BDF8",
  exercise: "#F97316",
  mind: "#EC4899",
  screen: "#22D3EE",
  shower: "#22D3EE",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SmartInsights = ({ suggestions, sentiment, triggerMap, onAddQuest }) => {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;
  const s = getStyles(isDark, colors, sub);

  const [openSections, setOpenSections] = useState({});
  const toggle = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const hasSuggestions = suggestions && suggestions.length > 0;
  const hasSentiment = sentiment && sentiment.entries && sentiment.entries.length > 0;
  const hasTriggers = triggerMap && triggerMap.triggers && triggerMap.triggers.length > 0;

  if (!hasSuggestions && !hasSentiment && !hasTriggers) return null;

  const trendArrow = (trend) => {
    if (trend === "improving") return { symbol: "↑", color: "#4ADE80", label: "Improving" };
    if (trend === "declining") return { symbol: "↓", color: "#FBBF24", label: "Declining" };
    return { symbol: "→", color: sub(0.4), label: "Stable" };
  };

  const scoreToColor = (score) => {
    const t = (score + 1) / 2;
    if (t < 0.5) {
      const g = Math.round(68 + (180 - 68) * (t / 0.5));
      return `rgb(239,${g},68)`;
    }
    const r = Math.round(239 - (239 - 74) * ((t - 0.5) / 0.5));
    const g = Math.round(180 + (222 - 180) * ((t - 0.5) / 0.5));
    const b = Math.round(68 + (128 - 68) * ((t - 0.5) / 0.5));
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={s.panel}>
      {/* Quest Suggestions */}
      {hasSuggestions && (
        <div style={s.section}>
          <div style={s.mainHeader}>
            <span style={s.icon}>💡</span>
            <span style={s.title}>Suggested Quests</span>
          </div>
          <div style={s.cardList}>
            {suggestions.map((sug, i) => (
              <div key={i} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.questText}>{sug.text}</span>
                  <span style={{ ...s.badge, background: CATEGORY_COLORS[sug.category] || "#7C5CFC" }}>
                    {sug.category}
                  </span>
                </div>
                {sug.reason && <div style={s.reason}>{sug.reason}</div>}
                <button
                  style={s.addBtn}
                  onClick={() => onAddQuest(sug.text, sug.category)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,92,252,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,92,252,0.1)"; }}
                >
                  + Add Quest
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal Sentiment */}
      {hasSentiment && (
        <div style={s.section}>
          <div style={s.collapsibleHeader} onClick={() => toggle("sentiment")}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={s.icon}>📊</span>
              <span style={s.title}>Journal Insights</span>
            </div>
            <span style={s.arrow}>{openSections.sentiment ? "▾" : "▸"}</span>
          </div>
          {openSections.sentiment && (
            <div style={s.collapsibleBody}>
              {sentiment.entries.length < 3 ? (
                <div style={s.emptyMsg}>Keep journaling to unlock insights</div>
              ) : (
                <>
                  {sentiment.trend && (
                    <div style={s.trendRow}>
                      <span style={{ color: trendArrow(sentiment.trend).color, fontWeight: 700, fontSize: 16 }}>
                        {trendArrow(sentiment.trend).symbol}
                      </span>
                      <span style={{ color: trendArrow(sentiment.trend).color, fontWeight: 600, fontSize: 12 }}>
                        {trendArrow(sentiment.trend).label}
                      </span>
                    </div>
                  )}
                  {sentiment.avgScore != null && (
                    <div style={s.scoreSection}>
                      <div style={s.scoreLabel}>Avg Sentiment: {sentiment.avgScore.toFixed(2)}</div>
                      <div style={s.barTrack}>
                        <div style={{ ...s.barFill, width: `${((sentiment.avgScore + 1) / 2) * 100}%`, background: scoreToColor(sentiment.avgScore) }} />
                        <div style={{ ...s.barMarker, left: `${((sentiment.avgScore + 1) / 2) * 100}%` }} />
                      </div>
                      <div style={s.barLabels}>
                        <span>-1</span><span>0</span><span>+1</span>
                      </div>
                    </div>
                  )}
                  {sentiment.insights && sentiment.insights.length > 0 && (
                    <ul style={s.insightList}>
                      {sentiment.insights.map((ins, i) => (
                        <li key={i} style={s.insightItem}>{ins}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Trigger Patterns */}
      {hasTriggers && (
        <div style={s.section}>
          <div style={s.collapsibleHeader} onClick={() => toggle("triggers")}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={s.icon}>🎯</span>
              <span style={s.title}>Trigger Patterns</span>
            </div>
            <span style={s.arrow}>{openSections.triggers ? "▾" : "▸"}</span>
          </div>
          {openSections.triggers && (
            <div style={s.collapsibleBody}>
              {triggerMap.riskDays && triggerMap.riskDays.length > 0 && (
                <div style={s.daysRow}>
                  {DAYS.map((day) => {
                    const isRisk = triggerMap.riskDays.includes(day);
                    return (
                      <span key={day} style={{
                        ...s.dayBadge,
                        background: isRisk ? "rgba(249,115,22,0.15)" : sub(0.04),
                        color: isRisk ? "#F97316" : sub(0.3),
                        borderColor: isRisk ? "rgba(249,115,22,0.3)" : sub(0.06),
                      }}>
                        {day}
                      </span>
                    );
                  })}
                </div>
              )}
              <div style={s.triggerList}>
                {triggerMap.triggers.map((t, i) => (
                  <div key={i} style={s.triggerItem}>
                    <div style={s.triggerTop}>
                      <span style={s.triggerKeyword}>{t.keyword}</span>
                      <span style={s.triggerCount}>{t.frequency}x</span>
                    </div>
                    {t.detail && <div style={s.triggerDetail}>{t.detail}</div>}
                  </div>
                ))}
              </div>
              {triggerMap.suggestions && triggerMap.suggestions.length > 0 && (
                <div style={s.tipList}>
                  {triggerMap.suggestions.map((tip, i) => (
                    <div key={i} style={s.tipItem}>
                      <span style={{ color: "#FBBF24" }}>⚡</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function getStyles(isDark, colors, sub) {
  return {
    panel: {
      maxWidth: 400,
      width: "100%",
      fontFamily: "inherit",
      color: colors.text,
      fontSize: 12,
      lineHeight: 1.5,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    section: {
      background: sub(0.02),
      borderRadius: 12,
      border: `1px solid ${sub(0.06)}`,
      padding: "12px 14px",
    },
    mainHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
    collapsibleHeader: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      cursor: "pointer", userSelect: "none",
    },
    collapsibleBody: { marginTop: 10 },
    icon: { fontSize: 16, lineHeight: 1, flexShrink: 0 },
    title: { fontSize: 13, fontWeight: 700, color: colors.text },
    arrow: { fontSize: 12, color: colors.textSecondary, width: 14, display: "inline-block", textAlign: "center" },

    cardList: { display: "flex", flexDirection: "column", gap: 6 },
    card: {
      background: sub(0.03), borderRadius: 10, padding: "10px 12px",
      border: `1px solid ${sub(0.05)}`,
    },
    cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 },
    questText: { fontWeight: 600, fontSize: 12, color: colors.text, flex: 1 },
    badge: {
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      padding: "2px 7px", borderRadius: 99, color: "#fff",
      opacity: 0.9, flexShrink: 0, letterSpacing: 0.3,
    },
    reason: { fontSize: 11, fontStyle: "italic", color: colors.textSecondary, marginBottom: 8, lineHeight: 1.4 },
    addBtn: {
      background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)",
      borderRadius: 8, color: "#7C5CFC", fontSize: 11, fontWeight: 600,
      padding: "5px 12px", cursor: "pointer", width: "100%",
      textAlign: "center", transition: "background 0.15s",
    },

    trendRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 10 },
    scoreSection: { marginBottom: 10 },
    scoreLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
    barTrack: {
      width: "100%", height: 6, background: sub(0.07),
      borderRadius: 3, position: "relative", overflow: "visible",
    },
    barFill: { height: "100%", borderRadius: 3, transition: "width 0.3s" },
    barMarker: {
      position: "absolute", top: -3, width: 4, height: 12,
      borderRadius: 2, background: isDark ? "#fff" : "#333", transform: "translateX(-2px)",
    },
    barLabels: {
      display: "flex", justifyContent: "space-between",
      fontSize: 11, color: sub(0.3), marginTop: 2,
    },
    insightList: { margin: 0, paddingLeft: 16, listStyle: "disc" },
    insightItem: { fontSize: 11, color: colors.textSecondary, marginBottom: 3, lineHeight: 1.4 },
    emptyMsg: {
      fontSize: 11, color: colors.textSecondary, fontStyle: "italic",
      textAlign: "center", padding: "8px 0",
    },

    daysRow: { display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" },
    dayBadge: { fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, border: "1px solid", textAlign: "center" },
    triggerList: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 },
    triggerItem: { background: sub(0.03), borderRadius: 8, padding: "8px 10px" },
    triggerTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    triggerKeyword: { fontWeight: 600, fontSize: 12, color: colors.text },
    triggerCount: {
      fontSize: 10, fontWeight: 700, color: "#7C5CFC",
      background: "rgba(124,92,252,0.1)", padding: "1px 6px", borderRadius: 4,
    },
    triggerDetail: { fontSize: 11, color: colors.textSecondary, marginTop: 3, lineHeight: 1.4 },
    tipList: { display: "flex", flexDirection: "column", gap: 5 },
    tipItem: { display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: colors.textSecondary, lineHeight: 1.4 },
  };
}

export default SmartInsights;
