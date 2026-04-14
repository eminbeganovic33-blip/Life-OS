// Blinkist-style book summaries — curated for each Life OS category.
// Each book has 4-6 key insights the user can mark as "read".

export const BOOKS = [
  // ── Habits & Mindset ──
  {
    id: "atomic_habits",
    title: "Atomic Habits",
    author: "James Clear",
    icon: "⚛️",
    coverImage: "https://covers.openlibrary.org/b/isbn/0735211299-M.jpg",
    category: "general",
    readTime: "12 min",
    coverColor: "#F59E0B",
    description: "Tiny changes, remarkable results. The definitive guide to building good habits and breaking bad ones.",
    insights: [
      {
        title: "The 1% Rule",
        content: "Getting 1% better every day compounds to being 37× better in a year. Habits are the compound interest of self-improvement. Small changes appear to make no difference until you cross a critical threshold.",
      },
      {
        title: "Identity-Based Habits",
        content: "The most effective way to change is to focus on who you wish to become, not what you want to achieve. Every action is a vote for the type of person you want to be. Don't say 'I want to run', say 'I am a runner'.",
      },
      {
        title: "The Four Laws of Behavior Change",
        content: "Make it obvious (cue), make it attractive (craving), make it easy (response), make it satisfying (reward). Invert these to break bad habits: make them invisible, unattractive, difficult, and unsatisfying.",
      },
      {
        title: "Habit Stacking",
        content: "Link new habits to existing ones: 'After I [current habit], I will [new habit].' This uses your brain's existing neural pathways as a foundation.",
      },
      {
        title: "Environment Design",
        content: "Make cues for good habits visible and cues for bad habits invisible. You don't need more motivation — you need a better environment. Every habit is context-dependent.",
      },
    ],
  },
  {
    id: "deep_work",
    title: "Deep Work",
    author: "Cal Newport",
    icon: "🧠",
    coverImage: "https://covers.openlibrary.org/b/isbn/0349411905-M.jpg",
    category: "work",
    readTime: "14 min",
    coverColor: "#3B82F6",
    description: "Rules for focused success in a distracted world.",
    insights: [
      {
        title: "Deep Work Is Rare and Valuable",
        content: "The ability to perform deep work is becoming increasingly rare and increasingly valuable. Those who master it will thrive. Most knowledge workers spend their days in shallows — email, meetings, social media.",
      },
      {
        title: "The Craftsman Approach",
        content: "Treat your profession like a skilled trade. Deliberate practice in a distraction-free state is the only path to elite performance. Talent is overrated; focused repetition is underrated.",
      },
      {
        title: "Schedule Every Minute",
        content: "Time-block your entire day. Give every minute a job. This doesn't make you rigid — it makes you intentional. Without structure, shallow work fills the vacuum.",
      },
      {
        title: "Embrace Boredom",
        content: "If you always reach for your phone when bored, you're training your brain to need constant stimulation. Practice being bored. Your ability to focus is a muscle that atrophies without use.",
      },
      {
        title: "Quit Social Media (or Drastically Reduce)",
        content: "Apply the craftsman approach to tools: adopt a tool only if its positive impacts substantially outweigh its negatives. Most people never do this analysis for social media.",
      },
    ],
  },
  {
    id: "cant_hurt_me",
    title: "Can't Hurt Me",
    author: "David Goggins",
    icon: "🔥",
    coverImage: "https://covers.openlibrary.org/b/isbn/1544512287-M.jpg",
    category: "exercise",
    readTime: "15 min",
    coverColor: "#EF4444",
    description: "Master your mind and defy the odds.",
    insights: [
      {
        title: "The 40% Rule",
        content: "When your mind tells you you're done, you're only at 40% of your capacity. Your brain is a survival machine — it creates an emergency brake well before actual failure. Push through.",
      },
      {
        title: "Accountability Mirror",
        content: "Write your goals and insecurities on Post-it notes and stick them on your mirror. Face them every morning. Brutal honesty with yourself is the foundation of all growth.",
      },
      {
        title: "Callusing Your Mind",
        content: "Intentionally seek out discomfort. Cold showers, hard workouts, difficult conversations. Each uncomfortable experience makes you more resilient. Comfort is the enemy of growth.",
      },
      {
        title: "The Cookie Jar",
        content: "When things get hard, reach into your mental 'cookie jar' — a collection of your past victories and hardships you've overcome. Remind yourself what you're capable of.",
      },
      {
        title: "Uncommon Among Uncommon",
        content: "Don't just be better than average — be uncommon among the uncommon. The second you feel satisfied, you've started dying. There's always more work to do.",
      },
    ],
  },

  // ── Health & Sleep ──
  {
    id: "why_we_sleep",
    title: "Why We Sleep",
    author: "Matthew Walker",
    icon: "😴",
    coverImage: "https://covers.openlibrary.org/b/isbn/1501144324-M.jpg",
    category: "sleep",
    readTime: "16 min",
    coverColor: "#6366F1",
    description: "The new science of sleep and dreams.",
    insights: [
      {
        title: "Sleep Is Non-Negotiable",
        content: "Every major disease that is killing us — Alzheimer's, cancer, obesity, diabetes — all have recognized causal links to insufficient sleep. Sleep is not a luxury; it's a biological necessity.",
      },
      {
        title: "The 8-Hour Minimum",
        content: "You need 7-9 hours of actual sleep (not time in bed). After 10 days of 7 hours, your brain performs as if you stayed awake for 24 hours straight. You can't 'catch up' on weekends.",
      },
      {
        title: "REM vs. Deep Sleep",
        content: "Deep sleep (early night) cleans toxic waste from your brain. REM sleep (late night) integrates memories and processes emotions. Cutting sleep short robs you of REM.",
      },
      {
        title: "Alcohol Destroys Sleep Quality",
        content: "Alcohol is a sedative — it knocks you unconscious but doesn't produce natural sleep. It fragments your sleep and suppresses REM. Even moderate drinking 6 hours before bed measurably impairs sleep.",
      },
    ],
  },
  {
    id: "power_of_now",
    title: "The Power of Now",
    author: "Eckhart Tolle",
    icon: "🧘",
    coverImage: "https://covers.openlibrary.org/b/isbn/1577314808-M.jpg",
    category: "mind",
    readTime: "11 min",
    coverColor: "#8B5CF6",
    description: "A guide to spiritual enlightenment and present-moment awareness.",
    insights: [
      {
        title: "You Are Not Your Mind",
        content: "The voice in your head is not you — it's your mind generating a constant stream of thoughts. The real you is the consciousness that observes those thoughts. Start watching the thinker.",
      },
      {
        title: "The Pain-Body",
        content: "You carry accumulated emotional pain from the past. This 'pain-body' feeds on negative experiences and drama. Once you become aware of it, it loses its power over you.",
      },
      {
        title: "Presence Is the Key",
        content: "The present moment is all you ever have. The past is a memory, the future is imagination. Suffering comes from living in time rather than in the Now.",
      },
      {
        title: "Surrender to What Is",
        content: "Acceptance of the present moment is not passivity — it's clarity. From a place of acceptance, you can take much more effective action than from resistance and frustration.",
      },
    ],
  },

  // ── Productivity & Finance ──
  {
    id: "psychology_of_money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    icon: "💰",
    coverImage: "https://covers.openlibrary.org/b/isbn/0857197681-M.jpg",
    category: "finance",
    readTime: "13 min",
    coverColor: "#10B981",
    description: "Timeless lessons on wealth, greed, and happiness.",
    insights: [
      {
        title: "Wealth Is What You Don't See",
        content: "Wealth is the nice cars not purchased, the upgrades not taken, the jewelry not bought. Wealth is hidden — it's income not spent. Building wealth requires restraint.",
      },
      {
        title: "Compounding Is Magic",
        content: "Warren Buffett's $84.5 billion net worth — $81.5 billion came after his 65th birthday. The key to compounding is time. Start early, be patient, and don't interrupt it.",
      },
      {
        title: "Room for Error",
        content: "The most important part of every plan is planning on your plan not going according to plan. Save for no reason. Build a margin of safety in everything.",
      },
      {
        title: "Enough",
        content: "The hardest financial skill is getting the goalpost to stop moving. If expectations rise with results, there's no logic in striving for more. Know what 'enough' looks like for you.",
      },
    ],
  },
  {
    id: "digital_minimalism",
    title: "Digital Minimalism",
    author: "Cal Newport",
    icon: "📵",
    coverImage: "https://covers.openlibrary.org/b/isbn/0525536515-M.jpg",
    category: "screen",
    readTime: "12 min",
    coverColor: "#EC4899",
    description: "Choosing a focused life in a noisy world.",
    insights: [
      {
        title: "The Attention Economy",
        content: "Tech companies employ teams of engineers whose job is to make their products as addictive as possible. You're not weak for struggling — you're fighting a billion-dollar machine.",
      },
      {
        title: "The 30-Day Declutter",
        content: "Remove all optional technologies from your life for 30 days. Then reintroduce only those that provide a clear, specific benefit. Most people find they need far less than they thought.",
      },
      {
        title: "High-Quality Leisure",
        content: "Replace passive consumption (scrolling, streaming) with active leisure: crafts, exercise, real-world socializing, learning. Your brain needs stimulation, not stimuli.",
      },
      {
        title: "Solitude Deprivation",
        content: "We've created a world where people are rarely alone with their thoughts. This causes anxiety, not alleviates it. Schedule regular time without any input — no phone, no podcast, no music.",
      },
    ],
  },

  // ── Social & Creative ──
  {
    id: "how_to_win_friends",
    title: "How to Win Friends",
    author: "Dale Carnegie",
    icon: "🤝",
    coverImage: "https://covers.openlibrary.org/b/isbn/0671027034-M.jpg",
    category: "social",
    readTime: "14 min",
    coverColor: "#F97316",
    description: "The timeless classic on human relationships and influence.",
    insights: [
      {
        title: "Become Genuinely Interested",
        content: "You can make more friends in two months by becoming interested in other people than you can in two years by trying to get people interested in you.",
      },
      {
        title: "Remember Their Name",
        content: "A person's name is to that person the sweetest sound in any language. Use it often. Make the effort to remember — it shows you care.",
      },
      {
        title: "Make the Other Person Feel Important",
        content: "The deepest urge in human nature is the desire to be important. Give honest appreciation — not flattery. Notice what people do well and tell them.",
      },
      {
        title: "Avoid Arguments",
        content: "The only way to get the best of an argument is to avoid it. You can't win an argument — even if you 'win', the other person will resent you. Seek understanding instead.",
      },
    ],
  },
  {
    id: "show_your_work",
    title: "Show Your Work!",
    author: "Austin Kleon",
    icon: "🎨",
    coverImage: "https://covers.openlibrary.org/b/isbn/0761178975-M.jpg",
    category: "creative",
    readTime: "10 min",
    coverColor: "#14B8A6",
    description: "10 ways to share your creativity and get discovered.",
    insights: [
      {
        title: "You Don't Have to Be a Genius",
        content: "Creativity is not a solo endeavor. Share your process, not just the product. People want to see the work behind the work. Being an amateur is an advantage — you have nothing to lose.",
      },
      {
        title: "Think Process, Not Product",
        content: "Document what you do. Take photos of your work in progress. Write about your methods. Share your influences. People are fascinated by how things are made.",
      },
      {
        title: "Share Something Small Every Day",
        content: "A daily dispatch — a photo, a journal entry, a sketch, a thought. Consistency builds an audience. You don't need to be perfect; you need to be present.",
      },
      {
        title: "Teach What You Know",
        content: "Teaching doesn't diminish your value — it increases it. When you share your knowledge freely, people trust you and want to learn from you.",
      },
    ],
  },
];

export function getBooksByCategory(category) {
  return BOOKS.filter((b) => b.category === category);
}

export function getBookById(id) {
  return BOOKS.find((b) => b.id === id);
}
