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

export function getCategoryCompletionRates(state) {
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

// --- Adaptive Difficulty System ---
// If completion rate < 30% → easy variant. 30-70% → standard. > 80% → hard.

export const ADAPTIVE_QUESTS = {
  sleep: {
    easy: "Set a bedtime alarm for tonight — just getting the reminder counts",
    standard: "Get to bed by 10:30 PM tonight",
    hard: "No screens 1 hour before bed AND in bed by 10 PM",
  },
  water: {
    easy: "Drink 3 glasses of water today — start with one right now",
    standard: "Drink 8 glasses of water today",
    hard: "Drink 3L of water and replace all sugary drinks today",
  },
  exercise: {
    easy: "Go for a 10 minute walk outside",
    standard: "Do a 20 minute bodyweight workout",
    hard: "Complete a 45 minute intense training session",
  },
  mind: {
    easy: "Close your eyes and take 10 deep breaths",
    standard: "Read for 15 minutes or meditate for 10",
    hard: "Meditate for 20 minutes AND read 30 pages of non-fiction",
  },
  screen: {
    easy: "Put your phone in another room for 30 minutes",
    standard: "No phone for the first hour after waking",
    hard: "Complete a 4-hour digital detox — no social media, no news",
  },
  shower: {
    easy: "End your regular shower with 15 seconds of cool water",
    standard: "Take a cold shower for at least 60 seconds",
    hard: "Full 3-minute cold shower — no warm water at all",
  },
};

export function getAdaptiveDifficulty(rate) {
  if (rate < 0.3) return "easy";
  if (rate > 0.8) return "hard";
  return "standard";
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

  // Find weakest category — use adaptive difficulty
  const sortedCats = CATEGORIES_LIST
    .map((cat) => ({ cat, rate: rates[cat] }))
    .sort((a, b) => a.rate - b.rate);

  const weakest = sortedCats[0];
  if (weakest && weakest.rate < 0.7) {
    const difficulty = getAdaptiveDifficulty(weakest.rate);
    const questText = ADAPTIVE_QUESTS[weakest.cat]?.[difficulty] || ADAPTIVE_QUESTS[weakest.cat]?.standard;
    const diffLabel = difficulty === "easy" ? "easier version" : difficulty === "hard" ? "upgraded challenge" : "quest";
    suggestions.push({
      text: questText,
      category: weakest.cat,
      reason: `Your ${weakest.cat} rate is ${Math.round(weakest.rate * 100)}% — here's ${/^[aeiou]/i.test(diffLabel) ? "an" : "a"} ${diffLabel} to build momentum`,
      difficulty,
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

  // Strongest category → auto-upgrade difficulty
  const strongest = sortedCats[sortedCats.length - 1];
  if (strongest && strongest.rate >= 0.8 && strongest.cat !== weakest?.cat) {
    const hardQuest = ADAPTIVE_QUESTS[strongest.cat]?.hard;
    if (hardQuest) {
      suggestions.push({
        text: hardQuest,
        category: strongest.cat,
        reason: `You're at ${Math.round(strongest.rate * 100)}% in ${strongest.cat} — upgraded challenge unlocked`,
        difficulty: "hard",
      });
    }
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

// --- 4. Proactive AI Nudges ---
// Surfaces context-aware insights without user having to ask

export function getProactiveNudges(state) {
  const nudges = [];
  const {
    currentDay = 1, streak = 0, moods = {}, journal = {},
    completedQuests = {}, sobrietyDates = {}, liftingStreak = 0,
  } = state;

  const rates = getCategoryCompletionRates(state);
  const latestMood = getLatestMood(state);

  // 1. Mood decline detection — if last 3 moods trend downward
  const moodDays = Object.keys(moods).map(Number).sort((a, b) => b - a).slice(0, 3);
  if (moodDays.length >= 3) {
    const recentMoods = moodDays.map((d) => moods[d]);
    const declining = recentMoods[0] < recentMoods[1] && recentMoods[1] < recentMoods[2];
    if (declining) {
      nudges.push({
        type: "mood_decline",
        icon: "💙",
        title: "Mood check-in",
        message: "Your mood has been dipping the last few days. Want to write about what's going on? Sometimes naming it helps.",
        action: "journal",
        priority: 3,
      });
    }
  }

  // 2. Journal gap — haven't journaled in 3+ days
  const journalDays = Object.keys(journal).map(Number).sort((a, b) => b - a);
  const daysSinceJournal = journalDays.length > 0 ? currentDay - journalDays[0] : currentDay;
  if (daysSinceJournal >= 3 && currentDay > 3) {
    nudges.push({
      type: "journal_gap",
      icon: "📝",
      title: "Haven't journaled in a while",
      message: `It's been ${daysSinceJournal} days since your last entry. Even a quick sentence helps track your progress.`,
      action: "journal",
      priority: 2,
    });
  }

  // 3. Forge milestone approaching
  for (const [trackerId, startDate] of Object.entries(sobrietyDates)) {
    if (!startDate) continue;
    const daysClean = Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000);
    const milestones = [7, 14, 21, 30, 60, 90];
    for (const m of milestones) {
      if (daysClean >= m - 2 && daysClean < m) {
        const labels = { smoking: "Smoking", alcohol: "Alcohol", junkfood: "Junk Food", social_media: "Doomscrolling" };
        nudges.push({
          type: "forge_milestone",
          icon: "🔥",
          title: `${m}-day milestone incoming`,
          message: `You're ${m - daysClean} day${m - daysClean === 1 ? "" : "s"} away from ${m} days clean of ${labels[trackerId] || trackerId}. Stay focused — you're almost there.`,
          action: "forge",
          priority: 3,
        });
        break; // only one milestone nudge per tracker
      }
    }
  }

  // 4. Weak category nudge — if a category drops below 30% over 7+ days
  if (currentDay > 7) {
    for (const cat of CATEGORIES_LIST) {
      if (rates[cat] < 0.3) {
        const difficulty = "easy";
        const easyQuest = ADAPTIVE_QUESTS[cat]?.easy;
        nudges.push({
          type: "weak_category",
          icon: "🎯",
          title: `${cat.charAt(0).toUpperCase() + cat.slice(1)} needs attention`,
          message: `Your ${cat} completion is only ${Math.round(rates[cat] * 100)}%. Try an easier version: "${easyQuest}"`,
          action: "home",
          priority: 1,
        });
        break; // only nudge about 1 weak category at a time
      }
    }
  }

  // 5. Streak celebration / motivation
  if (streak > 0 && streak % 7 === 0) {
    nudges.push({
      type: "streak_celebration",
      icon: "🎉",
      title: `${streak}-day streak!`,
      message: `You've been consistent for ${streak} days straight. That puts you ahead of 90% of users who start habit-building apps.`,
      priority: 2,
    });
  }

  // 6. Lifting gap — if they were lifting but stopped
  if (liftingStreak === 0 && (state.bestLiftingStreak || 0) >= 3) {
    nudges.push({
      type: "lifting_gap",
      icon: "🏋️",
      title: "Miss the Dojo?",
      message: `You had a ${state.bestLiftingStreak}-day lifting streak. Even a light session keeps the habit alive.`,
      action: "dojo",
      priority: 1,
    });
  }

  // Sort by priority (highest first) and return top 3
  return nudges.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

// --- 5. Trigger Map ---

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
