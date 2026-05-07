// Feature Set 4: Intelligent XP Weighting
// Parses quest text and assigns XP dynamically based on difficulty tier

import { dateToLocalDayKey } from "./helpers";

const TIER_3_KEYWORDS = [
  "workout", "gym", "cold shower", "run", "push-ups", "push ups",
  "steps", "10,000", "10000", "lifting", "squat", "deadlift",
  "bench", "hiit", "sprint", "plank",
];

const TIER_2_KEYWORDS = [
  "read", "meditate", "meditation", "journal", "learn", "study",
  "no phone", "no screens", "digital detox", "no sugary",
  "wake up before", "sleep before", "skincare",
];

const TIER_1_KEYWORDS = [
  "water", "vitamins", "stretch", "glass", "drink",
  "morning", "routine",
];

/**
 * Calculate XP for a quest based on its text content.
 * Tier 3 (hard/physical): 50-65 XP
 * Tier 2 (mental/discipline): 20-30 XP
 * Tier 1 (easy/maintenance): 10-15 XP
 *
 * Day multiplier adds +2 XP per 10 days to reward consistency.
 */
export function calculateQuestXP(text, day = 1) {
  const lower = text.toLowerCase();
  // Cumulative tier bonus (NOT a one-shot milestone). Every 10 days deeper into
  // the journey adds +2 to the daily floor: days 1-9 → +0, 10-19 → +2, 20-29 → +4, etc.
  // Reads as "the deeper into the journey, the bigger the daily bonus."
  const dayBonus = Math.floor(day / 10) * 2;

  // Check highest tier first
  for (const kw of TIER_3_KEYWORDS) {
    if (lower.includes(kw)) {
      return 50 + dayBonus;
    }
  }

  for (const kw of TIER_2_KEYWORDS) {
    if (lower.includes(kw)) {
      return 25 + dayBonus;
    }
  }

  for (const kw of TIER_1_KEYWORDS) {
    if (lower.includes(kw)) {
      return 12 + dayBonus;
    }
  }

  // Default fallback
  return 15 + dayBonus;
}

/**
 * Returns the tier label for display purposes
 */
export function getQuestTier(text) {
  const lower = text.toLowerCase();
  for (const kw of TIER_3_KEYWORDS) {
    if (lower.includes(kw)) return { tier: 3, label: "Hard", color: "#F97316" };
  }
  for (const kw of TIER_2_KEYWORDS) {
    if (lower.includes(kw)) return { tier: 2, label: "Medium", color: "#7C5CFC" };
  }
  for (const kw of TIER_1_KEYWORDS) {
    if (lower.includes(kw)) return { tier: 1, label: "Easy", color: "#10B981" };
  }
  return { tier: 1, label: "Easy", color: "#10B981" };
}

/**
 * Streak XP multiplier — rewards consecutive daily completion.
 * 0-2 days: 1x (no bonus)
 * 3-6 days: 1.2x
 * 7-13 days: 1.5x
 * 14-29 days: 1.8x
 * 30+ days: 2x
 */
export function getStreakMultiplier(streak) {
  if (streak >= 30) return { multiplier: 2.0, label: "2x", tier: "legendary" };
  if (streak >= 14) return { multiplier: 1.8, label: "1.8x", tier: "epic" };
  if (streak >= 7) return { multiplier: 1.5, label: "1.5x", tier: "rare" };
  if (streak >= 3) return { multiplier: 1.2, label: "1.2x", tier: "common" };
  return { multiplier: 1.0, label: "1x", tier: "none" };
}

/**
 * Apply streak multiplier to base XP.
 */
export function applyStreakMultiplier(baseXp, streak) {
  const { multiplier } = getStreakMultiplier(streak);
  return Math.round(baseXp * multiplier);
}

/**
 * Category mastery — tracks progression within each category.
 * Returns mastery level and progress based on total category quest completions.
 */
export const MASTERY_LEVELS = [
  { name: "Novice", threshold: 0, color: "#6B7280" },
  { name: "Initiate", threshold: 5, color: "#10B981" },
  { name: "Adept", threshold: 15, color: "#3B82F6" },
  { name: "Expert", threshold: 30, color: "#8B5CF6" },
  { name: "Master", threshold: 50, color: "#F59E0B" },
  { name: "Grandmaster", threshold: 80, color: "#EF4444" },
];

export function getCategoryMastery(state, categoryId) {
  let completions = 0;
  Object.entries(state.completedQuests || {}).forEach(([, qIds]) => {
    qIds.forEach((qid) => {
      if (qid.startsWith(categoryId + "-") || qid.startsWith(`custom-${categoryId}-`)) {
        completions++;
      }
    });
  });

  let level = MASTERY_LEVELS[0];
  let levelIndex = 0;
  for (let i = 0; i < MASTERY_LEVELS.length; i++) {
    if (completions >= MASTERY_LEVELS[i].threshold) {
      level = MASTERY_LEVELS[i];
      levelIndex = i;
    }
  }

  const nextLevel = MASTERY_LEVELS[levelIndex + 1] || null;
  const progress = nextLevel
    ? (completions - level.threshold) / (nextLevel.threshold - level.threshold)
    : 1;

  return {
    level: level.name,
    levelIndex,
    color: level.color,
    completions,
    progress: Math.min(progress, 1),
    nextLevel: nextLevel?.name || null,
    nextThreshold: nextLevel?.threshold || null,
  };
}

/**
 * Generate a daily bonus quest based on user's weakest category.
 * Bonus quests give 2x XP and rotate daily.
 */
const BONUS_QUEST_TEMPLATES = {
  sleep: "Bonus: Wind down 30 min before bed — no screens, dim lights",
  water: "Bonus: Drink a full glass of water before every meal today",
  exercise: "Bonus: 20 push-ups and 30 seconds of planks right now",
  mind: "Bonus: 10-minute meditation or deep breathing session",
  screen: "Bonus: 2-hour digital detox — phone in another room",
  shower: "Bonus: End your shower with 30 seconds of cold water",
  nutrition: "Bonus: Replace one processed snack with fruit today",
  reading: "Bonus: Read 20 pages of a non-fiction book",
  work: "Bonus: Complete your most dreaded task in the first hour",
  social: "Bonus: Reach out to someone you haven't talked to in a week",
  finance: "Bonus: Review and cancel one unused subscription",
  creative: "Bonus: Spend 15 minutes on a creative hobby",
};

export function getDailyBonusQuest(state) {
  if (!state || state.currentDay < 3) return null;

  // Find weakest category (lowest completion rate)
  const catCounts = {};
  const totalDays = Math.max(Object.keys(state.completedDays || {}).length, 1);

  Object.entries(state.completedQuests || {}).forEach(([, qIds]) => {
    qIds.forEach((qid) => {
      const cat = qid.split("-")[0];
      if (cat !== "custom") {
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      }
    });
  });

  // Sort categories by completion rate (ascending = weakest first)
  const categories = Object.keys(BONUS_QUEST_TEMPLATES);
  const sorted = categories.sort((a, b) => {
    const rateA = (catCounts[a] || 0) / totalDays;
    const rateB = (catCounts[b] || 0) / totalDays;
    return rateA - rateB;
  });

  // Rotate through weakest categories by day
  const pick = sorted[(state.currentDay - 1) % sorted.length];
  const text = BONUS_QUEST_TEMPLATES[pick];
  const baseXp = calculateQuestXP(text, state.currentDay);

  return {
    id: `bonus-${pick}-${state.currentDay}`,
    category: pick,
    text,
    xp: baseXp * 2,
    isBonus: true,
    isBonusQuest: true,
  };
}

/**
 * Weekly challenge — a harder challenge that spans the week.
 * Generated based on which week the user is in.
 */
const WEEKLY_CHALLENGES = [
  { id: "wc_1", text: "Complete all quests for 5 out of 7 days this week", xpReward: 200, type: "consistency", requirement: 5 },
  { id: "wc_2", text: "Log 3 Dojo workouts this week", xpReward: 150, type: "dojo", requirement: 3 },
  { id: "wc_3", text: "Write in your journal every day this week", xpReward: 150, type: "journal", requirement: 7 },
  { id: "wc_4", text: "Complete every exercise quest this week", xpReward: 175, type: "category_streak", category: "exercise", requirement: 7 },
  { id: "wc_5", text: "Achieve a 7-day streak or maintain your current one", xpReward: 200, type: "streak", requirement: 7 },
  { id: "wc_6", text: "Complete all mind quests for 5 days", xpReward: 150, type: "category_streak", category: "mind", requirement: 5 },
  { id: "wc_7", text: "Complete a full Academy course this week", xpReward: 250, type: "academy", requirement: 1 },
  { id: "wc_8", text: "Hit 100% quest completion for 3 consecutive days", xpReward: 250, type: "perfect_days", requirement: 3 },
  { id: "wc_9", text: "Complete every nutrition quest this week", xpReward: 150, type: "category_streak", category: "nutrition", requirement: 7 },
  { id: "wc_10", text: "Move 2000 kg total in the Dojo this week", xpReward: 200, type: "dojo_volume", requirement: 2000 },
];

export function getWeeklyChallenge(state) {
  if (!state || state.currentDay < 7) return null;

  // Rotate challenges by week number
  const weekNum = Math.floor((state.currentDay - 1) / 7);
  const challenge = WEEKLY_CHALLENGES[weekNum % WEEKLY_CHALLENGES.length];

  // Check progress
  const progress = getWeeklyChallengeProgress(state, challenge);

  return {
    ...challenge,
    weekNum,
    progress: progress.current,
    target: challenge.requirement,
    completed: progress.current >= challenge.requirement,
    percentComplete: Math.min((progress.current / challenge.requirement) * 100, 100),
  };
}

function getWeeklyChallengeProgress(state, challenge) {
  const weekStart = Math.max(1, state.currentDay - ((state.currentDay - 1) % 7));
  const weekEnd = state.currentDay;
  let current = 0;

  switch (challenge.type) {
    case "consistency": {
      for (let d = weekStart; d <= weekEnd; d++) {
        if (state.completedDays[d]) current++;
      }
      break;
    }
    case "dojo": {
      const startDate = state.startDate ? new Date(state.startDate) : new Date();
      for (let d = weekStart; d <= weekEnd; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + d - 1);
        const key = dateToLocalDayKey(date);
        if (state.workoutLogs?.[key]?.length > 0) current++;
      }
      break;
    }
    case "journal": {
      for (let d = weekStart; d <= weekEnd; d++) {
        if (state.journal?.[d]) current++;
      }
      break;
    }
    case "category_streak": {
      for (let d = weekStart; d <= weekEnd; d++) {
        const quests = state.completedQuests?.[d] || [];
        if (quests.some((qid) => qid.startsWith(challenge.category + "-"))) current++;
      }
      break;
    }
    case "streak": {
      current = state.streak || 0;
      break;
    }
    case "academy": {
      current = Object.values(state.courseProgress || {}).filter((p) => p.completed).length;
      break;
    }
    case "perfect_days": {
      let consecutive = 0;
      let maxConsecutive = 0;
      for (let d = weekStart; d <= weekEnd; d++) {
        if (state.completedDays[d]) {
          consecutive++;
          maxConsecutive = Math.max(maxConsecutive, consecutive);
        } else {
          consecutive = 0;
        }
      }
      current = maxConsecutive;
      break;
    }
    case "dojo_volume": {
      const startDate = state.startDate ? new Date(state.startDate) : new Date();
      for (let d = weekStart; d <= weekEnd; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + d - 1);
        const key = dateToLocalDayKey(date);
        (state.workoutLogs?.[key] || []).forEach((entry) => {
          entry.sets.forEach((s) => { current += s.weight * s.reps; });
        });
      }
      break;
    }
    default:
      break;
  }

  return { current };
}
