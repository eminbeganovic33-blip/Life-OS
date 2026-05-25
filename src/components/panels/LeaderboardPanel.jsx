import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Award, Flame, Trophy, Dumbbell, BookOpen, Shield, Target, TrendingUp } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { daysBetween, getLevelIndex } from "../../utils";
import { LEVELS } from "../../data/constants";

// Tier thresholds for "global percentile" approximations.
// Based on app-design assumptions, not real users.
const TIERS = [
  { pct: 0.5, label: "Top 50%", color: "#6B7280" },
  { pct: 0.25, label: "Top 25%", color: "#3B82F6" },
  { pct: 0.10, label: "Top 10%", color: "#7C5CFC" },
  { pct: 0.05, label: "Top 5%", color: "#EC4899" },
  { pct: 0.01, label: "Top 1%", color: "#F97316" },
  { pct: 0.001, label: "Elite", color: "#FBBF24" },
];

function getTier(value, thresholds) {
  // thresholds = [{ value, tierIdx }]
  let tier = 0;
  thresholds.forEach((t, i) => { if (value >= t) tier = i; });
  return TIERS[tier] || TIERS[0];
}

export default function LeaderboardPanel({ state, onClose }) {
  const stats = useMemo(() => {
    const lifetimeQuests = Object.values(state.completedQuests || {})
      .reduce((s, ids) => s + (Array.isArray(ids) ? ids.length : 0), 0);
    const bestDayQuests = Object.values(state.completedQuests || {})
      .reduce((m, ids) => Math.max(m, Array.isArray(ids) ? ids.length : 0), 0);
    const daysActive = Object.keys(state.completedDays || {}).length;
    const trophies = Object.keys(state.unlockedTrophies || {}).length;
    const coursesDone = Object.values(state.courseProgress || {}).filter((p) => p.completed).length;

    let volume = 0;
    Object.values(state.workoutLogs || {}).forEach((entries) => {
      const list = Array.isArray(entries) ? entries : [entries];
      list.forEach((entry) => {
        (entry.sets || entry.exercises || []).forEach((s) => {
          if (s.weight && s.reps) volume += s.weight * s.reps;
          if (s.sets) s.sets.forEach((set) => {
            if (set.weight && set.reps) volume += set.weight * set.reps;
          });
        });
      });
    });

    const forgeStreaks = Object.entries(state.sobrietyDates || {}).map(([id, date]) => ({
      id, days: daysBetween(date),
    }));
    const longestForge = forgeStreaks.reduce((m, f) => Math.max(m, f.days), 0);

    const readInsights = Object.keys(state.readInsights || {}).length;
    const journalEntries = Object.keys(state.journal || {}).length;

    return {
      xp: state.xp || 0,
      level: getLevelIndex(state.xp || 0) + 1,
      streak: state.streak || 0,
      bestStreak: state.bestStreak || 0,
      lifetimeQuests, bestDayQuests, daysActive, trophies,
      coursesDone, volume, longestForge,
      readInsights, journalEntries,
      liftingStreak: state.liftingStreak || 0,
    };
  }, [state]);

  // Personal records by stat
  const records = [
    {
      icon: <Flame size={16} color="#F97316" />, label: "Best Streak",
      value: stats.bestStreak, current: stats.streak,
      tier: getTier(stats.bestStreak, [3, 7, 14, 30, 66, 100]),
      next: getNext(stats.bestStreak, [3, 7, 14, 30, 66, 100, 200]),
    },
    {
      icon: <Target size={16} color="#7C5CFC" />, label: "Lifetime Quests",
      value: stats.lifetimeQuests,
      tier: getTier(stats.lifetimeQuests, [10, 50, 100, 250, 500, 1000]),
      next: getNext(stats.lifetimeQuests, [10, 50, 100, 250, 500, 1000, 2500]),
    },
    {
      icon: <Trophy size={16} color="#FBBF24" />, label: "Trophies Earned",
      value: `${stats.trophies}/34`,
      raw: stats.trophies,
      tier: getTier(stats.trophies, [3, 8, 14, 20, 27, 34]),
      next: getNext(stats.trophies, [3, 8, 14, 20, 27, 34]),
    },
    {
      icon: <BookOpen size={16} color="#3B82F6" />, label: "Courses Completed",
      value: stats.coursesDone,
      tier: getTier(stats.coursesDone, [1, 3, 6, 10, 15, 20]),
      next: getNext(stats.coursesDone, [1, 3, 6, 10, 15, 20]),
    },
    {
      icon: <Dumbbell size={16} color="#EF4444" />, label: "Lifetime Volume",
      value: stats.volume > 1000 ? `${Math.round(stats.volume / 1000)}k kg` : `${stats.volume} kg`,
      raw: stats.volume,
      tier: getTier(stats.volume, [1000, 5000, 25000, 100000, 250000, 500000]),
      next: getNext(stats.volume, [1000, 5000, 25000, 100000, 250000, 500000]),
    },
    {
      icon: <Shield size={16} color="#22C55E" />, label: "Longest Forge",
      value: `${stats.longestForge}d`,
      raw: stats.longestForge,
      tier: getTier(stats.longestForge, [7, 21, 30, 60, 90, 180]),
      next: getNext(stats.longestForge, [7, 21, 30, 60, 90, 180, 365]),
    },
    {
      icon: <TrendingUp size={16} color="#EC4899" />, label: "Best Day",
      value: `${stats.bestDayQuests} quests`,
      raw: stats.bestDayQuests,
      tier: getTier(stats.bestDayQuests, [2, 4, 6, 8, 10, 12]),
      next: getNext(stats.bestDayQuests, [2, 4, 6, 8, 10, 12]),
    },
  ];

  function getNext(value, thresholds) {
    return thresholds.find((t) => t > value) || null;
  }

  const overallScore = computeScore(stats);
  const overallTier = getTier(overallScore, [100, 300, 600, 1200, 2500, 5000]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={styles.panel}
    >
      <div style={styles.header}>
        <button onClick={onClose} style={styles.backBtn} aria-label="Close">
          <ChevronLeft size={20} color={TOKENS.color.text} />
        </button>
        <Award size={20} color={TOKENS.color.text} />
        <span style={styles.title}>Leaderboard</span>
      </div>

      <div style={styles.body}>
        <div style={{
          ...styles.hero,
          background: `linear-gradient(135deg, ${overallTier.color}18 0%, ${overallTier.color}08 100%)`,
          borderColor: `${overallTier.color}30`,
        }}>
          <div style={styles.heroLabel}>YOUR OVERALL RANK</div>
          <div style={{ ...styles.heroTier, color: overallTier.color }}>{overallTier.label}</div>
          <div style={styles.heroScore}>Score: {Math.round(overallScore)} points</div>
          <div style={styles.heroNote}>
            Based on streaks, quests, trophies, volume, books read, and forge days. Comparison is against modeled tiers, not other users.
          </div>
        </div>

        <div style={styles.sectionLabel}>Personal Records</div>
        {records.map((r) => {
          const raw = r.raw ?? r.value;
          const progress = r.next ? Math.min((raw / r.next) * 100, 100) : 100;
          return (
            <div key={r.label} style={styles.recordCard}>
              <div style={styles.recordHeader}>
                <div style={styles.recordLabelWrap}>
                  <div style={styles.recordIconWrap}>{r.icon}</div>
                  <span style={styles.recordLabel}>{r.label}</span>
                </div>
                <div style={{ ...styles.recordTier, color: r.tier.color, background: `${r.tier.color}14` }}>
                  {r.tier.label}
                </div>
              </div>
              <div style={styles.recordValueRow}>
                <span style={styles.recordValue}>{r.value}</span>
                {r.next && <span style={styles.recordNext}>Next: {r.next}</span>}
              </div>
              {r.next && (
                <div style={styles.recordBar}>
                  <div style={{
                    ...styles.recordFill,
                    width: `${progress}%`,
                    background: r.tier.color,
                  }} />
                </div>
              )}
            </div>
          );
        })}

        <div style={styles.footer}>
          <div style={styles.footerText}>
            Beat your own best. Every day, every domain.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function computeScore(s) {
  return (
    (s.xp || 0) * 0.1 +
    s.bestStreak * 5 +
    s.lifetimeQuests * 0.5 +
    s.trophies * 15 +
    s.coursesDone * 20 +
    Math.min(s.volume / 100, 500) +
    s.longestForge * 3 +
    s.readInsights * 2 +
    s.journalEntries * 1
  );
}

const styles = {
  panel: {
    position: "fixed", top: 0, right: 0, bottom: 0,
    width: "100%", maxWidth: 480, background: TOKENS.color.bg,
    zIndex: 200, display: "flex", flexDirection: "column",
    boxShadow: TOKENS.shadow.xl,
  },
  header: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1, borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  title: {
    fontSize: TOKENS.font.size.lg, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  body: { flex: 1, overflowY: "auto", padding: TOKENS.space[5] },
  hero: {
    padding: TOKENS.space[5], borderRadius: TOKENS.radius.lg,
    border: "1px solid", textAlign: "center",
    marginBottom: TOKENS.space[6],
  },
  heroLabel: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary, letterSpacing: 1.2,
  },
  heroTier: {
    fontSize: 36, fontWeight: 900, letterSpacing: -1,
    marginTop: TOKENS.space[2],
  },
  heroScore: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    fontWeight: TOKENS.font.weight.semibold, marginTop: TOKENS.space[2],
  },
  heroNote: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    marginTop: TOKENS.space[3], lineHeight: 1.5,
  },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary, textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: TOKENS.space[3],
  },
  recordCard: {
    padding: TOKENS.space[4], background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[3],
  },
  recordHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: TOKENS.space[2],
  },
  recordLabelWrap: { display: "flex", alignItems: "center", gap: 8 },
  recordIconWrap: { display: "flex", alignItems: "center" },
  recordLabel: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  recordTier: {
    fontSize: 10, fontWeight: 900, letterSpacing: 0.4,
    padding: "3px 8px", borderRadius: TOKENS.radius.full,
    textTransform: "uppercase",
  },
  recordValueRow: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
  },
  recordValue: {
    fontSize: TOKENS.font.size.xl, fontWeight: 900, color: TOKENS.color.text,
  },
  recordNext: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.medium,
  },
  recordBar: {
    height: 4, background: "rgba(0,0,0,0.05)", borderRadius: 2,
    marginTop: TOKENS.space[3], overflow: "hidden",
  },
  recordFill: { height: "100%", transition: "width 0.4s ease" },
  footer: { marginTop: TOKENS.space[6], textAlign: "center" },
  footerText: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    fontStyle: "italic",
  },
};
