// Voice — the app's ambient, adaptive narrator.
//
// Design principles:
// 1. Sparse = sacred. Return null when there's nothing worth saying.
// 2. Observational > prescriptive. Show the user what's true.
// 3. Short. Max ~2 sentences. Mobile-first reading.
// 4. Tone shifts with arc + streak + failure-state. Same slot, different voice.
// 5. No persona. No name. Ambient. The app *is* the voice.
//
// Usage:
//   import { getVoice } from "../utils/voice";
//   const v = getVoice("home_banner", state);
//   if (v) render(v.line);

import { getArc } from "./arcs";

// ─────────────────────────────────────────────────────────────────
// Context extraction — derive everything we need from raw state
// ─────────────────────────────────────────────────────────────────

function getContext(state = {}) {
  const day = state.currentDay || 1;
  const streak = state.streak || 0;
  const stake = state.stake || null;
  const completedQuests = state.completedQuests || {};
  const completedDays = state.completedDays || {};
  const todayQuests = completedQuests[day] || [];
  const yesterdayQuests = completedQuests[day - 1] || [];

  // Pull total quests from today's quest list if exposed on state,
  // else fall back to a conservative 5.
  const totalToday =
    (state.todayQuestsTotal ||
      state.quests?.length ||
      (state.activeQuests || []).length ||
      5);

  const completedToday = todayQuests.length;
  const allDoneToday = completedToday >= totalToday && totalToday > 0;
  const noneDoneToday = completedToday === 0;

  const missedYesterday =
    day > 1 && yesterdayQuests.length === 0 && !completedDays[day - 1];

  const arc = getArc(day);
  const hour = new Date().getHours();

  // Rough day parts
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const isEvening = hour >= 17 && hour < 22;
  const isLate = hour >= 22 || hour < 5;

  // Milestone proximity
  const isBossDayEve = (day + 1) % 21 === 0;
  const isBossDay = day % 21 === 0 && day > 0;
  const isArcTransitionEve = [30, 90, 180, 365].includes(day + 1);

  return {
    day,
    streak,
    arc,
    stake,
    completedToday,
    totalToday,
    allDoneToday,
    noneDoneToday,
    missedYesterday,
    hour,
    isMorning,
    isAfternoon,
    isEvening,
    isLate,
    isBossDayEve,
    isBossDay,
    isArcTransitionEve,
  };
}

// Trim a stake sentence to fit in a banner without breaking meaning
function clipStake(s, max = 90) {
  if (!s) return "";
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

// ─────────────────────────────────────────────────────────────────
// Deterministic pick — so the same day shows the same line
// (avoids jittering if component re-renders)
// ─────────────────────────────────────────────────────────────────

function pick(lines, seed) {
  if (!lines || lines.length === 0) return null;
  if (lines.length === 1) return lines[0];
  const idx = Math.abs(hash(String(seed))) % lines.length;
  return lines[idx];
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return h;
}

// ─────────────────────────────────────────────────────────────────
// HOME BANNER — shown above the quest list on HomeView
// Sparse rules:
//   - Recovery (missed yesterday) → always speak, once
//   - Boss day / arc transition eve → always speak
//   - Morning + 0 done → speak
//   - Afternoon + 0 done → speak (nudge)
//   - Evening + not all done → speak (gentle pressure)
//   - All done → brief acknowledgment
//   - Otherwise → silent
// ─────────────────────────────────────────────────────────────────

function homeBanner(ctx) {
  const { day, streak, arc, missedYesterday, noneDoneToday, allDoneToday,
    isMorning, isAfternoon, isEvening, isBossDay, isBossDayEve,
    isArcTransitionEve, completedToday, totalToday } = ctx;

  // Recovery — highest priority. When a stake exists, surface the user's own words.
  if (missedYesterday) {
    const stake = ctx.stake;
    if (stake?.cost) {
      return pick([
        { line: `You wrote: "${clipStake(stake.cost)}" — it's still true.`, tone: "recovery" },
        { line: `Yesterday slipped. Your reason hasn't changed.`, tone: "recovery" },
      ], `recovery-${day}`);
    }
    return pick([
      { line: "Yesterday slipped. Today doesn't have to.", tone: "recovery" },
      { line: "One missed day isn't the story. The next one is.", tone: "recovery" },
      { line: "The streak resets. The person you're building doesn't.", tone: "recovery" },
    ], `recovery-${day}`);
  }

  // Arc transition eve
  if (isArcTransitionEve) {
    return { line: `Tomorrow: ${nextArcName(day)}. Close this one well.`, tone: "milestone" };
  }

  // Boss day today
  if (isBossDay) {
    return pick([
      { line: `Boss Day. Twenty-one days asking the same question: will you show up?`, tone: "boss" },
      { line: `Day ${day}. A checkpoint, not a finish line.`, tone: "boss" },
    ], `boss-${day}`);
  }

  // Boss day tomorrow
  if (isBossDayEve) {
    return { line: "Tomorrow is a Boss Day. Tonight sets the tone.", tone: "milestone" };
  }

  // All done
  if (allDoneToday) {
    return pick(byArc(arc.id, {
      foundation: [
        { line: "All six. That's how foundations get laid.", tone: "seal" },
        { line: "Done. Quietly, without drama. That's the point.", tone: "seal" },
      ],
      build: [
        { line: "Day closed. Momentum is real and it's yours.", tone: "seal" },
        { line: `${streak} days. The pattern is forming.`, tone: "seal" },
      ],
      forge: [
        { line: "Complete. This is what forged looks like.", tone: "seal" },
        { line: "Seal it. Tomorrow is already watching.", tone: "seal" },
      ],
      mastery: [
        { line: "Another day handled. This is the baseline now.", tone: "seal" },
      ],
      legend: [
        { line: "Done.", tone: "seal" },
      ],
    }), `seal-${day}`);
  }

  // Morning + nothing started
  if (isMorning && noneDoneToday) {
    return pick(byArc(arc.id, {
      foundation: [
        { line: `Day ${day}. Start with one small thing.`, tone: "morning" },
        { line: "The first quest is the hardest. That's why it matters.", tone: "morning" },
      ],
      build: [
        { line: `${streak}-day streak. Today keeps it alive.`, tone: "morning" },
        { line: "You know how this works now. Begin.", tone: "morning" },
      ],
      forge: [
        { line: "The forge doesn't care how you feel. Show up anyway.", tone: "morning" },
        { line: `Day ${day}. Habits this deep don't miss.`, tone: "morning" },
      ],
      mastery: [
        { line: "You don't need motivation. You need to start.", tone: "morning" },
      ],
      legend: [
        { line: "Begin.", tone: "morning" },
      ],
    }), `morning-${day}`);
  }

  // Afternoon + nothing done = gentle nudge
  if (isAfternoon && noneDoneToday) {
    return pick([
      { line: "Still untouched. One small move changes the day.", tone: "nudge" },
      { line: "The day is half-written. You haven't picked up the pen.", tone: "nudge" },
      streak >= 7
        ? { line: `${streak} days didn't happen by accident. Move.`, tone: "nudge" }
        : { line: "Start anywhere. The first one is the hardest.", tone: "nudge" },
    ], `nudge-${day}`);
  }

  // Evening + incomplete = closing pressure
  if (isEvening && !allDoneToday && completedToday < totalToday) {
    const remaining = totalToday - completedToday;
    if (streak >= 14) {
      return { line: `${remaining} left. You've protected longer streaks than this.`, tone: "close" };
    }
    return pick([
      { line: `${remaining} quest${remaining === 1 ? "" : "s"} left. The day isn't closed yet.`, tone: "close" },
      { line: "Evening. Finish what you started.", tone: "close" },
    ], `close-${day}`);
  }

  // Mid-progress, no urgency — silent
  return null;
}

// ─────────────────────────────────────────────────────────────────
// POST-QUEST — micro-line after completing a quest
// Not shown every time. Only on meaningful beats.
// ─────────────────────────────────────────────────────────────────

function postQuest(ctx, meta = {}) {
  const { questId, categoryStreak = 0 } = meta;
  const { completedToday, totalToday, allDoneToday, arc, streak } = ctx;

  // First quest of the day
  if (completedToday === 1 && totalToday > 1) {
    return pick([
      { line: "The hardest one is done. Momentum from here.", tone: "post" },
      { line: "First move made.", tone: "post" },
    ], `first-${ctx.day}`);
  }

  // Last quest of the day (but not a category milestone)
  if (allDoneToday) {
    return null; // handled by banner seal instead
  }

  // Category streak milestones
  if (categoryStreak === 7) {
    return { line: `Seven days on ${prettyCategory(questId)}. The body is starting to expect it.`, tone: "post" };
  }
  if (categoryStreak === 21) {
    return { line: `Twenty-one days on ${prettyCategory(questId)}. This isn't a habit anymore. It's identity.`, tone: "post" };
  }
  if (categoryStreak === 66) {
    return { line: `Sixty-six days. ${prettyCategory(questId)} is who you are now.`, tone: "post" };
  }

  // Halfway mark
  if (completedToday === Math.ceil(totalToday / 2) && totalToday >= 4) {
    if (arc.id === "forge" || arc.id === "mastery") return null; // too small to celebrate
    return { line: "Halfway. The back half is the fastest.", tone: "post" };
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────
// PRE-SEAL — one optional question before sealing the day
// User can skip. Journaled into Forge if answered.
// ─────────────────────────────────────────────────────────────────

function preSeal(ctx) {
  const { arc, streak, day, isBossDayEve, stake } = ctx;

  if (isBossDayEve) {
    return { line: "Tomorrow is a Boss Day. What are you bringing to it?", tone: "reflect" };
  }

  // Every ~7 days, if stake exists, ask whether today served the Why.
  if (stake?.why && day % 7 === 0) {
    return {
      line: `You said you're here because: "${clipStake(stake.why, 110)}" Did today serve that?`,
      tone: "reflect",
    };
  }

  return pick(byArc(arc.id, {
    foundation: [
      { line: "What almost stopped you today?", tone: "reflect" },
      { line: "Which quest felt heaviest? Why?", tone: "reflect" },
      { line: "What surprised you about today?", tone: "reflect" },
    ],
    build: [
      { line: "Where did you feel resistance?", tone: "reflect" },
      { line: "What would yesterday-you think of today?", tone: "reflect" },
      { line: "What got easier this week?", tone: "reflect" },
    ],
    forge: [
      { line: "What did the work cost today?", tone: "reflect" },
      { line: "Who were you today that you weren't six months ago?", tone: "reflect" },
      { line: "What did you choose over comfort?", tone: "reflect" },
    ],
    mastery: [
      { line: "What did you notice today that most people miss?", tone: "reflect" },
      { line: "Where did you raise the standard?", tone: "reflect" },
    ],
    legend: [
      { line: "What's next?", tone: "reflect" },
    ],
  }), `seal-q-${day}`);
}

// ─────────────────────────────────────────────────────────────────
// NOTIFICATION SLOTS — rendered at send time, not schedule time
// ─────────────────────────────────────────────────────────────────

function morningIntent(ctx) {
  const { arc, streak, day, missedYesterday } = ctx;
  if (missedYesterday) {
    return { title: "Life OS", body: "Yesterday slipped. Today doesn't have to.", tone: "recovery" };
  }
  const body = pick(byArc(arc.id, {
    foundation: [
      `Day ${day}. Small. Consistent. Begin.`,
      "The first quest is the hardest. That's why it matters.",
    ],
    build: [
      `${streak}-day streak. Today keeps it alive.`,
      "You know how this works. Begin.",
    ],
    forge: [
      "The forge doesn't care how you feel. Show up.",
      `Day ${day}. Habits this deep don't miss.`,
    ],
    mastery: ["You don't need motivation. You need to start."],
    legend: ["Begin."],
  }), `morn-${day}`);
  return { title: "Morning", body, tone: "morning" };
}

function middayCheck(ctx) {
  if (!ctx.noneDoneToday) return null; // sparse: only if idle
  const body = ctx.streak >= 7
    ? `${ctx.streak} days didn't happen by accident. Move.`
    : "Still untouched. One small move changes the day.";
  return { title: "Midday", body, tone: "nudge" };
}

function eveningSeal(ctx) {
  const { completedToday, totalToday, allDoneToday } = ctx;
  if (allDoneToday) {
    return { title: "Evening", body: "All done. Seal the day.", tone: "seal" };
  }
  const remaining = totalToday - completedToday;
  return {
    title: "Evening",
    body: `${remaining} quest${remaining === 1 ? "" : "s"} left. The day isn't closed.`,
    tone: "close",
  };
}

function lateRecovery(ctx) {
  const { completedToday, totalToday, streak } = ctx;
  if (completedToday >= totalToday) return null;
  if (streak < 3) return null; // don't late-nag new users
  return {
    title: "Streak at risk",
    body: `${streak} days. Don't break what you built.`,
    tone: "risk",
  };
}

// ─────────────────────────────────────────────────────────────────
// Main dispatcher
// ─────────────────────────────────────────────────────────────────

export function getVoice(slot, state, meta = {}) {
  // Respect user toggle
  if (state?.voiceEnabled === false) return null;

  const ctx = getContext(state);

  switch (slot) {
    case "home_banner": return homeBanner(ctx);
    case "post_quest": return postQuest(ctx, meta);
    case "pre_seal": return preSeal(ctx);
    case "morning_intent": return morningIntent(ctx);
    case "midday_check": return middayCheck(ctx);
    case "evening_seal": return eveningSeal(ctx);
    case "late_recovery": return lateRecovery(ctx);
    default: return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function byArc(arcId, map) {
  return map[arcId] || map.foundation || [];
}

function nextArcName(day) {
  if (day + 1 === 31) return "Build";
  if (day + 1 === 91) return "Forge";
  if (day + 1 === 181) return "Mastery";
  if (day + 1 === 366) return "Legend";
  return "the next arc";
}

function prettyCategory(questId = "") {
  const id = String(questId).split("-")[0];
  const map = {
    sleep: "sleep", water: "hydration", exercise: "training",
    mind: "the mind", screen: "screens", shower: "cold",
    dojo: "training", reading: "reading",
  };
  return map[id] || id || "this";
}

// Exported for testing / introspection
export { getContext };

// ─────────────────────────────────────────────────────────────────
// VOICE NOTIFICATION SCHEDULER
// Fires adaptive OS notifications at 4 slots/day. Content is resolved
// at SEND time (not schedule time) so it reflects current progress.
//
// Usage: pass a getState() accessor (not a stale snapshot) so each
// tick sees the latest progress.
// ─────────────────────────────────────────────────────────────────

const DEFAULT_SLOT_TIMES = {
  morning_intent: "08:00",
  midday_check: "14:00",
  evening_seal: "20:00",
  late_recovery: "22:30",
};

export function getDefaultVoiceNotifSettings() {
  return {
    enabled: true,
    slots: { ...DEFAULT_SLOT_TIMES },
  };
}

export function scheduleVoiceNotifications(getState, sendNotification) {
  const firedToday = {}; // "YYYY-MM-DD:slot" → true

  const tick = () => {
    const state = typeof getState === "function" ? getState() : getState;
    if (!state) return;
    if (state.voiceEnabled === false) return;

    const settings = state.voiceNotifSettings || getDefaultVoiceNotifSettings();
    if (settings.enabled === false) return;

    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const dateKey = now.toISOString().split("T")[0];

    for (const [slot, time] of Object.entries(settings.slots || DEFAULT_SLOT_TIMES)) {
      if (time !== hhmm) continue;
      const fireKey = `${dateKey}:${slot}`;
      if (firedToday[fireKey]) continue;

      const v = getVoice(slot, state);
      if (v && v.body) {
        sendNotification(v.title || "Life OS", v.body);
        firedToday[fireKey] = true;
      } else {
        // Still mark as fired to avoid repeat attempts this minute
        firedToday[fireKey] = true;
      }
    }
  };

  const id = setInterval(tick, 60_000);
  // Fire once immediately to catch startup near a slot
  tick();
  return id;
}

