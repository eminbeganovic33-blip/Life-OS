import { CATEGORIES } from "../data";
import { calculateQuestXP } from "./xpEngine";

const MOODS = ["Frustrated", "Low", "Neutral", "Good", "Great", "On Fire"];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Get the day number for a given date string relative to the start date.
 */
function getDayForDate(startDate, dateStr) {
  const start = new Date(startDate + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  const diffMs = target - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Get a YYYY-MM-DD string for a Date object.
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get the date string for a given day number relative to the start date.
 */
function getDateForDay(startDate, day) {
  const start = new Date(startDate + "T00:00:00");
  const target = new Date(start);
  target.setDate(target.getDate() + (day - 1));
  return formatDate(target);
}

/**
 * Estimate XP earned on a specific day based on completed quests.
 * questId format is "category-day" (e.g. "sleep-1") or "custom-category-id-day".
 * Since we don't have the quest text, estimate based on count × average XP.
 */
function estimateDayXP(completedQuests, day) {
  const quests = completedQuests?.[day];
  if (!quests || !Array.isArray(quests)) return 0;
  // Average quest XP is ~30, so estimate based on count
  // This is more accurate than passing questId to calculateQuestXP which expects text
  return quests.length * 30;
}

/**
 * Returns array of 7 objects {label, xp} for the last 7 calendar days.
 */
export function getWeeklyXpData(state) {
  const { completedQuests = {}, startDate } = state || {};
  const today = new Date();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const label = DAY_LABELS[date.getDay()];
    const day = startDate ? getDayForDate(startDate, formatDate(date)) : -1;
    const xp = day > 0 ? estimateDayXP(completedQuests, day) : 0;
    result.push({ label, xp });
  }

  return result;
}

/**
 * Returns array of {category, label, icon, color, rate} where rate is 0-100.
 */
export function getCategoryCompletionRates(state) {
  const { completedQuests = {}, currentDay = 0 } = state || {};
  const totalDaysPlayed = Math.max(currentDay, Object.keys(completedQuests).length, 1);

  return CATEGORIES.map((cat) => {
    let daysWithCategory = 0;

    for (const day of Object.keys(completedQuests)) {
      const quests = completedQuests[day];
      if (Array.isArray(quests)) {
        const hasCat = quests.some((qId) => qId.startsWith(cat.id));
        if (hasCat) daysWithCategory++;
      }
    }

    const rate = Math.round((daysWithCategory / totalDaysPlayed) * 100);

    return {
      category: cat.id,
      label: cat.label || cat.name || cat.id,
      icon: cat.icon || "",
      color: cat.color || "#888",
      rate: Math.min(rate, 100),
    };
  });
}

/**
 * Returns array of {day, mood, label} for last 14 days of mood data.
 */
export function getMoodTrend(state) {
  const { moods = {}, startDate } = state || {};
  const today = new Date();
  const result = [];

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const day = startDate ? getDayForDate(startDate, formatDate(date)) : -1;

    if (day > 0 && moods[day] !== undefined && moods[day] !== null) {
      const moodIndex = moods[day];
      result.push({
        day,
        mood: moodIndex,
        label: MOODS[moodIndex] || "Unknown",
      });
    }
  }

  return result;
}

// Human-readable category action verbs for insight copy
const CATEGORY_ACTIONS = {
  sleep: "get quality sleep",
  water: "stay hydrated",
  exercise: "exercise",
  mind: "meditate",
  screen: "limit screen time",
  shower: "take a cold shower",
  nutrition: "eat well",
  reading: "read",
  work: "focus on deep work",
  social: "connect socially",
  finance: "track your finances",
  creative: "create something",
};

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

/**
 * Returns an array of up to 8 insight strings, sorted by signal strength.
 * Covers: mood-category correlation, quest volume vs mood, best weekday,
 * early-bird pattern, streak momentum, and category combos.
 */
export function getCorrelationInsights(state) {
  const {
    completedQuests = {},
    moods = {},
    questCompletedAt = {},
    startDate,
  } = state || {};

  const insights = [];
  const moodDays = Object.keys(moods).filter(
    (d) => moods[d] !== undefined && moods[d] !== null
  );

  if (moodDays.length < 5) return insights; // not enough data yet

  // ── 1. Mood vs category correlation (all categories) ──
  for (const [catId, action] of Object.entries(CATEGORY_ACTIONS)) {
    const withMoods = [];
    const withoutMoods = [];

    for (const day of moodDays) {
      const score = moods[day] + 1; // 1-6
      const quests = completedQuests[day];
      const has = Array.isArray(quests) && quests.some((q) => q.startsWith(catId));
      if (has) withMoods.push(score);
      else withoutMoods.push(score);
    }

    if (withMoods.length >= 3 && withoutMoods.length >= 3) {
      const avgWith = avg(withMoods);
      const avgWithout = avg(withoutMoods);
      const diff = avgWith - avgWithout;

      if (Math.abs(diff) >= 0.4) {
        const pct = Math.abs(Math.round((diff / avgWithout) * 100));
        const direction = diff > 0 ? "better" : "lower";
        insights.push({
          text: diff > 0
            ? `Days you ${action}, your mood runs ${pct}% ${direction} (avg ${avgWith.toFixed(1)}/6 vs ${avgWithout.toFixed(1)}/6).`
            : `Skipping "${action}" links to a ${pct}% ${direction} mood — avg ${avgWith.toFixed(1)}/6 vs ${avgWithout.toFixed(1)}/6.`,
          strength: Math.abs(diff),
        });
      }
    }
  }

  // ── 2. Quest volume vs mood ──
  const highOutput = []; // 5+ quests → mood
  const lowOutput = [];  // 1-2 quests → mood

  for (const day of moodDays) {
    const count = (completedQuests[day] || []).length;
    const score = moods[day] + 1;
    if (count >= 5) highOutput.push(score);
    else if (count <= 2 && count > 0) lowOutput.push(score);
  }

  if (highOutput.length >= 3 && lowOutput.length >= 3) {
    const diff = avg(highOutput) - avg(lowOutput);
    if (Math.abs(diff) >= 0.4) {
      insights.push({
        text: diff > 0
          ? `High-output days (5+ quests) give you a ${diff.toFixed(1)}-point mood boost vs low-output days.`
          : `Surprisingly, lighter days feel better for you — might be a recovery signal.`,
        strength: Math.abs(diff) * 0.9,
      });
    }
  }

  // ── 3. Best day of week ──
  if (startDate) {
    const weekdayMoods = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (const day of moodDays) {
      const dateStr = getDateForDay(startDate, parseInt(day));
      const date = new Date(dateStr + "T00:00:00");
      weekdayMoods[date.getDay()].push(moods[day] + 1);
    }

    let bestDay = -1, bestAvg = 0, worstDay = -1, worstAvg = 7;
    for (let wd = 0; wd <= 6; wd++) {
      if (weekdayMoods[wd].length >= 2) {
        const a = avg(weekdayMoods[wd]);
        if (a > bestAvg) { bestAvg = a; bestDay = wd; }
        if (a < worstAvg) { worstAvg = a; worstDay = wd; }
      }
    }

    if (bestDay >= 0 && worstDay >= 0 && bestDay !== worstDay && bestAvg - worstAvg >= 0.5) {
      insights.push({
        text: `${weekdayNames[bestDay]}s are your strongest days (avg mood ${bestAvg.toFixed(1)}/6). ${weekdayNames[worstDay]}s tend to be tougher — plan light on those.`,
        strength: (bestAvg - worstAvg) * 0.8,
      });
    }
  }

  // ── 4. Early bird vs evening pattern (from questCompletedAt) ──
  const morningMoods = [];
  const eveningMoods = [];

  for (const day of moodDays) {
    const times = questCompletedAt[day];
    if (!times || typeof times !== "object") continue;
    const timestamps = Object.values(times).filter(Boolean);
    if (timestamps.length === 0) continue;

    const medianTs = timestamps.sort((a, b) => a - b)[Math.floor(timestamps.length / 2)];
    const hour = new Date(medianTs).getHours();
    const score = moods[day] + 1;

    if (hour < 12) morningMoods.push(score);
    else if (hour >= 18) eveningMoods.push(score);
  }

  if (morningMoods.length >= 3 && eveningMoods.length >= 3) {
    const diff = avg(morningMoods) - avg(eveningMoods);
    if (Math.abs(diff) >= 0.4) {
      insights.push({
        text: diff > 0
          ? `Morning completions link to ${diff.toFixed(1)}-point higher mood vs evening sessions. You thrive by front-loading your quests.`
          : `Evening sessions actually feel better for you — avg ${avg(eveningMoods).toFixed(1)}/6 vs ${avg(morningMoods).toFixed(1)}/6 for mornings.`,
        strength: Math.abs(diff) * 0.85,
      });
    }
  }

  // ── 5. Streak momentum ──
  let streakDayMoods = [];
  let nonStreakMoods = [];
  let currentStreak = 0;

  for (let d = 1; d <= (state.currentDay || 0); d++) {
    const quests = completedQuests[d] || [];
    const hasMood = moods[d] !== undefined && moods[d] !== null;
    const hasActivity = quests.length > 0;

    if (hasActivity) currentStreak++;
    else currentStreak = 0;

    if (hasMood) {
      if (currentStreak >= 3) streakDayMoods.push(moods[d] + 1);
      else nonStreakMoods.push(moods[d] + 1);
    }
  }

  if (streakDayMoods.length >= 3 && nonStreakMoods.length >= 3) {
    const diff = avg(streakDayMoods) - avg(nonStreakMoods);
    if (diff >= 0.4) {
      insights.push({
        text: `On streak days (3+ consecutive), your mood is ${diff.toFixed(1)} points higher — momentum is real for you.`,
        strength: diff * 0.75,
      });
    }
  }

  // ── 6. Category combo detection ──
  const comboCounts = {};
  const catSingleCounts = {};
  const allCatIds = Object.keys(CATEGORY_ACTIONS);

  for (const day of Object.keys(completedQuests)) {
    const quests = completedQuests[day] || [];
    const presentCats = allCatIds.filter((c) => quests.some((q) => q.startsWith(c)));

    for (const c of presentCats) {
      catSingleCounts[c] = (catSingleCounts[c] || 0) + 1;
    }

    for (let i = 0; i < presentCats.length; i++) {
      for (let j = i + 1; j < presentCats.length; j++) {
        const key = [presentCats[i], presentCats[j]].sort().join("+");
        comboCounts[key] = (comboCounts[key] || 0) + 1;
      }
    }
  }

  // Find combo that appears together >70% of either category's solo days
  for (const [combo, count] of Object.entries(comboCounts)) {
    const [c1, c2] = combo.split("+");
    const solo1 = catSingleCounts[c1] || 1;
    const solo2 = catSingleCounts[c2] || 1;
    const coRate = Math.min(count / solo1, count / solo2);

    if (coRate >= 0.7 && count >= 4) {
      const a1 = CATEGORY_ACTIONS[c1] || c1;
      const a2 = CATEGORY_ACTIONS[c2] || c2;
      const label1 = a1.replace(/^(get|take|stay|limit|track|eat|focus on|connect|create) /, "");
      const label2 = a2.replace(/^(get|take|stay|limit|track|eat|focus on|connect|create) /, "");
      insights.push({
        text: `You almost always pair ${label1} with ${label2} — a powerful combo. ${Math.round(coRate * 100)}% of those days include both.`,
        strength: 0.5 + coRate * 0.3,
      });
      break; // one combo insight is enough
    }
  }

  // Sort by signal strength, return top 8 as strings
  return insights
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8)
    .map((ins) => ins.text);
}

/**
 * Returns object with personal records and stats.
 */
export function getPersonalRecords(state) {
  const {
    completedQuests = {},
    completedDays = {},
    streak = 0,
    bestStreak = 0,
  } = state || {};

  const longestStreak = Math.max(streak, bestStreak, 0);

  // Calculate highest day XP
  let highestDayXp = 0;
  for (const day of Object.keys(completedQuests)) {
    const dayXp = estimateDayXP(completedQuests, day);
    if (dayXp > highestDayXp) highestDayXp = dayXp;
  }

  // Find most consistent category
  const categoryCounts = {};
  let totalQuestsCompleted = 0;

  for (const day of Object.keys(completedQuests)) {
    const quests = completedQuests[day];
    if (!Array.isArray(quests)) continue;
    totalQuestsCompleted += quests.length;

    for (const questId of quests) {
      const category = questId.split("-")[0];
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  }

  let mostConsistentCategory = null;
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostConsistentCategory = cat;
    }
  }

  const totalDaysCompleted = Object.keys(completedDays).filter(
    (day) => completedDays[day]
  ).length;

  return {
    longestStreak,
    highestDayXp,
    mostConsistentCategory,
    totalDaysCompleted,
    totalQuestsCompleted,
  };
}

/**
 * Returns array of {date, intensity} for last 90 days.
 * intensity: 0 = no data, 1 = 1-2 quests, 2 = 3-4, 3 = 5, 4 = 6+
 */
export function getHeatmapData(state) {
  const { completedQuests = {}, startDate } = state || {};
  const today = new Date();
  const result = [];

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    const day = startDate ? getDayForDate(startDate, dateStr) : -1;

    let intensity = 0;
    if (day > 0) {
      const quests = completedQuests[day];
      if (Array.isArray(quests) && quests.length > 0) {
        const count = quests.length;
        if (count >= 6) intensity = 4;
        else if (count === 5) intensity = 3;
        else if (count >= 3) intensity = 2;
        else intensity = 1;
      }
    }

    result.push({ date: dateStr, intensity });
  }

  return result;
}
