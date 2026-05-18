import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, TrendingUp } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { getTodayStr, daysBetween, getDayQuests } from "../../utils";
import { CATEGORIES } from "../../data/categories";

export default function ProgressPanel({ state, save, onClose }) {
  const today = getTodayStr();
  const dayNumber = state.startDate ? daysBetween(state.startDate) + 1 : 1;

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
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
  }, [state]);

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      let completed = 0;
      let total = 0;
      Object.entries(state.completedQuests || {}).forEach(([date, ids]) => {
        const catIds = ids.filter((id) => id.startsWith(cat.id + "-") || id.startsWith("custom-" + cat.id + "-"));
        completed += catIds.length;
      });
      total = dayNumber;
      return { ...cat, completed, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }).filter((c) => c.completed > 0).sort((a, b) => b.rate - a.rate);
  }, [state, dayNumber]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={styles.panel}
    >
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <TrendingUp size={20} color={TOKENS.color.text} />
          <span style={styles.title}>Progress</span>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={20} color={TOKENS.color.textSecondary} />
        </button>
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
        </div>

        {/* Category breakdown */}
        {categoryStats.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Domain consistency</div>
            {categoryStats.slice(0, 6).map((cat) => (
              <div key={cat.id} style={styles.catRow}>
                <span style={{ fontSize: 16 }}>{cat.icon}</span>
                <span style={styles.catLabel}>{cat.label}</span>
                <div style={styles.catBar}>
                  <div style={{
                    height: "100%",
                    width: `${cat.rate}%`,
                    background: DOMAIN_COLORS[cat.id],
                    borderRadius: 3,
                  }} />
                </div>
                <span style={styles.catPct}>{cat.rate}%</span>
              </div>
            ))}
          </div>
        )}
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
    justifyContent: "space-between",
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottom: `1px solid ${TOKENS.color.border}`,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
  },
  title: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
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
