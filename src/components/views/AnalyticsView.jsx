import { useState } from "react";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { CATEGORIES, MOODS } from "../../data";
import {
  getWeeklyXpData,
  getCategoryCompletionRates,
  getMoodTrend,
  getCorrelationInsights,
  getPersonalRecords,
  getHeatmapData,
} from "../../utils/analytics";
import { usePremium } from "../../hooks/usePremium";
import { FEATURE_IDS } from "../../data/premium";

export default function AnalyticsView({ state }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;
  const [tab, setTab] = useState("overview"); // overview | heatmap | insights
  const { isPremium, checkFeatureAccess, setShowUpgrade } = usePremium();
  const hasAdvancedAnalytics = checkFeatureAccess(FEATURE_IDS.ADVANCED_ANALYTICS);

  const weeklyXp = getWeeklyXpData(state);
  const categoryRates = getCategoryCompletionRates(state);
  const moodTrend = getMoodTrend(state);
  const insights = getCorrelationInsights(state);
  const records = getPersonalRecords(state);
  const heatmap = getHeatmapData(state);

  const maxXp = Math.max(...weeklyXp.map((d) => d.xp), 1);

  // Welcome state for brand new users
  if (state.currentDay <= 1 && Object.keys(state.completedDays || {}).length === 0) {
    return (
      <div style={S.vc}>
        <div style={S.secTitle}>Analytics</div>
        <div style={welcomeState}>
          <span style={{ fontSize: 32 }}>📊</span>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>Your analytics are waiting</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4, lineHeight: 1.5 }}>
            Complete your first day of quests to start seeing progress charts, completion rates, and personal records.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.vc}>
      <div style={S.secTitle}>Analytics</div>

      {/* Tab Switcher */}
      <div style={tabRow}>
        {[
          { id: "overview", label: "Overview" },
          { id: "heatmap", label: "Heatmap" },
          { id: "insights", label: "Insights" },
        ].map((t) => (
          <div
            key={t.id}
            style={{
              ...tabItem,
              color: tab === t.id ? "#7C5CFC" : colors.textSecondary,
              borderBottomColor: tab === t.id ? "#7C5CFC" : "transparent",
            }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* Personal Records */}
          <div style={sectionLabel}>Personal Records</div>
          <div style={recordsGrid}>
            {[
              { icon: "🔥", val: records.longestStreak, label: "Longest Streak" },
              { icon: "⚡", val: records.highestDayXp, label: "Best Day XP" },
              { icon: "📅", val: records.totalDaysCompleted, label: "Days Done" },
              { icon: "✅", val: records.totalQuestsCompleted, label: "Quests Done" },
            ].map((r, i) => (
              <div key={i} style={recordCard}>
                <span style={{ fontSize: 20 }}>{r.icon}</span>
                <div style={recordVal}>{r.val}</div>
                <div style={recordLabel}>{r.label}</div>
              </div>
            ))}
          </div>
          {records.mostConsistentCategory && (
            <div style={consistentBadge}>
              Most consistent: <strong>{records.mostConsistentCategory}</strong>
            </div>
          )}

          {/* Weekly XP Chart */}
          <div style={sectionLabel}>XP This Week</div>
          <div style={chartContainer}>
            {weeklyXp.map((d, i) => (
              <div key={i} style={barCol}>
                <div style={barValue}>{d.xp > 0 ? d.xp : ""}</div>
                <div style={barTrack}>
                  <div
                    style={{
                      ...barFill,
                      height: `${(d.xp / maxXp) * 100}%`,
                    }}
                  />
                </div>
                <div style={barLabel}>{d.label}</div>
              </div>
            ))}
          </div>

          {/* Category Completion */}
          <div style={sectionLabel}>Category Completion Rate</div>
          <div style={catContainer}>
            {categoryRates.map((c) => (
              <div key={c.category} style={catRow}>
                <div style={catInfo}>
                  <span>{c.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</span>
                </div>
                <div style={catBarOuter}>
                  <div
                    style={{
                      ...catBarInner,
                      width: `${c.rate}%`,
                      background: c.color,
                    }}
                  />
                </div>
                <div style={catPercent}>{Math.round(c.rate)}%</div>
              </div>
            ))}
          </div>

          {/* Mood Trend */}
          {moodTrend.length > 0 && (
            <>
              <div style={sectionLabel}>Mood Trend (Last 14 Days)</div>
              <div style={moodChartContainer}>
                {moodTrend.map((m, i) => (
                  <div key={i} style={moodCol}>
                    <div style={{ fontSize: 16 }}>{MOODS[m.mood]?.emoji || "·"}</div>
                    <div style={moodDayLabel}>D{m.day}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === "heatmap" && (
        <>
          <div style={sectionLabel}>90-Day Activity Heatmap</div>
          <div style={heatmapLegend}>
            <span style={{ fontSize: 10, opacity: 0.4 }}>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} style={{ ...heatCell, background: heatColors[level] }} />
            ))}
            <span style={{ fontSize: 10, opacity: 0.4 }}>More</span>
          </div>
          <div style={heatmapGrid}>
            {heatmap.map((d, i) => (
              <div
                key={i}
                style={{
                  ...heatCell,
                  background: heatColors[d.intensity],
                }}
                title={`${d.date}: ${d.intensity === 0 ? "No activity" : `${d.intensity} quests`}`}
              />
            ))}
          </div>
          <div style={{ padding: "8px 16px", fontSize: 10, opacity: 0.3, textAlign: "center" }}>
            Each cell = 1 day. Brighter = more quests completed.
          </div>
        </>
      )}

      {tab === "insights" && (
        <>
          {!hasAdvancedAnalytics ? (
            <div style={premiumGate} onClick={() => setShowUpgrade(true)}>
              <span style={{ fontSize: 24 }}>👑</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD700" }}>Premium Insights</div>
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
                Unlock correlation insights, trend analysis, and category streaks with Premium.
              </div>
              <div style={premiumGateBtn}>Upgrade to Premium</div>
            </div>
          ) : (
            <>
              <div style={sectionLabel}>Correlation Insights</div>
              {insights.length > 0 ? (
                insights.map((insight, i) => (
                  <div key={i} style={insightCard}>
                    <span style={{ fontSize: 16 }}>💡</span>
                    <span style={{ fontSize: 12, lineHeight: 1.5 }}>{insight}</span>
                  </div>
                ))
              ) : (
                <div style={emptyState}>
                  Complete a few more days with mood tracking to unlock correlation insights.
                </div>
              )}

              <div style={sectionLabel}>Category Streaks</div>
              {categoryRates.map((c) => {
                const streakDays = getCatStreak(state, c.category);
                return (
                  <div key={c.category} style={streakRow}>
                    <span>{c.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{c.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: streakDays > 0 ? "#10B981" : sub(0.2) }}>
                      {streakDays > 0 ? `${streakDays}d streak` : "—"}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}

function getCatStreak(state, category) {
  let streak = 0;
  for (let d = state.currentDay; d >= 1; d--) {
    const quests = state.completedQuests[d] || [];
    if (quests.some((qid) => qid.startsWith(category + "-"))) streak++;
    else break;
  }
  return streak;
}

// ── Styles ──

const tabRow = {
  display: "flex",
  padding: "0 14px",
  gap: 0,
  marginBottom: 16,
};
const tabItem = {
  flex: 1,
  textAlign: "center",
  fontSize: 12,
  fontWeight: 700,
  padding: "8px 0",
  cursor: "pointer",
  borderBottom: "2px solid",
  transition: "all 0.15s",
};
const sectionLabel = {
  fontSize: 12,
  fontWeight: 700,
  opacity: 0.5,
  padding: "12px 16px 6px",
  textTransform: "uppercase",
  letterSpacing: 0.8,
};
const recordsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  padding: "0 14px",
};
const recordCard = {
  padding: 14,
  borderRadius: 12,
  background: "rgba(128,128,128,0.06)",
  border: "1px solid rgba(128,128,128,0.1)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
};
const recordVal = { fontSize: 22, fontWeight: 800 };
const recordLabel = { fontSize: 11, opacity: 0.4, textTransform: "uppercase", letterSpacing: 0.5 };
const consistentBadge = {
  margin: "8px 14px 0",
  padding: "8px 14px",
  borderRadius: 10,
  background: "rgba(16,185,129,0.08)",
  border: "1px solid rgba(16,185,129,0.12)",
  fontSize: 12,
  color: "#10B981",
  textAlign: "center",
};

// Bar chart
const chartContainer = {
  display: "flex",
  alignItems: "flex-end",
  gap: 6,
  padding: "0 14px",
  height: 140,
};
const barCol = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100%",
};
const barValue = { fontSize: 11, fontWeight: 700, color: "#7C5CFC", marginBottom: 4, minHeight: 12 };
const barTrack = {
  flex: 1,
  width: "100%",
  borderRadius: 6,
  background: "rgba(128,128,128,0.1)",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
};
const barFill = {
  width: "100%",
  borderRadius: 6,
  background: "linear-gradient(180deg, #7C5CFC, #6D28D9)",
  transition: "height 0.5s ease",
  minHeight: 2,
};
const barLabel = { fontSize: 11, opacity: 0.4, marginTop: 4 };

// Category bars
const catContainer = { padding: "0 14px", display: "flex", flexDirection: "column", gap: 8 };
const catRow = { display: "flex", alignItems: "center", gap: 8 };
const catInfo = { display: "flex", alignItems: "center", gap: 4, minWidth: 80 };
const catBarOuter = {
  flex: 1,
  height: 8,
  borderRadius: 4,
  background: "rgba(128,128,128,0.1)",
  overflow: "hidden",
};
const catBarInner = {
  height: "100%",
  borderRadius: 4,
  transition: "width 0.5s ease",
  opacity: 0.7,
};
const catPercent = { fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: "right" };

// Mood chart
const moodChartContainer = {
  display: "flex",
  gap: 2,
  padding: "0 14px",
  overflowX: "auto",
};
const moodCol = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  minWidth: 28,
};
const moodDayLabel = { fontSize: 11, opacity: 0.3 };

// Heatmap
const heatmapGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(13, 1fr)",
  gap: 3,
  padding: "0 14px",
};
const heatCell = {
  width: "100%",
  aspectRatio: "1",
  borderRadius: 3,
  minWidth: 8,
};
const heatColors = [
  "rgba(128,128,128,0.08)",
  "rgba(124,92,252,0.2)",
  "rgba(124,92,252,0.4)",
  "rgba(124,92,252,0.65)",
  "rgba(124,92,252,0.9)",
];
const heatmapLegend = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "0 14px",
  marginBottom: 10,
  justifyContent: "flex-end",
};

// Insights
const insightCard = {
  margin: "0 14px 8px",
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(124,92,252,0.06)",
  border: "1px solid rgba(124,92,252,0.1)",
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
};
const emptyState = {
  margin: "0 14px",
  padding: 20,
  borderRadius: 12,
  background: "rgba(128,128,128,0.06)",
  textAlign: "center",
  fontSize: 12,
  opacity: 0.4,
  lineHeight: 1.6,
};
const streakRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "0 14px",
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(128,128,128,0.06)",
  border: "1px solid rgba(128,128,128,0.1)",
  marginBottom: 6,
};

const premiumGate = {
  margin: "0 14px",
  padding: "30px 20px",
  borderRadius: 16,
  background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,165,0,0.03))",
  border: "1px solid rgba(255,215,0,0.12)",
  textAlign: "center",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
};

const premiumGateBtn = {
  marginTop: 12,
  padding: "8px 20px",
  borderRadius: 8,
  background: "linear-gradient(135deg, #FFD700, #FFA500)",
  color: "#000",
  fontSize: 12,
  fontWeight: 700,
};

const welcomeState = {
  margin: "20px 14px",
  padding: "40px 20px",
  borderRadius: 16,
  background: "rgba(124,92,252,0.04)",
  border: "1px solid rgba(124,92,252,0.08)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
