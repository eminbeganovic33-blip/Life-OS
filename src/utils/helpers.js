import { CATEGORIES, QUESTS_TEMPLATE, LEVELS } from "../data";
import { calculateQuestXP } from "./xpEngine";
import { getCategoryCompletionRates, getAdaptiveDifficulty, ADAPTIVE_QUESTS } from "./intelligence";

export function getLevel(xp) {
  let l = LEVELS[0];
  for (const v of LEVELS) {
    if (xp >= v.xpReq) l = v;
    else break;
  }
  return l;
}

export function getNextLevel(xp) {
  for (const l of LEVELS) {
    if (xp < l.xpReq) return l;
  }
  return null;
}

export function getLevelIndex(xp) {
  let i = 0;
  for (let j = 0; j < LEVELS.length; j++) {
    if (xp >= LEVELS[j].xpReq) i = j;
    else break;
  }
  return i;
}

// Prestige is unlockable when the user has reached the final LEVELS entry
export function isPrestigeReady(xp) {
  return getLevelIndex(xp) >= LEVELS.length - 1;
}

export const MAX_LEVEL_INDEX = LEVELS.length - 1;

export function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Feature Set 4: Quests now use calculateQuestXP for dynamic XP.
 * Custom quests from state are merged in when provided.
 */
export function getDayQuests(day, customQuests, state) {
  // When state is provided, use adaptive difficulty to pick quest text
  const rates = state ? getCategoryCompletionRates(state) : null;

  const coreQuests = CATEGORIES.map((cat) => {
    let text = QUESTS_TEMPLATE[cat.id][(day - 1) % QUESTS_TEMPLATE[cat.id].length];

    // Adaptive quest text: if user has enough history, swap in difficulty-appropriate quest
    if (rates && state.currentDay > 7 && ADAPTIVE_QUESTS[cat.id]) {
      const difficulty = getAdaptiveDifficulty(rates[cat.id] || 0);
      text = ADAPTIVE_QUESTS[cat.id][difficulty] || text;
    }

    return {
      id: `${cat.id}-${day}`,
      category: cat.id,
      text,
      xp: 0,
      isCore: true,
      difficulty: rates && state.currentDay > 7 ? getAdaptiveDifficulty(rates[cat.id] || 0) : undefined,
    };
  });

  // Apply intelligent XP weighting
  coreQuests.forEach((q) => {
    q.xp = calculateQuestXP(q.text, day);
  });

  // Merge custom quests if any
  if (customQuests && Array.isArray(customQuests)) {
    customQuests.forEach((cq) => {
      coreQuests.push({
        id: `custom-${cq.category}-${cq.id}-${day}`,
        category: cq.category,
        text: cq.text,
        xp: calculateQuestXP(cq.text, day),
        isCore: false,
        isCustom: true,
      });
    });
  }

  return coreQuests;
}

export function daysBetween(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0; // Invalid date guard
  const now = new Date();
  return Math.max(0, Math.floor((now - d) / 86400000));
}

export function getTotalVolume(workoutLogs) {
  let vol = 0;
  Object.values(workoutLogs || {}).forEach((sessions) => {
    sessions.forEach((s) => {
      s.sets.forEach((set) => {
        vol += (set.weight || 0) * (set.reps || 0);
      });
    });
  });
  return vol;
}

/**
 * Feature Set 1: Temporal Lock — compute the actual calendar day.
 * Returns the max day the user is allowed to be on based on real time.
 */
export function getCalendarDay(startDate) {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  // Reset to midnight for clean day comparison
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - start) / 86400000);
  return Math.max(1, diff + 1); // Day 1 is the start date
}

/**
 * Feature Set 3: Calculate category streak from completedQuests.
 * Counts consecutive days (ending at current) where the category quest was completed.
 */
export function getCategoryStreak(completedQuests, category, currentDay) {
  let streak = 0;
  for (let d = currentDay; d >= 1; d--) {
    const dayQuests = completedQuests[d] || [];
    const hasCategoryQuest = dayQuests.some((qid) => qid.startsWith(category + "-"));
    if (hasCategoryQuest) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Reconcile streaks after a gap in activity. Shared by useAppState and useCloudSync. */
export function reconcileStreaks(s) {
  const today = getTodayStr();
  const lastActive = s.lastActiveDate;
  if (!lastActive || lastActive === today) return s;

  // Check if any missed day was an intentional rest day
  const restDays = s.restDays || [];
  const missedDays = daysBetween(lastActive);
  const lastActiveDate = new Date(lastActive);
  let allMissedWereRest = true;
  for (let i = 1; i < missedDays; i++) {
    const checkDate = new Date(lastActiveDate);
    checkDate.setDate(checkDate.getDate() + i);
    const checkDay = s.currentDay - (daysBetween(checkDate.toISOString().slice(0, 10)));
    if (!restDays.includes(checkDay)) { allMissedWereRest = false; break; }
  }

  if (missedDays > 1 && !allMissedWereRest) {
    const freezes = s.streakFreezes || 0;
    if (freezes > 0 && missedDays <= 2) {
      s = {
        ...s,
        streakFreezes: freezes - 1,
        streakFreezeUsedDate: today,
        streakFreezeLog: [...(s.streakFreezeLog || []), { date: today, streakPreserved: s.streak }],
      };
    } else {
      s = { ...s, streak: 0 };
    }
  }

  const MAX_FREEZES = 3;
  const currentFreezes = s.streakFreezes || 0;
  const lastFreezeAwardedAt = s.lastFreezeAwardedAtStreak || 0;
  if (s.streak > 0 && s.streak >= lastFreezeAwardedAt + 7 && currentFreezes < MAX_FREEZES) {
    const newMilestone = Math.floor(s.streak / 7) * 7;
    if (newMilestone > lastFreezeAwardedAt) {
      s = {
        ...s,
        streakFreezes: Math.min(currentFreezes + 1, MAX_FREEZES),
        lastFreezeAwardedAtStreak: newMilestone,
      };
    }
  }

  if (s.lastLiftDate) {
    const liftGap = daysBetween(s.lastLiftDate);
    if (liftGap > 1) {
      s = { ...s, liftingStreak: 0 };
    }
  }

  return s;
}
