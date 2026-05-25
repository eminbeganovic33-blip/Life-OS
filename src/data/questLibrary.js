// QUEST LIBRARY — vetted healthy habits users can browse and add to their roster.
// Each quest is a habit-in-progress, not a one-time task.
// Structure: { id, category, title, icon, why, difficulty, timeOfDay, frequency }
//   difficulty: "easy" | "medium" | "hard"  → XP: 15 / 20 / 30
//   timeOfDay:  "morning" | "midday" | "evening" | "anytime"
//   frequency:  "daily" | "weekdays" | "3x_week" | "weekly" | "monthly"
//
// Tone for `why`: empowering, science-backed, no jargon. 1-2 sentences.

const DIFFICULTY_XP = { easy: 15, medium: 20, hard: 30 };

const QUESTS = [
  // ═══ SLEEP ═══
  { id: "sleep-lights-out-1030",     category: "sleep",     title: "Lights out by 10:30 PM",            icon: "🌙", difficulty: "easy",   timeOfDay: "evening", frequency: "daily",
    why: "Going to bed before 11 PM aligns with your body's natural cortisol rhythm. Deep sleep happens mostly in the first half of the night." },
  { id: "sleep-no-screens-1hr",      category: "sleep",     title: "No screens 1 hour before bed",      icon: "📵", difficulty: "medium", timeOfDay: "evening", frequency: "daily",
    why: "Blue light blocks melatonin production. Even 30 minutes of phone use can delay sleep onset by 90 minutes." },
  { id: "sleep-read-before-bed",     category: "sleep",     title: "Read for 20 minutes before sleep",  icon: "📖", difficulty: "easy",   timeOfDay: "evening", frequency: "daily",
    why: "Reading reduces stress by up to 68% in 6 minutes and serves as a natural pre-sleep ritual." },
  { id: "sleep-cool-bedroom",        category: "sleep",     title: "Cool bedroom (65-68°F / 18-20°C)",  icon: "❄️", difficulty: "easy",   timeOfDay: "evening", frequency: "daily",
    why: "Core body temperature must drop 1-2°F to enter deep sleep. A cool room accelerates this." },
  { id: "sleep-no-snooze",           category: "sleep",     title: "Wake without snoozing",             icon: "⏰", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "Snoozing fragments REM sleep and produces sleep inertia that can linger for 4 hours." },
  { id: "sleep-consistent-wake",     category: "sleep",     title: "Consistent wake time (±30 min)",    icon: "🌅", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "A regular wake time anchors your circadian rhythm. More important than bedtime for sleep quality." },
  { id: "sleep-no-late-food",        category: "sleep",     title: "No food 3 hours before bed",        icon: "🍽️", difficulty: "medium", timeOfDay: "evening", frequency: "daily",
    why: "Late eating raises core body temperature and digestive activity, both of which suppress deep sleep." },
  { id: "sleep-8-hours",             category: "sleep",     title: "Get 8 hours of sleep",              icon: "😴", difficulty: "hard",   timeOfDay: "evening", frequency: "daily",
    why: "Less than 7 hours measurably impairs cognition, immunity, and recovery. 8 is the consistent sweet spot for most adults." },

  // ═══ WATER / HYDRATION ═══
  { id: "water-glass-before-coffee", category: "water",     title: "Glass of water before coffee",      icon: "💧", difficulty: "easy",   timeOfDay: "morning", frequency: "daily",
    why: "You wake up dehydrated. Water before caffeine rehydrates faster and reduces the cortisol spike." },
  { id: "water-2L",                  category: "water",     title: "Drink 2L of water",                 icon: "💧", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "Even 2% dehydration impairs focus and energy. 2L is the baseline minimum for most adults." },
  { id: "water-3L",                  category: "water",     title: "Drink 3L of water",                 icon: "🌊", difficulty: "hard",   timeOfDay: "anytime", frequency: "daily",
    why: "Optimal hydration boosts cognitive performance by 14% and reduces headache frequency by 47%." },
  { id: "water-after-meals",         category: "water",     title: "Water after every meal",            icon: "🚰", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "Stacks a hydration habit onto an existing routine you already have (eating). Habit-stacking is the most reliable formation method." },
  { id: "water-electrolytes",        category: "water",     title: "Electrolytes in morning",           icon: "🧂", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "Sodium + potassium upon waking improves cellular hydration far more than plain water alone." },
  { id: "water-replace-sugary",      category: "water",     title: "Replace 1 sugary drink with water", icon: "🚫", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "A single soda contains your daily added-sugar limit. One swap per day cuts ~150 empty calories." },

  // ═══ EXERCISE ═══
  { id: "exercise-walk-10",          category: "exercise",  title: "10-minute walk",                    icon: "🚶", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "10 minutes of walking improves mood as much as low-dose antidepressants in clinical studies." },
  { id: "exercise-walk-30",          category: "exercise",  title: "30-minute walk",                    icon: "🚶", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "30 minutes of brisk walking 5x/week cuts all-cause mortality risk by ~30%." },
  { id: "exercise-pushups-30",       category: "exercise",  title: "30 push-ups throughout day",        icon: "💪", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "Studies link push-up capacity to cardiovascular health. 30 daily reps builds the foundation." },
  { id: "exercise-squats-100",       category: "exercise",  title: "100 squats throughout day",         icon: "🦵", difficulty: "hard",   timeOfDay: "anytime", frequency: "daily",
    why: "Largest muscle group → biggest metabolic stimulus. Spread across the day = sustainable." },
  { id: "exercise-stairs",           category: "exercise",  title: "Take stairs, not elevator",         icon: "🪜", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "Adds zero-friction NEAT activity. Climbing 8 flights/day lowers mortality by 33%." },
  { id: "exercise-stretch-5",        category: "exercise",  title: "5-minute stretch routine",          icon: "🤸", difficulty: "easy",   timeOfDay: "morning", frequency: "daily",
    why: "Morning mobility primes your nervous system and reduces injury risk for the rest of the day." },
  { id: "exercise-mobility-10",      category: "exercise",  title: "10-min mobility flow",              icon: "🧘", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "Joints heal at the speed of movement. Daily mobility prevents 60% of common adult aches." },
  { id: "exercise-walk-after-lunch", category: "exercise",  title: "Walk after lunch (10 min)",         icon: "🥗", difficulty: "easy",   timeOfDay: "midday",  frequency: "daily",
    why: "Post-meal walking flattens the glucose spike and aids digestion. Best 10 min you can spend." },
  { id: "exercise-sprints",          category: "exercise",  title: "Sprint intervals (4×30s)",          icon: "🏃", difficulty: "hard",   timeOfDay: "evening", frequency: "3x_week",
    why: "VO2max — the strongest predictor of longevity. Sprint intervals improve it faster than steady cardio." },
  { id: "exercise-plank-90s",        category: "exercise",  title: "Plank for 90 seconds",              icon: "🪨", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "Core stability transfers to every movement you make. 90 seconds is the strength benchmark." },
  { id: "exercise-yoga",             category: "exercise",  title: "Yoga session (20 min)",             icon: "🧘", difficulty: "medium", timeOfDay: "evening", frequency: "3x_week",
    why: "Combines mobility, strength, and breath work. Lowers cortisol more than aerobic exercise." },

  // ═══ MIND ═══
  { id: "mind-meditate-5",           category: "mind",      title: "5 minutes of meditation",           icon: "🧘", difficulty: "easy",   timeOfDay: "morning", frequency: "daily",
    why: "Even 5 minutes daily measurably thickens the prefrontal cortex within 8 weeks." },
  { id: "mind-meditate-10",          category: "mind",      title: "10 minutes of meditation",          icon: "🧘", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "10 min/day = the dose used in most clinical anxiety studies. Real, replicable effects." },
  { id: "mind-meditate-20",          category: "mind",      title: "20 minutes of meditation",          icon: "🧘", difficulty: "hard",   timeOfDay: "morning", frequency: "daily",
    why: "20 minutes is where the 'noticeable shift' begins for most practitioners. Default-mode network rewires." },
  { id: "mind-breathwork-5",         category: "mind",      title: "5 minutes of breathwork",           icon: "🌬️", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "Box breathing (4-4-4-4) drops cortisol within 90 seconds. Free, portable, instant." },
  { id: "mind-gratitude-3",          category: "mind",      title: "Write 3 gratitudes",                icon: "🙏", difficulty: "easy",   timeOfDay: "morning", frequency: "daily",
    why: "Daily gratitude journaling raises baseline happiness within 21 days. Studied since 2003." },
  { id: "mind-cold-shower-30s",      category: "mind",      title: "Cold shower finish (30s)",          icon: "🥶", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "30 seconds of cold exposure spikes dopamine by 250% — lasts 4-6 hours. Better than coffee." },
  { id: "mind-cold-shower-2min",     category: "mind",      title: "Cold exposure (2 minutes)",         icon: "🧊", difficulty: "hard",   timeOfDay: "morning", frequency: "daily",
    why: "2 minutes is the threshold for measurable brown fat activation and metabolic boost." },
  { id: "mind-journal-wins",         category: "mind",      title: "Journal 3 wins from yesterday",     icon: "✍️", difficulty: "easy",   timeOfDay: "morning", frequency: "daily",
    why: "Naming wins activates the brain's reward system retroactively. Builds positive identity." },
  { id: "mind-mindful-walk",         category: "mind",      title: "Mindful walk (no phone)",           icon: "🌳", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "20 minutes in nature with no input restores attention as much as a full night's sleep." },
  { id: "mind-deep-work-45",         category: "mind",      title: "45-min single-task block",          icon: "🎯", difficulty: "medium", timeOfDay: "midday",  frequency: "daily",
    why: "Deep work — concentration without distraction — is the rarest skill of the century. Train it daily." },

  // ═══ SCREEN ═══
  { id: "screen-no-phone-first-hour", category: "screen",   title: "No phone first hour awake",         icon: "📵", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "Starting the day on your phone hijacks dopamine and primes anxious focus. Protect this hour." },
  { id: "screen-no-phone-last-hour",  category: "screen",   title: "No phone last hour before bed",     icon: "🌙", difficulty: "medium", timeOfDay: "evening", frequency: "daily",
    why: "Blue light + dopamine spikes destroy sleep architecture. One screen-free hour transforms sleep quality." },
  { id: "screen-phone-other-room",    category: "screen",   title: "Phone in another room while working", icon: "🚪", difficulty: "medium", timeOfDay: "midday", frequency: "daily",
    why: "Phone proximity alone reduces cognitive capacity by 10% — even when it's face-down and silent." },
  { id: "screen-greyscale",           category: "screen",   title: "Greyscale mode all day",            icon: "⚫", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "Color is dopaminergic. Greyscale removes the visual reward that keeps you scrolling." },
  { id: "screen-delete-app",          category: "screen",   title: "Delete one time-waster app",        icon: "🗑️", difficulty: "hard",   timeOfDay: "anytime", frequency: "weekly",
    why: "The friction of re-downloading is enough to break compulsive use. One subtraction per week compounds." },
  { id: "screen-airplane-deep-work",  category: "screen",   title: "Airplane mode during deep work",    icon: "✈️", difficulty: "medium", timeOfDay: "midday",  frequency: "daily",
    why: "Even a single notification preview triggers a 23-minute recovery to refocus. Airplane mode is non-negotiable." },
  { id: "screen-under-4-hours",       category: "screen",   title: "Screen time under 4 hours",         icon: "📱", difficulty: "hard",   timeOfDay: "anytime", frequency: "daily",
    why: "Average user spends 6.5 hrs/day on screens. Dropping to 4 frees 18 hours/week — roughly one workday." },
  { id: "screen-no-social-am",        category: "screen",   title: "No social media before 10 AM",      icon: "📵", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "The first hours set your dopamine baseline for the day. Social feeds reset it to seeking-mode." },

  // ═══ SHOWER / GROOMING ═══
  { id: "shower-cold-30s",            category: "shower",   title: "Cold shower finish (30s)",          icon: "🚿", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "Ends every shower with a confidence-boosting micro-challenge. Easier than you think after week 1." },
  { id: "shower-cold-2min",           category: "shower",   title: "Cold shower (2 minutes)",           icon: "🧊", difficulty: "hard",   timeOfDay: "morning", frequency: "daily",
    why: "Full 2-min cold exposure mimics the metabolic stimulus of intense cardio. Daily builds resilience." },
  { id: "shower-brush-2x",            category: "shower",   title: "Brush teeth twice",                 icon: "🪥", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "Oral health correlates with cardiovascular health. The mouth is the gateway to the bloodstream." },
  { id: "shower-floss",               category: "shower",   title: "Floss every night",                 icon: "🦷", difficulty: "easy",   timeOfDay: "evening", frequency: "daily",
    why: "Flossing reduces inflammation throughout the body, not just the gums. Tiny habit, massive effect." },

  // ═══ NUTRITION ═══
  { id: "nutrition-protein-am",       category: "nutrition", title: "Protein with breakfast (30g+)",    icon: "🥚", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "30g+ protein at breakfast suppresses appetite and stabilizes blood sugar for the next 10 hours." },
  { id: "nutrition-veg-every-meal",   category: "nutrition", title: "Vegetables at every meal",         icon: "🥗", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "Diversity of plant fiber feeds the microbiome. The gut influences mood, focus, and immunity." },
  { id: "nutrition-no-food-after-8",  category: "nutrition", title: "No food after 8 PM",               icon: "🌃", difficulty: "medium", timeOfDay: "evening", frequency: "daily",
    why: "Time-restricted eating improves insulin sensitivity and sleep quality in just two weeks." },
  { id: "nutrition-no-sugar",         category: "nutrition", title: "Skip processed sugar today",       icon: "🚫", difficulty: "hard",   timeOfDay: "anytime", frequency: "daily",
    why: "Sugar primes the same reward pathway as nicotine. One day off resets baseline sensitivity." },
  { id: "nutrition-log-meals",        category: "nutrition", title: "Log all meals",                    icon: "📝", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "Awareness alone reduces calorie intake by ~15% in studies. You can't change what you don't see." },
  { id: "nutrition-whole-food-meal",  category: "nutrition", title: "Eat one whole-food meal",          icon: "🍎", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "Just one ultra-processed-food-free meal per day improves biomarkers within a week." },
  { id: "nutrition-coffee-after-9",   category: "nutrition", title: "First coffee after 9 AM",          icon: "☕", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "Cortisol peaks 8-9 AM naturally. Drinking coffee earlier dulls your natural energy and creates dependence." },
  { id: "nutrition-fast-16-8",        category: "nutrition", title: "Intermittent fast 16:8",           icon: "⏱️", difficulty: "hard",   timeOfDay: "anytime", frequency: "daily",
    why: "16:8 triggers autophagy — cellular cleanup. Lower inflammation, better insulin sensitivity, sharper cognition." },
  { id: "nutrition-meal-prep",        category: "nutrition", title: "Meal prep for tomorrow",           icon: "🥘", difficulty: "medium", timeOfDay: "evening", frequency: "weekly",
    why: "Future-you is more impulsive than current-you. Prep removes the decision when willpower is lowest." },

  // ═══ READING ═══
  { id: "reading-10-pages",           category: "reading",  title: "Read 10 pages",                     icon: "📖", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "10 pages × 365 days = ~12 books per year. Compound learning is the highest-ROI habit." },
  { id: "reading-20-minutes",         category: "reading",  title: "Read 20 minutes",                   icon: "📚", difficulty: "medium", timeOfDay: "evening", frequency: "daily",
    why: "20 minutes lowers heart rate, drops cortisol, and serves as a natural sleep cue." },
  { id: "reading-30-minutes",         category: "reading",  title: "Read 30 minutes",                   icon: "📚", difficulty: "hard",   timeOfDay: "evening", frequency: "daily",
    why: "30 min/day is the dose that correlates with measurable IQ and vocabulary growth in adults." },
  { id: "reading-highlight",          category: "reading",  title: "Highlight one insight",             icon: "🖍️", difficulty: "easy",   timeOfDay: "evening", frequency: "daily",
    why: "Active reading > passive reading. One insight noted = 10x retention vs. just reading through." },
  { id: "reading-audiobook",          category: "reading",  title: "Listen to audiobook on commute",    icon: "🎧", difficulty: "easy",   timeOfDay: "midday",  frequency: "daily",
    why: "Turns dead time into the highest-leverage hours of your week. Commutes are an underused goldmine." },

  // ═══ WORK ═══
  { id: "work-deep-block-45",         category: "work",     title: "45-minute deep work block",         icon: "🧠", difficulty: "medium", timeOfDay: "midday",  frequency: "daily",
    why: "45 min = roughly one ultradian cycle. Your brain peaks then naturally seeks rest. Honor it." },
  { id: "work-deep-block-90",         category: "work",     title: "90-minute deep work block",         icon: "🎯", difficulty: "hard",   timeOfDay: "midday",  frequency: "daily",
    why: "90 min is the elite-performance window. Cal Newport's data: 4 hours/day max — but those 4 are everything." },
  { id: "work-inbox-zero",            category: "work",     title: "Inbox to zero",                     icon: "📧", difficulty: "medium", timeOfDay: "midday",  frequency: "daily",
    why: "Open loops drain working memory. Closing them daily frees up cognitive bandwidth." },
  { id: "work-plan-tomorrow",         category: "work",     title: "Plan tomorrow before logging off",  icon: "📋", difficulty: "easy",   timeOfDay: "evening", frequency: "daily",
    why: "Today's planning is tomorrow's flow state. Five minutes saves 30 of decision fatigue in the AM." },
  { id: "work-mit-first",             category: "work",     title: "Most Important Task first",         icon: "⭐", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "Your first 2 hours are 2-3x more productive than any other window. Spend them on what matters." },
  { id: "work-time-block",            category: "work",     title: "Time-block your day",               icon: "🗓️", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "Untimed tasks expand to fill the day. Time-blocking is the single biggest productivity multiplier." },
  { id: "work-no-meetings-am",        category: "work",     title: "No meetings before 11 AM",          icon: "🛡️", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "Protect peak cognitive hours. Meetings can happen later — deep work cannot." },

  // ═══ SOCIAL ═══
  { id: "social-call-loved",          category: "social",   title: "Call someone you care about",       icon: "📞", difficulty: "easy",   timeOfDay: "evening", frequency: "weekly",
    why: "Social connection predicts longevity more than diet or exercise. Calls > texts > nothing." },
  { id: "social-thank-you",           category: "social",   title: "Send a thank-you message",          icon: "💌", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "Gratitude expressed externally amplifies internally. 30-second message, week-long mood lift." },
  { id: "social-compliment",          category: "social",   title: "Compliment a stranger",             icon: "🤝", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "Specific, sincere compliments make their day and rewire yours toward noticing the good." },
  { id: "social-new-connection",      category: "social",   title: "Connect with one new person",       icon: "👋", difficulty: "medium", timeOfDay: "anytime", frequency: "weekly",
    why: "Weak ties (acquaintances) are responsible for ~80% of life opportunities. Cast a wider net." },
  { id: "social-old-friend",          category: "social",   title: "Reach out to old friend",           icon: "💬", difficulty: "medium", timeOfDay: "anytime", frequency: "weekly",
    why: "Relationships are like plants — they die from neglect, not crisis. Tend them deliberately." },
  { id: "social-deep-convo",          category: "social",   title: "Have a meaningful conversation",    icon: "🗣️", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "Substantive talks (vs. small talk) correlate with higher life satisfaction in long-term studies." },

  // ═══ FINANCE ═══
  { id: "finance-log-purchases",      category: "finance",  title: "Log every purchase today",          icon: "💳", difficulty: "medium", timeOfDay: "evening", frequency: "daily",
    why: "Awareness curbs spending more than any rule. You can't budget what you don't see." },
  { id: "finance-review-weekly",      category: "finance",  title: "Review weekly spending",            icon: "📊", difficulty: "medium", timeOfDay: "evening", frequency: "weekly",
    why: "Weekly review > monthly. Catches drift early, lets you course-correct before damage." },
  { id: "finance-cancel-sub",         category: "finance",  title: "Cancel one unused subscription",    icon: "✂️", difficulty: "hard",   timeOfDay: "anytime", frequency: "monthly",
    why: "Avg adult has $237/mo in forgotten subscriptions. One cancellation = real money found." },
  { id: "finance-save-transfer",      category: "finance",  title: "Transfer to savings",               icon: "🏦", difficulty: "medium", timeOfDay: "evening", frequency: "weekly",
    why: "Automating savings before spending is the #1 wealth-building principle. Pay yourself first." },
  { id: "finance-read-article",       category: "finance",  title: "Read finance article/chapter",      icon: "💰", difficulty: "easy",   timeOfDay: "evening", frequency: "daily",
    why: "Financial literacy is the highest-ROI subject you can study. Compounds for life." },
  { id: "finance-net-worth",          category: "finance",  title: "Track net worth",                   icon: "📈", difficulty: "medium", timeOfDay: "anytime", frequency: "monthly",
    why: "What gets measured improves. Tracking net worth monthly creates accountability to your future self." },

  // ═══ CREATIVE ═══
  { id: "creative-create-30",         category: "creative", title: "30 minutes of focused creating",    icon: "🎨", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "Daily creative output > occasional bursts. Skill compounds through reps, not inspiration." },
  { id: "creative-sketch-15",         category: "creative", title: "Sketch for 15 minutes",             icon: "✏️", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "Drawing trains observation. 15 daily minutes is the dose used in art-therapy clinical trials." },
  { id: "creative-write-200",         category: "creative", title: "Write 200 words",                   icon: "📝", difficulty: "medium", timeOfDay: "morning", frequency: "daily",
    why: "200 words/day = a book per year. Writing also clarifies thinking. Double win." },
  { id: "creative-content",           category: "creative", title: "Make one piece of content",         icon: "🎬", difficulty: "medium", timeOfDay: "anytime", frequency: "daily",
    why: "Building in public compounds skill, network, and luck surface area. Ship daily." },
  { id: "creative-instrument",        category: "creative", title: "Play an instrument",                icon: "🎸", difficulty: "easy",   timeOfDay: "evening", frequency: "daily",
    why: "Music practice is one of the few activities that lights up nearly the entire brain at once." },
  { id: "creative-photograph",        category: "creative", title: "Photograph something beautiful",    icon: "📸", difficulty: "easy",   timeOfDay: "anytime", frequency: "daily",
    why: "Trains your eye to notice beauty. Daily aesthetic appreciation correlates with higher wellbeing." },
];

export const QUEST_LIBRARY = QUESTS;

// Map for O(1) lookup
export const QUEST_LIBRARY_MAP = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

export function getLibraryQuest(id) {
  return QUEST_LIBRARY_MAP[id] || null;
}

export function getXpForDifficulty(difficulty) {
  return DIFFICULTY_XP[difficulty] || 15;
}

export function getLibraryByCategory(categoryId) {
  return QUESTS.filter((q) => q.category === categoryId);
}

// Find a sensible starter quest for a given category — used during migration
export function getStarterForCategory(categoryId) {
  const cat = getLibraryByCategory(categoryId);
  // Prefer "easy" difficulty as the starter
  return cat.find((q) => q.difficulty === "easy") || cat[0] || null;
}

/**
 * Pick `count` quests for a category, calibrated to the user's time
 * commitment. Used by the onboarding questionnaire so users with a "short"
 * budget don't get loaded up with hard quests on Day 1.
 *
 * timeCommitment: 'short' → all easy
 *                 'medium' → one easy + one medium (or just easy if count=1)
 *                 'long'  → mix including a hard option
 */
export function getCalibratedStartersForCategory(categoryId, timeCommitment = "short", count = 1) {
  const cat = getLibraryByCategory(categoryId);
  if (cat.length === 0) return [];
  const easies = cat.filter((q) => q.difficulty === "easy");
  const meds = cat.filter((q) => q.difficulty === "medium");
  const hards = cat.filter((q) => q.difficulty === "hard");

  const picks = [];
  const tryPush = (q) => { if (q && !picks.find((p) => p.id === q.id)) picks.push(q); };

  if (timeCommitment === "long") {
    tryPush(easies[0]);
    if (count >= 2) tryPush(meds[0]);
    if (count >= 3) tryPush(hards[0]);
  } else if (timeCommitment === "medium") {
    tryPush(easies[0]);
    if (count >= 2) tryPush(meds[0] || easies[1]);
    if (count >= 3) tryPush(meds[1] || easies[2]);
  } else {
    // short
    for (let i = 0; i < count; i++) tryPush(easies[i] || cat[i]);
  }
  return picks.slice(0, count);
}
