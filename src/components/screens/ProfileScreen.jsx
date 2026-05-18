import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, RotateCcw, Shield, Dumbbell } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { getTodayStr, daysBetween } from "../../utils";

export default function ProfileScreen({ state, save }) {
  const today = getTodayStr();
  const dayNumber = state.startDate ? daysBetween(state.startDate) + 1 : 1;
  const totalCompleted = Object.keys(state.completedDays || {}).length;
  const [showReset, setShowReset] = useState(false);

  function handleReset() {
    if (window.confirm("This will erase all your data. Are you sure?")) {
      localStorage.removeItem("life-os-state");
      window.location.reload();
    }
  }

  return (
    <div style={styles.screen}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <header style={styles.header}>
          <div style={styles.title}>Profile</div>
          <div style={styles.subtitle}>Day {dayNumber} of your journey</div>
        </header>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <StatCard label="XP" value={state.xp || 0} />
          <StatCard label="Streak" value={state.streak || 0} />
          <StatCard label="Best streak" value={state.bestStreak || 0} />
          <StatCard label="Days done" value={totalCompleted} />
          <StatCard label="Lifetime XP" value={state.lifetimeXp || 0} />
          <StatCard label="Day" value={dayNumber} />
        </div>

        {/* Forge summary */}
        {Object.keys(state.sobrietyDates || {}).length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Forge streaks</div>
            {Object.entries(state.sobrietyDates).map(([id, startDate]) => {
              const days = daysBetween(startDate);
              return (
                <div key={id} style={styles.forgeRow}>
                  <Shield size={14} color={TOKENS.color.textSecondary} />
                  <span style={styles.forgeLabel}>{id}</span>
                  <span style={styles.forgeDays}>{days}d</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Workout streak */}
        {(state.liftingStreak || 0) > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Dojo</div>
            <div style={styles.forgeRow}>
              <Dumbbell size={14} color={TOKENS.color.textSecondary} />
              <span style={styles.forgeLabel}>Lifting streak</span>
              <span style={styles.forgeDays}>{state.liftingStreak}d</span>
            </div>
          </div>
        )}

        {/* Settings */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Settings</div>
          <button onClick={handleReset} style={styles.settingsRow}>
            <RotateCcw size={16} color={TOKENS.color.danger} />
            <span style={{ ...styles.settingsLabel, color: TOKENS.color.danger }}>Reset all data</span>
            <ChevronRight size={16} color={TOKENS.color.textTertiary} />
          </button>
        </div>
      </motion.div>
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
  subtitle: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: TOKENS.space[3],
    marginBottom: TOKENS.space[7],
  },
  stat: {
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    textAlign: "center",
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
  forgeRow: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px 0`,
  },
  forgeLabel: {
    flex: 1,
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.text,
    fontWeight: TOKENS.font.weight.medium,
    textTransform: "capitalize",
  },
  forgeDays: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  settingsRow: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    width: "100%",
    padding: `${TOKENS.space[4]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  settingsLabel: {
    flex: 1,
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.medium,
  },
};
