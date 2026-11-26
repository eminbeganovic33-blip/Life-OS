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

/** Shift a YYYY-MM-DD local day key by n calendar days (DST-safe: noon anchored). */
export function addDaysToKey(dayKey, n) {
  const d = parseDayKey(dayKey);
  d.setDate(d.getDate() + n);
  return dateToLocalDayKey(d);
}

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Most recent completed day key strictly before `today`, or null. */
function lastCompletedDayBefore(completedDays, today) {
  let best = null;
  for (const [key, done] of Object.entries(completedDays || {})) {
    if (!done || !DAY_KEY_RE.test(key) || key >= today) continue;
    if (!best || key > best) best = key;
  }
  return best;
}

/**
 * Low-shame consistency: completed days out of the last `windowDays` days of
 * the journey. Today only counts once it's completed (it's still in
 * progress), paused days are excused entirely. A miss costs 1/14 here instead
 * of zeroing everything — the counterweight to a streak reset.
 */
export function getConsistency(s, windowDays = 14) {
  const today = getTodayStr();
  const start = typeof s.startDate === "string" && DAY_KEY_RE.test(s.startDate) ? s.startDate : today;
  const paused = new Set(s.pausedDates || []);
  const done = s.completedDays || {};
  let total = 0;
  let count = 0;
  for (let i = 0; i < windowDays; i++) {
    const key = addDaysToKey(today, -i);
    if (key < start) break;
    if (i === 0 && !done[key]) continue;
    if (paused.has(key)) continue;
    total++;
    if (done[key]) count++;
  }
  return { done: count, total };
}

export const MAX_STREAK_FREEZES = 3;

/**
 * Streak freeze award for reaching `newStreak` — one freeze per 7-day
 * milestone, max 3 banked, none in Hard Mode. The single place freezes are
 * earned (day completion calls this); returns the state patch, or null.
 */
export function freezeAwardFor(s, newStreak) {
  if (s.hardMode || newStreak <= 0 || newStreak % 7 !== 0) return null;
  if (newStreak <= (s.lastFreezeAwardedAtStreak || 0)) return null;
  const current = s.streakFreezes || 0;
  if (current >= MAX_STREAK_FREEZES) return { lastFreezeAwardedAtStreak: newStreak };
  return {
    streakFreezes: current + 1,
    lastFreezeAwardedAtStreak: newStreak,
    streakFreezeEarnedDate: getTodayStr(),
  };
}

/**
 * Reconcile the day streak on load. The single place a missed day spends a
 * freeze or breaks the streak.
 *
 * The anchor is the last day that was actually COMPLETED, not the last day
 * the app was opened (`lastActiveDate` is bumped on every open, so anchoring
 * on it made "active yesterday" look like a missed day and capped every
 * streak at 1). Only days strictly between that anchor and today count as
 * missed — today is still in progress. Paused days (10A) and rest days are
 * excused. `streakCheckedThrough` records the last day already accounted for,
 * so reopening the app on the same day never spends a second freeze.
 */
export function reconcileStreaks(s) {
  const today = getTodayStr();
  const yesterday = addDaysToKey(today, -1);
  const lastDone = lastCompletedDayBefore(s.completedDays, today);
  // A marker after yesterday (clock was ahead, or a backup from a phone with
  // a wrong clock) would silently forgive real misses — ignore it.
  const checked = s.streakCheckedThrough && s.streakCheckedThrough <= yesterday ? s.streakCheckedThrough : null;
  const from = checked && (!lastDone || checked > lastDone) ? checked : lastDone;

  if ((s.streak || 0) > 0 && from && from < yesterday) {
    const paused = new Set(s.pausedDates || []);
    const restDays = new Set(s.restDays || []); // journey-day numbers
    const startDay = s.startDate ? parseDayKey(s.startDate) : null;
    const journeyDay = (key) => {
      if (!startDay) return null;
      const d = parseDayKey(key);
      return Math.round((d - startDay) / 86400000) + 1;
    };

    let missed = 0;
    for (let key = addDaysToKey(from, 1); key < today; key = addDaysToKey(key, 1)) {
      if (paused.has(key) || restDays.has(journeyDay(key))) continue;
      missed++;
      if (missed > 366) break; // corrupted dates — don't spin
    }

    if (missed > 0) {
      const freezes = s.streakFreezes || 0;
      if (!s.hardMode && freezes >= missed) {
        s = {
          ...s,
          streakFreezes: freezes - missed,
          streakFreezeUsedDate: today,
          streakFreezeUsedCount: missed,
          streakFreezeLog: [...(s.streakFreezeLog || []), { date: today, streakPreserved: s.streak, missedDays: missed }],
        };
      } else {
        // Preserve the broken streak so the comeback modal can offer a
        // guilt-free partial restore (Phase 9E).
        // Reset the freeze milestone too, so freezes can be re-earned at 7/14/21.
        s = { ...s, streak: 0, lastBrokenStreak: s.streak, streakBrokenDate: today, lastFreezeAwardedAtStreak: 0 };
      }
    }
  }
  if (s.streakCheckedThrough !== yesterday) s = { ...s, streakCheckedThrough: yesterday };

  if (s.lastLiftDate) {
    const liftGap = daysBetween(s.lastLiftDate);
    if (liftGap > 1) {
      s = { ...s, liftingStreak: 0 };
    }
  }

  return s;
}
