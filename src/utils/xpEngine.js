// Feature Set 4: Intelligent XP Weighting
// Parses quest text and assigns XP dynamically based on difficulty tier

const TIER_3_KEYWORDS = [
  "workout", "gym", "cold shower", "run", "push-ups", "push ups",
  "steps", "10,000", "10000", "lifting", "squat", "deadlift",
  "bench", "hiit", "sprint", "plank",
];

const TIER_2_KEYWORDS = [
  "read", "meditate", "meditation", "journal", "learn", "study",
  "no phone", "no screens", "digital detox", "no sugary",
  "wake up before", "sleep before", "skincare",
];

const TIER_1_KEYWORDS = [
  "water", "vitamins", "stretch", "glass", "drink",
  "morning", "routine",
];

/**
 * Calculate XP for a quest based on its text content.
 * Tier 3 (hard/physical): 50-65 XP
 * Tier 2 (mental/discipline): 20-30 XP
 * Tier 1 (easy/maintenance): 10-15 XP
 *
 * Day multiplier adds +1 XP per 10 days to reward consistency.
 */
export function calculateQuestXP(text, day = 1) {
  const lower = text.toLowerCase();
  const dayBonus = Math.floor(day / 10) * 2;

  // Check highest tier first
  for (const kw of TIER_3_KEYWORDS) {
    if (lower.includes(kw)) {
      return 50 + dayBonus;
    }
  }

  for (const kw of TIER_2_KEYWORDS) {
    if (lower.includes(kw)) {
      return 25 + dayBonus;
    }
  }

  for (const kw of TIER_1_KEYWORDS) {
    if (lower.includes(kw)) {
      return 12 + dayBonus;
    }
  }

  // Default fallback
  return 15 + dayBonus;
}

/**
 * Returns the tier label for display purposes
 */
export function getQuestTier(text) {
  const lower = text.toLowerCase();
  for (const kw of TIER_3_KEYWORDS) {
    if (lower.includes(kw)) return { tier: 3, label: "Hard", color: "#F97316" };
  }
  for (const kw of TIER_2_KEYWORDS) {
    if (lower.includes(kw)) return { tier: 2, label: "Medium", color: "#7C5CFC" };
  }
  for (const kw of TIER_1_KEYWORDS) {
    if (lower.includes(kw)) return { tier: 1, label: "Easy", color: "#10B981" };
  }
  return { tier: 1, label: "Easy", color: "#10B981" };
}
