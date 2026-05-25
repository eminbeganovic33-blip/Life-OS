import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, TrendingUp } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { getTodayStr, daysBetween, getDayQuests } from "../../utils";
import { questIdMatchesCategory } from "../../utils/helpers";
import { CATEGORIES } from "../../data/categories";

function getDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ProgressPanel({ state, save, onClose }) {
  const today = getTodayStr();
  const dayNumber = state.startDate ? daysBetween(state.startDate) + 1 : 1;

  // Last 7 days bar chart
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const completed = state.completedQuests?.[key]?.length || 0;
      const dayNum = state.startDate ? Math.max(1, daysBetween(state.startDate) + 1 - i) : 1;
      const total = getDayQuests(dayNum, state.customQuests, state).length;
      days.push({
        key,
        label: d.toLocaleDateString("en", { weekday: "short" }),
        completed,
        total,
        pct: total > 0 ? completed / total : 0,
      });
    }
    return days;
  }, [state.completedQuests, state.startDate, state.activeQuests, state.customQuests]);

  // Activity heatmap: last 12 weeks (84 days)
  const heatmapData = useMemo(() => {
    const weeks = [];
    const now = new Date();
    const startDay = new Date(now);
    startDay.setDate(startDay.getDate() - 83);
    // Align to Sunday
    startDay.setDate(startDay.getDate() - startDay.getDay());

    let currentDate = new Date(startDay);
    let currentWeek = [];

    while (currentDate <= now) {
      const key = getDateKey(currentDate);
      const ids = state.completedQuests?.[key] || [];
      const count = ids.length;
      currentWeek.push({ date: key, count });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    return weeks;
  }, [state.completedQuests]);

  // Weekly quest completion trend (last 8 weeks)
  const weeklyTrend = useMemo(() => {
    const weeks = [];
    for (let w = 7; w >= 0; w--) {
      let count = 0;
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() - (w * 7 + d));
        const key = getDateKey(date);
        count += (state.completedQuests?.[key]?.length || 0);
      }
      weeks.push(count);
    }
    const max = Math.max(...weeks, 1);
    return weeks.map((v) => ({ value: v, pct: v / max }));
  }, [state.completedQuests]);

  // Lifetime quests + best day
  const { lifetimeQuests, bestDayQuests, avgPerDay } = useMemo(() => {
    const allDays = Object.values(state.completedQuests || {});
    const total = allDays.reduce((sum, ids) => sum + (Array.isArray(ids) ? ids.length : 0), 0);
    const best = allDays.reduce((max, ids) => Math.max(max, Array.isArray(ids) ? ids.length : 0), 0);
    const activeDays = Object.keys(state.completedDays || {}).length || 1;
    return { lifetimeQuests: total, bestDayQuests: best, avgPerDay: Math.round(total / activeDays * 10) / 10 };
  }, [state.completedQuests, state.completedDays]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      let completed = 0;
      Object.values(state.completedQuests || {}).forEach((ids) => {
        completed += ids.filter((id) => questIdMatchesCategory(id, cat.id)).length;
      });
      const total = Math.max(dayNumber, 1);
      return { ...cat, completed, rate: Math.round((completed / total) * 100) };
    }).filter((c) => c.completed > 0).sort((a, b) => b.rate - a.rate);
  }, [state.completedQuests, dayNumber]);

  function getHeatColor(count) {
    if (count === 0) return TOKENS.color.surface;
    if (count <= 2) return "rgba(17,17,17,0.15)";
    if (count <= 4) return "rgba(17,17,17,0.35)";
    if (count <= 6) return "rgba(17,17,17,0.55)";
    return "rgba(17,17,17,0.8)";
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
        <TrendingUp size={20} color={TOKENS.color.text} />
        <span style={styles.title}>Progress</span>
      </div>

      <div style={styles.body}>
        {/* 7-day chart */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Last 7 days</div>
          <div style={styles.chart}>
            {last7Days.map((day) => (
              <div key={day.key} style={styles.chartCol}>
                <div style={styles.barBg}>
                  <div style={{
                    ...styles.barFill,
                    height: `${Math.max(day.pct * 100, 4)}%`,
                    background: day.pct >= 1 ? TOKENS.color.success : TOKENS.color.text,
                  }} />
                </div>
                <div style={styles.chartLabel}>{day.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Overview</div>
          <div style={styles.statsRow}>
            <Stat label="Total XP" value={state.xp || 0} />
            <Stat label="Best streak" value={state.bestStreak || 0} />
            <Stat label="Days active" value={Object.keys(state.completedDays || {}).length} />
          </div>
          <div style={{ ...styles.statsRow, marginTop: TOKENS.space[3] }}>
            <Stat label="Quests done" value={lifetimeQuests} />
            <Stat label="Best day" value={`${bestDayQuests}q`} />
            <Stat label="Avg/day" value={avgPerDay} />
          </div>
        </div>

        {/* Activity heatmap */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Activity (12 weeks)</div>
          <div style={styles.heatmap}>
            {heatmapData.map((week, wi) => (
              <div key={wi} style={styles.heatWeek}>
                {week.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.count} quests`}
                    style={{
                      ...styles.heatCell,
                      background: getHeatColor(day.count),
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={styles.heatLegend}>
            <span style={styles.heatLegendLabel}>Less</span>
            {[0, 2, 4, 6, 8].map((v) => (
              <div key={v} style={{ ...styles.heatCell, width: 10, height: 10, background: getHeatColor(v) }} />
            ))}
            <span style={styles.heatLegendLabel}>More</span>
          </div>
        </div>

        {/* Weekly trend */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Weekly trend (8 weeks)</div>
          <div style={styles.trendChart}>
            {weeklyTrend.map((w, i) => (
              <div key={i} style={styles.trendCol}>
                <div style={styles.trendBarBg}>
                  <div style={{
                    ...styles.trendBarFill,
                    height: `${Math.max(w.pct * 100, 3)}%`,
                  }} />
                </div>
                <div style={styles.trendLabel}>{w.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        {categoryStats.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Domain consistency</div>
            {categoryStats.slice(0, 8).map((cat) => (
              <div key={cat.id} style={styles.catRow}>
                <span style={{ fontSize: 16 }}>{cat.icon}</span>
                <span style={styles.catLabel}>{cat.label}</span>
                <div style={styles.catBar}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(cat.rate, 100)}%`,
                    background: DOMAIN_COLORS[cat.id] || TOKENS.color.text,
                    borderRadius: 3,
                  }} />
                </div>
                <span style={styles.catPct}>{cat.rate}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Streak history */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Streaks</div>
          <div style={styles.statsRow}>
            <Stat label="Current" value={state.streak || 0} />
            <Stat label="Best" value={state.bestStreak || 0} />
            <Stat label="Lifting" value={state.liftingStreak || 0} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statVal}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    maxWidth: 480,
    background: TOKENS.color.bg,
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    boxShadow: TOKENS.shadow.xl,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  title: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
  },
  section: {
    marginBottom: TOKENS.space[7],
  },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: TOKENS.space[4],
  },
  chart: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    padding: `0 ${TOKENS.space[2]}px`,
  },
  chartCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  barBg: {
    width: 20,
    height: 100,
    background: TOKENS.color.surface,
    borderRadius: 10,
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 10,
    transition: "height 0.4s ease",
  },
  chartLabel: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.medium,
  },
  statsRow: {
    display: "flex",
    gap: TOKENS.space[3],
  },
  stat: {
    flex: 1,
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    textAlign: "center",
  },
  statVal: {
    fontSize: TOKENS.font.size.xl,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  statLabel: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 4,
  },
  heatmap: {
    display: "flex",
    gap: 3,
    overflowX: "auto",
    paddingBottom: TOKENS.space[3],
  },
  heatWeek: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  heatCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  heatLegend: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginTop: TOKENS.space[2],
    justifyContent: "flex-end",
  },
  heatLegendLabel: {
    fontSize: 10,
    color: TOKENS.color.textTertiary,
  },
  trendChart: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 80,
    gap: 4,
  },
  trendCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  trendBarBg: {
    width: "100%",
    height: 60,
    background: TOKENS.color.surface,
    borderRadius: 6,
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  },
  trendBarFill: {
    width: "100%",
    background: TOKENS.color.brand,
    borderRadius: 6,
    transition: "height 0.4s ease",
  },
  trendLabel: {
    fontSize: 10,
    color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.medium,
  },
  catRow: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    marginBottom: TOKENS.space[3],
  },
  catLabel: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.medium,
    color: TOKENS.color.text,
    width: 70,
  },
  catBar: {
    flex: 1,
    height: 6,
    background: TOKENS.color.surface,
    borderRadius: 3,
    overflow: "hidden",
  },
  catPct: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.semibold,
    width: 36,
    textAlign: "right",
  },
};
