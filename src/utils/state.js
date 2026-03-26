import { getTodayStr } from "./helpers";

// Generate a date string N days ago
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export const defaultState = () => {
  // ── Simulate 14 days of progress for testing ──
  const startDate = daysAgo(14);

  // Build completed quests and days for days 1-13
  const completedDays = {};
  const completedQuests = {};
  const journal = {};
  const moods = {};
  const categories = ["sleep", "water", "exercise", "mind", "screen", "shower"];

  let totalXp = 0;
  for (let day = 1; day <= 13; day++) {
    completedDays[day] = true;
    // Complete 4-6 quests per day (realistic)
    const numCompleted = day <= 3 ? 4 : day <= 7 ? 5 : 6;
    const dayQuests = [];
    for (let i = 0; i < numCompleted; i++) {
      dayQuests.push(`${categories[i]}-${day}`);
      totalXp += 25; // avg XP per quest
    }
    completedQuests[day] = dayQuests;

    // Add some journal entries and moods
    if (day % 2 === 0) {
      journal[day] = day <= 5
        ? "Getting into the routine. Feeling more disciplined already."
        : day <= 10
          ? "Week two energy. The habits are starting to feel natural."
          : "Two weeks in. This is becoming part of who I am.";
    }
    moods[day] = day <= 3 ? 2 : day <= 7 ? 3 : day <= 10 ? 4 : 4;
  }

  // Academy progress — completed getting_started, working on sleep_optimization
  const courseProgress = {
    getting_started: { steps: [0, 1, 2, 3, 4], completed: true },
    sleep_optimization: { steps: [0, 1, 2], completed: false },
  };
  const courseXpAwarded = { getting_started: true };
  const stepCompletedAt = {
    sleep_optimization: { 0: Date.now() - 86400000 * 3, 1: Date.now() - 86400000 * 2, 2: Date.now() - 86400000 },
  };

  // Forge — started tracking smoking and doomscrolling 10 days ago
  const sobrietyDates = {
    smoking: daysAgo(10),
    social_media: daysAgo(8),
  };
  const forgeGoals = {
    smoking: 30,
    social_media: 21,
  };

  // Some workout data
  const workoutLogs = {};
  workoutLogs[daysAgo(5)] = [{ exercise: "bench", sets: [{ weight: 60, reps: 10 }, { weight: 60, reps: 8 }], time: Date.now() - 86400000 * 5 }];
  workoutLogs[daysAgo(3)] = [{ exercise: "squat", sets: [{ weight: 80, reps: 8 }, { weight: 80, reps: 6 }], time: Date.now() - 86400000 * 3 }];
  workoutLogs[daysAgo(1)] = [{ exercise: "deadlift", sets: [{ weight: 100, reps: 5 }, { weight: 100, reps: 5 }], time: Date.now() - 86400000 }];

  // Custom quests (unlocked at day 4)
  const customQuests = [
    { id: "cq_1", category: "exercise", text: "20 min morning run" },
    { id: "cq_2", category: "mind", text: "10 min gratitude journaling" },
  ];

  totalXp += 50; // course completion bonus

  return {
    startDate,
    currentDay: 14,
    xp: totalXp,
    streak: 13,
    bestStreak: 13,
    completedDays,
    completedQuests,
    journal,
    moods,
    lastActiveDate: getTodayStr(),
    motivationSeen: [],
    onboarded: true,
    pomodoroMinutes: 25,
    // Dojo
    workoutLogs,
    liftingStreak: 3,
    bestLiftingStreak: 3,
    lastLiftDate: daysAgo(1),
    // Academy
    courseProgress,
    courseXpAwarded,
    academyFocus: ["sleep_optimization"],
    stepCompletedAt,
    // Trophies
    unlockedTrophies: {
      first_quest: true,  // completed first quest
      streak_3: true,     // 3-day streak
      streak_7: true,     // 7-day streak
    },
    // Forge
    sobrietyDates,
    recoveryJournals: [],
    forgeStoriesSeen: {},
    forgeGoals,
    // Sub-streaks
    subStreaks: {},
    // Custom quests
    customQuests,
    // Progression
    bossClears: {},
    masteryMode: false,
    // Notifications
    notificationSettings: null,
    weeklySummaryDismissed: null,
    // Premium
    premium: {
      plan: null,
      premiumUntil: null,
      subscribedAt: null,
      trialStartedAt: null,
    },
  };
};
