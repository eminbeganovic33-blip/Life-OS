// Blinkist-style book summaries — curated for each Life OS category.
// Each book has 4-6 key insights the user can mark as "read".

export const BOOK_CATEGORIES = [
  { id: "all",          label: "All",           icon: "📚" },
  { id: "habits",       label: "Habits",        icon: "🔄" },
  { id: "mindset",      label: "Mindset",       icon: "🧠" },
  { id: "fitness",      label: "Fitness",       icon: "💪" },
  { id: "finance",      label: "Finance",       icon: "💰" },
  { id: "focus",        label: "Focus",         icon: "🎯" },
  { id: "philosophy",   label: "Philosophy",    icon: "🏛️" },
  { id: "business",     label: "Business",      icon: "🚀" },
  { id: "social",       label: "Social",        icon: "🤝" },
  { id: "creative",     label: "Creative",      icon: "🎨" },
  { id: "health",       label: "Health",        icon: "❤️" },
];

export const BOOKS = [
  // ── Habits ──
  {
    id: "atomic_habits",
    title: "Atomic Habits",
    author: "James Clear",
    icon: "⚛️",
    coverImage: "https://covers.openlibrary.org/b/isbn/0735211299-M.jpg",
    category: "habits",
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
    id: "miracle_morning",
    title: "The Miracle Morning",
    author: "Hal Elrod",
    icon: "🌅",
    coverImage: "https://covers.openlibrary.org/b/isbn/0979019710-M.jpg",
    category: "habits",
    readTime: "10 min",
    coverColor: "#FBBF24",
    description: "The not-so-obvious secret to transforming your life before 8 AM.",
    insights: [
      {
        title: "The SAVERS Routine",
        content: "Silence (meditation), Affirmations, Visualization, Exercise, Reading, Scribing (journaling). Do all six every morning. Even 6 minutes total is transformative if you're consistent.",
      },
      {
        title: "You Hit Snooze on Your Life",
        content: "The moment you hit snooze, you're signalling to yourself that your goals are not a priority. How you wake up each day profoundly affects how you live your life.",
      },
      {
        title: "The 5-Minute Rule",
        content: "On hard mornings: accept you feel bad (1 min), reframe discomfort as evidence of progress (1 min), act in spite of how you feel. Motion creates emotion — start moving first.",
      },
      {
        title: "Level 10 Life",
        content: "Rate 10 areas of your life (health, finances, relationships, etc.) on a 1-10 scale. This reveals where the gap between where you are and where you want to be is widest — your focus areas.",
      },
    ],
  },
  {
    id: "power_of_habit",
    title: "The Power of Habit",
    author: "Charles Duhigg",
    icon: "🔄",
    coverImage: "https://covers.openlibrary.org/b/isbn/081298160X-M.jpg",
    category: "habits",
    readTime: "13 min",
    coverColor: "#8B5CF6",
    description: "Why we do what we do in life and business.",
    insights: [
      {
        title: "The Habit Loop",
        content: "Every habit has three parts: Cue (trigger), Routine (behavior), Reward (satisfaction). Understanding this loop is the key to changing any habit. You can't eliminate a habit — only replace the routine.",
      },
      {
        title: "Keystone Habits",
        content: "Some habits spark widespread change across many areas of life. Exercise is the classic example — it improves sleep, diet, focus, and mood. Find your keystone habit and anchor everything else to it.",
      },
      {
        title: "The Golden Rule of Habit Change",
        content: "Keep the same cue and reward, but change the routine. If you smoke when stressed (cue) for relaxation (reward), substitute smoking with a run or deep breathing.",
      },
      {
        title: "Belief Is the Ingredient",
        content: "Habits can be changed, but requires belief — especially in hard times. AA works not because of the steps alone, but because it creates community and belief that change is possible.",
      },
    ],
  },

  // ── Mindset ──
  {
    id: "mindset",
    title: "Mindset",
    author: "Carol S. Dweck",
    icon: "🌱",
    coverImage: "https://covers.openlibrary.org/b/isbn/0345472322-M.jpg",
    category: "mindset",
    readTime: "11 min",
    coverColor: "#10B981",
    description: "The new psychology of success.",
    insights: [
      {
        title: "Fixed vs. Growth Mindset",
        content: "People with a fixed mindset believe their qualities are carved in stone. Those with a growth mindset believe abilities can be developed through dedication and hard work. This view creates a love of learning and resilience.",
      },
      {
        title: "The Power of 'Yet'",
        content: "Change 'I can't do this' to 'I can't do this yet.' This tiny shift signals that failure is feedback, not a verdict. Your brain literally grows when you learn from challenges.",
      },
      {
        title: "Praise Process, Not Intelligence",
        content: "Praising effort, strategy, and improvement encourages a growth mindset. Praising intelligence makes people avoid challenges (to protect their 'smart' label). Focus on how, not what.",
      },
      {
        title: "Champions Have a Growth Mindset",
        content: "Michael Jordan was cut from his high school basketball team. He didn't interpret that as 'I'm not good enough.' He interpreted it as 'I need to work harder.' The fixed mindset person quits; the growth mindset person trains.",
      },
    ],
  },
  {
    id: "subtle_art",
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    icon: "🖕",
    coverImage: "https://covers.openlibrary.org/b/isbn/0062457713-M.jpg",
    category: "mindset",
    readTime: "12 min",
    coverColor: "#EF4444",
    description: "A counterintuitive approach to living a good life.",
    insights: [
      {
        title: "Give a F*ck About Less",
        content: "You have a limited number of f*cks to give. The key to a good life isn't caring about more things — it's caring about fewer, better things that align with your values.",
      },
      {
        title: "Problems Never Go Away",
        content: "Happiness is not solving problems — it's having good problems. The best you can do is choose which problems are worth having. The goal isn't a problem-free life; it's solving meaningful problems.",
      },
      {
        title: "You Are Not Special",
        content: "The belief that you're uniquely entitled to success makes failure devastating. Accepting that you're ordinary removes the pressure to be extraordinary — and ironically makes extraordinary things possible.",
      },
      {
        title: "Action Precedes Motivation",
        content: "Don't wait to feel motivated. Action → Inspiration → Motivation is the real order. You do something, you get inspired by the result, then you feel motivated to keep going. Start before you're ready.",
      },
      {
        title: "Choose Your Values Carefully",
        content: "Bad values (pleasure, wealth as a goal, constant positivity) lead to constant suffering. Good values (honesty, contribution, self-respect) are internally controlled and process-based.",
      },
    ],
  },
  {
    id: "grit",
    title: "Grit",
    author: "Angela Duckworth",
    icon: "💎",
    coverImage: "https://covers.openlibrary.org/b/isbn/1501111116-M.jpg",
    category: "mindset",
    readTime: "11 min",
    coverColor: "#F97316",
    description: "The power of passion and perseverance.",
    insights: [
      {
        title: "Talent Is Overrated",
        content: "Achievement = skill × effort². Effort counts twice — once to build skill, once to produce results. Gritty people often outperform talented people because they keep going when talent runs dry.",
      },
      {
        title: "Passion Is Developed, Not Found",
        content: "The advice to 'follow your passion' is misleading — passion develops through years of deliberate practice. Interest → practice → purpose → hope. It's a journey, not a discovery.",
      },
      {
        title: "The Hard Thing Rule",
        content: "Do at least one hard thing that requires deliberate practice. Pick a thing, don't quit until the season is over, and let your kids choose their own hard thing. No one quits on a bad day.",
      },
      {
        title: "Growth Mindset Is the Foundation of Grit",
        content: "Gritty people believe their abilities can improve. They don't see setbacks as permanent — they see them as feedback. The belief that you can grow is what keeps you going.",
      },
    ],
  },

  // ── Fitness ──
  {
    id: "cant_hurt_me",
    title: "Can't Hurt Me",
    author: "David Goggins",
    icon: "🔥",
    coverImage: "https://covers.openlibrary.org/b/isbn/1544512287-M.jpg",
    category: "fitness",
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
  {
    id: "born_to_run",
    title: "Born to Run",
    author: "Christopher McDougall",
    icon: "🏃",
    coverImage: "https://covers.openlibrary.org/b/isbn/0307266303-M.jpg",
    category: "fitness",
    readTime: "13 min",
    coverColor: "#22C55E",
    description: "A hidden tribe, superathletes, and the greatest race the world has never seen.",
    insights: [
      {
        title: "Humans Are Born to Run",
        content: "The human body evolved over millions of years as a long-distance running machine. Our ancestors literally ran prey to exhaustion — a technique called persistence hunting still used by the Tarahumara.",
      },
      {
        title: "The Shoe Industry Made Us Weaker",
        content: "Modern running shoes with thick cushioning alter natural stride mechanics and may increase injury rates. Barefoot or minimal footwear forces a forefoot strike — the way humans evolved to run.",
      },
      {
        title: "Run with Joy",
        content: "The Tarahumara people — the world's greatest endurance runners — run for fun, celebration, and community. Competitive angst and obsession with performance metrics may be why modern runners get injured.",
      },
      {
        title: "Train Easy, Race Hard",
        content: "80% of your runs should be at a conversational pace. Grinding out hard miles every day leads to overtraining. Save the intensity for when it counts.",
      },
    ],
  },
  {
    id: "spark",
    title: "Spark",
    author: "John J. Ratey",
    icon: "⚡",
    coverImage: "https://covers.openlibrary.org/b/isbn/0316113514-M.jpg",
    category: "fitness",
    readTime: "11 min",
    coverColor: "#3B82F6",
    description: "The revolutionary new science of exercise and the brain.",
    insights: [
      {
        title: "Exercise Is Medicine for the Brain",
        content: "Exercise increases BDNF (brain-derived neurotrophic factor) — literally 'Miracle-Gro for the brain.' It improves learning, memory, mood, and protects against Alzheimer's.",
      },
      {
        title: "Aerobic Exercise Combats Depression",
        content: "30 minutes of aerobic exercise 3× per week is as effective as Zoloft for treating mild-to-moderate depression — with zero side effects. Exercise increases serotonin, dopamine, and norepinephrine.",
      },
      {
        title: "Morning Exercise Primes Learning",
        content: "Students who exercise before school show dramatically better focus, memory, and academic performance. Elevating heart rate for 20 minutes before class improves cognitive readiness for hours.",
      },
      {
        title: "Stress + Recovery = Adaptation",
        content: "Exercise is a controlled stress. The recovery from that stress is what makes you stronger. The same principle applies to learning, relationships, and business — grow through manageable challenge.",
      },
    ],
  },

  // ── Finance ──
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
    id: "rich_dad_poor_dad",
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    icon: "🏠",
    coverImage: "https://covers.openlibrary.org/b/isbn/1612680194-M.jpg",
    category: "finance",
    readTime: "14 min",
    coverColor: "#F59E0B",
    description: "What the rich teach their kids about money that the poor and middle class do not.",
    insights: [
      {
        title: "Assets vs. Liabilities",
        content: "The rich buy assets (things that put money in your pocket). The poor and middle class buy liabilities they think are assets (like houses and cars). The number one rule of wealth: know the difference.",
      },
      {
        title: "Work to Learn, Not for Money",
        content: "Job security means everything in the Industrial Age. Learning means everything in the Information Age. Take a job for what you'll learn, not just what you'll earn.",
      },
      {
        title: "The Rat Race",
        content: "Most people spend their lives trapped: earn money, pay bills, earn more money, spend more. Escape the rat race by building assets that generate passive income exceeding your expenses.",
      },
      {
        title: "Fear and Greed Control Most People",
        content: "The fear of not having enough money and the greed for more are the two emotions that trap people in financial mediocrity. Financial intelligence requires managing both.",
      },
    ],
  },
  {
    id: "i_will_teach_you",
    title: "I Will Teach You to Be Rich",
    author: "Ramit Sethi",
    icon: "📈",
    coverImage: "https://covers.openlibrary.org/b/isbn/0761147489-M.jpg",
    category: "finance",
    readTime: "12 min",
    coverColor: "#22C55E",
    description: "No guilt. No excuses. No BS. Just a 6-week program that works.",
    insights: [
      {
        title: "Automate Your Finances",
        content: "Set up automatic transfers: paycheck → savings → investments → bills → guilt-free spending. Automation removes willpower from the equation. If you have to manually do it, you won't.",
      },
      {
        title: "The Conscious Spending Plan",
        content: "Instead of cutting every latte, spend extravagantly on things you love and ruthlessly cut costs on things you don't. Design a life around your priorities, not generic budgeting advice.",
      },
      {
        title: "Credit Cards Are Powerful Tools",
        content: "Used correctly (paid in full every month), credit cards are free money — rewards, protections, and credit score building. The problem is the behavior, not the card.",
      },
      {
        title: "Start Investing — Now",
        content: "The biggest mistake in personal finance is waiting until you know enough to invest. Open an account today, invest in low-cost index funds, and let time do the work. Perfect is the enemy of good.",
      },
    ],
  },

  // ── Focus / Productivity ──
  {
    id: "deep_work",
    title: "Deep Work",
    author: "Cal Newport",
    icon: "🧠",
    coverImage: "https://covers.openlibrary.org/b/isbn/0349411905-M.jpg",
    category: "focus",
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
    ],
  },
  {
    id: "essentialism",
    title: "Essentialism",
    author: "Greg McKeown",
    icon: "🎯",
    coverImage: "https://covers.openlibrary.org/b/isbn/0804137382-M.jpg",
    category: "focus",
    readTime: "11 min",
    coverColor: "#EC4899",
    description: "The disciplined pursuit of less.",
    insights: [
      {
        title: "Less But Better",
        content: "The Essentialist pursues less but better. If you don't prioritize your life, someone else will. The disciplined pursuit of less enables the undisciplined pursuit of more to be replaced with focused impact.",
      },
      {
        title: "The Paradox of Success",
        content: "Success often breeds failure. You succeed by focusing, gain options, stop focusing, spread thin, lose what made you successful. Essentialism is the antidote: succeed by continuing to focus.",
      },
      {
        title: "If It Isn't a Hell Yes, It's a No",
        content: "When evaluating an opportunity, ask: 'If I weren't already committed to this and someone asked me to join, would I say yes?' Anything less than a clear yes is a no.",
      },
      {
        title: "Build In Buffers",
        content: "Add 50% more time than you think a project will take. Life is unpredictable. Buffers remove the frantic crisis mode that causes poor decisions. Slack is a feature, not a bug.",
      },
    ],
  },
  {
    id: "digital_minimalism",
    title: "Digital Minimalism",
    author: "Cal Newport",
    icon: "📵",
    coverImage: "https://covers.openlibrary.org/b/isbn/0525536515-M.jpg",
    category: "focus",
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

  // ── Philosophy ──
  {
    id: "obstacle_way",
    title: "The Obstacle Is the Way",
    author: "Ryan Holiday",
    icon: "🏛️",
    coverImage: "https://covers.openlibrary.org/b/isbn/1591846358-M.jpg",
    category: "philosophy",
    readTime: "11 min",
    coverColor: "#6366F1",
    description: "The timeless art of turning trials into triumph.",
    insights: [
      {
        title: "Perception Is a Choice",
        content: "The obstacle in the path becomes the path. The same wall that stops you is also something you can walk along, climb, or use as leverage. How you see a problem determines what you can do about it.",
      },
      {
        title: "The Dichotomy of Control",
        content: "Stoics separate what is 'up to us' (judgments, impulses, desires) from what is 'not up to us' (body, reputation, external circumstances). Focus entirely on the first category; release the second.",
      },
      {
        title: "Turn Action Into Practice",
        content: "Every obstacle is practice. Every problem is training. When you accept that life will always have obstacles, you stop wasting energy wishing it was otherwise and start getting better at handling them.",
      },
      {
        title: "Will Is the Final Weapon",
        content: "When perception and action fail — when things are truly outside your control — you still have your will. You can accept what is, endure what must be, and use it to serve a greater purpose.",
      },
    ],
  },
  {
    id: "meditations",
    title: "Meditations",
    author: "Marcus Aurelius",
    icon: "🦁",
    coverImage: "https://covers.openlibrary.org/b/isbn/0140449337-M.jpg",
    category: "philosophy",
    readTime: "10 min",
    coverColor: "#78716C",
    description: "The personal journal of the greatest philosopher-king — a Stoic masterpiece.",
    insights: [
      {
        title: "You Have Power Over Your Mind",
        content: "You have power over your mind, not outside events. Realize this and you will find strength. The quality of your life is determined not by what happens to you, but by how you respond.",
      },
      {
        title: "Memento Mori",
        content: "Remember that you are mortal. Alexander the Great and his muleteer now lie in the same dust. Contemplating death is not morbid — it's clarifying. What actually matters when you step back?",
      },
      {
        title: "Do Less, Better",
        content: "If you seek tranquility, do less. Or more accurately: do what is essential. Most of what we do, say, and think is not essential. Cut the non-essential and you'll find your life expands.",
      },
      {
        title: "The Obstacle Reveals Character",
        content: "The impediment to action advances action. What stands in the way becomes the way. Every difficulty is an opportunity to demonstrate virtue — patience, courage, wisdom.",
      },
    ],
  },
  {
    id: "mans_search",
    title: "Man's Search for Meaning",
    author: "Viktor Frankl",
    icon: "🕯️",
    coverImage: "https://covers.openlibrary.org/b/isbn/0807014273-M.jpg",
    category: "philosophy",
    readTime: "14 min",
    coverColor: "#64748B",
    description: "A Holocaust survivor's reflections on finding purpose in suffering.",
    insights: [
      {
        title: "Meaning Beats Pleasure",
        content: "Man's primary motivational force is the search for meaning — not pleasure (Freud) or power (Adler). Even in unimaginable suffering, those who found meaning survived. Those who lost it perished.",
      },
      {
        title: "The Last Freedom",
        content: "Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom. Everything can be taken from a man but one thing.",
      },
      {
        title: "Suffering Is Not Necessary",
        content: "Frankl didn't teach that suffering was good — he taught that when suffering is unavoidable, finding meaning within it transforms it. Don't seek suffering. But don't let unavoidable pain be wasted.",
      },
      {
        title: "Live as If You're Living for the Second Time",
        content: "Act as though you've already lived your life, made all the mistakes you're about to make, and now have the chance to do it differently. This creates instant moral clarity.",
      },
    ],
  },
  {
    id: "stillness_is_key",
    title: "Stillness Is the Key",
    author: "Ryan Holiday",
    icon: "🧘",
    coverImage: "https://covers.openlibrary.org/b/isbn/0525538585-M.jpg",
    category: "philosophy",
    readTime: "11 min",
    coverColor: "#0EA5E9",
    description: "Ancient wisdom applied to modern chaos.",
    insights: [
      {
        title: "Be Present",
        content: "The mind that is cluttered with the past and future cannot see what is right in front of it. Tiger Woods described his practice of getting 'in the present' before big shots. It's the same for everything important.",
      },
      {
        title: "Limit Your Inputs",
        content: "Stillness requires resisting the urge to constantly fill your mind with news, social media, and noise. You cannot think clearly with a cluttered mind. Protect your attention fiercely.",
      },
      {
        title: "Journaling Creates Clarity",
        content: "Writing forces you to slow down your thoughts and confront them honestly. The journal is a safe space to work through problems before they become crises.",
      },
      {
        title: "Enough",
        content: "The greedy man is never satisfied. He gets more and wants more. The Stoics taught that enough is a mindset, not a number. Stillness comes from being content — not from achieving more.",
      },
    ],
  },

  // ── Business ──
  {
    id: "zero_to_one",
    title: "Zero to One",
    author: "Peter Thiel",
    icon: "🔮",
    coverImage: "https://covers.openlibrary.org/b/isbn/0804139296-M.jpg",
    category: "business",
    readTime: "12 min",
    coverColor: "#6366F1",
    description: "Notes on startups, or how to build the future.",
    insights: [
      {
        title: "Every Moment Happens Once",
        content: "Going from 0→1 is harder and more valuable than 1→n. Copying is easy and competitive. Creating something new is difficult but creates monopoly value. Seek to create, not replicate.",
      },
      {
        title: "Competition Is for Losers",
        content: "Monopoly is the condition of every great business. Google has a monopoly; restaurants compete in a race to zero. The goal isn't to compete — it's to build something so uniquely valuable that competition becomes irrelevant.",
      },
      {
        title: "Secrets Still Exist",
        content: "Great companies are built on secrets — things that are true but that most people don't believe yet. Ask: what valuable company is nobody building? The best opportunities are hidden in plain sight.",
      },
      {
        title: "Sales Matter as Much as Product",
        content: "Engineers underestimate the importance of distribution. A product that doesn't sell is worthless. Superior distribution is often a more sustainable competitive advantage than a superior product.",
      },
    ],
  },
  {
    id: "start_with_why",
    title: "Start with Why",
    author: "Simon Sinek",
    icon: "💡",
    coverImage: "https://covers.openlibrary.org/b/isbn/1591846447-M.jpg",
    category: "business",
    readTime: "12 min",
    coverColor: "#F59E0B",
    description: "How great leaders inspire everyone to take action.",
    insights: [
      {
        title: "The Golden Circle",
        content: "Most companies communicate from the outside in: What → How → Why. Great companies communicate inside out: Why → How → What. People don't buy what you do; they buy why you do it.",
      },
      {
        title: "WHY Is About Biology",
        content: "The limbic brain (feelings, loyalty, trust) doesn't understand language — but it responds to WHY. The neocortex (rational thought) processes WHAT. Inspiring communication bypasses logic and hits feeling first.",
      },
      {
        title: "The Tipping Point Is 15-18%",
        content: "You don't need everyone to buy in to create a movement. When 15-18% of a population adopts an idea, the tipping point is reached and adoption becomes self-sustaining.",
      },
      {
        title: "Leaders Must Know Their Why",
        content: "A leader without a WHY is just someone in charge. When leaders are clear about their purpose, the right people are attracted and the wrong people self-select out.",
      },
    ],
  },
  {
    id: "lean_startup",
    title: "The Lean Startup",
    author: "Eric Ries",
    icon: "🔬",
    coverImage: "https://covers.openlibrary.org/b/isbn/0307887898-M.jpg",
    category: "business",
    readTime: "13 min",
    coverColor: "#22C55E",
    description: "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
    insights: [
      {
        title: "Build-Measure-Learn",
        content: "The core activity of a startup is turning ideas into products, measuring customer response, then deciding whether to pivot or persevere. Speed of this feedback loop is everything.",
      },
      {
        title: "Validated Learning",
        content: "Startups don't exist to make stuff — they exist to learn how to build a sustainable business. Every action should be designed to test a specific assumption about what customers want.",
      },
      {
        title: "The Minimum Viable Product",
        content: "An MVP is not the smallest product imaginable — it's the fastest way to get through the Build-Measure-Learn loop with the maximum amount of validated learning. Don't build more than you need to learn.",
      },
      {
        title: "Pivot or Persevere",
        content: "The pivot is not giving up — it's making a structured course correction. The question is never 'did we execute the plan?' but 'did we learn enough to decide whether to continue or change direction?'",
      },
    ],
  },

  // ── Social ──
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
    id: "never_split_difference",
    title: "Never Split the Difference",
    author: "Chris Voss",
    icon: "🎙️",
    coverImage: "https://covers.openlibrary.org/b/isbn/0062407805-M.jpg",
    category: "social",
    readTime: "13 min",
    coverColor: "#DC2626",
    description: "Negotiating as if your life depended on it — FBI techniques for everyday life.",
    insights: [
      {
        title: "Tactical Empathy",
        content: "The goal of negotiation is not to force agreement but to make the other side feel heard and understood. Tactical empathy — naming their emotions — disarms resistance and builds trust.",
      },
      {
        title: "The Power of 'No'",
        content: "Pushing for 'yes' puts people on guard. Getting to 'no' gives the other party a feeling of safety and control — then real conversation can start. Start with questions that invite a no.",
      },
      {
        title: "Mirroring",
        content: "Repeat the last 1-3 words the other person said. This simple technique makes people expand on what they said, revealing information. Silence after mirroring is golden.",
      },
      {
        title: "Calibrated Questions",
        content: "'How am I supposed to do that?' is the most powerful negotiating sentence. It forces the other side to solve your problem while feeling in control. Always ask 'how' and 'what' — never 'why'.",
      },
    ],
  },

  // ── Creative ──
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
  {
    id: "war_of_art",
    title: "The War of Art",
    author: "Steven Pressfield",
    icon: "⚔️",
    coverImage: "https://covers.openlibrary.org/b/isbn/1936891026-M.jpg",
    category: "creative",
    readTime: "9 min",
    coverColor: "#8B5CF6",
    description: "Break through the blocks and win your inner creative battles.",
    insights: [
      {
        title: "Resistance Is Universal",
        content: "Resistance is the force that stops you from doing your creative work. It's not outside you — it's inside. It will use any tactic: procrastination, fear, rationalization, self-doubt.",
      },
      {
        title: "Turning Pro",
        content: "The amateur plays when inspired. The professional shows up every day regardless of how they feel. Turning pro means treating your creative work with the same discipline as a job.",
      },
      {
        title: "Fear Is the Most Reliable Compass",
        content: "The more Resistance you feel toward a creative project, the more important that project is to your soul's evolution. Fear and Resistance are pointing you toward the work that matters most.",
      },
      {
        title: "Hierarchy vs. Territory",
        content: "Hierarchical thinkers do their work to gain the approval of others. Territorial thinkers do their work because they love the work itself. The territorial orientation is the only sustainable one.",
      },
    ],
  },
  {
    id: "big_magic",
    title: "Big Magic",
    author: "Elizabeth Gilbert",
    icon: "✨",
    coverImage: "https://covers.openlibrary.org/b/isbn/1594634718-M.jpg",
    category: "creative",
    readTime: "11 min",
    coverColor: "#F472B6",
    description: "Creative living beyond fear.",
    insights: [
      {
        title: "Ideas Are Looking for Partners",
        content: "Ideas are living entities. They knock on many doors looking for a willing partner. If you ignore an idea long enough, it leaves and finds someone else. Say yes to creative impulses.",
      },
      {
        title: "Curiosity Over Passion",
        content: "'Follow your passion' is terrible advice — it puts enormous pressure on what should be joyful exploration. Instead, follow your curiosity. It's a gentler, more sustainable guide.",
      },
      {
        title: "Do It Anyway",
        content: "Make your work even if you think it won't matter. Even if no one sees it. Even if no one cares. The act of creation is its own reward. Don't demand results before you start.",
      },
      {
        title: "Creativity Is Not Suffering",
        content: "The tortured artist myth is a lie. You don't have to be miserable to create great work. In fact, when you create from a place of curiosity and play, the work is often more alive.",
      },
    ],
  },

  // ── Health ──
  {
    id: "why_we_sleep",
    title: "Why We Sleep",
    author: "Matthew Walker",
    icon: "😴",
    coverImage: "https://covers.openlibrary.org/b/isbn/1501144324-M.jpg",
    category: "health",
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
    category: "health",
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
  {
    id: "outliers",
    title: "Outliers",
    author: "Malcolm Gladwell",
    icon: "📊",
    coverImage: "https://covers.openlibrary.org/b/isbn/0316017922-M.jpg",
    category: "mindset",
    readTime: "13 min",
    coverColor: "#EF4444",
    description: "The story of success — why some people succeed far more than others.",
    insights: [
      {
        title: "The 10,000-Hour Rule",
        content: "The key to world-class expertise in any skill is practice — roughly 10,000 hours. This isn't just repeated practice; it's deliberate practice with feedback and refinement. Time + intention = mastery.",
      },
      {
        title: "Opportunity Matters as Much as Talent",
        content: "Bill Gates had access to a computer terminal in 1968 — almost no one did. The Beatles played 1,200 shows in Hamburg before they were famous. Opportunity + work ethic, not talent alone, creates outliers.",
      },
      {
        title: "Cultural Legacy Shapes You",
        content: "Where you come from matters more than we think. The cultures, traditions, and norms passed down through generations shape how you think, work, and communicate — often invisibly.",
      },
      {
        title: "The Trouble with Geniuses",
        content: "IQ matters — up to a point. After about 120, additional IQ points contribute diminishing returns. What predicts success above that threshold is practical intelligence, emotional savvy, and opportunity.",
      },
    ],
  },
];

export function getBooksByCategory(category) {
  if (!category || category === "all") return BOOKS;
  return BOOKS.filter((b) => b.category === category);
}

export function getBookById(id) {
  return BOOKS.find((b) => b.id === id);
}
