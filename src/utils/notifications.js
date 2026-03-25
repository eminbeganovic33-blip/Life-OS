const CATEGORY_LABELS = {
  sleep: "Sleep",
  water: "Water",
  exercise: "Exercise",
  mind: "Mind",
  screen: "Screen",
  shower: "Shower",
};

const QUESTS_PER_DAY = 6;
const DAYS_IN_WEEK = 7;
const AVG_XP_PER_QUEST = 15;

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return "denied";
  }
  const result = await Notification.requestPermission();
  return result;
}

export function sendNotification(title, body, icon = "\u26A1") {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }
  try {
    new Notification(title, { body, icon });
    return true;
  } catch {
    return false;
  }
}

export function getDefaultNotificationSettings() {
  return {
    enabled: false,
    coldShowerTime: "07:00",
    noScreensTime: "21:00",
    streakRiskTime: "20:00",
    weeklySummaryDay: 0,
    customReminders: [],
  };
}

export function computeWeeklySummary(state) {
  const { completedQuests = {}, currentDay = 0, moods = {}, xp = 0 } = state;

  const weekDays = [];
  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    weekDays.push(currentDay - i);
  }

  let totalQuests = 0;
  const categoryCounts = {};
  const moodValues = [];

  for (const day of weekDays) {
    const quests = completedQuests[day] || [];
    totalQuests += quests.length;

    for (const questId of quests) {
      const categoryId = questId.split("-")[0];
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
    }

    if (moods[day] !== undefined) {
      moodValues.push(moods[day] + 1);
    }
  }

  const totalPossible = QUESTS_PER_DAY * DAYS_IN_WEEK;
  const completionRate =
    totalPossible > 0
      ? Math.round((totalQuests / totalPossible) * 100)
      : 0;

  let bestCategory = null;
  let maxCount = 0;
  for (const [id, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      bestCategory = {
        id,
        label: CATEGORY_LABELS[id] || id,
        count,
      };
    }
  }

  const moodAvg =
    moodValues.length > 0
      ? Math.round(
          (moodValues.reduce((sum, v) => sum + v, 0) / moodValues.length) * 10
        ) / 10
      : 0;

  const xpThisWeek = totalQuests * AVG_XP_PER_QUEST;

  return {
    totalQuests,
    totalPossible,
    completionRate,
    bestCategory,
    moodAvg,
    xpThisWeek,
  };
}

export function checkStreakAtRisk(state, settingsTime) {
  const { completedQuests = {}, currentDay = 0 } = state;

  const now = new Date();
  const [hours, minutes] = settingsTime.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const thresholdMinutes = hours * 60 + minutes;

  if (currentMinutes < thresholdMinutes) {
    return false;
  }

  const todayQuests = completedQuests[currentDay];
  return !todayQuests || todayQuests.length === 0;
}

export function scheduleNotificationCheck(state, settings, callbacks) {
  const getCurrentHHMM = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const intervalId = setInterval(() => {
    const currentTime = getCurrentHHMM();

    if (settings.customReminders && settings.customReminders.length > 0) {
      for (const reminder of settings.customReminders) {
        if (reminder.time === currentTime && callbacks.onReminder) {
          callbacks.onReminder(reminder.label);
        }
      }
    }

    if (
      callbacks.onStreakRisk &&
      checkStreakAtRisk(state, settings.streakRiskTime)
    ) {
      callbacks.onStreakRisk();
    }
  }, 60_000);

  return intervalId;
}
