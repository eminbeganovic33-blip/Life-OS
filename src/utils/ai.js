// AI Service Layer — uses Gemini API via environment variable
// Key is loaded from VITE_GEMINI_API_KEY in .env (never hardcoded)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  : "";

const AI_CACHE_KEY = "life-os-ai-cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// --- Legacy settings compatibility (remove user-facing settings) ---
export function loadAISettings() {
  return { apiKey: GEMINI_API_KEY, model: GEMINI_MODEL };
}
export function saveAISettings() {} // no-op
export function isAIConfigured() { return !!GEMINI_API_KEY; }

// --- Cache ---

function getCacheStore() {
  try {
    const raw = localStorage.getItem(AI_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCacheStore(store) {
  try {
    localStorage.setItem(AI_CACHE_KEY, JSON.stringify(store));
  } catch {}
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
  if (keys.length > 30) {
    const sorted = keys.sort((a, b) => (store[a].timestamp || 0) - (store[b].timestamp || 0));
    sorted.slice(0, 10).forEach((k) => delete store[k]);
  }
  store[key] = { value, timestamp: Date.now() };
  setCacheStore(store);
}

function hashInput(prefix, data) {
  const str = prefix + JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return prefix + "_" + Math.abs(hash).toString(36);
}

// --- Core Gemini API Call ---

// Sentinel objects so callers can distinguish error types from null content
export const AI_ERR_QUOTA = { __aiError: "quota" };
export const AI_ERR_NETWORK = { __aiError: "network" };

async function callAI(systemPrompt, userPrompt, cacheKey) {
  if (!GEMINI_URL) return null; // no API key configured

  // Check cache
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
      console.warn("Gemini API error:", res.status);
      return null;
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) return null;

    if (cacheKey) {
      setCache(cacheKey, content);
    }
    return content;
  } catch (err) {
    console.warn("AI call failed:", err.message);
    return AI_ERR_NETWORK;
  }
}

// --- State Summary Helper ---

function buildStateSummary(state) {
  const {
    currentDay = 1, xp = 0, streak = 0, bestStreak = 0,
    completedQuests = {}, journal = {}, moods = {},
    sobrietyDates = {}, recoveryJournals = [], customQuests = [],
    liftingStreak = 0, userName = "User",
  } = state || {};

  const todayQuests = completedQuests[currentDay] || [];
  const totalDaysCompleted = Object.keys(completedQuests).filter(
    (d) => (completedQuests[d] || []).length > 0
  ).length;

  const recentMoods = Object.entries(moods)
    .sort(([a], [b]) => Number(b) - Number(a))
    .slice(0, 5)
    .map(([day, mood]) => {
      const labels = ["Frustrated", "Low", "Neutral", "Good", "Great", "On Fire"];
      return `Day ${day}: ${labels[mood] || "Unknown"}`;
    });

  const forgeTrackers = Object.entries(sobrietyDates).map(([id, date]) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    return `${id}: ${days} days clean`;
  });

  const journalDays = Object.keys(journal).map(Number).sort((a, b) => b - a);
  const latestJournal = journalDays.length > 0 ? journal[journalDays[0]] : "";
  const journalSnippet = latestJournal
    ? latestJournal.substring(0, 200) + (latestJournal.length > 200 ? "..." : "")
    : "No journal entries yet";

  return [
    `User: ${userName}`,
    `Day: ${currentDay}, XP: ${xp}, Current Streak: ${streak}, Best Streak: ${bestStreak}`,
    `Today's completed quests: ${todayQuests.length} of ~6`,
    `Total active days: ${totalDaysCompleted}`,
    `Lifting streak: ${liftingStreak} days`,
    forgeTrackers.length > 0 ? `Forge trackers: ${forgeTrackers.join(", ")}` : "No forge trackers active",
    recentMoods.length > 0 ? `Recent moods: ${recentMoods.join("; ")}` : "No mood data",
    `Latest journal: ${journalSnippet}`,
    recoveryJournals.length > 0 ? `Recovery journal entries: ${recoveryJournals.length}` : "",
    customQuests.length > 0 ? `Custom quests: ${customQuests.map((q) => q.text).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const SYSTEM_BASE = `You are the AI Coach for Life OS, a gamified habit-tracking app that helps users build discipline through daily quests (sleep, water, exercise, mind, screen discipline, cold showers), journaling, lifting, and recovery from addictions (The Forge).

Your personality: Supportive but direct. You celebrate wins authentically. You don't sugarcoat struggles but always offer a path forward. Think of yourself as a wise mentor who genuinely cares. Keep responses concise (2-4 sentences unless asked for more). Use plain language, no corporate speak.`;

// --- Public AI Functions ---

export async function getAICoachMessage(state) {
  const summary = buildStateSummary(state);
  const cacheKey = hashInput("coach", {
    day: state?.currentDay, streak: state?.streak,
    date: new Date().toISOString().split("T")[0],
  });

  return callAI(
    `${SYSTEM_BASE}\n\nGenerate a personalized daily coaching message for this user. Be specific about their data — reference their streak, progress, or struggles. Make it feel personal and motivating, not generic.`,
    `Here is the user's current state:\n${summary}\n\nGive a brief, personalized coaching message for today.`,
    cacheKey
  );
}

export async function getAIJournalPrompt(state) {
  const summary = buildStateSummary(state);
  const cacheKey = hashInput("jprompt", {
    day: state?.currentDay, date: new Date().toISOString().split("T")[0],
  });

  return callAI(
    `${SYSTEM_BASE}\n\nGenerate a thoughtful, context-aware journal writing prompt. The prompt should encourage reflection and self-awareness. It should relate to what the user is currently working on or struggling with. Return ONLY the prompt question, nothing else.`,
    `Here is the user's current state:\n${summary}\n\nGenerate one journal prompt.`,
    cacheKey
  );
}

export async function analyzeJournalEntryAI(entry, state) {
  if (!entry || entry.trim().length < 10) return null;

  const summary = buildStateSummary(state);
  const cacheKey = hashInput("janalyze", { entry: entry.substring(0, 100), day: state?.currentDay });

  const raw = await callAI(
    `${SYSTEM_BASE}\n\nAnalyze this journal entry and return a JSON object with these fields:\n- sentiment: "positive", "negative", or "neutral"\n- score: number from -1 to 1\n- insight: a brief personalized observation (1-2 sentences)\n- pattern: a pattern you notice relating to their habits (1 sentence, or null if not enough data)\n- suggestion: one specific actionable suggestion based on the entry (1 sentence)\n\nReturn ONLY valid JSON, no markdown fences.`,
    `User state:\n${summary}\n\nJournal entry:\n"${entry}"`,
    cacheKey
  );

  if (!raw) return null;

  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { sentiment: "neutral", score: 0, insight: raw.substring(0, 200), pattern: null, suggestion: null };
  }
}

export async function getAIQuestSuggestions(state) {
  const summary = buildStateSummary(state);
  const cacheKey = hashInput("quests", {
    day: state?.currentDay, date: new Date().toISOString().split("T")[0],
  });

  const raw = await callAI(
    `${SYSTEM_BASE}\n\nSuggest 3 personalized quests for this user based on their data. Return a JSON array where each item has:\n- text: the quest description (short, actionable)\n- category: one of "sleep", "water", "exercise", "mind", "screen", "shower"\n- reason: why this quest is relevant to them (1 sentence)\n\nReturn ONLY valid JSON array, no markdown fences.`,
    `User state:\n${summary}\n\nSuggest 3 quests.`,
    cacheKey
  );

  if (!raw) return null;
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch { return null; }
}

export async function getAIRelapseSupport(trackerId, state) {
  const summary = buildStateSummary(state);
  const trackerLabels = { smoking: "Smoking", alcohol: "Alcohol", junkfood: "Junk Food", social_media: "Doomscrolling" };
  const label = trackerLabels[trackerId] || trackerId;
  const startDate = state?.sobrietyDates?.[trackerId];
  const daysClean = startDate ? Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) : 0;
  const cacheKey = hashInput("relapse", { tracker: trackerId, days: daysClean, date: new Date().toISOString().split("T")[0] });

  return callAI(
    `${SYSTEM_BASE}\n\nThe user is tracking their recovery from ${label} in The Forge. They have been clean for ${daysClean} days. Generate a supportive, encouraging message that:\n1. Acknowledges their progress (${daysClean} days is significant)\n2. Offers a specific coping strategy\n3. Reminds them why they started\n\nKeep it warm and personal, 3-4 sentences. Don't be preachy.`,
    `User state:\n${summary}\n\nGenerate a support message for their ${label} recovery journey.`,
    cacheKey
  );
}

export async function chatWithCoach(message, state) {
  const summary = buildStateSummary(state);
  return callAI(
    `${SYSTEM_BASE}\n\nThe user is asking you a question in a chat. You have full context about their habits and progress. Answer specifically and helpfully. Keep responses to 2-4 sentences unless the question requires more detail.`,
    `User state:\n${summary}\n\nUser's question: ${message}`,
    null
  );
}

// --- Multi-turn Journal Chat ---

export async function chatJournal(messages, state) {
  if (!GEMINI_URL) return null;

  const summary = buildStateSummary(state);
  const systemPrompt = `${SYSTEM_BASE}

You are having a reflective journal conversation with the user. Your role is to be a thoughtful, empathetic journal companion — NOT a therapist, NOT a chatbot. Think of yourself as a wise friend who asks the right questions.

Rules:
- Ask ONE follow-up question at a time, never more
- Keep responses to 2-3 sentences max
- Reference their actual data (streak, habits, mood) when relevant
- Don't repeat what they said back to them
- Be warm but not saccharine
- If they share something difficult, acknowledge it genuinely before asking more
- Vary your question style: sometimes reflective, sometimes forward-looking, sometimes playful
- After 4+ exchanges, offer a brief insight or observation about patterns you notice

User context:
${summary}`;

  // Build multi-turn contents array for Gemini
  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.85,
        },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return AI_ERR_QUOTA;
      return null;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return AI_ERR_NETWORK;
  }
}

export async function getJournalStarter(state) {
  const summary = buildStateSummary(state);
  const cacheKey = hashInput("jstart", {
    day: state?.currentDay, date: new Date().toISOString().split("T")[0],
  });

  return callAI(
    `${SYSTEM_BASE}\n\nGenerate an opening message for a reflective journal conversation. Make it personal based on the user's current data — mention their streak, recent mood, or today's progress. Ask ONE specific question to get them writing. Keep it to 2 sentences. Be warm and specific, not generic.`,
    `User state:\n${summary}\n\nGenerate the opening journal prompt.`,
    cacheKey
  );
}

export async function testAIConnection() {
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Reply with exactly: OK" }] }],
        generationConfig: { maxOutputTokens: 5 },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: `HTTP ${res.status}: ${text.substring(0, 100)}` };
    }
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return { success: true, reply, model: GEMINI_MODEL };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
