// Each course has a skillLevel: "beginner", "intermediate", or "advanced"
// Courses are grouped by category, and the user's assessed level determines which they see first

export const COURSES = [
  // ── Getting Started (always available, no level req) ──
  {
    id: "getting_started",
    title: "Getting Started with Life OS",
    icon: "🚀",
    category: "general",
    levelReq: 0,
    dayUnlock: 1,
    skillLevel: "beginner",
    description: "Your first steps to building lasting habits",
    steps: [
      {
        title: "Understand the habit loop",
        content: "Every habit follows a loop: Cue → Routine → Reward. Your daily quests are the routine. The cue is opening this app. The reward? XP, streaks, and real change.",
        why: "Research by Charles Duhigg shows that understanding this loop is the first step to rewiring behavior.",
      },
      {
        title: "Start small, stay consistent",
        content: "Don't try to be perfect. Complete your quests each day, even if imperfectly. A 2-minute meditation counts. A 5-minute walk counts.",
        why: "BJ Fogg's Tiny Habits research proves that consistency beats intensity for habit formation.",
      },
      {
        title: "Use the Academy",
        content: "Each quest category has courses here in the Academy. They teach you the science and techniques behind every habit — so you know WHY you're doing it.",
        why: "Understanding purpose increases follow-through by 42% according to motivation research.",
      },
      {
        title: "Check in with the Forge",
        content: "If you're trying to quit something (smoking, doomscrolling, etc.), the Forge tracks your progress and gives you daily support messages.",
        why: "Having a dedicated space for quitting habits reduces relapse rates significantly.",
      },
      {
        title: "Track your mood",
        content: "After completing your day, log your mood in the Journal. Over time, Analytics will show you which habits improve your mood the most.",
        why: "Self-awareness is the foundation of lasting behavior change.",
      },
    ],
  },

  // ── Sleep ──
  {
    id: "sleep_hygiene",
    title: "Sleep Optimization",
    icon: "🌙",
    category: "sleep",
    levelReq: 0,
    dayUnlock: 1,
    skillLevel: "beginner",
    description: "Build a sleep routine that actually works",
    steps: [
      {
        title: "Set a non-negotiable bedtime",
        content: "Your body craves routine — same time, every night. Pick a bedtime and commit to it for 2 weeks.",
        why: "Your circadian rhythm takes about 2 weeks to adjust. Consistency is more important than the exact time.",
      },
      {
        title: "Create a wind-down ritual",
        content: "Dim lights 1 hour before bed. No screens 30 min before. Try reading, stretching, or journaling.",
        why: "Blue light suppresses melatonin production by up to 50%. Dimming lights signals your brain to prepare for sleep.",
      },
      {
        title: "Optimize your environment",
        content: "Keep your room cold (18-20°C / 64-68°F), dark, and quiet. Use blackout curtains if needed.",
        why: "Core body temperature needs to drop 1-2°F to initiate sleep. Cool rooms facilitate this naturally.",
      },
      {
        title: "Watch your inputs",
        content: "Avoid caffeine after 2 PM and heavy meals 3 hours before sleep.",
        why: "Caffeine has a half-life of 6 hours. That 3 PM coffee is still 50% active at 9 PM.",
      },
      {
        title: "Handle insomnia properly",
        content: "If you can't sleep after 20 minutes, get up. Read a physical book until drowsy, then return.",
        why: "Lying in bed awake trains your brain to associate bed with wakefulness — the opposite of what you want.",
      },
    ],
  },
  {
    id: "sleep_mastery",
    title: "Circadian Mastery",
    icon: "🌅",
    category: "sleep",
    levelReq: 3,
    dayUnlock: 1,
    skillLevel: "advanced",
    tier: 2,
    description: "Master your biological clock for peak performance",
    steps: [
      {
        title: "Morning light exposure",
        content: "Get 10 minutes of direct sunlight within 30 minutes of waking. This sets your master clock (SCN).",
        why: "The suprachiasmatic nucleus responds to light intensity. Outdoor light (10,000+ lux) is 50x stronger than indoor.",
      },
      {
        title: "Align eating with daylight",
        content: "Time-restricted eating (8-10 hour window) synchronizes peripheral clocks in your liver and gut.",
        why: "Your digestive system has its own circadian rhythm. Eating at odd hours disrupts metabolic efficiency.",
      },
      {
        title: "Temperature manipulation",
        content: "Warm shower 90 min before bed triggers a core temp drop that initiates deep sleep.",
        why: "The post-shower cooling effect mimics the natural temperature drop your body needs for sleep onset.",
      },
      {
        title: "Eliminate artificial light",
        content: "After sunset, use red/amber bulbs only. Blue-blocking glasses are a minimum.",
        why: "Even brief exposure to bright light after dark can shift your circadian rhythm by up to 2 hours.",
      },
      {
        title: "Measure and adjust",
        content: "Track sleep with a wearable. Target 1.5+ hours deep sleep, 1.5+ hours REM. Adjust bedtime until you hit both.",
        why: "You can't improve what you don't measure. Most people are surprised by how little deep sleep they actually get.",
      },
    ],
  },

  // ── Water / Nutrition ──
  {
    id: "hydration",
    title: "Hydration Science",
    icon: "💧",
    category: "water",
    levelReq: 0,
    dayUnlock: 1,
    skillLevel: "beginner",
    description: "Optimize your water intake for energy and focus",
    steps: [
      {
        title: "Calculate your target",
        content: "Your target: 35ml per kg of body weight daily. A 70kg person needs ~2.4L.",
        why: "Even 2% dehydration causes measurable cognitive decline — reduced focus, slower reaction times.",
      },
      {
        title: "Front-load your morning",
        content: "Drink 500ml within the first 30 minutes of waking.",
        why: "You lose 500-700ml of water overnight through breathing. Morning hydration kickstarts your metabolism.",
      },
      {
        title: "Add electrolytes",
        content: "Add a pinch of sea salt or electrolytes to your morning water for better absorption.",
        why: "Plain water without minerals can flush through you too quickly. Electrolytes improve cellular uptake.",
      },
      {
        title: "Pre-meal hydration",
        content: "Drink 250ml 30 minutes before each meal — it aids digestion and prevents overeating.",
        why: "Studies show pre-meal water consumption reduces calorie intake by 75 calories per meal.",
      },
      {
        title: "Read your body's signals",
        content: "Track color, not just volume. Pale yellow = hydrated. Clear = overhydrated. Dark = drink now.",
        why: "Urine color is the most reliable real-time hydration indicator — more accurate than thirst alone.",
      },
    ],
  },
  {
    id: "nutrition",
    title: "Nutrition Fundamentals",
    icon: "🥗",
    category: "water",
    levelReq: 3,
    dayUnlock: 5,
    skillLevel: "intermediate",
    tier: 2,
    description: "Fuel your body for performance and recovery",
    steps: [
      {
        title: "Find your baseline",
        content: "Calculate your TDEE (Total Daily Energy Expenditure). Eat at maintenance for 2 weeks to establish baseline.",
        why: "You can't adjust what you don't know. Most people overestimate or underestimate their needs by 500+ calories.",
      },
      {
        title: "Hit your protein target",
        content: "Protein target: 1.6-2.2g per kg of bodyweight. Spread across 4 meals for optimal muscle protein synthesis.",
        why: "Muscle protein synthesis peaks every 3-4 hours. Spreading protein intake maximizes this anabolic window.",
      },
      {
        title: "Prioritize whole foods",
        content: "If it has more than 5 ingredients or your grandmother wouldn't recognize it, minimize it.",
        why: "Ultra-processed foods are engineered to override satiety signals, leading to overconsumption.",
      },
      {
        title: "Time your macros",
        content: "Largest meal post-workout. Carbs around training, fats away from training. Protein every 3-4 hours.",
        why: "Post-workout nutrient timing takes advantage of increased insulin sensitivity and nutrient partitioning.",
      },
      {
        title: "Build intuition, then let go",
        content: "Track for 2 weeks to build intuition, then eat intuitively. The goal is wisdom, not obsession.",
        why: "Long-term tracking creates anxiety. The purpose is to calibrate your instincts, then trust them.",
      },
    ],
  },

  // ── Exercise ──
  {
    id: "lifting",
    title: "Strength Training Basics",
    icon: "🏋️",
    category: "exercise",
    levelReq: 0,
    dayUnlock: 3,
    skillLevel: "beginner",
    description: "Build a foundation of functional strength",
    steps: [
      {
        title: "Master the Big 5",
        content: "Squat, Bench Press, Deadlift, Overhead Press, Barbell Row. These build 80% of your strength.",
        why: "Compound movements recruit multiple muscle groups simultaneously, maximizing hormonal response and efficiency.",
      },
      {
        title: "Progressive overload",
        content: "Add 2.5kg/5lb each session. When you can't, deload 10% and climb again.",
        why: "Muscles adapt to stress. Without progressive challenge, adaptation stalls. The deload-reload cycle prevents plateaus.",
      },
      {
        title: "Choose your rep range",
        content: "3-5 reps for strength, 8-12 for hypertrophy, 15+ for endurance. Pick your goal.",
        why: "Different rep ranges recruit different muscle fiber types and trigger different hormonal responses.",
      },
      {
        title: "Rest properly between sets",
        content: "Rest 2-3 minutes between heavy sets. Your muscles need ATP to regenerate for peak performance.",
        why: "ATP-PC system (your explosive energy) takes 2-3 minutes to fully replenish. Short rest = weaker sets.",
      },
      {
        title: "Track every set",
        content: "What gets measured gets managed. Use the Dojo workout logger in this app.",
        why: "Training logs let you see plateaus, plan deloads, and celebrate progress you'd otherwise forget.",
      },
    ],
  },
  {
    id: "periodization",
    title: "Training Periodization",
    icon: "📊",
    category: "exercise",
    levelReq: 3,
    dayUnlock: 1,
    skillLevel: "advanced",
    tier: 2,
    description: "Program your training for continuous progress",
    steps: [
      {
        title: "Hypertrophy phase (Weeks 1-4)",
        content: "4 sets × 8-12 reps at 65-75% 1RM. Build the muscle base.",
        why: "Volume is the primary driver of hypertrophy. This phase builds the raw material for strength gains.",
      },
      {
        title: "Strength phase (Weeks 5-8)",
        content: "5 sets × 3-5 reps at 80-90% 1RM. Teach your muscles to fire maximally.",
        why: "Heavy loads train neural efficiency — your brain learns to recruit more motor units simultaneously.",
      },
      {
        title: "Deload phase (Week 9)",
        content: "3 sets × 8 reps at 50% 1RM. Recovery is where growth happens.",
        why: "Accumulated fatigue masks fitness. After a deload, you'll often hit PRs as fatigue dissipates.",
      },
      {
        title: "Track your progress",
        content: "Track your 1RM estimates monthly. Use the formula: Weight × (1 + Reps/30).",
        why: "Estimated 1RM lets you track strength progress without the injury risk of actual max attempts.",
      },
      {
        title: "Rotate your splits",
        content: "Rotate emphasis: push/pull/legs or upper/lower splits. Never train the same muscle group on consecutive days.",
        why: "Muscle protein synthesis peaks 24-48 hours post-training. Training the same muscle too soon interrupts recovery.",
      },
    ],
  },

  // ── Mind ──
  {
    id: "meditation",
    title: "Meditation 101",
    icon: "🧘",
    category: "mind",
    levelReq: 0,
    dayUnlock: 1,
    skillLevel: "beginner",
    description: "Build a sustainable meditation practice from scratch",
    steps: [
      {
        title: "Find your spot",
        content: "Choose a quiet spot. Sit comfortably with your back straight, hands on your knees.",
        why: "A consistent location creates an environmental cue that triggers your meditation habit automatically.",
      },
      {
        title: "Start with breath",
        content: "Close your eyes. Take 3 deep breaths — in through the nose (4s), out through the mouth (6s).",
        why: "The extended exhale activates your parasympathetic nervous system, shifting you from stress to calm.",
      },
      {
        title: "Practice focused attention",
        content: "Focus on your breath. Notice the air entering and leaving. When your mind wanders, gently return.",
        why: "The 'return' is the exercise — like a bicep curl for your attention. Wandering is normal and expected.",
      },
      {
        title: "Build duration gradually",
        content: "Start with 2 minutes. Add 1 minute each week. Consistency beats duration.",
        why: "Habit research shows that frequency matters more than duration. 2 min daily beats 20 min weekly.",
      },
      {
        title: "End with gratitude",
        content: "End each session by noting one thing you're grateful for. Open your eyes slowly.",
        why: "Pairing meditation with gratitude creates a positive association that reinforces the habit loop.",
      },
    ],
  },
  {
    id: "breathwork",
    title: "Advanced Breathwork",
    icon: "🌬️",
    category: "mind",
    levelReq: 2,
    dayUnlock: 1,
    skillLevel: "intermediate",
    description: "Harness your breath for energy, calm, and focus",
    steps: [
      {
        title: "Box Breathing",
        content: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 rounds.",
        why: "Used by Navy SEALs for stress management. Equalizing all phases regulates the autonomic nervous system.",
      },
      {
        title: "Wim Hof Method",
        content: "30 deep breaths (inhale fully, exhale passively), then hold after last exhale as long as possible.",
        why: "Controlled hyperventilation followed by retention trains your body's stress response and boosts adrenaline.",
      },
      {
        title: "4-7-8 Technique",
        content: "Inhale (4s), Hold (7s), Exhale slowly (8s). Activates parasympathetic nervous system.",
        why: "The extended hold and exhale ratio forces CO2 buildup, which paradoxically calms the nervous system.",
      },
      {
        title: "Alternate Nostril Breathing",
        content: "Close right nostril, inhale left (4s). Close left, exhale right (4s). Switch.",
        why: "This technique balances the left and right hemispheres and has been shown to reduce blood pressure.",
      },
      {
        title: "Safety first",
        content: "Practice on an empty stomach. Start with 3 rounds. Never do breathwork in water or while driving.",
        why: "Breath holds can cause lightheadedness. Safety is non-negotiable — these are powerful physiological tools.",
      },
    ],
  },
  {
    id: "stoicism",
    title: "Applied Stoicism",
    icon: "🏛️",
    category: "mind",
    levelReq: 3,
    dayUnlock: 30,
    skillLevel: "advanced",
    tier: 2,
    description: "Ancient philosophy for modern resilience",
    steps: [
      {
        title: "Morning control inventory",
        content: "Ask 'What is in my control today?' Write two columns: controllable vs. uncontrollable. Release column B.",
        why: "Epictetus taught that suffering comes from trying to control the uncontrollable. This exercise prevents that.",
      },
      {
        title: "Negative visualization",
        content: "Spend 2 minutes imagining losing something you value. This builds gratitude, not anxiety.",
        why: "Premeditatio malorum (premeditation of evils) was practiced by Seneca to inoculate against loss and build appreciation.",
      },
      {
        title: "The Dichotomy of Control",
        content: "When frustrated, pause and ask 'Can I change this?' If yes, act. If no, accept.",
        why: "This simple filter eliminates 90% of daily stress. Most of what bothers us is outside our control.",
      },
      {
        title: "Evening review",
        content: "Seneca's method: 'What bad habit did I correct? What virtue did I practice? How am I better?'",
        why: "Daily self-examination was the cornerstone of Stoic practice. It turns each day into a learning opportunity.",
      },
      {
        title: "Daily reading",
        content: "Read one page of Marcus Aurelius' Meditations daily. 2,000 years of wisdom, still undefeated.",
        why: "Written as a private journal by a Roman Emperor under constant pressure. Deeply practical, never preachy.",
      },
    ],
  },

  // ── Screen ──
  {
    id: "dopamine",
    title: "Dopamine Detox Protocol",
    icon: "📵",
    category: "screen",
    levelReq: 0,
    dayUnlock: 21,
    skillLevel: "beginner",
    description: "Reclaim your attention from addictive technology",
    steps: [
      {
        title: "Low Stimulation Day",
        content: "Pick one day per week as your 'Low Stimulation Day.' No social media, no gaming, no junk food.",
        why: "Your dopamine system downregulates with constant stimulation. A break lets receptors recover.",
      },
      {
        title: "Earn your rewards",
        content: "Replace dopamine hits with earned rewards: workout → hot meal, reading → favorite show.",
        why: "Linking rewards to effort retrains your brain to associate pleasure with productive behavior.",
      },
      {
        title: "Add friction",
        content: "Delete apps from your home screen. Log in via browser every time you want to scroll.",
        why: "Behavioral research shows that even 10 seconds of added friction reduces usage by 20-30%.",
      },
      {
        title: "Survive the first 72 hours",
        content: "First 72 hours are hardest. Boredom is the signal your brain is recalibrating — lean into it.",
        why: "Boredom triggers creativity and problem-solving. Your brain is searching for novel stimulation in healthy ways.",
      },
      {
        title: "Reintroduce mindfully",
        content: "Reintroduce stimuli slowly. Ask: 'Does this serve me?' If not, it's noise, not signal.",
        why: "The goal isn't abstinence — it's intentionality. Use technology as a tool, not a pacifier.",
      },
    ],
  },

  // ── Shower ──
  {
    id: "cold_shower",
    title: "Cold Shower Protocol",
    icon: "🥶",
    category: "shower",
    levelReq: 0,
    dayUnlock: 3,
    skillLevel: "beginner",
    description: "Build mental toughness one cold second at a time",
    steps: [
      {
        title: "Start warm",
        content: "Shower normally for 2-3 minutes to relax your muscles.",
        why: "The warm start makes the transition bearable and creates a contrast that amplifies the cold's benefits.",
      },
      {
        title: "Turn it cold — briefly",
        content: "Turn the dial to cold for the last 15 seconds. Focus on breathing slowly.",
        why: "15 seconds is enough to trigger norepinephrine release (up to 530% increase) without overwhelming you.",
      },
      {
        title: "Build duration daily",
        content: "Each day, add 5 seconds. By week 2, aim for 30-60 seconds of cold.",
        why: "Gradual exposure (cold adaptation) trains your brown fat cells and improves thermoregulation over time.",
      },
      {
        title: "Master your breath",
        content: "Breathe through the shock: 4-count inhale, 4-count exhale. Don't hold your breath.",
        why: "The gasp reflex is instinctive but counterproductive. Controlled breathing keeps you in control.",
      },
      {
        title: "Let your body warm itself",
        content: "After exiting, do NOT towel off immediately — let your body generate its own warmth for 30 seconds.",
        why: "This activates thermogenesis, burning calories and building cold resilience faster.",
      },
    ],
  },
];
