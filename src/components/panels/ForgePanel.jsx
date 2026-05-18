import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, Shield, Flame } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { getTodayStr, daysBetween } from "../../utils";

const DEFAULT_HABITS = [
  { id: "smoking", label: "Smoking", icon: "🚬", color: "#EF4444" },
  { id: "alcohol", label: "Alcohol", icon: "🍺", color: "#F59E0B" },
  { id: "doomscrolling", label: "Doomscrolling", icon: "📱", color: "#8B5CF6" },
  { id: "junkfood", label: "Junk Food", icon: "🍔", color: "#F97316" },
  { id: "porn", label: "Porn", icon: "🔞", color: "#EC4899" },
];

export default function ForgePanel({ state, save, onClose }) {
  const sobrietyDates = state.sobrietyDates || {};

  const activeHabits = useMemo(() => {
    return DEFAULT_HABITS.filter((h) => sobrietyDates[h.id]);
  }, [sobrietyDates]);

  const availableHabits = DEFAULT_HABITS.filter((h) => !sobrietyDates[h.id]);

  function startTracking(habitId) {
    save({
      ...state,
      sobrietyDates: { ...sobrietyDates, [habitId]: getTodayStr() },
    });
  }

  function resetHabit(habitId) {
    save({
      ...state,
      sobrietyDates: { ...sobrietyDates, [habitId]: getTodayStr() },
    });
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
        <div style={styles.headerLeft}>
          <Shield size={20} color={TOKENS.color.text} />
          <span style={styles.title}>Forge</span>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={20} color={TOKENS.color.textSecondary} />
        </button>
      </div>

      <div style={styles.body}>
        {activeHabits.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Active streaks</div>
            {activeHabits.map((habit) => {
              const days = daysBetween(sobrietyDates[habit.id]);
              return (
                <div key={habit.id} style={styles.habitCard}>
                  <div style={styles.habitLeft}>
                    <span style={{ fontSize: 24 }}>{habit.icon}</span>
                    <div>
                      <div style={styles.habitLabel}>{habit.label}</div>
                      <div style={styles.habitSub}>
                        {days === 0 ? "Started today" : `${days} day${days > 1 ? "s" : ""} clean`}
                      </div>
                    </div>
                  </div>
                  <div style={styles.habitRight}>
                    <div style={{ ...styles.daysBadge, background: `${habit.color}14`, color: habit.color }}>
                      <Flame size={14} />
                      <span>{days}d</span>
                    </div>
                    <button onClick={() => resetHabit(habit.id)} style={styles.resetBtn}>
                      Reset
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {availableHabits.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Start tracking</div>
            <div style={styles.availableGrid}>
              {availableHabits.map((habit) => (
                <button key={habit.id} onClick={() => startTracking(habit.id)} style={styles.addChip}>
                  <span>{habit.icon}</span>
                  <span style={{ fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.medium }}>
                    {habit.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
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
  habitCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[3],
  },
  habitLeft: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
  },
  habitLabel: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  habitSub: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 1,
  },
  habitRight: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
  },
  daysBadge: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    borderRadius: TOKENS.radius.full,
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
  },
  resetBtn: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 8px",
  },
  availableGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: TOKENS.space[3],
  },
  addChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 14px",
    borderRadius: TOKENS.radius.full,
    border: `1px solid ${TOKENS.color.border}`,
    background: TOKENS.color.surfaceElevated,
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
};
