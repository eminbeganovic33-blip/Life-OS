// Phase 6: Monetization — Premium tier definitions

export const PREMIUM_PLANS = {
  monthly: {
    id: "monthly",
    price: 4.99,
    label: "$4.99/month",
    interval: "month",
    savings: null,
  },
  yearly: {
    id: "yearly",
    price: 39.99,
    label: "$39.99/year",
    interval: "year",
    savings: Math.round((1 - 39.99 / (4.99 * 12)) * 100),
  },
};

export const FREE_LIMITS = {
  questsPerCategory: 3, // first 3 quests in each category
  maxForgeTrackers: 4, // 4 default trackers free, custom ones need premium
  maxCustomQuests: 0, // no custom quests on free
  analyticsAccess: "basic", // basic analytics only (overview tab)
  journalAccess: "basic", // basic journal (no export, no search)
  courseTier: 1, // only tier-1 courses
  trialDays: 7, // free trial duration
};

export const PREMIUM_FEATURES = {
  allQuests: {
    id: "allQuests",
    label: "All Daily Quests",
    description: "Access every quest in all categories",
    icon: "✅",
    free: "First 3 per category",
    premium: "All quests unlocked",
  },
  unlimitedForge: {
    id: "unlimitedForge",
    label: "Custom Forge Trackers",
    description: "Add custom trackers with personalized tips beyond the 4 free defaults",
    icon: "🔥",
    free: "4 default trackers",
    premium: "Unlimited custom trackers",
  },
  advancedAnalytics: {
    id: "advancedAnalytics",
    label: "Advanced Analytics",
    description: "Weekly summaries, trend charts, and correlation insights",
    icon: "📊",
    free: "Basic overview only",
    premium: "Full analytics suite",
  },
  customQuests: {
    id: "customQuests",
    label: "Custom Quests",
    description: "Create your own personalized quests",
    icon: "🎯",
    free: "Not available",
    premium: "Unlimited custom quests",
  },
  allCourses: {
    id: "allCourses",
    label: "All Academy Courses",
    description: "Access advanced Tier 2 courses and future content",
    icon: "🎓",
    free: "Basic courses only",
    premium: "All courses + Tier 2",
  },
  unlimitedFocus: {
    id: "unlimitedFocus",
    label: "Unlimited Focus Slots",
    description: "Focus on as many courses as you want simultaneously",
    icon: "🎯",
    free: "3 focus slots max",
    premium: "Unlimited focus slots",
  },
  aiFeatures: {
    id: "aiFeatures",
    label: "AI-Powered Insights",
    description: "Personalized recommendations and smart coaching",
    icon: "🤖",
    free: "Not available",
    premium: "AI coach, journal insights, & more",
  },
  prioritySupport: {
    id: "prioritySupport",
    label: "Priority Support",
    description: "Get help faster when you need it",
    icon: "⚡",
    free: "Community support",
    premium: "Priority response",
  },
  exportData: {
    id: "exportData",
    label: "Data Export",
    description: "Export your journal and analytics data",
    icon: "📤",
    free: "Not available",
    premium: "CSV & JSON export",
  },
};

/**
 * Check if a feature requires premium access.
 * @param {string} featureId - One of the keys in PREMIUM_FEATURES
 * @returns {boolean}
 */
export function isPremiumFeature(featureId) {
  return featureId in PREMIUM_FEATURES;
}

/**
 * Feature IDs for quick reference
 */
export const FEATURE_IDS = {
  ALL_QUESTS: "allQuests",
  UNLIMITED_FORGE: "unlimitedForge",
  ADVANCED_ANALYTICS: "advancedAnalytics",
  CUSTOM_QUESTS: "customQuests",
  ALL_COURSES: "allCourses",
  UNLIMITED_FOCUS: "unlimitedFocus",
  AI_FEATURES: "aiFeatures",
  PRIORITY_SUPPORT: "prioritySupport",
  EXPORT_DATA: "exportData",
};
