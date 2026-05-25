import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { CATEGORIES } from "../../data/categories";

// Extract the category id from any of the three quest-id shapes the app uses.
function categoryFromQuestId(id) {
  if (!id) return null;
  const parts = id.split("-");
  if (parts[0] === "lib" || parts[0] === "custom") return parts[1] || null;
  return parts[0] || null;
}

/**
 * Heuristic-based insights from the user's activity.
 * No AI required — surfaces patterns from raw data.
 */
export default function PatternInsights({ state }) {
  const insights = useMemo(() => generateInsights(state), [state]);

  if (insights.length === 0) {
    return (
      <div style={styles.empty}>
        <Lightbulb size={20} color={TOKENS.color.textTertiary} />
        <div style={styles.emptyText}>
          Patterns appear after <strong>7 active days</strong>.<br/>
          Keep showing up — we'll spot the wins and the slips for you.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      {insights.map((ins, i) => (
        <div key={i} style={{ ...styles.card, borderLeftColor: ins.color }}>
          <Lightbulb size={14} color={ins.color} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={styles.title}>{ins.title}</div>
            <div style={styles.body}>{ins.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function generateInsights(state) {
  const completed = state.completedQuests || {};
  const days = Object.entries(completed).filter(([_, ids]) => Array.isArray(ids) && ids.length > 0);
  if (days.length < 7) return [];

  const out = [];

  // 1. Best day of week
  const byDow = [0, 0, 0, 0, 0, 0, 0];
  const byDowCount = [0, 0, 0, 0, 0, 0, 0];
  days.forEach(([key, ids]) => {
    const d = new Date(key + "T12:00:00");
    if (isNaN(d)) return;
    const dow = d.getDay();
    byDow[dow] += ids.length;
    byDowCount[dow]++;
  });
  const avg = byDow.map((sum, i) => (byDowCount[i] > 0 ? sum / byDowCount[i] : 0));
  const bestDow = avg.indexOf(Math.max(...avg));
  const worstDow = avg.indexOf(Math.min(...avg.filter((v) => v > 0)));
  const dowNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (avg[bestDow] > 0) {
    out.push({
      title: `${dowNames[bestDow]} is your strongest day`,
      body: `Average ${avg[bestDow].toFixed(1)} quests completed on ${dowNames[bestDow]}s. Stack your hardest habits on this day.`,
      color: "#22C55E",
    });
  }
  if (worstDow >= 0 && avg[worstDow] > 0 && worstDow !== bestDow && avg[worstDow] < avg[bestDow] * 0.6) {
    out.push({
      title: `${dowNames[worstDow]} tends to slip`,
      body: `Completion drops ${Math.round((1 - avg[worstDow] / avg[bestDow]) * 100)}% on ${dowNames[worstDow]}s. Consider lighter quests or earlier reminders.`,
      color: "#F59E0B",
    });
  }

  // 2. Streak momentum
  const streak = state.streak || 0;
  const bestStreak = state.bestStreak || 0;
  if (streak >= 7) {
    out.push({
      title: `${streak}-day streak active`,
      body: bestStreak > streak
        ? `Your best is ${bestStreak}. Push past it.`
        : `New personal best every day from here on.`,
      color: "#F97316",
    });
  } else if (streak === 0 && bestStreak > 7) {
    out.push({
      title: "Comeback opportunity",
      body: `You've held a ${bestStreak}-day streak before. Start fresh today — you know you can do this.`,
      color: "#7C5CFC",
    });
  }

  // 3. Forge longevity
  const forgeEntries = Object.entries(state.sobrietyDates || {});
  if (forgeEntries.length > 0) {
    const oldest = forgeEntries.reduce((m, [id, date]) => {
      const d = new Date(date);
      return !m || d < m.date ? { id, date: d } : m;
    }, null);
    if (oldest) {
      const days = Math.floor((Date.now() - oldest.date) / 86400000);
      if (days >= 30) {
        out.push({
          title: `${days} days clean from ${oldest.id.replace(/_/g, " ")}`,
          body: "Your brain has had time to rewire. The next 30 days compound on this foundation.",
          color: "#EC4899",
        });
      }
    }
  }

  // 4. Category leader (which domain user crushes most)
  const byCat = {};
  days.forEach(([_, ids]) => {
    ids.forEach((id) => {
      const cat = categoryFromQuestId(id);
      if (!cat) return;
      byCat[cat] = (byCat[cat] || 0) + 1;
    });
  });
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  if (top) {
    const meta = CATEGORIES.find((c) => c.id === top[0]);
    const label = meta?.label || (top[0].charAt(0).toUpperCase() + top[0].slice(1));
    out.push({
      title: `${label} is your strongest domain`,
      body: `${top[1]} completions all-time. Consider raising the bar on this category — adaptive difficulty.`,
      color: "#3B82F6",
    });
  }

  // 5. Goal-aware nudge — reference the user's stated primary goal so the
  // insights speak directly to what they signed up to do.
  const goal = state.profile?.primaryGoal;
  if (goal) {
    const goalNudge = GOAL_NUDGES[goal];
    if (goalNudge) {
      // Pick the variant that fits the user's current state.
      const variant = goalNudge(state, { byCat, streak: state.streak || 0 });
      if (variant) out.push(variant);
    }
  }

  return out.slice(0, 4);
}

// Insight nudges tailored to the user's primary goal from onboarding.
// Each returns a card-style insight, or null if not applicable.
const GOAL_NUDGES = {
  fitness: (state, { byCat }) => {
    const exerciseCount = byCat.exercise || 0;
    const workouts = Object.keys(state.workoutLogs || {}).length;
    if (workouts === 0 && exerciseCount < 3) {
      return {
        title: "You said fitness — open the Dojo",
        body: "No workouts logged yet. Even a 15-min session counts. Train → pick a quick workout.",
        color: "#EF4444",
      };
    }
    return null;
  },
  discipline: (state) => {
    const hasMind = (state.activeQuests || []).some((aq) => aq.libraryId?.startsWith("mind-"));
    if (!hasMind) {
      return {
        title: "Discipline starts with the mind",
        body: "You don't have a mind quest in your roster yet. Add a daily meditation from the library.",
        color: "#7C5CFC",
      };
    }
    return null;
  },
  quit: (state) => {
    const forgeCount = Object.keys(state.sobrietyDates || {}).length;
    if (forgeCount === 0) {
      return {
        title: "You said quit — start a Forge tracker",
        body: "Even a single 'days clean' counter rewires the brain's reward loop. Tap Forge to start one.",
        color: "#F97316",
      };
    }
    return null;
  },
  learning: (state) => {
    const insightsRead = Object.keys(state.readInsights || {}).length;
    const coursesDone = Object.values(state.courseProgress || {}).filter((p) => p?.completed).length;
    if (insightsRead < 3 && coursesDone === 0) {
      return {
        title: "Learn deeply — open Academy or a book",
        body: "Your stated goal is learning, but you haven't read an insight or completed a course yet. Five minutes a day compounds.",
        color: "#3B82F6",
      };
    }
    return null;
  },
  balance: (state, { byCat }) => {
    const cats = Object.keys(byCat);
    if (cats.length === 1) {
      return {
        title: "Balance means spreading the load",
        body: "All your completions are in one domain. Add at least one quest from a different area to round it out.",
        color: "#22C55E",
      };
    }
    return null;
  },
};

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: TOKENS.space[2] },
  empty: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
  },
  emptyText: {
    flex: 1,
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textSecondary,
    lineHeight: 1.6,
    textAlign: "left",
  },
  card: {
    display: "flex", gap: TOKENS.space[3],
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    borderLeft: "3px solid",
  },
  title: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  body: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textSecondary,
    marginTop: 4,
    lineHeight: 1.5,
  },
};
