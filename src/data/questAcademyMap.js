// Quest → Academy course mapping
// Used to surface "Learn why" links on quest cards and suggest quests after course completion.

/** Category → primary course ID */
export const CATEGORY_COURSE_MAP = {
  sleep:     "sleep_hygiene",
  water:     "hydration",
  exercise:  "strength_training",
  mind:      "meditation_basics",
  reading:   "reading_habit",
  nutrition: "nutrition_basics",
  screen:    "dopamine_detox",
  finance:   "money_basics",
  social:    "social_intelligence",
  creative:  "creative_habit",
  shower:    "cold_exposure",
  work:      "deep_work",
  general:   "getting_started",
};

/**
 * Given a quest object (with .category), return the most relevant Academy course ID.
 * Falls back to category-level mapping.
 */
export function getCourseForQuest(quest) {
  if (!quest) return null;
  return CATEGORY_COURSE_MAP[quest.category] || null;
}

/**
 * Given a course ID, return the 2–3 most related quest categories to suggest.
 * Used on AcademyView after course completion.
 */
export const COURSE_QUEST_SUGGESTIONS = {
  sleep_hygiene:      { categories: ["sleep"], tip: "Add a sleep quest to lock in what you just learned." },
  sleep_mastery:      { categories: ["sleep"], tip: "Your sleep knowledge is advanced — challenge yourself daily." },
  hydration:          { categories: ["water"], tip: "Track your water intake every day this week." },
  strength_training:  { categories: ["exercise"], tip: "Hit the Dojo — log a workout to apply this knowledge." },
  meditation_basics:  { categories: ["mind"], tip: "Add a morning meditation quest to build the habit." },
  reading_habit:      { categories: ["reading"], tip: "Schedule a reading quest for tonight." },
  nutrition_basics:   { categories: ["nutrition"], tip: "One nutrition quest per day compounds fast." },
  dopamine_detox:     { categories: ["screen"], tip: "Set a screen-time quest to protect your dopamine baseline." },
  money_basics:       { categories: ["finance"], tip: "A daily finance check-in builds the money habit." },
  cold_exposure:      { categories: ["shower"], tip: "Start with a 30-second cold end to your shower." },
  deep_work:          { categories: ["work"], tip: "Block two hours of deep work into today's quest list." },
  getting_started:    { categories: ["mind", "sleep", "exercise"], tip: "Pick one category and go all-in this week." },
};
