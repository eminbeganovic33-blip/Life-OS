// Character stat system — derives RPG-style attributes from real activity.
// Pure functions: state in, stats out. No persistence — everything is derived.

import { daysBetween, questIdMatchesCategory } from "./helpers";

// How each domain feeds character stats. Tuned so a balanced player levels evenly.
// Weights are per-quest-completion.
const CATEGORY_STAT_WEIGHTS = {
  exercise:  { strength: 2.0, vitality: 0.5 },
  nutrition: { strength: 0.8, vitality: 1.0 },
  shower:    { vitality: 1.0 },
  water:     { vitality: 1.0 },
  sleep:     { vitality: 1.2, wisdom: 0.3 },
  reading:   { intelligence: 2.0 },
  work:      { intelligence: 0.8, focus: 1.2 },
  finance:   { intelligence: 0.8, wisdom: 0.5 },
  mind:      { wisdom: 1.5, focus: 1.0 },
  screen:    { focus: 1.8 },
  social:    { wisdom: 1.2 },
  creative:  { wisdom: 0.8, focus: 0.8 },
};

const DOMAIN_LABELS = {
  sleep: "Sleep", water: "Hydration", exercise: "Exercise", mind: "Mind",
  screen: "Screen", shower: "Grooming", nutrition: "Nutrition",
  reading: "Reading", work: "Work", social: "Social",
  finance: "Finance", creative: "Creative",
};

/**
 * Compute character stats from all activity in state.
 * Returns { strength, intelligence, vitality, wisdom, focus } as integers.
 */
export function getCharacterStats(state) {
  const stats = { strength: 0, intelligence: 0, vitality: 0, wisdom: 0, focus: 0 };

  // Quest completions by category.
  // Quest ID formats:
  //  - Legacy:   "{category}-{idx}-day{N}"          → split[0] is category
  //  - Library:  "lib-{libraryId}-day{N}" where libraryId starts with "{category}-…"
  //  - Custom:   "custom-{category}-{id}-day{N}"    → split[1] is category
  const completedByCategory = {};
  Object.values(state.completedQuests || {}).forEach((ids) => {
    if (!Array.isArray(ids)) return;
    ids.forEach((id) => {
      const parts = id.split("-");
      const cat = (parts[0] === "lib" || parts[0] === "custom") ? parts[1] : parts[0];
      if (!cat) return;
      completedByCategory[cat] = (completedByCategory[cat] || 0) + 1;
    });
  });

  Object.entries(completedByCategory).forEach(([cat, count]) => {
    const weights = CATEGORY_STAT_WEIGHTS[cat];
    if (!weights) return;
    Object.entries(weights).forEach(([stat, weight]) => {
      stats[stat] += count * weight;
    });
  });

  // Dojo: workouts → Strength (big boost per session)
  const totalWorkouts = Object.values(state.workoutLogs || {}).reduce(
    (s, day) => s + (Array.isArray(day) ? day.length : 1), 0
  );
  stats.strength += totalWorkouts * 5;

  // Academy: courses → Intelligence
  const coursesDone = Object.values(state.courseProgress || {}).filter(
    (p) => p?.completed
  ).length;
  stats.intelligence += coursesDone * 15;

  // Book insights → Intelligence
  const insightsRead = Object.keys(state.readInsights || {}).length;
  stats.intelligence += insightsRead * 3;

  // Forge: each sober day → Vitality
  let forgeDays = 0;
  Object.values(state.sobrietyDates || {}).forEach((date) => {
    if (date) forgeDays += daysBetween(date);
  });
  stats.vitality += forgeDays * 2;

  // Journal: entries → Wisdom
  const journalCount = Object.keys(state.journal || {}).length;
  stats.wisdom += journalCount * 3;

  // Lifting streak → bonus Strength (consistency rewarded)
  stats.strength += (state.liftingStreak || 0) * 2;

  // Best streak → Wisdom (discipline)
  stats.wisdom += (state.bestStreak || 0) * 0.5;

  // Round to integers
  Object.keys(stats).forEach((k) => { stats[k] = Math.round(stats[k]); });

  return stats;
}

/**
 * Character tier based on total stat sum. Used for visual evolution stages.
 * Returns { tier: 0-5, label, color, emoji }
 */
const TIERS = [
  { min: 0,    label: "Initiate",    color: "#94A3B8", emoji: "🌱" },
  { min: 100,  label: "Apprentice",  color: "#60A5FA", emoji: "⚡" },
  { min: 300,  label: "Disciple",    color: "#7C5CFC", emoji: "🔥" },
  { min: 700,  label: "Warrior",     color: "#EC4899", emoji: "⚔️" },
  { min: 1500, label: "Champion",    color: "#F97316", emoji: "👑" },
  { min: 3000, label: "Transcended", color: "#FBBF24", emoji: "✨" },
];

export function getCharacterTier(stats) {
  const total = Object.values(stats).reduce((s, v) => s + v, 0);
  let tier = 0;
  TIERS.forEach((t, i) => { if (total >= t.min) tier = i; });
  return { ...TIERS[tier], tier, total, next: TIERS[tier + 1] };
}

/**
 * Per-domain XP, derived from completed quests' xp values + custom-quest xp.
 */
export function getDomainXp(state, categoryId) {
  let total = 0;
  const customQuests = state.customQuests || [];

  Object.values(state.completedQuests || {}).forEach((ids) => {
    if (!Array.isArray(ids)) return;
    ids.forEach((id) => {
      if (!questIdMatchesCategory(id, categoryId)) return;
      if (id.startsWith("custom-")) {
        const q = customQuests.find((x) => id.includes(x.id));
        total += q?.xp || 15;
      } else {
        total += 15;
      }
    });
  });

  return total;
}

/**
 * Domain mastery level. Curve: ~50 XP for L1, ~200 XP for L3, ~800 XP for L5.
 */
export function getDomainLevel(domainXp) {
  if (domainXp <= 0) return 1;
  return Math.max(1, Math.floor(Math.sqrt(domainXp / 50)) + 1);
}

export function getDomainXpForNextLevel(domainXp) {
  const level = getDomainLevel(domainXp);
  // Inverse of getDomainLevel: xpNeeded(level) = 50 * (level - 1)^2
  const nextLevelStart = 50 * level * level;
  return nextLevelStart;
}

/**
 * Get all domain masteries, sorted by level.
 */
export function getAllDomainMasteries(state) {
  return Object.keys(DOMAIN_LABELS).map((id) => {
    const xp = getDomainXp(state, id);
    const level = getDomainLevel(xp);
    const next = getDomainXpForNextLevel(xp);
    const prev = level > 1 ? 50 * (level - 1) * (level - 1) : 0;
    return {
      id,
      label: DOMAIN_LABELS[id],
      xp, level,
      progress: next > prev ? (xp - prev) / (next - prev) : 0,
      next,
    };
  }).sort((a, b) => b.level - a.level || b.xp - a.xp);
}

export const STAT_META = {
  strength:     { label: "Strength",     icon: "💪", color: "#EF4444", source: "Workouts, exercise, nutrition" },
  intelligence: { label: "Intelligence", icon: "🧠", color: "#3B82F6", source: "Courses, books, reading" },
  vitality:     { label: "Vitality",     icon: "❤️", color: "#22C55E", source: "Sleep, hydration, sober days" },
  wisdom:       { label: "Wisdom",       icon: "📜", color: "#A78BFA", source: "Journal, meditation, social" },
  focus:        { label: "Focus",        icon: "🎯", color: "#F59E0B", source: "Screen, deep work, mind quests" },
};
