import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOKENS, DARK_COLORS } from "../styles/theme";
import { useTheme } from "../hooks/useTheme";
import { getPersonalizedQuote, getProactiveNudges, getCategoryCompletionRates } from "../utils/intelligence";
import { getDayQuests, daysBetween } from "../utils";
import { getAICoachMessage } from "../utils/ai";
import { MOTIVATION_CARDS, SOBRIETY_DEFAULTS } from "../data";
import { Sparkles, ArrowRight, Quote } from "lucide-react";

const T = TOKENS;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function buildLocalBrief(state) {
  const lines = [];
  const { streak = 0, currentDay = 1, xp = 0, sobrietyDates = {}, completedQuests = {} } = state;

  // Streak callout
  if (streak > 0) {
    lines.push(`You're on a ${streak}-day streak. Keep it alive today.`);
  } else if (currentDay > 1) {
    lines.push("Today is a fresh start. One quest at a time.");
  } else {
    lines.push("Welcome to Day 1. Let's build something great.");
  }

  // Yesterday recap
  const yesterday = currentDay - 1;
  const yesterdayQuests = completedQuests[yesterday] || [];
  if (yesterday > 0 && yesterdayQuests.length > 0) {
    const totalYesterday = getDayQuests(yesterday, state.customQuests).length;
    lines.push(`Yesterday you completed ${yesterdayQuests.length}/${totalYesterday} quests.`);
  }

  // Forge highlight
  const trackers = Object.entries(sobrietyDates).filter(([, d]) => !!d);
  if (trackers.length > 0) {
    const best = trackers.reduce((a, b) => {
      const da = daysBetween(a[1]);
      const db = daysBetween(b[1]);
      return da > db ? a : b;
    });
    const days = daysBetween(best[1]);
    const meta = SOBRIETY_DEFAULTS?.find((s) => s.id === best[0]);
    if (days > 0) {
      lines.push(`${days} days clean of ${meta?.label || best[0]}. Proud of you.`);
    }
  }

  // Weak category nudge
  const rates = getCategoryCompletionRates(state);
  const weakest = Object.entries(rates).sort(([, a], [, b]) => a - b)[0];
  if (weakest && weakest[1] < 0.5 && currentDay > 5) {
    lines.push(`Focus area: your ${weakest[0]} completion is ${Math.round(weakest[1] * 100)}%.`);
  }

  return lines.join(" ");
}

export default function MorningBrief({ state, user, onDismiss }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const [aiBrief, setAiBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  const userName = user?.displayName || state.userName || "Warrior";
  const quote = getPersonalizedQuote(state, MOTIVATION_CARDS);
  const nudges = getProactiveNudges(state).slice(0, 2);
  const localBrief = buildLocalBrief(state);

  useEffect(() => {
    let cancelled = false;
    getAICoachMessage(state).then((msg) => {
      if (!cancelled) {
        setAiBrief(msg);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const briefText = aiBrief || localBrief;

  const bg = isDark
    ? "linear-gradient(180deg, #0C0F1A 0%, #161233 50%, #0C0F1A 100%)"
    : "linear-gradient(180deg, #FAFAF9 0%, #EDE9FE 50%, #FAFAF9 100%)";

  const s = getStyles(isDark, colors);

  return (
    <motion.div
      style={{ ...s.fullscreen, background: bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        style={s.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
      >
        {/* Greeting */}
        <p style={s.dateLabel}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 style={s.greeting}>{getGreeting()}, {userName}</h1>
        <p style={s.subtitle}>Day {state.currentDay} &middot; {state.streak || 0}-day streak</p>

        {/* Brief */}
        <motion.div
          style={s.briefCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          {loading ? (
            <div style={s.loadingDots}>
              <span style={s.dot} /><span style={{ ...s.dot, animationDelay: "0.15s" }} /><span style={{ ...s.dot, animationDelay: "0.3s" }} />
            </div>
          ) : (
            <p style={s.briefText}>{briefText}</p>
          )}
        </motion.div>

        {/* Nudges */}
        {nudges.length > 0 && (
          <motion.div
            style={s.nudgeSection}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <p style={s.nudgeLabel}>Today's focus</p>
            {nudges.map((n, i) => (
              <div key={i} style={s.nudgeRow}>
                <span style={s.nudgeIcon}>{n.icon}</span>
                <span style={s.nudgeText}>{n.title}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Quote */}
        <motion.div
          style={s.quoteSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          <Quote size={18} color="#7C5CFC" strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: 6 }} />
          <p style={s.quoteText}>{quote.quote}</p>
          <p style={s.quoteAuthor}>&mdash; {quote.author}</p>
        </motion.div>

        {/* CTA */}
        <motion.button
          style={s.cta}
          onClick={onDismiss}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            Start Your Day <ArrowRight size={16} />
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function getStyles(isDark, colors) {
  const text = isDark ? "#E2E8F0" : "#1E293B";
  const textSub = isDark ? "rgba(226,232,240,0.5)" : "rgba(30,41,59,0.5)";

  return {
    fullscreen: {
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    content: {
      maxWidth: 400,
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: 20,
    },
    dateLabel: {
      fontSize: T.font.xs,
      color: textSub,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      fontWeight: T.weight.medium,
      margin: 0,
    },
    greeting: {
      fontSize: 28,
      fontWeight: T.weight.black,
      margin: 0,
      background: isDark
        ? "linear-gradient(135deg, #E2E8F0, #A78BFA)"
        : "linear-gradient(135deg, #1E293B, #7C3AED)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: T.font.sm,
      color: "#7C5CFC",
      fontWeight: T.weight.bold,
      margin: 0,
    },
    briefCard: {
      padding: "20px 24px",
      borderRadius: T.radii.lg,
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
      width: "100%",
    },
    briefText: {
      fontSize: T.font.md,
      lineHeight: 1.7,
      color: text,
      margin: 0,
      fontWeight: T.weight.normal,
    },
    loadingDots: {
      display: "flex",
      gap: 6,
      justifyContent: "center",
      padding: "8px 0",
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "#7C5CFC",
      opacity: 0.4,
      animation: "pulse 1s ease-in-out infinite",
    },
    nudgeSection: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    nudgeLabel: {
      fontSize: T.font.xs,
      color: textSub,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: T.weight.bold,
      margin: 0,
      textAlign: "left",
    },
    nudgeRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: T.radii.md,
      background: isDark ? "rgba(124,92,252,0.06)" : "rgba(124,92,252,0.04)",
      border: isDark ? "1px solid rgba(124,92,252,0.1)" : "1px solid rgba(124,92,252,0.08)",
    },
    nudgeIcon: { fontSize: 16, flexShrink: 0 },
    nudgeText: {
      fontSize: T.font.sm,
      fontWeight: T.weight.medium,
      color: text,
      textAlign: "left",
    },
    quoteSection: {
      padding: "0 12px",
    },
    quoteText: {
      fontSize: T.font.md,
      fontStyle: "italic",
      lineHeight: 1.6,
      color: textSub,
      margin: 0,
    },
    quoteAuthor: {
      fontSize: T.font.xs,
      color: textSub,
      margin: "6px 0 0",
    },
    cta: {
      marginTop: 8,
      padding: "14px 48px",
      borderRadius: T.radii.xl,
      border: "none",
      background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
      color: "#fff",
      fontSize: T.font.md,
      fontWeight: T.weight.bold,
      cursor: "pointer",
      boxShadow: "0 4px 20px rgba(124,92,252,0.35)",
      letterSpacing: 0.3,
    },
  };
}
