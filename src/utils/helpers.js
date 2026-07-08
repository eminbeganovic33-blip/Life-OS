import { CATEGORIES, QUESTS_TEMPLATE, LEVELS, getQuestTimeOfDay } from "../data";
import { calculateQuestXP } from "./xpEngine";
import { getCategoryCompletionRates, getAdaptiveDifficulty, ADAPTIVE_QUESTS } from "./intelligence";
import { QUEST_LIBRARY_MAP, getXpForDifficulty, getStarterForCategory } from "../data/questLibrary";

/**
 * Test whether a completed-quest ID belongs to the given category.
 * Handles all three quest ID shapes used in the app:
 *   - Legacy:  "{category}-{idx}-day{N}"
 *   - Library: "lib-{libraryId}-day{N}" where libraryId starts with "{category}-…"
 *   - Custom:  "custom-{category}-{id}-day{N}"
 */
export function questIdMatchesCategory(qid, category) {
  if (!qid || !category) return false;
  if (qid.startsWith("lib-")) return qid.startsWith(`lib-${category}-`);
  if (qid.startsWith("custom-")) return qid.startsWith(`custom-${category}-`);
  return qid.startsWith(`${category}-`);
}

// Frequency → today's day-of-week check (Sun=0..Sat=6).
// MWF for "3x_week", Mon-Fri for "weekdays", Sunday for "weekly", any day for "monthly" (always due).
function isDueToday(frequency, _dayNumber) {
  const today = new Date();
  const dow = today.getDay();
  switch (frequency) {
    case "weekdays":  return dow >= 1 && dow <= 5;
    case "3x_week":   return dow === 1 || dow === 3 || dow === 5; // Mon/Wed/Fri
    case "weekly":    return dow === 0; // Sunday default
    case "monthly":   return today.getDate() === 1;
    case "daily":
    default:          return true;
  }
}

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
 * Parse a stored date string safely. Bare "YYYY-MM-DD" strings parse as UTC
 * midnight, which is the *previous local day* everywhere west of UTC — noon
 * anchoring removes that day-shift. Full ISO timestamps pass through as-is.
 */
export function parseDayKey(dateStr) {
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + "T12:00:00");
  }
  return new Date(dateStr);
}

/**
 * Feature Set 4: Quests now use calculateQuestXP for dynamic XP.
 * Custom quests from state are merged in when provided.
 */
export function getDayQuests(day, customQuests, state) {
  const rates = state ? getCategoryCompletionRates(state) : null;
  const activeQuests = state?.activeQuests;
  let coreQuests;

  // Onboarded users with an explicitly-empty roster get an empty list —
  // not the 12-category legacy fallback (which would show generic habits the
  // user never opted into). Custom quests are still merged below.
  if (state?.onboarded && Array.isArray(activeQuests) && activeQuests.length === 0) {
    coreQuests = [];
  } else if (Array.isArray(activeQuests) && activeQuests.length > 0) {
    // ── Active-quests mode ── supports both legacy and new library-based shapes
    coreQuests = activeQuests
      .filter((aq) => !aq.paused)
      .map((aq) => {
        // NEW SHAPE: { id, libraryId, frequency? }
        if (aq.libraryId) {
          const lib = QUEST_LIBRARY_MAP[aq.libraryId];
          if (!lib) return null;
          const freq = aq.frequency || lib.frequency || "daily";
          if (!isDueToday(freq, day)) return null;
          return {
            id: `lib-${aq.libraryId}-day${day}`,
            aqId: aq.id,
            libraryId: aq.libraryId,
            category: lib.category,
            text: lib.title,
            icon: lib.icon,
            why: lib.why,
            xp: getXpForDifficulty(lib.difficulty),
            isCore: true,
            timeOfDay: lib.timeOfDay || "anytime",
            difficulty: lib.difficulty,
            frequency: freq,
            type: lib.type || "build",
          };
        }
        // LEGACY SHAPE: { id, category, questIndex }
        const template = QUESTS_TEMPLATE[aq.category] || [];
        const idx = typeof aq.questIndex === "number" ? aq.questIndex % Math.max(template.length, 1) : 0;
        let text = template[idx] || aq.category;
        if (rates && day > 7 && ADAPTIVE_QUESTS[aq.category]) {
          const difficulty = getAdaptiveDifficulty(rates[aq.category] || 0);
          text = ADAPTIVE_QUESTS[aq.category][difficulty] || text;
        }
        return {
          id: `${aq.category}-${idx}-day${day}`,
          aqId: aq.id,
          category: aq.category,
          text,
          xp: 0,
          isCore: true,
          timeOfDay: aq.timeOfDay || getQuestTimeOfDay(aq.category, idx),
          difficulty: rates && day > 7 ? getAdaptiveDifficulty(rates[aq.category] || 0) : undefined,
        };
      })
      .filter(Boolean);
  } else {
    // ── Legacy mode: 12-category grid (pre-migration) ──
    coreQuests = CATEGORIES.map((cat) => {
      const questIdx = (day - 1) % QUESTS_TEMPLATE[cat.id].length;
      let text = QUESTS_TEMPLATE[cat.id][questIdx];
      if (rates && day > 7 && ADAPTIVE_QUESTS[cat.id]) {
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
        difficulty: rates && day > 7 ? getAdaptiveDifficulty(rates[cat.id] || 0) : undefined,
      };
    });
  }

  coreQuests.forEach((q) => {
    // Library quests already have correct XP from difficulty tier — don't recompute
    if (!q.libraryId) {
      q.xp = calculateQuestXP(q.text, day);
    }
  });

  if (customQuests && Array.isArray(customQuests)) {
    customQuests.forEach((cq) => {
      coreQuests.push({
        id: `custom-${cq.category}-${cq.id}-${day}`,
        category: cq.category,
        text: cq.text,
        // Use the user-assigned XP if present; only fall back to text-based calculation
        xp: typeof cq.xp === "number" ? cq.xp : calculateQuestXP(cq.text, day),
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
  const d = parseDayKey(dateStr);
  if (isNaN(d.getTime())) return 0; // Invalid date guard
  // Compare local calendar days, not raw 24h windows — otherwise the count
  // flips an hour early/late around DST and for noon-anchored day keys.
  const startOfDay = (x) => { const c = new Date(x); c.setHours(0, 0, 0, 0); return c; };
  return Math.max(0, Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000));
}

/**
 * workoutLogs day values exist in TWO shapes and every consumer must tolerate both:
 *  - Legacy/dev-seed: an ARRAY of sessions [{ exercise, sets: [{weight, reps}] }]
 *  - DojoPanel (real writes): a single OBJECT
 *    { type, label, ts, sets: <number>, volume: <number>, exercises: [{ name, sets: [{done, weight, reps}] }] }
 * Naively treating the object as an array (or `sets` as an array) crashes — use
 * these helpers instead of touching the raw shape.
 */
export function workoutCountForDay(dayLog) {
  if (!dayLog) return 0;
  if (Array.isArray(dayLog)) return dayLog.length;
  return 1;
}

export function workoutVolumeForDay(dayLog) {
  if (!dayLog) return 0;
  // DojoPanel object shape: volume is precomputed — trust it.
  if (!Array.isArray(dayLog)) {
    if (typeof dayLog.volume === "number") return dayLog.volume;
    // Fallback: derive from nested exercises' set arrays.
    let vol = 0;
    (dayLog.exercises || []).forEach((ex) => {
      (Array.isArray(ex.sets) ? ex.sets : []).forEach((set) => {
        vol += (parseFloat(set.weight) || 0) * (parseInt(set.reps, 10) || 0);
      });
    });
    return vol;
  }
  // Legacy array shape
  let vol = 0;
  dayLog.forEach((s) => {
    (Array.isArray(s.sets) ? s.sets : []).forEach((set) => {
      vol += (set.weight || 0) * (set.reps || 0);
    });
  });
  return vol;
}

export function getTotalVolume(workoutLogs) {
  return Object.values(workoutLogs || {}).reduce(
    (sum, dayLog) => sum + workoutVolumeForDay(dayLog), 0
  );
}

/**
 * Feature Set 1: Temporal Lock — compute the actual calendar day.
 * Returns the max day the user is allowed to be on based on real time.
 */
export function getCalendarDay(startDate) {
  if (!startDate) return 1;
  const start = parseDayKey(startDate);
  const now = new Date();
  // Reset to midnight for clean day comparison
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  // Round (not floor): DST shifts make some day-gaps 23h/25h.
  const diff = Math.round((now - start) / 86400000);
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
    const hasCategoryQuest = dayQuests.some((qid) => questIdMatchesCategory(qid, category));
    if (hasCategoryQuest) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Migrate legacy activeQuests shape ({category, questIndex}) to library-based shape ({id, libraryId}).
 * Idempotent — safe to run every load.
 * Maps each old category-based active quest to a sensible starter from the library.
 */
export function migrateActiveQuests(s) {
  if (!Array.isArray(s.activeQuests) || s.activeQuests.length === 0) return s;
  const allNew = s.activeQuests.every((aq) => aq.libraryId);
  if (allNew) return s; // already migrated

  const seen = new Set();
  const migrated = s.activeQuests.map((aq, i) => {
    if (aq.libraryId) return aq;
    const starter = getStarterForCategory(aq.category);
    if (!starter) return null;
    // Avoid duplicates if multiple legacy entries pointed at the same category
    if (seen.has(starter.id)) return null;
    seen.add(starter.id);
    return {
      id: aq.id || `aq-${i}`,
      libraryId: starter.id,
      addedAt: aq.addedAt || Date.now(),
      paused: !!aq.paused,
    };
  }).filter(Boolean);

  return { ...s, activeQuests: migrated };
}

/** Reconcile streaks after a gap in activity. Shared by useAppState and useCloudSync. */
export function reconcileStreaks(s) {
  const today = getTodayStr();
  const lastActive = s.lastActiveDate;
  if (!lastActive || lastActive === today) return s;

  // Check if any missed day was an intentional rest day OR a paused day.
  // Walk forward from the day AFTER lastActive up to the day BEFORE today.
  const restDays = s.restDays || [];
  const pausedDates = s.pausedDates || [];
  const missedDays = daysBetween(lastActive);
  // The journey-day number of `lastActive`. Derive today's day number from
  // startDate — state.currentDay is only set at init and goes stale, so it
  // must never be trusted for day math.
  const todayDayNum = getCalendarDay(s.startDate);
  const lastActiveDayNum = todayDayNum - missedDays;
  let allMissedWereRest = true;
  for (let i = 1; i <= missedDays; i++) {
    const checkDay = lastActiveDayNum + i;
    // Build the date string for this missed day to check against pausedDates.
    // Parse at noon — bare "YYYY-MM-DD" parses as UTC midnight, which rolls
    // back a day in west-of-UTC timezones (same pitfall as dateToLocalDayKey).
    const missedDate = new Date(lastActive + "T12:00:00");
    missedDate.setDate(missedDate.getDate() + i);
    const missedDateStr = dateToLocalDayKey(missedDate);
    const isPaused = pausedDates.includes(missedDateStr);
    if (!restDays.includes(checkDay) && !isPaused) { allMissedWereRest = false; break; }
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
      // Preserve the broken streak so the comeback modal can offer a
      // guilt-free partial restore (Phase 9E).
      s = { ...s, streak: 0, lastBrokenStreak: s.streak };
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
