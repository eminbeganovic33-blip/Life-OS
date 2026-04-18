import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { CategoryIcon } from "../Icon";
import { Flame, Zap, CalendarCheck, CheckCircle, BarChart3, TrendingUp, Grid3X3, Lightbulb, Crown, ChevronRight, CalendarDays } from "lucide-react";
import Skeleton from "../Skeleton";

export default function AnalyticsView({ state }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;
  const [tab, setTab] = useState("overview");
  const [hoveredBar, setHoveredBar] = useState(null);
  const { isPremium, checkFeatureAccess, setShowUpgrade } = usePremium();
  const hasAdvancedAnalytics = checkFeatureAccess(FEATURE_IDS.ADVANCED_ANALYTICS);

  const weeklyXp = useMemo(() => getWeeklyXpData(state), [state.xp, state.currentDay]);
  const categoryRates = useMemo(() => getCategoryCompletionRates(state), [state.completedQuests, state.currentDay]);
  const moodTrend = useMemo(() => getMoodTrend(state), [state.moods, state.currentDay]);
  const insights = useMemo(() => getCorrelationInsights(state), [state.completedQuests, state.moods, state.currentDay]);
  const records = useMemo(() => getPersonalRecords(state), [state.completedQuests, state.completedDays, state.xp]);
  const heatmap = useMemo(() => getHeatmapData(state), [state.completedQuests, state.currentDay]);

  const maxXp = Math.max(...weeklyXp.map((d) => d.xp), 1);

  // Welcome state for brand new users
  if (state.currentDay <= 1 && Object.keys(state.completedDays || {}).length === 0) {
    return (
      <div style={S.vc}>
        <div style={headerRow}>
          <BarChart3 size={20} color="#7C5CFC" strokeWidth={2} />
          <span style={headerTitle}>Analytics</span>
        </div>
        <motion.div
          style={welcomeState}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={welcomeIcon}>
            <BarChart3 size={28} color="#7C5CFC" strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 12 }}>Your analytics are waiting</div>
          <div style={{ fontSize: 12, opacity: 0.45, marginTop: 6, lineHeight: 1.6, maxWidth: 260 }}>
            Complete your first day to unlock progress charts, completion rates, and personal records.
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", Icon: TrendingUp },
    { id: "pixels", label: "Year", Icon: CalendarDays },
    { id: "heatmap", label: "Heatmap", Icon: Grid3X3 },
    { id: "insights", label: "Insights", Icon: Lightbulb },
  ];

  const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

  return (
    <div style={S.vc}>
      {/* Header */}
      <div style={headerRow}>
        <BarChart3 size={20} color="#7C5CFC" strokeWidth={2} />
        <span style={headerTitle}>Analytics</span>
      </div>

      {/* Tab Switcher */}
      <div style={tabRow} role="tablist">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              aria-label={t.label}
              style={{
                ...tabItem,
                color: active ? colors.text : colors.textSecondary,
                background: active ? "rgba(124,92,252,0.1)" : "transparent",
                borderColor: active ? "rgba(124,92,252,0.2)" : "transparent",
              }}
              onClick={() => setTab(t.id)}
            >
              <t.Icon size={13} strokeWidth={active ? 2 : 1.5} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} {...fadeIn}>
          {tab === "overview" && renderOverview()}
          {tab === "pixels" && renderYearInPixels()}
          {tab === "heatmap" && renderHeatmap()}
          {tab === "insights" && renderInsights()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  function renderOverview() {
    const hasRealInsights = insights.length > 0;
    const overviewInsights = hasRealInsights ? insights.slice(0, isPremium ? 2 : 1) : [];

    return (
      <>
        {/* Pattern Insight teaser */}
        {hasRealInsights && (
          <>
            <div style={{ ...sectionLabel, display: "flex", alignItems: "center", gap: 6 }}>
              <Lightbulb size={12} color="#FBBF24" strokeWidth={2} />
              Pattern Insight
            </div>
            {overviewInsights.map((insight, i) => (
              <motion.div
                key={i}
                style={{ ...insightCard, opacity: !isPremium ? 0.7 : 1 }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: !isPremium ? 0.7 : 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div style={insightIconBg}>
                  <Lightbulb size={14} color="#FBBF24" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 12, lineHeight: 1.6, flex: 1 }}>{insight}</span>
              </motion.div>
            ))}
            {!isPremium && (
              <div
                style={{ margin: "0 14px 10px", fontSize: 11, opacity: 0.45, cursor: "pointer", color: "#FBBF24", fontWeight: 600 }}
                onClick={() => setTab("insights")}
              >
                See all insights →
              </div>
            )}
          </>
        )}

        {/* Personal Records */}
        <div style={sectionLabel}>Personal Records</div>
        <div style={recordsGrid}>
          {[
            { Icon: Flame, val: records.longestStreak, label: "Best Streak", color: "#F97316" },
            { Icon: Zap, val: records.highestDayXp, label: "Best Day XP", color: "#FBBF24" },
            { Icon: CalendarCheck, val: records.totalDaysCompleted, label: "Days Done", color: "#22C55E" },
            { Icon: CheckCircle, val: records.totalQuestsCompleted, label: "Quests Done", color: "#7C5CFC" },
          ].map((r, i) => (
            <motion.div
              key={i}
              style={recordCard}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <div style={{ ...recordIconBg, background: `${r.color}15`, border: `1px solid ${r.color}25` }}>
                <r.Icon size={16} color={r.color} strokeWidth={2} />
              </div>
              <div style={recordVal}>{r.val}</div>
              <div style={recordLabel}>{r.label}</div>
            </motion.div>
          ))}
        </div>
        {records.mostConsistentCategory && (
          <div style={consistentBadge}>
            <TrendingUp size={13} color="#10B981" strokeWidth={2} />
            Most consistent: <strong>{records.mostConsistentCategory}</strong>
          </div>
        )}

        {/* Weekly XP Chart */}
        <div style={sectionLabel}>XP This Week</div>
        <div style={chartContainer}>
          {weeklyXp.map((d, i) => {
            const pct = (d.xp / maxXp) * 100;
            const isHovered = hoveredBar === i;
            return (
              <div
                key={i}
                style={barCol}
                onPointerEnter={() => setHoveredBar(i)}
                onPointerLeave={() => setHoveredBar(null)}
              >
                <div style={{ ...barValue, opacity: d.xp > 0 ? 1 : 0 }}>
                  {d.xp > 0 ? d.xp : ""}
                </div>
                <div style={barTrack}>
                  <motion.div
                    style={{
                      ...barFill,
                      opacity: isHovered ? 1 : 0.85,
                      filter: isHovered ? "brightness(1.2)" : "none",
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(pct, 2)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                  />
                </div>
                <div style={{ ...barLabel, fontWeight: isHovered ? 700 : 400 }}>{d.label}</div>
              </div>
            );
          })}
        </div>

        {/* Category Completion */}
        <div style={sectionLabel}>Category Completion Rate</div>
        <div style={catContainer}>
          {categoryRates.map((c, i) => {
            const cat = CATEGORIES.find((cat) => cat.id === c.category);
            return (
              <motion.div
                key={c.category}
                style={catRow}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div style={catInfo}>
                  {cat ? <CategoryIcon id={cat.id} size={14} color={cat.color} /> : <span>{c.icon}</span>}
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</span>
                </div>
                <div style={catBarOuter}>
                  <motion.div
                    style={{ ...catBarInner, background: c.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${c.rate}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
                  />
                </div>
                <div style={{ ...catPercent, color: c.rate > 70 ? "#22C55E" : c.rate > 40 ? colors.text : colors.textSecondary }}>
                  {Math.round(c.rate)}%
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mood Trend */}
        {moodTrend.length > 0 && (
          <>
            <div style={sectionLabel}>Mood Trend (Last 14 Days)</div>
            <div style={moodChartContainer}>
              {moodTrend.map((m, i) => {
                const mood = MOODS[m.mood];
                return (
                  <motion.div
                    key={i}
                    style={moodCol}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: mood ? mood.color : "rgba(255,255,255,0.15)",
                      margin: "0 auto",
                      opacity: mood ? 1 : 0.3,
                      boxShadow: mood ? `0 0 6px ${mood.color}60` : "none",
                    }} />
                    <div style={moodDayLabel}>D{m.day}</div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </>
    );
  }

  function renderYearInPixels() {
    const startDate = state.startDate ? new Date(state.startDate) : new Date();
    const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    // Build day objects: { day (1-based), date, mood, questsDone }
    const days = [];
    for (let d = 1; d <= Math.min(state.currentDay, 365); d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d - 1);
      days.push({
        day: d,
        date,
        mood: state.moods?.[d] !== undefined ? state.moods[d] : null,
        questsDone: (state.completedQuests?.[d] || []).length,
      });
    }

    // Group by month label for display
    const byMonth = {};
    days.forEach((d) => {
      const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
      if (!byMonth[key]) byMonth[key] = { label: `${MONTH_NAMES[d.date.getMonth()]} ${d.date.getFullYear()}`, days: [] };
      byMonth[key].days.push(d);
    });
    const months = Object.values(byMonth);

    const moodDone = days.filter((d) => d.mood !== null).length;
    const moodColors = MOODS.map((m) => m.color);

    return (
      <>
        <div style={sectionLabel}>Year in Pixels</div>
        <div style={{ padding: "0 14px 8px", fontSize: 11, opacity: 0.35, lineHeight: 1.5 }}>
          Each pixel = one day · Color = mood · Gray = no entry
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", marginBottom: 16, flexWrap: "wrap" }}>
          {MOODS.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: m.color }} />
              <span style={{ fontSize: 10, opacity: 0.5 }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Months */}
        <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 14 }}>
          {months.map((month, mi) => (
            <motion.div
              key={month.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.04 }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.4, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {month.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {month.days.map((d) => {
                  const color = d.mood !== null ? moodColors[d.mood] : null;
                  const hasActivity = d.questsDone > 0;
                  return (
                    <div
                      key={d.day}
                      title={`Day ${d.day}: ${d.mood !== null ? MOODS[d.mood].label : "No mood"} · ${d.questsDone} quests`}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: color
                          ? color
                          : hasActivity
                          ? "rgba(124,92,252,0.2)"
                          : sub(0.06),
                        border: color
                          ? `1px solid ${color}60`
                          : `1px solid ${sub(0.08)}`,
                        transition: "transform 0.1s",
                        cursor: "default",
                        boxShadow: color ? `0 0 4px ${color}40` : "none",
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats footer */}
        <div style={{ display: "flex", gap: 8, padding: "20px 14px 8px" }}>
          <div style={heatStat}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{days.length}</div>
            <div style={{ fontSize: 10, opacity: 0.4 }}>Days Tracked</div>
          </div>
          <div style={heatStat}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{moodDone}</div>
            <div style={{ fontSize: 10, opacity: 0.4 }}>Moods Logged</div>
          </div>
          <div style={heatStat}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {moodDone > 0 ? Math.round((moodDone / days.length) * 100) : 0}%
            </div>
            <div style={{ fontSize: 10, opacity: 0.4 }}>Consistency</div>
          </div>
        </div>
        {days.length < 7 && (
          <div style={{ padding: "0 14px 12px", fontSize: 11, opacity: 0.3, textAlign: "center" }}>
            Keep going — your year is just starting to fill in.
          </div>
        )}
      </>
    );
  }

  function renderHeatmap() {
    return (
      <>
        <div style={sectionLabel}>90-Day Activity Heatmap</div>
        <div style={heatmapLegend}>
          <span style={{ fontSize: 10, opacity: 0.35 }}>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} style={{ ...heatCell, background: heatColors[level] }} />
          ))}
          <span style={{ fontSize: 10, opacity: 0.35 }}>More</span>
        </div>
        <div style={heatmapGrid}>
          {heatmap.map((d, i) => (
            <motion.div
              key={i}
              style={{
                ...heatCell,
                background: heatColors[d.intensity],
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.003, duration: 0.2 }}
              title={`${d.date}: ${d.intensity === 0 ? "No activity" : `Level ${d.intensity}`}`}
            />
          ))}
        </div>
        <div style={{ padding: "10px 16px", fontSize: 11, opacity: 0.3, textAlign: "center" }}>
          Each cell = 1 day · Brighter = more quests completed
        </div>

        {/* Summary stats below heatmap */}
        <div style={{ padding: "0 14px", display: "flex", gap: 8 }}>
          <div style={heatStat}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{heatmap.filter((d) => d.intensity > 0).length}</div>
            <div style={{ fontSize: 10, opacity: 0.4 }}>Active Days</div>
          </div>
          <div style={heatStat}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{heatmap.filter((d) => d.intensity >= 3).length}</div>
            <div style={{ fontSize: 10, opacity: 0.4 }}>High Activity</div>
          </div>
          <div style={heatStat}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {Math.round((heatmap.filter((d) => d.intensity > 0).length / Math.max(heatmap.length, 1)) * 100)}%
            </div>
            <div style={{ fontSize: 10, opacity: 0.4 }}>Coverage</div>
          </div>
        </div>
      </>
    );
  }

  function renderInsights() {
    if (!hasAdvancedAnalytics) {
      return (
        <motion.div
          style={premiumGate}
          onClick={() => setShowUpgrade(true)}
          whileTap={{ scale: 0.98 }}
        >
          <div style={premiumIconBg}>
            <Crown size={24} color="#FFD700" strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#FFD700", marginTop: 8 }}>Premium Insights</div>
          <div style={{ fontSize: 12, opacity: 0.45, marginTop: 4, lineHeight: 1.6, maxWidth: 260 }}>
            Unlock correlation insights, trend analysis, and category streaks.
          </div>
          <div style={premiumGateBtn}>
            <span>Upgrade to Premium</span>
            <ChevronRight size={14} />
          </div>
        </motion.div>
      );
    }

    return (
      <>
        <div style={sectionLabel}>Pattern Insights</div>
        <div style={{ padding: "0 16px 10px", fontSize: 11, opacity: 0.35, lineHeight: 1.5 }}>
          Computed from your actual mood logs, quest completions, and timing data.
        </div>
        {insights.length > 0 ? (
          insights.map((insight, i) => (
            <motion.div
              key={i}
              style={insightCard}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div style={insightIconBg}>
                <Lightbulb size={14} color="#FBBF24" strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, lineHeight: 1.6 }}>{insight}</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div style={emptyState}>
            <Lightbulb size={20} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
            <div style={{ marginTop: 8, fontWeight: 600, fontSize: 13 }}>Not enough data yet</div>
            <div style={{ marginTop: 4, fontSize: 11, opacity: 0.6 }}>
              Log your mood for 5+ days to unlock real pattern insights across sleep, exercise, timing, and more.
            </div>
          </div>
        )}

        <div style={sectionLabel}>Category Streaks</div>
        {categoryRates.map((c, i) => {
          const cat = CATEGORIES.find((cat) => cat.id === c.category);
          const streakDays = getCatStreak(state, c.category);
          return (
            <motion.div
              key={c.category}
              style={streakRow}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {cat ? <CategoryIcon id={cat.id} size={14} color={cat.color} /> : <span>{c.icon}</span>}
              <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{c.label}</span>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: streakDays >= 7 ? "#22C55E" : streakDays > 0 ? "#F59E0B" : sub(0.2),
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}>
                {streakDays > 0 ? (
                  <>
                    <Flame size={11} color={streakDays >= 7 ? "#22C55E" : "#F59E0B"} />
                    {streakDays}d
                  </>
                ) : "—"}
              </span>
            </motion.div>
          );
        })}
      </>
    );
  }
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

const headerRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 16px 2px",
};
const headerTitle = {
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: -0.3,
};
const tabRow = {
  display: "flex",
  padding: "0 14px",
  gap: 6,
  marginBottom: 14,
  marginTop: 8,
};
const tabItem = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  fontSize: 12,
  fontWeight: 600,
  padding: "8px 0",
  cursor: "pointer",
  borderRadius: 10,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "transparent",
  background: "transparent",
  transition: "all 0.15s",
};
const sectionLabel = {
  fontSize: 11,
  fontWeight: 700,
  opacity: 0.4,
  padding: "14px 16px 6px",
  textTransform: "uppercase",
  letterSpacing: 1,
};
const recordsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  padding: "0 14px",
};
const recordCard = {
  padding: "14px 12px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
};
const recordIconBg = {
  width: 32,
  height: 32,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const recordVal = { fontSize: 22, fontWeight: 800, letterSpacing: -0.5 };
const recordLabel = { fontSize: 10, opacity: 0.35, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 };
const consistentBadge = {
  margin: "8px 14px 0",
  padding: "8px 14px",
  borderRadius: 10,
  background: "rgba(16,185,129,0.06)",
  border: "1px solid rgba(16,185,129,0.1)",
  fontSize: 12,
  color: "#10B981",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

// Bar chart
const chartContainer = {
  display: "flex",
  alignItems: "flex-end",
  gap: 6,
  padding: "0 14px",
  height: 150,
};
const barCol = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100%",
  cursor: "pointer",
};
const barValue = { fontSize: 11, fontWeight: 700, color: "#7C5CFC", marginBottom: 4, minHeight: 14 };
const barTrack = {
  flex: 1,
  width: "100%",
  borderRadius: 8,
  background: "rgba(255,255,255,0.04)",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
};
const barFill = {
  width: "100%",
  borderRadius: 8,
  background: "linear-gradient(180deg, #7C5CFC, #6D28D9)",
  transition: "opacity 0.15s, filter 0.15s",
  minHeight: 2,
};
const barLabel = { fontSize: 11, opacity: 0.35, marginTop: 4, transition: "all 0.15s" };

// Category bars
const catContainer = { padding: "0 14px", display: "flex", flexDirection: "column", gap: 8 };
const catRow = { display: "flex", alignItems: "center", gap: 8 };
const catInfo = { display: "flex", alignItems: "center", gap: 5, minWidth: 85 };
const catBarOuter = {
  flex: 1,
  height: 7,
  borderRadius: 4,
  background: "rgba(255,255,255,0.05)",
  overflow: "hidden",
};
const catBarInner = {
  height: "100%",
  borderRadius: 4,
  opacity: 0.75,
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
  gap: 3,
  minWidth: 30,
};
const moodDayLabel = { fontSize: 10, opacity: 0.25, fontWeight: 500 };

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
  "rgba(255,255,255,0.04)",
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
const heatStat = {
  flex: 1,
  padding: 12,
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  textAlign: "center",
};

// Insights
const insightCard = {
  margin: "0 14px 8px",
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(251,191,36,0.04)",
  border: "1px solid rgba(251,191,36,0.08)",
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
};
const insightIconBg = {
  width: 28,
  height: 28,
  borderRadius: 8,
  background: "rgba(251,191,36,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const emptyState = {
  margin: "0 14px",
  padding: 24,
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  textAlign: "center",
  fontSize: 12,
  opacity: 0.4,
  lineHeight: 1.6,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const streakRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "0 14px",
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  marginBottom: 6,
};

const premiumGate = {
  margin: "8px 14px",
  padding: "32px 20px",
  borderRadius: 18,
  background: "linear-gradient(135deg, rgba(255,215,0,0.04), rgba(255,165,0,0.02))",
  border: "1px solid rgba(255,215,0,0.1)",
  textAlign: "center",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const premiumIconBg = {
  width: 48,
  height: 48,
  borderRadius: 14,
  background: "rgba(255,215,0,0.08)",
  border: "1px solid rgba(255,215,0,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const premiumGateBtn = {
  marginTop: 14,
  padding: "9px 22px",
  borderRadius: 10,
  background: "linear-gradient(135deg, #FFD700, #FFA500)",
  color: "#000",
  fontSize: 12,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const welcomeState = {
  margin: "24px 14px",
  padding: "44px 20px",
  borderRadius: 18,
  background: "rgba(124,92,252,0.04)",
  border: "1px solid rgba(124,92,252,0.08)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const welcomeIcon = {
  width: 56,
  height: 56,
  borderRadius: 16,
  background: "rgba(124,92,252,0.08)",
  border: "1px solid rgba(124,92,252,0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
