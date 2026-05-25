import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { CATEGORIES } from "../../data/categories";
import { dateToLocalDayKey } from "../../utils/helpers";

function getWeekDates() {
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // Match how completedQuests are keyed (local date). Using toISOString
    // shifts the lookup by a day for any user not in UTC.
    dates.push(dateToLocalDayKey(d));
  }
  return dates;
}

export default function WeeklyReviewModal({ state, onDismiss }) {
  const weekDates = useMemo(() => getWeekDates(), []);

  const stats = useMemo(() => {
    let daysCompleted = 0;
    let totalXp = 0;
    let questsCompleted = 0;
    const categoryHits = {};

    weekDates.forEach((date) => {
      const ids = state.completedQuests?.[date] || [];
      if (ids.length > 0) daysCompleted++;
      questsCompleted += ids.length;
      ids.forEach((qid) => {
        const parts = qid.split("-");
        const cat = (parts[0] === "lib" || parts[0] === "custom") ? parts[1] : parts[0];
        if (!cat) return;
        categoryHits[cat] = (categoryHits[cat] || 0) + 1;
      });
    });

    weekDates.forEach((date) => {
      const mood = state.moods?.[date];
      if (mood !== undefined) totalXp += 0;
    });

    const topCategory = Object.entries(categoryHits).sort((a, b) => b[1] - a[1])[0];
    const topDomain = topCategory
      ? CATEGORIES.find((c) => c.id === topCategory[0])
      : null;

    return { daysCompleted, questsCompleted, topDomain };
  }, [state, weekDates]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        style={styles.overlay}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={styles.card}
        >
          <div style={styles.halo} />
          <motion.div
            initial={{ scale: 0.4, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            style={styles.badge}
          >
            <BarChart3 size={32} color="#fff" strokeWidth={2.4} />
          </motion.div>
          <div style={styles.kicker}>WEEKLY REVIEW</div>
          <div style={styles.title}>Here's your week</div>

          <div style={styles.grid}>
            {weekDates.map((date) => {
              const ids = state.completedQuests?.[date] || [];
              const hasSome = ids.length > 0;
              const dayLabel = new Date(date + "T12:00:00").toLocaleDateString("en", { weekday: "short" });
              return (
                <div key={date} style={styles.dayCol}>
                  <div style={{
                    ...styles.dayDot,
                    background: hasSome ? TOKENS.color.text : TOKENS.color.border,
                  }} />
                  <div style={styles.dayName}>{dayLabel}</div>
                </div>
              );
            })}
          </div>

          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <div style={styles.statVal}>{stats.daysCompleted}/7</div>
              <div style={styles.statLabel}>days active</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statVal}>{stats.questsCompleted}</div>
              <div style={styles.statLabel}>quests done</div>
            </div>
          </div>

          {stats.topDomain && (
            <div style={styles.highlight}>
              Top domain: {stats.topDomain.icon} {stats.topDomain.label}
            </div>
          )}

          <button onClick={onDismiss} style={styles.btn}>Continue</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 800,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 340,
    background: "#fff",
    borderRadius: TOKENS.radius.xl,
    padding: "56px 24px 24px",
    textAlign: "center",
    overflow: "hidden",
  },
  halo: {
    position: "absolute", top: -60, left: "50%",
    transform: "translateX(-50%)",
    width: 220, height: 220, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(124,92,252,0.05) 50%, transparent 70%)",
    pointerEvents: "none",
  },
  badge: {
    width: 72, height: 72, borderRadius: 22,
    background: "linear-gradient(135deg, #3B82F6 0%, #7C5CFC 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 12px 32px rgba(59,130,246,0.30)",
    position: "relative", zIndex: 1,
  },
  kicker: {
    fontSize: 11, fontWeight: 900,
    color: "#3B82F6", letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    letterSpacing: -0.5,
    marginBottom: TOKENS.space[5],
  },
  grid: {
    display: "flex",
    justifyContent: "center",
    gap: TOKENS.space[3],
    marginBottom: TOKENS.space[5],
  },
  dayCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: TOKENS.radius.full,
  },
  dayName: {
    fontSize: 10,
    color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.medium,
  },
  statsRow: {
    display: "flex",
    gap: TOKENS.space[3],
    marginBottom: TOKENS.space[4],
  },
  stat: {
    flex: 1,
    padding: TOKENS.space[3],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
  },
  statVal: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  statLabel: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
  },
  highlight: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
    padding: `${TOKENS.space[3]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    marginBottom: TOKENS.space[5],
  },
  btn: {
    width: "100%",
    padding: "14px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    background: TOKENS.color.text,
    color: "#fff",
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
};
