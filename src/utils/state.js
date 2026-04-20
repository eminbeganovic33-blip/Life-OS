import { getTodayStr } from "./helpers";

// Generate a date string N days ago
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// ── Production default: completely blank state ──
export const defaultState = () => ({
  startDate: getTodayStr(),
  currentDay: 1,
  xp: 0,
  lifetimeXp: 0,
  streak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  motivationSeen: [],
  onboarded: false,
  pomodoroMinutes: 25,
  // Quests
  completedDays: {},
  completedQuests: {},
  questCompletedAt: {},
  xpByDay: {},          // real XP earned per day (keyed by ISO date string)
  customQuests: [],
  // Journal
  journal: {},
  moods: {},
  // Dojo
  workoutLogs: {},
  liftingStreak: 0,
  bestLiftingStreak: 0,
  lastLiftDate: null,
  // Academy
  courseProgress: {},
  courseXpAwarded: {},
  academyFocus: [],
  stepCompletedAt: {},
  bookProgress: {},
  bookXpAwarded: {},
  // Trophies
  unlockedTrophies: {},
  // Forge
  sobrietyDates: {},
  recoveryJournals: [],
  forgeStoriesSeen: {},
  forgeGoals: {},
  // Sub-streaks
  subStreaks: {},
  // Rest days
  restDays: [],
  // Progression
  bossClears: {},
  masteryMode: false,
  seenMilestones: {},
  // Notifications
  notificationSettings: null,
  weeklySummaryDismissed: null,
  weeklyChallengeClaimed: {},
  // Premium
  premium: {
    plan: null,
    premiumUntil: null,
    subscribedAt: null,
    trialStartedAt: null,
  },
  // Prestige
  prestige: 0,
  prestigeHistory: [],
  // Personalization (set during onboarding)
  userName: null,
  focusCategories: null,
});

// ── Dev seed: 14 days of realistic progress for local development only ──
// Never called in production. Gated behind import.meta.env.DEV in useCloudSync.
export const devSeedState = () => {
  const startDate = daysAgo(14);
  const completedDays = {};
  const completedQuests = {};
  const journal = {};
  const moods = {};
  const xpByDay = {};
  const categories = ["sleep", "water", "exercise", "mind", "screen", "shower"];

  let totalXp = 0;
  for (let day = 1; day <= 13; day++) {
    completedDays[day] = true;
    const numCompleted = day <= 3 ? 4 : day <= 7 ? 5 : 6;
    const dayQuests = [];
    for (let i = 0; i < numCompleted; i++) {
      dayQuests.push(`${categories[i]}-${day}`);
    }
    completedQuests[day] = dayQuests;

    const dayXp = numCompleted * 25;
    const dateForDay = daysAgo(14 - day);
    xpByDay[dateForDay] = dayXp;
    totalXp += dayXp;

    if (day % 2 === 0) {
      journal[day] = day <= 5
        ? "Getting into the routine. Feeling more disciplined already."
        : day <= 10
          ? "Week two energy. The habits are starting to feel natural."
          : "Two weeks in. This is becoming part of who I am.";
    }
    moods[day] = day <= 3 ? 2 : day <= 7 ? 3 : day <= 10 ? 4 : 4;
  }

  const courseProgress = {
    getting_started: { steps: [0, 1, 2, 3, 4], completed: true },
    sleep_optimization: { steps: [0, 1, 2], completed: false },
  };
  const courseXpAwarded = { getting_started: true };
  const stepCompletedAt = {
    sleep_optimization: {
      0: Date.now() - 86400000 * 3,
      1: Date.now() - 86400000 * 2,
      2: Date.now() - 86400000,
    },
  };

  const sobrietyDates = {
    smoking: daysAgo(10),
    social_media: daysAgo(8),
  };
  const forgeGoals = { smoking: 30, social_media: 21 };

  const workoutLogs = {};
  workoutLogs[daysAgo(5)] = [{ exercise: "bench_press", sets: [{ weight: 60, reps: 10 }, { weight: 60, reps: 8 }], time: Date.now() - 86400000 * 5 }];
  workoutLogs[daysAgo(3)] = [{ exercise: "barbell_squat", sets: [{ weight: 80, reps: 8 }, { weight: 80, reps: 6 }], time: Date.now() - 86400000 * 3 }];
  workoutLogs[daysAgo(1)] = [{ exercise: "deadlift", sets: [{ weight: 100, reps: 5 }, { weight: 100, reps: 5 }], time: Date.now() - 86400000 }];

  const customQuests = [
    { id: "cq_1", category: "exercise", text: "20 min morning run" },
    { id: "cq_2", category: "mind", text: "10 min gratitude journaling" },
  ];

  totalXp += 50; // course completion bonus

  return {
    ...defaultState(),
    startDate,
    currentDay: 14,
    xp: totalXp,
    lifetimeXp: totalXp,
    streak: 13,
    bestStreak: 13,
    lastActiveDate: getTodayStr(),
    motivationSeen: [],
    onboarded: true,
    completedDays,
    completedQuests,
    xpByDay,
    journal,
    moods,
    workoutLogs,
    liftingStreak: 3,
    bestLiftingStreak: 3,
    lastLiftDate: daysAgo(1),
    courseProgress,
    courseXpAwarded,
    academyFocus: ["sleep_optimization"],
    stepCompletedAt,
    unlockedTrophies: {
      first_quest: true,
      streak_3: true,
      streak_7: true,
    },
    sobrietyDates,
    recoveryJournals: [],
    forgeStoriesSeen: {},
    forgeGoals,
    customQuests,
  };
};
