import { useMemo } from "react";
import { motion } from "framer-motion";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { getTodayStr, getDayQuests, daysBetween } from "../../utils";
import { CATEGORIES } from "../../data/categories";
import DomainCard from "../shared/DomainCard";
import StreakPill from "../shared/StreakPill";
import ProgressRing from "../shared/ProgressRing";

export default function BriefScreen({ state, save, onOpenPanel }) {
  const today = getTodayStr();
  const dayNumber = state.startDate ? daysBetween(state.startDate) + 1 : 1;
  const todayQuests = getDayQuests(dayNumber, state.customQuests, state);
  const completedIds = state.completedQuests?.[today] || [];
  const completedToday = todayQuests.filter((q) => completedIds.includes(q.id));
  const progress = todayQuests.length > 0 ? completedToday.length / todayQuests.length : 0;
  const allDone = todayQuests.length > 0 && completedToday.length === todayQuests.length;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const activeDomains = useMemo(() => {
    return CATEGORIES.filter((cat) =>
      todayQuests.some((q) => q.category === cat.id)
    );
  }, [todayQuests]);

  return (
    <div style={styles.screen}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={styles.header}
      >
        <div>
          <div style={styles.greeting}>{greeting}</div>
          <div style={styles.dayLabel}>Day {dayNumber}</div>
        </div>
        <div style={styles.headerRight}>
          <StreakPill streak={state.streak || 0} />
        </div>
      </motion.header>

      {/* Progress summary */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={styles.progressSection}
      >
        <ProgressRing progress={progress} size={64} />
        <div style={styles.progressText}>
          <div style={styles.progressCount}>
            {completedToday.length} of {todayQuests.length}
          </div>
          <div style={styles.progressLabel}>
            {allDone ? "All protocols complete" : "protocols remaining"}
          </div>
        </div>
      </motion.section>

      {/* Domain cards */}
      <section style={styles.domains}>
        <div style={styles.sectionLabel}>Today's domains</div>
        <div style={styles.domainGrid}>
          {activeDomains.map((domain, i) => {
            const domainQuests = todayQuests.filter((q) => q.category === domain.id);
            const domainCompleted = domainQuests.filter((q) => completedIds.includes(q.id));
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.35 }}
              >
                <DomainCard
                  domain={domain}
                  completedCount={domainCompleted.length}
                  totalCount={domainQuests.length}
                  onTap={() => onOpenPanel(domain.id)}
                />
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const styles = {
  screen: {
    padding: `${TOKENS.space[7]}px ${TOKENS.space[5]}px`,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: TOKENS.space[7],
  },
  greeting: {
    fontSize: TOKENS.font.size.md,
    color: TOKENS.color.textSecondary,
    fontWeight: TOKENS.font.weight.medium,
  },
  dayLabel: {
    fontSize: TOKENS.font.size.hero,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    letterSpacing: -1,
    marginTop: 2,
  },
  headerRight: {
    paddingTop: 4,
  },
  progressSection: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[5],
    padding: TOKENS.space[5],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[7],
  },
  progressText: {
    flex: 1,
  },
  progressCount: {
    fontSize: TOKENS.font.size.xl,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  progressLabel: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginTop: 2,
  },
  domains: {},
  sectionLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: TOKENS.space[4],
  },
  domainGrid: {
    display: "flex",
    flexDirection: "column",
    gap: TOKENS.space[3],
  },
};
