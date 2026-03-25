// ─── Quest Knowledge Engine ─────────────────────────────────────────────────
// Keyword-matched guidance that surfaces contextual content for every quest.
// Each guide has: tips, steps (actionable), and optionally books/resources.

export const QUEST_GUIDES = {
  // ═══════════════════════════════════════════════════════════════════════════
  // READING & LEARNING
  // ═══════════════════════════════════════════════════════════════════════════
  read: {
    icon: "📖",
    title: "Reading Guide",
    subtitle: "Turn pages into power",
    tips: [
      "Read first thing in the morning — your focus is sharpest before screens take over.",
      "Set a page goal instead of time: 20 pages ≈ 30 min for most people.",
      "Keep a 'commonplace book' — jot down one idea per session that stuck with you.",
    ],
    steps: [
      { label: "Pick your book", detail: "Choose one from the suggestions below. Don't read 5 at once." },
      { label: "Set environment", detail: "Phone in another room. Physical book > e-reader > phone app." },
      { label: "Read actively", detail: "Underline, annotate, or write a 1-sentence summary after each chapter." },
    ],
    books: [
      { title: "Atomic Habits", author: "James Clear", category: "Habits", summary: "Habits are the compound interest of self-improvement. 1% better daily = 37x better in a year. Focus on systems, not goals. Make good habits obvious, attractive, easy, and satisfying. Make bad habits invisible, unattractive, hard, and unsatisfying.", actionQuest: "Read 1 chapter of Atomic Habits" },
      { title: "Deep Work", author: "Cal Newport", category: "Productivity", summary: "The ability to focus without distraction on a cognitively demanding task is becoming rare — and valuable. Schedule deep work blocks. Quit social media for 30 days and see what you miss (nothing). Embrace boredom — if you can't resist checking your phone in a line, you can't do deep work.", actionQuest: "1 hour of deep work with phone off" },
      { title: "Meditations", author: "Marcus Aurelius", category: "Stoicism", summary: "Written by a Roman Emperor to himself. Core ideas: you control your reactions, not events. The obstacle is the way. Memento mori — remember you will die, so act with urgency. Practice negative visualization. Serve others. Your mind is a citadel — don't let externals breach it.", actionQuest: "Read 1 page of Meditations and journal about it" },
      { title: "Why We Sleep", author: "Matthew Walker", category: "Health", summary: "Sleep is the single most effective thing you can do for brain and body health. 7-9 hours is non-negotiable. Sleeping 6 hours for 10 days = cognitive impairment of 24 hours without sleep. Caffeine has a 6-hour half-life. Cool room (18°C) + dark + consistent schedule = optimal sleep.", actionQuest: "Sleep 8 hours tonight" },
      { title: "Can't Hurt Me", author: "David Goggins", category: "Mental Toughness", summary: "Most people only tap 40% of their potential — the '40% Rule.' Callous your mind through voluntary suffering. The accountability mirror: write your insecurities on post-its and face them daily. When you think you're done, you're only at 40%. Embrace the suck.", actionQuest: "Do something uncomfortable for 30 min today" },
      { title: "The Power of Now", author: "Eckhart Tolle", category: "Mindfulness", summary: "You are not your thoughts. The 'pain-body' feeds on negativity — starve it with presence. Past and future exist only in your mind. Observe your thoughts without judgment. The present moment is all you ever have. Surrender to what is.", actionQuest: "Spend 10 min doing nothing — just observing" },
      { title: "Digital Minimalism", author: "Cal Newport", category: "Focus", summary: "Less tech = more life. Do a 30-day digital declutter: remove all optional tech, then reintroduce only what passes a strict test. Solitude is a nutrient — schedule time alone without inputs. Replace high-stimulation leisure with high-quality analog activities.", actionQuest: "1-hour phone-free block today" },
      { title: "Man's Search for Meaning", author: "Viktor Frankl", category: "Psychology", summary: "Those who have a 'why' to live can bear almost any 'how.' Written in Auschwitz. Three sources of meaning: work (creating something), love (experiencing someone), and suffering (choosing your attitude). Freedom is choosing your response to any situation.", actionQuest: "Journal about your personal 'why'" },
      { title: "The Obstacle Is the Way", author: "Ryan Holiday", category: "Stoicism", summary: "Based on Marcus Aurelius. Every obstacle is fuel if you flip your perspective. Three disciplines: Perception (see clearly), Action (act decisively), Will (endure). What stands in the way becomes the way. Amor fati — love your fate, even the hard parts.", actionQuest: "Reframe one problem as an opportunity today" },
      { title: "Tiny Habits", author: "BJ Fogg", category: "Habits", summary: "Forget motivation — design for behavior. Anchor new habits to existing ones: 'After I [existing habit], I will [tiny new habit].' Start absurdly small: 1 push-up, 1 page, 1 deep breath. Celebrate immediately after — emotion creates habit, not repetition alone.", actionQuest: "Anchor one tiny habit to your morning routine" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEDITATION & MINDFULNESS
  // ═══════════════════════════════════════════════════════════════════════════
  meditat: {
    icon: "🧘",
    title: "Meditation Guide",
    subtitle: "Train your mind like a muscle",
    tips: [
      "Start with 2 minutes. Seriously. 2 minutes daily beats 30 minutes once a week.",
      "Your mind WILL wander. That's not failure — noticing it wandered IS the exercise.",
      "Morning meditation sets the tone. Before coffee, before phone, before anything.",
    ],
    steps: [
      { label: "Sit comfortably", detail: "Spine straight, shoulders relaxed, hands on knees. Chair or floor — both fine." },
      { label: "Set a timer", detail: "Use a gentle alarm. Start with 2 min, add 1 min per week." },
      { label: "Focus on breath", detail: "Inhale 4 counts, exhale 6 counts. When mind wanders, gently return. No judgment." },
      { label: "Body scan finish", detail: "Last 30 seconds: scan from toes to head, noticing sensations. Open eyes slowly." },
    ],
    techniques: [
      { name: "Box Breathing", time: "5 min", desc: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat. Used by Navy SEALs for stress." },
      { name: "Body Scan", time: "10 min", desc: "Lie down. Focus attention slowly from toes → calves → thighs → ... → crown. Release tension at each zone." },
      { name: "Loving Kindness", time: "10 min", desc: "Repeat: 'May I be happy. May I be healthy.' Then extend to others: friends, strangers, even enemies." },
      { name: "Noting", time: "Any", desc: "Label each thought as 'thinking,' each feeling as 'feeling,' each sound as 'hearing.' Don't engage — just note and release." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXERCISE & FITNESS
  // ═══════════════════════════════════════════════════════════════════════════
  workout: {
    icon: "💪",
    title: "Workout Guide",
    subtitle: "Build strength that transfers to life",
    tips: [
      "Consistency > intensity. 3 mediocre workouts beat 1 perfect one.",
      "Progressive overload: add weight, reps, or sets each session. Small jumps compound.",
      "Sleep and nutrition are 70% of your results. You don't grow in the gym — you grow recovering.",
    ],
    steps: [
      { label: "Warm up (5 min)", detail: "Light cardio + dynamic stretches. Arm circles, leg swings, hip rotations." },
      { label: "Compound first", detail: "Start with big lifts (squat, bench, deadlift). Save isolation for the end." },
      { label: "Track everything", detail: "Use the Dojo to log sets. What gets measured gets managed." },
      { label: "Cool down", detail: "5 min stretching. Focus on muscles you just worked. Deep breaths." },
    ],
    programs: [
      { name: "Beginner Strength", weeks: 8, frequency: "3x/week", desc: "Squat, Bench, Row on Day A. Deadlift, OHP, Pull-ups on Day B. Alternate. Add 2.5kg each session." },
      { name: "Push/Pull/Legs", weeks: 12, frequency: "6x/week", desc: "Push (chest/shoulders/triceps), Pull (back/biceps), Legs. 2 rotations per week. 4 exercises, 3-4 sets each." },
    ],
  },

  gym: { _aliasOf: "workout" },

  calisthenic: {
    icon: "🤸",
    title: "Calisthenics Guide",
    subtitle: "Master your bodyweight",
    tips: [
      "Calisthenics builds functional strength — you learn to move YOUR body, not just weights.",
      "Progression is everything. Can't do a pull-up? Start with dead hangs, then negatives, then band-assisted.",
      "Aim for 3 sessions/week. Full body each time at beginner level.",
    ],
    steps: [
      { label: "Assess your level", detail: "Can you do 10 push-ups? 1 pull-up? 20 bodyweight squats? Start one step below your max." },
      { label: "Follow progressions", detail: "Each exercise has a ladder. Master one level before moving to the next." },
      { label: "Rest 60-90 seconds", detail: "Between sets. For strength, rest more (2-3 min). For endurance, rest less." },
    ],
    progressions: [
      {
        name: "Push-Up Progression",
        levels: [
          { level: 1, exercise: "Wall Push-Ups", reps: "3 × 15", cue: "Hands on wall at chest height. Body straight. Touch chest to wall." },
          { level: 2, exercise: "Incline Push-Ups", reps: "3 × 12", cue: "Hands on a bench or chair. Lower chest to surface. Elbows 45°." },
          { level: 3, exercise: "Knee Push-Ups", reps: "3 × 10", cue: "Knees on ground, cross ankles. Full range of motion. Core tight." },
          { level: 4, exercise: "Full Push-Ups", reps: "3 × 8", cue: "Toes on ground. Chest 1 inch from floor. Elbows 45°. Squeeze at top." },
          { level: 5, exercise: "Diamond Push-Ups", reps: "3 × 6", cue: "Hands together, index fingers and thumbs form a diamond. Harder on triceps." },
          { level: 6, exercise: "Archer Push-Ups", reps: "3 × 5 each", cue: "Wide stance. Shift weight to one arm as you descend. Builds toward one-arm." },
        ],
      },
      {
        name: "Pull-Up Progression",
        levels: [
          { level: 1, exercise: "Dead Hangs", reps: "3 × 20s", cue: "Hang from bar with straight arms. Build grip and shoulder stability." },
          { level: 2, exercise: "Scapular Pulls", reps: "3 × 10", cue: "Hang and pull shoulder blades down/together without bending elbows." },
          { level: 3, exercise: "Negative Pull-Ups", reps: "3 × 5", cue: "Jump to top position. Lower yourself as slowly as possible (5 seconds)." },
          { level: 4, exercise: "Band-Assisted Pull-Ups", reps: "3 × 6", cue: "Loop band around bar, place foot in loop. Full range of motion." },
          { level: 5, exercise: "Full Pull-Ups", reps: "3 × 5", cue: "Dead hang → chin over bar. No kipping. Squeeze lats at top." },
          { level: 6, exercise: "Weighted Pull-Ups", reps: "3 × 5", cue: "Add 5-10 kg via belt or backpack. The king of upper body exercises." },
        ],
      },
      {
        name: "Squat Progression",
        levels: [
          { level: 1, exercise: "Chair Squats", reps: "3 × 15", cue: "Sit back onto chair, stand up without using hands. Control the descent." },
          { level: 2, exercise: "Bodyweight Squats", reps: "3 × 20", cue: "Feet shoulder-width. Hips back and down. Knees track over toes. Full depth." },
          { level: 3, exercise: "Bulgarian Split Squats", reps: "3 × 10 each", cue: "Rear foot on bench. Drop back knee toward floor. Keep torso upright." },
          { level: 4, exercise: "Jump Squats", reps: "3 × 10", cue: "Full squat → explode up. Land softly. Builds power." },
          { level: 5, exercise: "Pistol Squat (Assisted)", reps: "3 × 5 each", cue: "One leg squat holding a doorframe or TRX for balance." },
          { level: 6, exercise: "Pistol Squat", reps: "3 × 5 each", cue: "Full single-leg squat. Arms forward for balance. The ultimate leg test." },
        ],
      },
      {
        name: "Core Progression",
        levels: [
          { level: 1, exercise: "Dead Bugs", reps: "3 × 10 each", cue: "On back. Opposite arm + leg extend. Lower back stays flat on floor." },
          { level: 2, exercise: "Plank", reps: "3 × 30s", cue: "Forearms and toes. Body straight as a board. Squeeze glutes and abs." },
          { level: 3, exercise: "Hollow Body Hold", reps: "3 × 20s", cue: "On back. Arms overhead, legs straight, lift both off ground. Gymnastics staple." },
          { level: 4, exercise: "Hanging Knee Raises", reps: "3 × 10", cue: "Hang from bar. Knees to chest. Control the descent — no swinging." },
          { level: 5, exercise: "Hanging Leg Raises", reps: "3 × 8", cue: "Straight legs to horizontal. Pause at top. The gold standard of ab exercises." },
          { level: 6, exercise: "Dragon Flags", reps: "3 × 5", cue: "Lie on bench. Lift body straight using only shoulder blades as pivot. Bruce Lee's favorite." },
        ],
      },
    ],
  },

  "push-up": { _aliasOf: "calisthenic" },
  "push up": { _aliasOf: "calisthenic" },
  "pull-up": { _aliasOf: "calisthenic" },
  "pull up": { _aliasOf: "calisthenic" },
  stretching: {
    icon: "🧘",
    title: "Stretching Routine",
    subtitle: "Flexibility is freedom",
    tips: [
      "Never stretch cold muscles. Do 2 min of light movement first.",
      "Hold each stretch 30-60 seconds. Breathe into the stretch — exhale to go deeper.",
      "Consistency matters more than intensity. 10 min daily > 1 hour weekly.",
    ],
    steps: [
      { label: "Neck rolls", detail: "Slow circles both directions. 30 seconds each way." },
      { label: "Shoulder stretch", detail: "Cross arm across chest. Hold 30s each side." },
      { label: "Forward fold", detail: "Stand, fold at hips, reach for toes. Bend knees if needed. 45s." },
      { label: "Hip flexor lunge", detail: "Low lunge, push hips forward. 30s each side. Crucial if you sit all day." },
      { label: "Pigeon pose", detail: "Front shin parallel to mat, back leg extended. Deep hip opener. 45s each." },
      { label: "Spinal twist", detail: "Seated, cross one leg over, twist toward it. 30s each side." },
    ],
  },

  steps: {
    icon: "🚶",
    title: "10K Steps Guide",
    subtitle: "The easiest health hack that works",
    tips: [
      "Walking is the most underrated exercise. It burns fat, reduces cortisol, and boosts creativity.",
      "Split it up: 3K morning walk + 3K lunch walk + 4K evening = done without 'exercise'.",
      "Take calls walking. Park far away. Stairs over elevator. It adds up fast.",
    ],
    steps: [
      { label: "Morning walk (15 min)", detail: "Sunlight + movement first thing. Sets circadian rhythm. No phone ideally." },
      { label: "Walking meetings", detail: "Take phone calls on foot. Walk-and-talk. Some of the best ideas happen while walking." },
      { label: "Evening stroll (20 min)", detail: "Post-dinner walk aids digestion, lowers blood sugar spikes, and improves sleep." },
    ],
  },

  run: {
    icon: "🏃",
    title: "Running Guide",
    subtitle: "Start where you are",
    tips: [
      "If you can't run 5 minutes straight, that's your starting point. No shame. Walk/run intervals.",
      "80% of your runs should be conversational pace — you should be able to talk. This builds your aerobic base.",
      "Increase weekly distance by no more than 10% to avoid injury.",
    ],
    steps: [
      { label: "Week 1-2", detail: "Run 1 min → Walk 2 min. Repeat 8x. Three times per week." },
      { label: "Week 3-4", detail: "Run 2 min → Walk 1 min. Repeat 8x. Focus on breathing rhythm." },
      { label: "Week 5-6", detail: "Run 5 min → Walk 1 min. Repeat 4x. You're building now." },
      { label: "Week 7-8", detail: "Run 10 min → Walk 1 min → Run 10 min. Almost there." },
      { label: "Week 9+", detail: "Continuous 20-30 minute run at easy pace. Congratulations — you're a runner." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COLD EXPOSURE
  // ═══════════════════════════════════════════════════════════════════════════
  "cold shower": {
    icon: "🥶",
    title: "Cold Shower Protocol",
    subtitle: "Discomfort is the shortcut to growth",
    tips: [
      "Cold water triggers norepinephrine release — a 200-300% spike. Natural antidepressant.",
      "Your body adapts. What feels brutal on day 1 feels normal by day 14.",
      "Breathe SLOWLY through the shock. 4 count in, 4 count out. Don't hold your breath.",
    ],
    steps: [
      { label: "Week 1", detail: "End your normal shower with 15 seconds of cold. Focus on breathing." },
      { label: "Week 2", detail: "30 seconds cold. Start to notice you recover faster each time." },
      { label: "Week 3", detail: "60 seconds cold. You might actually start to enjoy it." },
      { label: "Week 4+", detail: "2-3 minutes cold. Full benefits: mood boost, reduced inflammation, increased willpower." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SLEEP
  // ═══════════════════════════════════════════════════════════════════════════
  sleep: {
    icon: "🌙",
    title: "Sleep Optimization",
    subtitle: "Sleep is a performance enhancer",
    tips: [
      "Consistent bed/wake times matter more than total hours. Your circadian rhythm craves routine.",
      "Room temp 18-20°C (64-68°F). Your core temp must drop to initiate sleep.",
      "No caffeine after 2 PM. Half-life is 6 hours — a 2 PM coffee is still in your system at 8 PM.",
    ],
    steps: [
      { label: "Set a hard cutoff", detail: "Pick a bedtime and honor it like a meeting. Alarm for 'start winding down' 60 min before." },
      { label: "Kill the screens", detail: "No screens 30 min before bed. Blue light suppresses melatonin by up to 50%." },
      { label: "Cool & dark", detail: "Blackout curtains. Room temp 18-20°C. Consider a warm shower 90 min before — the temp drop after initiates drowsiness." },
      { label: "Dump your brain", detail: "Write tomorrow's to-do list before bed. Unfinished tasks keep the brain on alert." },
    ],
  },

  phone: {
    icon: "📵",
    title: "Digital Boundaries",
    subtitle: "Reclaim your attention",
    tips: [
      "Your phone is an attention slot machine. Every notification is a pull of the lever.",
      "The average person checks their phone 96 times per day. Each check costs 23 min of focus recovery.",
      "Replace the habit loop: when you feel the urge to scroll, do 5 deep breaths instead.",
    ],
    steps: [
      { label: "Remove from bedroom", detail: "Buy a $10 alarm clock. Your phone charges in another room overnight." },
      { label: "Delete social from home screen", detail: "Move apps to a folder on page 3. Add friction. Use browser versions instead." },
      { label: "Grayscale mode", detail: "Settings → Accessibility → Color Filters → Grayscale. Removes the dopamine of colorful interfaces." },
      { label: "Set app timers", detail: "Most phones have Screen Time / Digital Wellbeing. Set 30 min limits on social apps." },
    ],
  },

  screen: { _aliasOf: "phone" },

  // ═══════════════════════════════════════════════════════════════════════════
  // NUTRITION & WATER
  // ═══════════════════════════════════════════════════════════════════════════
  water: {
    icon: "💧",
    title: "Hydration Protocol",
    subtitle: "Your brain is 75% water",
    tips: [
      "Dehydration of just 2% impairs cognitive performance. You're probably dehydrated right now.",
      "Pale yellow urine = hydrated. Clear = overhydrated (flushing electrolytes). Dark = drink now.",
      "Add a pinch of sea salt to morning water — electrolytes improve absorption by 25%.",
    ],
    steps: [
      { label: "500ml upon waking", detail: "Before coffee, before food. Your body is dehydrated after 8 hours of sleep." },
      { label: "250ml before each meal", detail: "Aids digestion, prevents overeating. 30 min before eating for best results." },
      { label: "Carry a bottle", detail: "Visible water = more drinking. Fill a 1L bottle twice = done for the day." },
    ],
    nutrition: [
      { name: "Morning Electrolyte Water", ingredients: "500ml water + pinch of sea salt + squeeze of lemon", benefit: "Rehydrates, replenishes minerals, kickstarts digestion" },
      { name: "Post-Workout Hydration", ingredients: "750ml water + 1/4 tsp salt + splash of orange juice", benefit: "Replaces sodium and potassium lost in sweat" },
    ],
  },

  sugar: {
    icon: "🍬",
    title: "Sugar-Free Guide",
    subtitle: "Break the sweetest addiction",
    tips: [
      "Sugar activates the same brain pathways as cocaine. The cravings are real and biological.",
      "Days 1-3 are hardest. After day 7, taste buds recalibrate and fruit tastes like candy.",
      "Read labels: sugar hides as dextrose, maltose, corn syrup, agave, 'natural flavors.'",
    ],
    steps: [
      { label: "Identify hidden sugars", detail: "Check everything: sauces, bread, yogurt, 'healthy' snacks. If sugar is in top 3 ingredients, skip it." },
      { label: "Replace, don't eliminate", detail: "Craving something sweet? Berries, dark chocolate (85%+), or frozen grapes." },
      { label: "Eat protein + fat first", detail: "Starting meals with protein stabilizes blood sugar and prevents the crash-then-crave cycle." },
    ],
    nutrition: [
      { name: "Craving Killer Smoothie", ingredients: "Frozen berries + spinach + protein powder + almond butter + water", benefit: "Sweet taste, high protein, stable blood sugar" },
      { name: "Savory Snack Swap", ingredients: "Apple slices + 2 tbsp almond butter + cinnamon", benefit: "Fiber + fat = sustained energy without sugar crash" },
    ],
  },

  journal: {
    icon: "📝",
    title: "Journaling Guide",
    subtitle: "Write your way to clarity",
    tips: [
      "Don't aim for perfection. Stream of consciousness is fine. The act of writing IS the benefit.",
      "Morning journals plan the day. Evening journals process the day. Both work — pick one.",
      "Gratitude journaling rewires the brain: 3 things you're grateful for, every night. Simple but transformative.",
    ],
    steps: [
      { label: "Pick a prompt", detail: "If blank page is scary: 'What's on my mind?' or 'What would make today great?' or 'What did I learn?'" },
      { label: "Write for 5 min", detail: "Set a timer. Don't stop writing. If stuck, write 'I don't know what to write' until something comes." },
      { label: "Review weekly", detail: "Every Sunday, scan your week's entries. Patterns emerge: what triggers stress, joy, productivity." },
    ],
  },

  learn: {
    icon: "🧠",
    title: "Learning Guide",
    subtitle: "Become a knowledge machine",
    tips: [
      "The Feynman Technique: explain the concept to a 12-year-old. If you can't, you don't understand it yet.",
      "Spaced repetition: review material at increasing intervals (1 day, 3 days, 7 days, 14 days).",
      "Active recall > passive review. Close the book and try to remember. The struggle is the learning.",
    ],
    steps: [
      { label: "Choose ONE thing", detail: "Don't learn 5 topics. Pick one and go deep. Breadth comes later." },
      { label: "25-min focus blocks", detail: "Pomodoro technique: 25 min study → 5 min break. Use the Focus Timer in this app." },
      { label: "Teach someone", detail: "Explain what you learned to a friend, or write it down as if teaching. Teaching = mastery." },
    ],
  },

  skincare: {
    icon: "✨",
    title: "Skincare Basics",
    subtitle: "Simple routine, real results",
    tips: [
      "The best skincare routine is one you'll actually do. Start with 3 products max.",
      "Sunscreen is the #1 anti-aging product. SPF 30+ every day, even cloudy days.",
      "Your skin reflects your habits: sleep, water, diet, and stress show on your face first.",
    ],
    steps: [
      { label: "Cleanser (AM & PM)", detail: "Gentle, non-foaming. Removes dirt and oil without stripping. CeraVe or Cetaphil are solid starts." },
      { label: "Moisturizer (AM & PM)", detail: "Even oily skin needs moisture. Look for 'non-comedogenic' (won't clog pores)." },
      { label: "Sunscreen (AM only)", detail: "SPF 30-50. Apply as last skincare step, before makeup. Reapply every 2 hours in sun." },
    ],
  },

  vitamin: {
    icon: "💊",
    title: "Essential Supplements",
    subtitle: "Fill the gaps in your nutrition",
    tips: [
      "Food first, supplements second. No pill replaces a balanced diet.",
      "Vitamin D deficiency affects 42% of adults. If you don't get 20 min of sun daily, supplement.",
      "Take fat-soluble vitamins (A, D, E, K) with a meal containing fat for 2-3x better absorption.",
    ],
    steps: [
      { label: "Vitamin D3 (2000-4000 IU)", detail: "Take with breakfast. The 'sunshine vitamin' — crucial for mood, immunity, and bone health." },
      { label: "Magnesium Glycinate (200-400mg)", detail: "Take before bed. Improves sleep, reduces muscle cramps, calms the nervous system." },
      { label: "Omega-3 (1000-2000mg EPA/DHA)", detail: "Take with a meal. Anti-inflammatory, brain health, heart health. Fish oil or algae-based." },
    ],
  },
};

/**
 * Find the best matching guide for a quest text.
 * Returns the guide object or null if no match.
 */
export function findGuideForQuest(questText) {
  const lower = questText.toLowerCase();
  let bestMatch = null;
  let bestLen = 0;

  for (const [keyword, guide] of Object.entries(QUEST_GUIDES)) {
    if (lower.includes(keyword) && keyword.length > bestLen) {
      // Resolve aliases
      const resolved = guide._aliasOf ? QUEST_GUIDES[guide._aliasOf] : guide;
      if (resolved && !resolved._aliasOf) {
        bestMatch = resolved;
        bestLen = keyword.length;
      }
    }
  }

  return bestMatch;
}
