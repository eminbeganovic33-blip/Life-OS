// Intelligence features: quest suggestions, journal sentiment, personalized quotes, trigger mapping

const CATEGORIES_LIST = ["sleep", "water", "exercise", "mind", "screen", "shower"];

const POSITIVE_KEYWORDS = [
  "grateful", "happy", "proud", "progress", "accomplished", "energized",
  "motivated", "strong", "focused", "peaceful", "calm", "better", "great",
  "amazing", "love", "excited", "confident", "powerful", "disciplined",
];

const NEGATIVE_KEYWORDS = [
  "struggled", "failed", "relapsed", "tired", "stressed", "anxious",
  "angry", "frustrated", "depressed", "lonely", "weak", "tempted",
  "craving", "bored", "lazy", "guilty", "ashamed", "overwhelmed",
  "lost", "broken",
];

const TRIGGER_KEYWORDS = [
  "stress", "bored", "party", "social", "weekend", "night", "morning",
  "alone", "tired", "argument", "work", "drink", "friends",
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// --- Helpers ---

function getCategoryCompletionRates(state) {
  const { completedQuests = {} } = state;
  const counts = {};
  const totals = {};

  for (const cat of CATEGORIES_LIST) {
    counts[cat] = 0;
    totals[cat] = 0;
  }

  for (const day of Object.keys(completedQuests)) {
    const quests = completedQuests[day] || [];
    for (const cat of CATEGORIES_LIST) {
      totals[cat]++;
      if (quests.some((q) => q.startsWith(cat))) {
        counts[cat]++;
      }
    }
  }

  const rates = {};
  for (const cat of CATEGORIES_LIST) {
    rates[cat] = totals[cat] > 0 ? counts[cat] / totals[cat] : 0;
  }
  return rates;
}

function getLatestMood(state) {
  const { moods = {} } = state;
  const days = Object.keys(moods).map(Number).sort((a, b) => b - a);
  return days.length > 0 ? moods[days[0]] : null;
}

function dateHash(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function scoreText(text) {
  const lower = text.toLowerCase();
  let pos = 0;
  let neg = 0;
  const keywords = [];

  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) {
      pos++;
      keywords.push(kw);
    }
  }
  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) {
      neg++;
      keywords.push(kw);
    }
  }

  const total = pos + neg;
  if (total === 0) return { score: 0, sentiment: "neutral", keywords };

  const score = Math.round(((pos - neg) / total) * 100) / 100;
  const sentiment = score > 0.2 ? "positive" : score < -0.2 ? "negative" : "neutral";
  return { score, sentiment, keywords };
}

// --- 1. Quest Suggestions ---

export function getQuestSuggestions(state) {
  const suggestions = [];
  const rates = getCategoryCompletionRates(state);
  const {
    completedQuests = {},
    currentDay = 1,
    liftingStreak = 0,
    sobrietyDates = {},
    customQuests = [],
  } = state;

  const yesterday = currentDay - 1;
  const todayQuests = completedQuests[currentDay] || [];
  const yesterdayQuests = completedQuests[yesterday] || [];

  // Find weakest category
  const sortedCats = CATEGORIES_LIST
    .map((cat) => ({ cat, rate: rates[cat] }))
    .sort((a, b) => a.rate - b.rate);

  const weakest = sortedCats[0];
  if (weakest && weakest.rate < 0.7) {
    const templates = {
      sleep: "Get to bed by 10:30 PM tonight",
      water: "Drink 8 glasses of water today",
      exercise: "Do a 20 minute bodyweight workout",
      mind: "Read for 15 minutes or meditate for 10",
      screen: "No phone for the first hour after waking",
      shower: "Take a cold shower for at least 60 seconds",
    };
    suggestions.push({
      text: templates[weakest.cat],
      category: weakest.cat,
      reason: `Your ${weakest.cat} completion rate is only ${Math.round(weakest.rate * 100)}% — your weakest area`,
    });
  }

  // Category streak about to break
  for (const cat of CATEGORIES_LIST) {
    const didYesterday = yesterdayQuests.some((q) => q.startsWith(cat));
    const didToday = todayQuests.some((q) => q.startsWith(cat));
    if (didYesterday && !didToday) {
      const urgentTemplates = {
        sleep: "Don't break your sleep streak — set a bedtime alarm now",
        water: "Keep your hydration streak alive — fill a bottle right now",
        exercise: "Your exercise streak is on the line — even a 10 min walk counts",
        mind: "Protect your mind streak — journal or meditate for 5 minutes",
        screen: "Your screen discipline streak is at risk — put the phone away for 30 min",
        shower: "Don't lose your shower streak — take one now",
      };
      suggestions.push({
        text: urgentTemplates[cat],
        category: cat,
        reason: `You completed ${cat} yesterday but not today — streak at risk!`,
      });
    }
  }

  // High lifting streak → progressive exercise
  if (liftingStreak >= 5) {
    const progressiveQuests = [
      "Add 5 lbs to your main lift today",
      "Try a new compound movement you haven't done before",
      "Do an extra set on your weakest exercise",
      "Hit a new personal best on any lift",
    ];
    const pick = progressiveQuests[liftingStreak % progressiveQuests.length];
    suggestions.push({
      text: pick,
      category: "exercise",
      reason: `${liftingStreak}-day lifting streak — time to push harder`,
    });
  }

  // Strong mind category → harder variants
  if (rates.mind >= 0.8) {
    const hardMind = [
      "Meditate for 20 minutes without any background noise",
      "Write a full-page journal entry reflecting on your growth",
      "Read 30 pages of a non-fiction book today",
      "Do a complete digital detox for 3 hours",
    ];
    const pick = hardMind[currentDay % hardMind.length];
    suggestions.push({
      text: pick,
      category: "mind",
      reason: "You're crushing the mind category — here's a harder challenge",
    });
  }

  // Active forge trackers → complementary quests
  const activeTrackers = Object.keys(sobrietyDates);
  if (activeTrackers.length > 0) {
    const forgeQuests = {
      smoking: { text: "Take a 15 min walk when a craving hits", category: "exercise" },
      alcohol: { text: "Replace your evening drink with herbal tea and journaling", category: "mind" },
      vaping: { text: "Do 10 deep breaths whenever you feel the urge", category: "mind" },
      gambling: { text: "Track every impulse to gamble in your journal today", category: "mind" },
      sugar: { text: "Prep healthy snacks so you're not tempted by sweets", category: "water" },
      caffeine: { text: "Go for a brisk 10 min walk instead of reaching for coffee", category: "exercise" },
      porn: { text: "When tempted, do 20 push-ups and take a cold shower", category: "exercise" },
      doomscrolling: { text: "Set a 15 min screen timer and read a book after", category: "screen" },
    };

    for (const tracker of activeTrackers) {
      const key = tracker.toLowerCase();
      if (forgeQuests[key]) {
        suggestions.push({
          text: forgeQuests[key].text,
          category: forgeQuests[key].category,
          reason: `Complementary quest for your ${tracker} recovery tracker`,
        });
      }
    }
  }

  // Return 3–5, deduplicating by text
  const seen = new Set();
  const unique = [];
  for (const s of suggestions) {
    if (!seen.has(s.text)) {
      seen.add(s.text);
      unique.push(s);
    }
    if (unique.length >= 5) break;
  }

  // If we have fewer than 3, pad with general suggestions
  const fallbacks = [
    { text: "Drink a glass of water right now", category: "water", reason: "Hydration is always a good idea" },
    { text: "Do 10 minutes of stretching", category: "exercise", reason: "Active recovery keeps you moving" },
    { text: "Write 3 things you're grateful for", category: "mind", reason: "Gratitude journaling boosts mood" },
  ];
  for (const fb of fallbacks) {
    if (unique.length >= 3) break;
    if (!seen.has(fb.text)) {
      seen.add(fb.text);
      unique.push(fb);
    }
  }

  return unique.slice(0, 5);
}

// --- 2. Journal Sentiment Analysis ---

export function analyzeJournalSentiment(state) {
  const { journal = {}, completedQuests = {} } = state;
  const days = Object.keys(journal).map(Number).sort((a, b) => a - b);

  const empty = { entries: [], trend: "stable", avgScore: 0, insights: [] };
  if (days.length < 3) return empty;

  const entries = days.map((day) => {
    const text = journal[day];
    const { score, sentiment, keywords } = scoreText(text);
    return { day, sentiment, score, keywords };
  });

  const avgScore =
    Math.round((entries.reduce((sum, e) => sum + e.score, 0) / entries.length) * 100) / 100;

  // Trend: compare first half vs second half
  const mid = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(0, mid);
  const secondHalf = entries.slice(mid);
  const firstAvg = firstHalf.reduce((s, e) => s + e.score, 0) / (firstHalf.length || 1);
  const secondAvg = secondHalf.reduce((s, e) => s + e.score, 0) / (secondHalf.length || 1);
  const diff = secondAvg - firstAvg;
  const trend = diff > 0.15 ? "improving" : diff < -0.15 ? "declining" : "stable";

  // Insights
  const insights = [];

  // Mid-week dip check (map day numbers to day-of-week if possible)
  const dayScores = {};
  for (const e of entries) {
    // Use day number mod 7 as a rough weekday proxy
    const wd = e.day % 7;
    if (!dayScores[wd]) dayScores[wd] = [];
    dayScores[wd].push(e.score);
  }
  const wdAvgs = Object.entries(dayScores).map(([wd, scores]) => ({
    wd: Number(wd),
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));
  const worstDay = wdAvgs.sort((a, b) => a.avg - b.avg)[0];
  const bestDay = wdAvgs.sort((a, b) => b.avg - a.avg)[0];
  if (worstDay && bestDay && bestDay.avg - worstDay.avg > 0.3) {
    insights.push(
      `Your mood tends to dip around day ${worstDay.wd} of each week cycle`
    );
  }

  // Exercise mention correlation
  const withExercise = entries.filter((e) => {
    const quests = completedQuests[e.day] || [];
    return quests.some((q) => q.startsWith("exercise"));
  });
  const withoutExercise = entries.filter((e) => {
    const quests = completedQuests[e.day] || [];
    return !quests.some((q) => q.startsWith("exercise"));
  });
  if (withExercise.length >= 2 && withoutExercise.length >= 2) {
    const exAvg = withExercise.reduce((s, e) => s + e.score, 0) / withExercise.length;
    const noExAvg = withoutExercise.reduce((s, e) => s + e.score, 0) / withoutExercise.length;
    if (exAvg > noExAvg + 0.1) {
      const pct = Math.round(((exAvg - noExAvg) / (Math.abs(noExAvg) || 1)) * 100);
      insights.push(
        `Journal entries on exercise days are ${Math.min(pct, 200)}% more positive`
      );
    }
  }

  // Trend insight
  if (trend === "improving") {
    insights.push("Your journal sentiment has been trending upward — keep it going");
  } else if (trend === "declining") {
    insights.push("Your recent entries are more negative than earlier ones — check in with yourself");
  }

  return { entries, trend, avgScore, insights: insights.slice(0, 3) };
}

// --- 3. Personalized Quote ---

export function getPersonalizedQuote(state, allQuotes) {
  if (!allQuotes || allQuotes.length === 0) {
    return { category: "General", quote: "Keep going.", author: "Unknown", reason: "No quotes available" };
  }

  const {
    streak = 0,
    sobrietyDates = {},
    moods = {},
  } = state;

  const latestMood = getLatestMood(state);
  const rates = getCategoryCompletionRates(state);
  const activeTrackers = Object.keys(sobrietyDates);

  // Determine preferred categories with reasons
  let preferredCategories = [];
  let reason = "";

  if (streak === 0) {
    preferredCategories = ["Resilience", "Courage"];
    reason = "You're starting fresh — time to rebuild";
  } else if (streak >= 7) {
    preferredCategories = ["Growth", "Confidence"];
    reason = `${streak}-day streak — you've earned some confidence`;
  }

  // Forge trackers < 7 days
  if (activeTrackers.length > 0 && !reason) {
    const now = new Date();
    const recentTracker = activeTrackers.some((t) => {
      const start = new Date(sobrietyDates[t]);
      const diffDays = Math.floor((now - start) / 86400000);
      return diffDays < 7;
    });
    if (recentTracker) {
      preferredCategories = ["Strength", "Discipline"];
      reason = "Early days in recovery — stay strong";
    }
  }

  // Mood overrides
  if (latestMood !== null && latestMood <= 1 && !reason) {
    preferredCategories = ["Resilience", "Wisdom"];
    reason = "Your mood is low — here's something to lift you up";
  } else if (latestMood !== null && latestMood >= 4 && !reason) {
    preferredCategories = ["Growth", "Confidence"];
    reason = "You're feeling great — ride the momentum";
  }

  // Low exercise completion
  if (rates.exercise < 0.4 && !reason) {
    preferredCategories = ["Health", "Discipline"];
    reason = "Your exercise completion could use a boost";
  }

  // Filter quotes
  let filtered = allQuotes;
  if (preferredCategories.length > 0) {
    const lowered = preferredCategories.map((c) => c.toLowerCase());
    const matched = allQuotes.filter((q) =>
      lowered.includes((q.category || "").toLowerCase())
    );
    if (matched.length > 0) filtered = matched;
  }

  // Deterministic daily rotation
  const hash = dateHash(todayStr());
  const index = hash % filtered.length;
  const picked = filtered[index];

  return {
    category: picked.category || "General",
    quote: picked.quote,
    author: picked.author || "Unknown",
    reason: reason || "Daily motivation pick",
  };
}

// --- 4. Trigger Map ---

export function getTriggerMap(state) {
  const { recoveryJournals = [] } = state;

  const empty = { triggers: [], riskDays: [], riskTimes: [], suggestions: [] };
  if (recoveryJournals.length < 2) return empty;

  // Count trigger keyword occurrences
  const keywordCounts = {};
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const trackerCounts = {};

  for (const entry of recoveryJournals) {
    const lower = (entry.text || "").toLowerCase();

    // Keywords
    for (const kw of TRIGGER_KEYWORDS) {
      if (lower.includes(kw)) {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      }
    }

    // Day of week
    if (entry.date) {
      const d = new Date(entry.date + "T12:00:00");
      if (!isNaN(d.getTime())) {
        dayOfWeekCounts[d.getDay()]++;
      }
    }

    // Tracker clustering
    if (entry.tracker) {
      trackerCounts[entry.tracker] = (trackerCounts[entry.tracker] || 0) + 1;
    }
  }

  // Build triggers sorted by frequency
  const triggers = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([pattern, frequency]) => {
      const pct = Math.round((frequency / recoveryJournals.length) * 100);
      return {
        pattern,
        frequency,
        details: `Appears in ${pct}% of recovery journal entries`,
      };
    });

  // Risk days
  const maxDayCount = Math.max(...dayOfWeekCounts);
  const riskDays = [];
  if (maxDayCount >= 2) {
    dayOfWeekCounts.forEach((count, i) => {
      if (count >= maxDayCount * 0.7 && count >= 2) {
        riskDays.push(DAY_NAMES[i]);
      }
    });
  }

  // Risk times from keywords
  const riskTimes = [];
  if (keywordCounts.night) riskTimes.push("evening/night");
  if (keywordCounts.morning) riskTimes.push("morning");

  // Generate suggestions
  const suggestions = [];

  if (riskDays.length > 0) {
    const dayList = riskDays.join(" and ");
    suggestions.push(
      `You tend to relapse on ${dayList}. Pre-plan activities for ${riskDays[0]} evening.`
    );
  }

  if (keywordCounts.alone) {
    suggestions.push("Isolation is a trigger for you. Reach out to someone when you're feeling alone.");
  }

  if (keywordCounts.stress || keywordCounts.work) {
    suggestions.push("Stress and work pressure are common triggers. Build a 5-minute breathing routine for tense moments.");
  }

  if (keywordCounts.bored) {
    suggestions.push("Boredom is a trigger. Keep a list of go-to activities for idle moments.");
  }

  if (keywordCounts.social || keywordCounts.friends || keywordCounts.party) {
    suggestions.push("Social situations can be risky. Have an exit plan or accountability partner for events.");
  }

  if (keywordCounts.tired) {
    suggestions.push("Fatigue weakens your defenses. Prioritize sleep and avoid making decisions when exhausted.");
  }

  // Tracker-specific
  const topTracker = Object.entries(trackerCounts).sort(([, a], [, b]) => b - a)[0];
  if (topTracker && topTracker[1] >= 2) {
    suggestions.push(
      `Your ${topTracker[0]} tracker has the most journal entries — give it extra attention this week.`
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("Keep logging recovery journal entries to uncover deeper patterns.");
  }

  return { triggers, riskDays, riskTimes, suggestions };
}
