// AI Service Layer — uses Gemini API via environment variable.
// Key is loaded from VITE_GEMINI_API_KEY in .env (never hardcoded).
//
// Public surface kept intentionally tiny — only the AI Coach widget and the
// AI Workout Generator are wired up today. If more callers appear, add
// purpose-built wrappers rather than expanding this file.

import { dateToLocalDayKey } from "./helpers";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  : "";

const AI_CACHE_KEY = "life-os-ai-cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MOOD_LABELS = [null, "Awful", "Bad", "Meh", "Okay", "Good", "Great"];

export function isAIConfigured() { return !!GEMINI_API_KEY; }

// --- Cache ---

function getCacheStore() {
  try { const raw = localStorage.getItem(AI_CACHE_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}

function setCacheStore(store) {
  try { localStorage.setItem(AI_CACHE_KEY, JSON.stringify(store)); } catch {}
}

function getCached(key) {
  const store = getCacheStore();
  const entry = store[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete store[key];
    setCacheStore(store);
    return null;
  }
  return entry.value;
}

function setCache(key, value) {
  const store = getCacheStore();
  const keys = Object.keys(store);
  // LRU-ish trim: keep cache from growing unbounded.
  if (keys.length > 30) {
    const sorted = keys.sort((a, b) => (store[a].timestamp || 0) - (store[b].timestamp || 0));
    sorted.slice(0, 10).forEach((k) => delete store[k]);
  }
  store[key] = { value, timestamp: Date.now() };
  setCacheStore(store);
}

// --- Core Gemini call ---

// Sentinel objects so callers can distinguish error types from null content.
const AI_ERR_QUOTA = { __aiError: "quota" };
const AI_ERR_NETWORK = { __aiError: "network" };

async function callAI(systemPrompt, userPrompt, cacheKey) {
  if (!GEMINI_URL) return null;
  if (cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          maxOutputTokens: 1200,
          temperature: 0.8,
        },
      }),
    });
    if (!res.ok) {
      if (res.status === 429) return AI_ERR_QUOTA;
      // eslint-disable-next-line no-console
      console.warn("Gemini API error:", res.status);
      return null;
    }
    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) return null;
    if (cacheKey) setCache(cacheKey, content);
    return content;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("AI call failed:", err.message);
    return AI_ERR_NETWORK;
  }
}

// --- State summary for prompts ---

// Friendly labels for the onboarding profile (matches OnboardingScreen options)
const ACTIVITY_LABELS = {
  sedentary: "sedentary (mostly sitting, no regular exercise)",
  light: "lightly active (walks, occasional movement)",
  moderate: "active (workouts 2-3x/week)",
  high: "very active (training almost daily)",
};
const SLEEP_LABELS = {
  poor: "poor — trouble falling/staying asleep",
  okay: "inconsistent — some nights great, some rough",
  good: "solid — 7+ hours most nights",
};
const GOAL_LABELS = {
  fitness: "get in shape (workouts, nutrition, energy)",
  discipline: "build discipline (sleep, focus, screen control)",
  quit: "quit a habit (smoking, drinking, scrolling, etc.)",
  learning: "learn deeply (books, courses, reflection)",
  balance: "full lifestyle reset (a bit of everything)",
};
const TIME_LABELS = {
  short: "5-15 min/day (just the basics)",
  medium: "15-30 min/day (a solid routine)",
  long: "30-60+ min/day (going deep)",
};

function buildStateSummary(state) {
  const {
    currentDay = 1, xp = 0, streak = 0, bestStreak = 0,
    completedQuests = {}, journal = {}, moods = {},
    sobrietyDates = {}, recoveryJournals = [], customQuests = [],
    liftingStreak = 0, userName = "User",
    profile = null,
  } = state || {};

  // completedQuests is keyed by LOCAL ISO date, not day number.
  const todayQuests = completedQuests[dateToLocalDayKey(new Date())] || [];
  const totalDaysCompleted = Object.keys(completedQuests).filter(
    (d) => (completedQuests[d] || []).length > 0
  ).length;

  const recentMoods = Object.entries(moods)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 5)
    .map(([day, mood]) => `${day}: ${MOOD_LABELS[mood] || "Unknown"}`);

  const forgeTrackers = Object.entries(sobrietyDates).map(([id, date]) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    return `${id}: ${days} days clean`;
  });

  const journalKeys = Object.keys(journal).sort().reverse();
  const latestEntry = journalKeys[0] ? journal[journalKeys[0]] : null;
  const journalSnippet = latestEntry?.text
    ? `"${latestEntry.text.substring(0, 200)}${latestEntry.text.length > 200 ? "..." : ""}"`
    : "No recent journal entries";

  // ── Profile block (from onboarding questionnaire) — the WHY behind the user
  const profileLines = [];
  if (profile) {
    if (profile.primaryGoal && GOAL_LABELS[profile.primaryGoal]) {
      profileLines.push(`Primary goal: ${GOAL_LABELS[profile.primaryGoal]}`);
    }
    if (profile.activityLevel && ACTIVITY_LABELS[profile.activityLevel]) {
      profileLines.push(`Baseline activity: ${ACTIVITY_LABELS[profile.activityLevel]}`);
    }
    if (profile.sleepQuality && SLEEP_LABELS[profile.sleepQuality]) {
      profileLines.push(`Baseline sleep: ${SLEEP_LABELS[profile.sleepQuality]}`);
    }
    if (profile.timeCommitment && TIME_LABELS[profile.timeCommitment]) {
      profileLines.push(`Time budget: ${TIME_LABELS[profile.timeCommitment]}`);
    }
    if (Array.isArray(profile.vices) && profile.vices.length > 0) {
      profileLines.push(`Habits they're quitting: ${profile.vices.join(", ")}`);
    }
  }

  return [
    `User: ${userName}`,
    ...profileLines,
    profileLines.length > 0 ? "---" : "",
    `Day ${currentDay} of journey`,
    `Total XP: ${xp}`,
    `Current streak: ${streak} days (best: ${bestStreak})`,
    `Today's completed quests: ${todayQuests.length}`,
    `Total active days: ${totalDaysCompleted}`,
    `Lifting streak: ${liftingStreak} days`,
    forgeTrackers.length > 0 ? `Forge trackers: ${forgeTrackers.join(", ")}` : "No forge trackers active",
    recentMoods.length > 0 ? `Recent moods: ${recentMoods.join("; ")}` : "No mood data",
    `Latest journal: ${journalSnippet}`,
    recoveryJournals.length > 0 ? `Recovery journal entries: ${recoveryJournals.length}` : "",
    customQuests.length > 0 ? `Custom quests: ${customQuests.map((q) => q.text).join(", ")}` : "",
  ].filter(Boolean).join("\n");
}

const SYSTEM_BASE = `You are the AI Coach for Life OS, a gamified habit-tracking app that helps users build discipline through daily quests (sleep, water, exercise, mind, screen discipline, cold showers), journaling, lifting, and recovery from addictions (The Forge).

Your personality: Supportive but direct. You celebrate wins authentically. You don't sugarcoat struggles but always offer a path forward. Think of yourself as a wise mentor who genuinely cares. Keep responses concise (2-4 sentences unless asked for more). Use plain language, no corporate speak.

When the user's state includes a Profile block (primary goal, baseline activity/sleep, time budget, habits-to-quit), use it. Tailor advice to their stated goal — don't recommend hard workouts to a "sedentary" user, don't push 60-min routines on someone with a "5-15 min" budget, and remember the vices they're working on quitting. Reference their goal when relevant (e.g., "Since you're focused on quitting smoking…").`;

// --- Public ---

export async function chatWithCoach(message, state) {
  const summary = buildStateSummary(state);
  return callAI(
    `${SYSTEM_BASE}\n\nThe user is asking you a question in a chat. You have full context about their habits and progress. Answer specifically and helpfully. Keep responses to 2-4 sentences unless the question requires more detail.`,
    `User state:\n${summary}\n\nUser's question: ${message}`,
    null
  );
}

