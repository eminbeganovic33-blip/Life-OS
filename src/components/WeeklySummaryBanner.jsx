import { useTheme } from "../hooks/useTheme";

export default function WeeklySummaryBanner({ summary, onDismiss }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;

  if (!summary) return null;

  const s = getStyles(isDark, colors, sub);

  return (
    <div style={s.banner}>
      <div style={s.bannerHeader}>
        <span style={{ fontSize: 14 }}>📊</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>Weekly Summary</span>
        <span style={{ fontSize: 14, cursor: "pointer", color: colors.textSecondary, marginLeft: "auto" }} onClick={onDismiss}>✕</span>
      </div>
      <div style={s.statsRow}>
        <div style={s.statBox}>
          <div style={s.statNum}>{Math.round(summary.completionRate)}%</div>
          <div style={s.statLabel}>Completion</div>
        </div>
        <div style={s.statBox}>
          <div style={s.statNum}>{summary.totalQuests}</div>
          <div style={s.statLabel}>Quests</div>
        </div>
        <div style={s.statBox}>
          <div style={s.statNum}>{summary.xpThisWeek}</div>
          <div style={s.statLabel}>XP Est.</div>
        </div>
      </div>
      {summary.bestCategory && (
        <div style={s.bestCat}>
          Best category: <strong>{summary.bestCategory.label}</strong> ({summary.bestCategory.count} completions)
        </div>
      )}
      {summary.moodAvg > 0 && (
        <div style={s.moodLine}>
          Avg mood: <strong>{summary.moodAvg.toFixed(1)}/6</strong>
        </div>
      )}
    </div>
  );
}

function getStyles(isDark, colors, sub) {
  return {
    banner: {
      margin: "10px 14px",
      padding: 16,
      borderRadius: 14,
      background: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(236,72,153,0.04))",
      border: "1px solid rgba(124,92,252,0.12)",
    },
    bannerHeader: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    statsRow: {
      display: "flex",
      gap: 8,
      marginBottom: 10,
    },
    statBox: {
      flex: 1,
      padding: 10,
      borderRadius: 10,
      background: sub(0.04),
      textAlign: "center",
    },
    statNum: {
      fontSize: 18,
      fontWeight: 800,
      color: "#7C5CFC",
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
      textTransform: "uppercase",
    },
    bestCat: {
      fontSize: 11,
      color: colors.textSecondary,
      lineHeight: 1.5,
    },
    moodLine: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
  };
}
