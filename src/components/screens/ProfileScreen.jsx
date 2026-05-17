import { TOKENS } from "../../styles/tokens";
import { getTodayStr, daysBetween } from "../../utils";

export default function ProfileScreen({ state }) {
  const today = getTodayStr();
  const dayNumber = state.startDate ? daysBetween(state.startDate, today) + 1 : 1;
  const totalCompleted = Object.keys(state.completedDays || {}).length;

  return (
    <div style={styles.screen}>
      <header style={styles.header}>
        <div style={styles.title}>Profile</div>
      </header>

      <div style={styles.statsGrid}>
        <StatCard label="Day" value={dayNumber} />
        <StatCard label="XP" value={state.xp || 0} />
        <StatCard label="Streak" value={state.streak || 0} />
        <StatCard label="Best streak" value={state.bestStreak || 0} />
        <StatCard label="Days completed" value={totalCompleted} />
        <StatCard label="Lifetime XP" value={state.lifetimeXp || 0} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  screen: {
    padding: `${TOKENS.space[7]}px ${TOKENS.space[5]}px`,
  },
  header: {
    marginBottom: TOKENS.space[7],
  },
  title: {
    fontSize: TOKENS.font.size.xxl,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: TOKENS.space[3],
  },
  stat: {
    padding: TOKENS.space[5],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
  },
  statValue: {
    fontSize: TOKENS.font.size.xl,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  statLabel: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: TOKENS.font.weight.medium,
  },
};
