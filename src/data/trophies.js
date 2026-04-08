export const TROPHIES = [
  // ── Category Streaks — Tiered ──
  // Water
  { id: "hydration_hero", name: "Hydration Hero", icon: "💧", desc: "Complete water quests for 7 days", category: "water", daysReq: 7, xpReward: 100, tier: 1 },
  { id: "hydration_master", name: "Hydration Master", icon: "🌊", desc: "Complete water quests for 21 days", category: "water", daysReq: 21, xpReward: 200, tier: 2 },
  // Sleep
  { id: "early_bird", name: "Early Bird", icon: "🐦", desc: "Complete sleep quests for 5 days", category: "sleep", daysReq: 5, xpReward: 80, tier: 1 },
  { id: "sleep_architect", name: "Sleep Architect", icon: "🌙", desc: "Complete sleep quests for 21 days", category: "sleep", daysReq: 21, xpReward: 200, tier: 2 },
  // Mind
  { id: "deep_thinker", name: "Deep Thinker", icon: "🧠", desc: "Complete mind quests for 10 days", category: "mind", daysReq: 10, xpReward: 120, tier: 1 },
  { id: "zen_master", name: "Zen Master", icon: "🧘", desc: "Complete mind quests for 30 days", category: "mind", daysReq: 30, xpReward: 250, tier: 2 },
  // Shower
  { id: "cold_warrior", name: "Cold Warrior", icon: "🥶", desc: "Complete shower quests for 7 days", category: "shower", daysReq: 7, xpReward: 100, tier: 1 },
  { id: "ice_breaker", name: "Ice Breaker", icon: "❄️", desc: "Complete shower quests for 21 days", category: "shower", daysReq: 21, xpReward: 200, tier: 2 },
  // Screen
  { id: "digital_monk", name: "Digital Monk", icon: "📵", desc: "Complete screen quests for 10 days", category: "screen", daysReq: 10, xpReward: 120, tier: 1 },
  { id: "digital_ascetic", name: "Digital Ascetic", icon: "🔇", desc: "Complete screen quests for 30 days", category: "screen", daysReq: 30, xpReward: 250, tier: 2 },
  // Exercise
  { id: "first_sweat", name: "First Sweat", icon: "💪", desc: "Complete exercise quests for 5 days", category: "exercise", daysReq: 5, xpReward: 80, tier: 1 },
  { id: "iron_athlete", name: "Iron Athlete", icon: "🏋️", desc: "Complete exercise quests for 21 days", category: "exercise", daysReq: 21, xpReward: 200, tier: 2 },
  // Nutrition
  { id: "clean_eater", name: "Clean Eater", icon: "🥗", desc: "Complete nutrition quests for 7 days", category: "nutrition", daysReq: 7, xpReward: 100, tier: 1 },
  { id: "nutrition_guru", name: "Nutrition Guru", icon: "🍎", desc: "Complete nutrition quests for 21 days", category: "nutrition", daysReq: 21, xpReward: 200, tier: 2 },
  // Reading
  { id: "bookworm", name: "Bookworm", icon: "📖", desc: "Complete reading quests for 7 days", category: "reading", daysReq: 7, xpReward: 100, tier: 1 },
  { id: "bibliophile", name: "Bibliophile", icon: "📚", desc: "Complete reading quests for 21 days", category: "reading", daysReq: 21, xpReward: 200, tier: 2 },

  // ── Consistency / All-Quest Streaks ──
  { id: "first_week", name: "First Week", icon: "✨", desc: "Complete all quests for 7 days", category: "all", daysReq: 7, xpReward: 150, tier: 1 },
  { id: "iron_will", name: "Iron Will", icon: "⚔️", desc: "Complete all quests for 14 days", category: "all", daysReq: 14, xpReward: 200, tier: 2 },
  { id: "unstoppable", name: "Unstoppable", icon: "⚡", desc: "Complete all quests for 30 days", category: "all", daysReq: 30, xpReward: 350, tier: 3 },

  // ── Dojo ──
  { id: "first_rep", name: "First Rep", icon: "🎯", desc: "Log your first workout", category: "dojo", countReq: 1, xpReward: 50, tier: 1 },
  { id: "beast_mode", name: "Beast Mode", icon: "🦁", desc: "Log 10 workouts in the Dojo", category: "dojo", countReq: 10, xpReward: 150, tier: 2 },
  { id: "iron_addict", name: "Iron Addict", icon: "🔩", desc: "Log 30 workouts in the Dojo", category: "dojo", countReq: 30, xpReward: 300, tier: 3 },
  { id: "gym_rat", name: "Gym Rat", icon: "🐀", desc: "Move 10,000 kg total in the Dojo", category: "dojo", volumeReq: 10000, xpReward: 200 },
  { id: "titan", name: "Titan", icon: "🗿", desc: "Move 50,000 kg total in the Dojo", category: "dojo", volumeReq: 50000, xpReward: 400 },

  // ── Academy ──
  { id: "first_lesson", name: "First Lesson", icon: "📝", desc: "Complete your first Academy course", category: "academy", countReq: 1, xpReward: 75, tier: 1 },
  { id: "scholar", name: "Scholar", icon: "🎓", desc: "Complete 3 Academy courses", category: "academy", countReq: 3, xpReward: 150, tier: 2 },
  { id: "professor", name: "Professor", icon: "🏛️", desc: "Complete 6 Academy courses", category: "academy", countReq: 6, xpReward: 300, tier: 3 },

  // ── Forge ──
  { id: "phoenix", name: "Phoenix Rising", icon: "🔥", desc: "Recover from a Forge relapse 3 times", category: "forge", countReq: 3, xpReward: 100, tier: 1 },
  { id: "resilient", name: "Resilient", icon: "🛡️", desc: "Recover from 7 relapses — you never quit", category: "forge", countReq: 7, xpReward: 200, tier: 2 },

  // ── Journey Milestones ──
  { id: "first_step", name: "First Step", icon: "👣", desc: "Complete Day 1", category: "milestone", dayReq: 1, xpReward: 50, tier: 1 },
  { id: "week_one", name: "Week One", icon: "🗓️", desc: "Reach Day 7", category: "milestone", dayReq: 7, xpReward: 100, tier: 1 },
  { id: "halfway", name: "Halfway There", icon: "⛰️", desc: "Reach Day 33", category: "milestone", dayReq: 33, xpReward: 250, tier: 2 },
  { id: "legend", name: "Legend", icon: "👑", desc: "Complete the full 66-day journey", category: "milestone", dayReq: 66, xpReward: 500, tier: 3 },
  { id: "centurion", name: "Centurion", icon: "💎", desc: "Reach Day 100 in mastery mode", category: "milestone", dayReq: 100, xpReward: 750, tier: 3 },
];

/**
 * Get trophy tier color for visual badges
 */
export function getTrophyTierColor(tier) {
  if (tier === 3) return { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.25)", text: "#FBBF24", label: "Gold" };
  if (tier === 2) return { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.2)", text: "#94A3B8", label: "Silver" };
  return { bg: "rgba(180,120,80,0.12)", border: "rgba(180,120,80,0.2)", text: "#B4784F", label: "Bronze" };
}
