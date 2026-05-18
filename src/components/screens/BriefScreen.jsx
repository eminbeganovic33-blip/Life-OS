import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Shield, Dumbbell, TrendingUp, Sparkles } from "lucide-react";
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

  const hasForgeDates = Object.keys(state.sobrietyDates || {}).length > 0;

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

      {/* All done celebration */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.celebration}
        >
          <Sparkles size={20} color={TOKENS.color.success} />
          <span style={styles.celebrationText}>Day complete — you showed up.</span>
        </motion.div>
      )}

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

      {/* Quick actions */}
      <section style={styles.actions}>
        <div style={styles.sectionLabel}>Quick actions</div>
        <div style={styles.actionGrid}>
          <ActionBtn icon={<BookOpen size={18} />} label="Journal" onClick={() => onOpenPanel("journal")} />
          <ActionBtn icon={<Dumbbell size={18} />} label="Dojo" onClick={() => onOpenPanel("dojo")} />
          {hasForgeDates && (
            <ActionBtn icon={<Shield size={18} />} label="Forge" onClick={() => onOpenPanel("forge")} />
          )}
          <ActionBtn icon={<TrendingUp size={18} />} label="Progress" onClick={() => onOpenPanel("progress")} />
        </div>
      </section>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={styles.actionBtn}>
      <div style={styles.actionIcon}>{icon}</div>
      <span style={styles.actionLabel}>{label}</span>
    </button>
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
    marginBottom: TOKENS.space[5],
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
  celebration: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: "rgba(34, 197, 94, 0.06)",
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[7],
  },
  celebrationText: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.success,
  },
  domains: {
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
  domainGrid: {
    display: "flex",
    flexDirection: "column",
    gap: TOKENS.space[3],
  },
  actions: {
    marginBottom: TOKENS.space[7],
  },
  actionGrid: {
    display: "flex",
    gap: TOKENS.space[3],
  },
  actionBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: `${TOKENS.space[4]}px ${TOKENS.space[3]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    border: "none",
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
  actionIcon: {
    color: TOKENS.color.text,
  },
  actionLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.medium,
    color: TOKENS.color.textSecondary,
  },
};
