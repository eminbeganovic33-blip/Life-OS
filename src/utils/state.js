import { getTodayStr } from "./helpers";

export const defaultState = () => ({
  startDate: getTodayStr(),
  currentDay: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  completedDays: {},
  completedQuests: {},
  journal: {},
  moods: {},
  lastActiveDate: getTodayStr(),
  motivationSeen: [],
  onboarded: false,
  pomodoroMinutes: 25,
  // Dojo
  workoutLogs: {},
  liftingStreak: 0,
  bestLiftingStreak: 0,
  lastLiftDate: null,
  // Academy
  courseProgress: {},
  courseXpAwarded: {}, // permanently tracks which courses awarded their 50 XP
  // Trophies
  unlockedTrophies: {},
  // Forge
  sobrietyDates: {},
  recoveryJournals: [],
  forgeStoriesSeen: {}, // { "smoking-7": true, ... }
  // Sub-streaks
  subStreaks: {},
  // Feature Set 3: Custom quests
  customQuests: [], // [{ id, category, text }]
  // Feature Set 5: Progression lifecycle
  bossClears: {}, // { 21: true, 66: true }
  masteryMode: false, // true after Day 66 cleared — infinite mode
  // Notifications
  notificationSettings: null, // populated from getDefaultNotificationSettings()
  weeklySummaryDismissed: null, // date string of last dismissed weekly summary
  // Phase 6: Premium / Monetization
  premium: {
    plan: null, // "monthly" | "yearly" | null
    premiumUntil: null, // timestamp
    subscribedAt: null, // timestamp
    trialStartedAt: null, // timestamp (null = trial never started)
  },
});
