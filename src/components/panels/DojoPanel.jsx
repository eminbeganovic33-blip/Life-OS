import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Dumbbell, Plus, Check } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { getTodayStr } from "../../utils";

const QUICK_WORKOUTS = [
  { id: "push", label: "Push Day", muscles: "Chest, Shoulders, Triceps", duration: "45 min" },
  { id: "pull", label: "Pull Day", muscles: "Back, Biceps", duration: "45 min" },
  { id: "legs", label: "Leg Day", muscles: "Quads, Hamstrings, Calves", duration: "50 min" },
  { id: "cardio", label: "Cardio", muscles: "Full Body", duration: "30 min" },
  { id: "hiit", label: "HIIT", muscles: "Full Body", duration: "20 min" },
];

export default function DojoPanel({ state, save, onClose }) {
  const today = getTodayStr();
  const todayLog = state.workoutLogs?.[today];
  const [logged, setLogged] = useState(!!todayLog);

  function logWorkout(workout) {
    const log = {
      type: workout.id,
      label: workout.label,
      ts: Date.now(),
    };
    const newLiftDate = today;
    const wasYesterday = state.lastLiftDate && dayDiff(state.lastLiftDate, today) === 1;
    const newStreak = wasYesterday ? (state.liftingStreak || 0) + 1 : 1;

    save({
      ...state,
      workoutLogs: { ...state.workoutLogs, [today]: log },
      lastLiftDate: newLiftDate,
      liftingStreak: newStreak,
      bestLiftingStreak: Math.max(newStreak, state.bestLiftingStreak || 0),
    });
    setLogged(true);
  }

  const streak = state.liftingStreak || 0;

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
          <Dumbbell size={20} color={TOKENS.color.text} />
          <span style={styles.title}>Dojo</span>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={20} color={TOKENS.color.textSecondary} />
        </button>
      </div>

      <div style={styles.body}>
        {/* Streak */}
        {streak > 0 && (
          <div style={styles.streakBanner}>
            <span style={{ fontSize: TOKENS.font.size.xl, fontWeight: TOKENS.font.weight.bold }}>
              {streak}
            </span>
            <span style={{ fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary }}>
              day lifting streak
            </span>
          </div>
        )}

        {logged ? (
          <div style={styles.doneCard}>
            <Check size={32} color={TOKENS.color.success} />
            <div style={styles.doneTitle}>Workout logged</div>
            <div style={styles.doneSub}>{todayLog?.label || "Today's session"} — done.</div>
          </div>
        ) : (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Log a workout</div>
            <div style={styles.workoutList}>
              {QUICK_WORKOUTS.map((w) => (
                <button key={w.id} onClick={() => logWorkout(w)} style={styles.workoutCard}>
                  <div>
                    <div style={styles.workoutLabel}>{w.label}</div>
                    <div style={styles.workoutSub}>{w.muscles}</div>
                  </div>
                  <div style={styles.workoutDuration}>{w.duration}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function dayDiff(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.round((b - a) / 86400000);
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
  streakBanner: {
    display: "flex",
    alignItems: "baseline",
    gap: TOKENS.space[3],
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[6],
  },
  section: {},
  sectionLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: TOKENS.space[4],
  },
  workoutList: {
    display: "flex",
    flexDirection: "column",
    gap: TOKENS.space[3],
  },
  workoutCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surfaceElevated,
    border: `1px solid ${TOKENS.color.border}`,
    borderRadius: TOKENS.radius.lg,
    cursor: "pointer",
    textAlign: "left",
    transition: TOKENS.transition.fast,
  },
  workoutLabel: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  workoutSub: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
  },
  workoutDuration: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    fontWeight: TOKENS.font.weight.medium,
  },
  doneCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: TOKENS.space[9],
    textAlign: "center",
  },
  doneTitle: {
    fontSize: TOKENS.font.size.xl,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
    marginTop: TOKENS.space[4],
  },
  doneSub: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginTop: TOKENS.space[2],
  },
};
