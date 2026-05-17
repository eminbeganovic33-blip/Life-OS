import { CATEGORIES, QUESTS_TEMPLATE, LEVELS, getQuestTimeOfDay } from "../data";
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

/**
 * Convert a Date to a YYYY-MM-DD string in the USER'S LOCAL timezone.
 *
 * IMPORTANT: Do NOT use `toISOString()` for day-keyed persistence — that
 * produces UTC, which causes streaks to break unfairly for users in
 * non-UTC zones (a quest completed at 11pm PST becomes "tomorrow" in
 * UTC). All day-keyed storage in this app must use local-day boundaries.
 */
export function dateToLocalDayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getTodayStr() {
  return dateToLocalDayKey(new Date());
}

/**
 * Feature Set 4: Quests now use calculateQuestXP for dynamic XP.
 * Custom quests from state are merged in when provided.
 */
export function getDayQuests(day, customQuests, state) {
  const rates = state ? getCategoryCompletionRates(state) : null;
  const activeQuests = state?.activeQuests;
  let coreQuests;

  if (Array.isArray(activeQuests) && activeQuests.length > 0) {
    // ── New active-quests mode (#11) ──
    // User has opted in to a curated set of N quests; only render those.
    coreQuests = activeQuests.map((aq) => {
      const template = QUESTS_TEMPLATE[aq.category] || [];
      const idx = typeof aq.questIndex === "number" ? aq.questIndex % Math.max(template.length, 1) : 0;
      let text = template[idx] || aq.category;
      // Adaptive text swap (keeps user on harder quests as they mature)
      if (rates && state.currentDay > 7 && ADAPTIVE_QUESTS[aq.category]) {
        const difficulty = getAdaptiveDifficulty(rates[aq.category] || 0);
        text = ADAPTIVE_QUESTS[aq.category][difficulty] || text;
      }
      return {
        // id must be stable per-day for completedQuests keying
        id: `${aq.category}-${idx}-day${day}`,
        // aqId links back to the activeQuests entry (retire needs this)
        aqId: aq.id,
        category: aq.category,
        text,
        xp: 0,
        isCore: true,
        timeOfDay: aq.timeOfDay || getQuestTimeOfDay(aq.category, idx),
        difficulty: rates && state.currentDay > 7 ? getAdaptiveDifficulty(rates[aq.category] || 0) : undefined,
      };
    });
  } else {
    // ── Legacy mode: 12-category grid (pre-migration) ──
    coreQuests = CATEGORIES.map((cat) => {
      const questIdx = (day - 1) % QUESTS_TEMPLATE[cat.id].length;
      let text = QUESTS_TEMPLATE[cat.id][questIdx];
      if (rates && state?.currentDay > 7 && ADAPTIVE_QUESTS[cat.id]) {
        const difficulty = getAdaptiveDifficulty(rates[cat.id] || 0);
        text = ADAPTIVE_QUESTS[cat.id][difficulty] || text;
      }
      return {
        id: `${cat.id}-${day}`,
        category: cat.id,
        text,
        xp: 0,
        isCore: true,
        timeOfDay: getQuestTimeOfDay(cat.id, questIdx),
        difficulty: rates && state?.currentDay > 7 ? getAdaptiveDifficulty(rates[cat.id] || 0) : undefined,
      };
    });
  }

  coreQuests.forEach((q) => {
    q.xp = calculateQuestXP(q.text, day);
  });

  if (customQuests && Array.isArray(customQuests)) {
    customQuests.forEach((cq) => {
      coreQuests.push({
        id: `custom-${cq.category}-${cq.id}-${day}`,
        category: cq.category,
        text: cq.text,
        xp: calculateQuestXP(cq.text, day),
        isCore: false,
        isCustom: true,
        timeOfDay: cq.timeOfDay || "anytime",
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

/** Returns true if dayNum is marked as a rest day.
 *  Handles both old number[] format and new { day, reason }[] format. */
export function isRestDay(restDays, dayNum) {
  return (restDays || []).some((r) => (typeof r === "number" ? r : r.day) === dayNum);
}

/** Reconcile streaks after a gap in activity. Shared by useAppState and useCloudSync. */
export function reconcileStreaks(s) {
  const today = getTodayStr();
  const lastActive = s.lastActiveDate;
  if (!lastActive || lastActive === today) return s;

  // Vacation mode: if user paused until a future date, treat all missed days as rest
  if (s.vacationUntil && today <= s.vacationUntil) return s;

  // Check if any missed day was an intentional rest day. Walk forward
  // from the day AFTER lastActive up to the day BEFORE today, in journey-day
  // numbers so we can match against state.restDays directly.
  const restDays = s.restDays || [];
  const missedDays = daysBetween(lastActive);
  // The day-number of `lastActive`. Today's journey day is s.currentDay; if the
  // user missed N days, lastActive corresponded to currentDay - N.
  const lastActiveDayNum = s.currentDay - missedDays;
  let allMissedWereRest = true;
  for (let i = 1; i <= missedDays; i++) {
    const checkDay = lastActiveDayNum + i;
    if (!isRestDay(restDays, checkDay)) { allMissedWereRest = false; break; }
  }

  // ANY miss should consume a freeze or break the streak. The previous code
  // gave a free pass on single-day misses (missedDays > 1) AND gated freeze
  // consumption on missedDays <= 2 (which never fired for the 1-day case).
  if (missedDays >= 1 && !allMissedWereRest) {
    const freezes = s.streakFreezes || 0;
    if (freezes > 0 && missedDays <= 2) {
      s = {
        ...s,
        streakFreezes: freezes - 1,
        streakFreezeUsedDate: today,
        streakFreezeLog: [...(s.streakFreezeLog || []), { date: today, streakPreserved: s.streak, missedDays }],
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
        // Mark "earned today" so App can show a one-time toast on hydrate.
        streakFreezeEarnedDate: today,
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
