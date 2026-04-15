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

/**
 * Returns array of insight strings comparing mood on days with/without specific categories.
 */
export function getCorrelationInsights(state) {
  const { completedQuests = {}, moods = {} } = state || {};
  const insights = [];

  const categoryLabels = {
    sleep: "get good sleep",
    water: "stay hydrated",
    exercise: "exercise",
    mind: "meditate",
    screen: "limit screen time",
    shower: "take a cold shower",
  };

  const categories = ["sleep", "water", "exercise", "mind", "screen", "shower"];

  for (const category of categories) {
    const moodsWithCategory = [];
    const moodsWithoutCategory = [];

    for (const day of Object.keys(moods)) {
      const moodIndex = moods[day];
      if (moodIndex === undefined || moodIndex === null) continue;

      // Convert 0-5 index to 1-6 scale for display
      const moodScore = moodIndex + 1;

      const quests = completedQuests[day];
      const hasCategory =
        Array.isArray(quests) && quests.some((qId) => qId.startsWith(category));

      if (hasCategory) {
        moodsWithCategory.push(moodScore);
      } else {
        moodsWithoutCategory.push(moodScore);
      }
    }

    // Need at least 3 data points in each group for meaningful insight
    if (moodsWithCategory.length >= 3 && moodsWithoutCategory.length >= 3) {
      const avgWith = (
        moodsWithCategory.reduce((a, b) => a + b, 0) / moodsWithCategory.length
      ).toFixed(1);
      const avgWithout = (
        moodsWithoutCategory.reduce((a, b) => a + b, 0) /
        moodsWithoutCategory.length
      ).toFixed(1);

      const diff = parseFloat(avgWith) - parseFloat(avgWithout);

      if (Math.abs(diff) >= 0.3) {
        const action = categoryLabels[category] || category;
        const pct = Math.abs(Math.round((diff / parseFloat(avgWithout)) * 100));
        if (diff > 0) {
          insights.push(
            `When you ${action}, your mood is ~${pct}% better. Days with: ${avgWith}/6 vs without: ${avgWithout}/6.`
          );
        } else {
          insights.push(
            `Skipping "${action}" seems to correlate with lower mood — avg ${avgWith}/6 vs ${avgWithout}/6 on non-skip days.`
          );
        }
      }
    }
  }

  if (insights.length === 0) {
    insights.push("Keep logging your moods and quests to unlock mood insights!");
  }

  return insights;
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
