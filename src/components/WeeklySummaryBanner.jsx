import { S } from "../styles/theme";

export default function WeeklySummaryBanner({ summary, onDismiss }) {
  if (!summary) return null;

  return (
    <div style={banner}>
      <div style={bannerHeader}>
        <span style={{ fontSize: 14 }}>📊</span>
        <span style={{ fontSize: 12, fontWeight: 700 }}>Weekly Summary</span>
        <span style={{ fontSize: 14, cursor: "pointer", opacity: 0.4, marginLeft: "auto" }} onClick={onDismiss}>✕</span>
      </div>
      <div style={statsRow}>
        <div style={statBox}>
          <div style={statNum}>{Math.round(summary.completionRate)}%</div>
          <div style={statLabel}>Completion</div>
        </div>
        <div style={statBox}>
          <div style={statNum}>{summary.totalQuests}</div>
          <div style={statLabel}>Quests</div>
        </div>
        <div style={statBox}>
          <div style={statNum}>{summary.xpThisWeek}</div>
          <div style={statLabel}>XP Est.</div>
        </div>
      </div>
      {summary.bestCategory && (
        <div style={bestCat}>
          Best category: <strong>{summary.bestCategory.label}</strong> ({summary.bestCategory.count} completions)
        </div>
      )}
      {summary.moodAvg > 0 && (
        <div style={moodLine}>
          Avg mood: <strong>{summary.moodAvg.toFixed(1)}/6</strong>
        </div>
      )}
    </div>
  );
}

const banner = {
  margin: "10px 14px",
  padding: 16,
  borderRadius: 14,
  background: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(236,72,153,0.04))",
  border: "1px solid rgba(124,92,252,0.12)",
};
const bannerHeader = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 12,
};
const statsRow = {
  display: "flex",
  gap: 8,
  marginBottom: 10,
};
const statBox = {
  flex: 1,
  padding: 10,
  borderRadius: 10,
  background: "rgba(255,255,255,0.03)",
  textAlign: "center",
};
const statNum = {
  fontSize: 18,
  fontWeight: 800,
  color: "#7C5CFC",
};
const statLabel = {
  fontSize: 11,
  opacity: 0.4,
  marginTop: 2,
  textTransform: "uppercase",
};
const bestCat = {
  fontSize: 11,
  opacity: 0.6,
  lineHeight: 1.5,
};
const moodLine = {
  fontSize: 11,
  opacity: 0.6,
  marginTop: 2,
};
