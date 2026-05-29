import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, Sun, Sunset, Moon, ChevronDown, ChevronUp, Zap, Trophy, BookOpen, Plus, Dumbbell, X } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { getTodayStr, getDayQuests, daysBetween, getLevelIndex } from "../../utils";
import { getDailyBonusQuest, getWeeklyChallenge } from "../../utils/xpEngine";
import { CATEGORIES } from "../../data/categories";
import { LEVELS, MOTIVATION_CARDS } from "../../data/constants";
import StreakPill from "../shared/StreakPill";
import ProgressRing from "../shared/ProgressRing";
import AICoachWidget from "../shared/AICoachWidget";
import { feedback } from "../../utils/audio";

const TIME_BLOCKS = [
  { id: "morning", label: "Morning", icon: Sun, accent: "#F59E0B", time: "Wake up to noon" },
  { id: "midday",  label: "Midday",  icon: Sunset, accent: "#F97316", time: "Noon to evening" },
  { id: "evening", label: "Evening", icon: Moon, accent: "#7C5CFC", time: "Evening to bed" },
  { id: "anytime", label: "Anytime", icon: Zap,  accent: "#10B981", time: "Throughout the day" },
];

export default function TodayScreen({ state, save, onOpenPanel }) {
  const today = getTodayStr();
  const dayNumber = state.startDate ? daysBetween(state.startDate) + 1 : 1;
  const todayQuests = getDayQuests(dayNumber, state.customQuests, state);
  const completedIds = state.completedQuests?.[today] || [];
  const completedToday = todayQuests.filter((q) => completedIds.includes(q.id));
  const progress = todayQuests.length > 0 ? completedToday.length / todayQuests.length : 0;
  const allDone = todayQuests.length > 0 && completedToday.length === todayQuests.length;
  const [collapsedBlocks, setCollapsedBlocks] = useState({});

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const levelIdx = getLevelIndex(state.xp || 0);
  const levelName = LEVELS[levelIdx]?.name || "Beginner";
  const forgeEntries = Object.entries(state.sobrietyDates || {});

  // Group quests by time block
  const questsByBlock = useMemo(() => {
    const groups = { morning: [], midday: [], evening: [], anytime: [] };
    todayQuests.forEach((q) => {
      const block = q.timeOfDay || "anytime";
      (groups[block] || groups.anytime).push(q);
    });
    return groups;
  }, [todayQuests]);

  const dailyBonus = useMemo(() => getDailyBonusQuest({ ...state, currentDay: dayNumber }), [state, dayNumber]);
  const weeklyChallenge = useMemo(() => getWeeklyChallenge({ ...state, currentDay: dayNumber }), [state, dayNumber]);

  const dailyQuote = useMemo(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return MOTIVATION_CARDS[dayOfYear % MOTIVATION_CARDS.length];
  }, []);

  function toggleQuest(questId, explicitXp) {
    const isDone = completedIds.includes(questId);
    const newCompleted = isDone
      ? completedIds.filter((id) => id !== questId)
      : [...completedIds, questId];
    // Daily Bonus / Weekly Challenge quests aren't in todayQuests, so look up
    // their xp via the explicit param when the caller knows it.
    const quest = todayQuests.find((q) => q.id === questId);
    const xpForQuest = quest?.xp ?? explicitXp ?? 15;
    const xpDelta = isDone ? -xpForQuest : xpForQuest;
    feedback(isDone ? "questUncheck" : "questCheck");
    save({
      ...state,
      completedQuests: { ...state.completedQuests, [today]: newCompleted },
      xp: Math.max(0, (state.xp || 0) + xpDelta),
      lifetimeXp: (state.lifetimeXp || 0) + (xpDelta > 0 ? xpDelta : 0),
    });
  }

  function toggleBlock(blockId) {
    setCollapsedBlocks((p) => ({ ...p, [blockId]: !p[blockId] }));
  }

  return (
    <div style={styles.screen}>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={styles.header}
      >
        <div>
          <div style={styles.greeting}>
            {greeting}{state.userName ? `, ${state.userName}` : ""}
          </div>
          <div style={styles.dayLabel}>Day {dayNumber}</div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.levelPill}>Lv.{levelIdx + 1} {levelName}</div>
          <StreakPill streak={state.streak || 0} freezes={state.streakFreezes || 0} />
        </div>
      </motion.header>

      {/* Progress ring (only when roster is non-empty) */}
      {todayQuests.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          onClick={() => onOpenPanel("progress")}
          style={{
            ...styles.progressSection,
            background: allDone
              ? "linear-gradient(135deg, rgba(34,197,94,0.10) 0%, rgba(16,185,129,0.04) 100%)"
              : styles.progressSection.background,
            borderColor: allDone ? "rgba(34,197,94,0.22)" : styles.progressSection.border,
          }}
        >
          <ProgressRing progress={progress} size={64} />
          <div style={styles.progressText}>
            <div style={styles.progressCount}>
              {completedToday.length} of {todayQuests.length}
            </div>
            <div style={styles.progressLabel}>
              {allDone ? "All protocols complete" : "protocols done"}
            </div>
          </div>
          <ChevronDown size={16} color={TOKENS.color.textTertiary} style={{ transform: "rotate(-90deg)", flexShrink: 0 }} />
        </motion.button>
      )}

      {/* Empty roster state — invite the user to build one */}
      {todayQuests.length === 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onOpenPanel("quest-library")}
          style={styles.emptyState}
        >
          <Sparkles size={20} color={TOKENS.color.brand} />
          <div style={styles.emptyTitle}>No habits yet</div>
          <div style={styles.emptyBody}>
            Browse 86 vetted habits and pick the ones that fit your life. Add as many or as few as you want.
          </div>
          <div style={styles.emptyCta}>Browse the library →</div>
        </motion.button>
      )}

      {/* First-day welcome hint — copy adapts to the user's primary goal so
          it feels personal, not generic. */}
      {dayNumber <= 2 && Object.keys(state.completedDays || {}).length === 0 && !state.welcomeHintDismissed && (() => {
        const goal = state.profile?.primaryGoal;
        const titles = {
          fitness:    "Day 1 — let's get strong 💪",
          discipline: "Day 1 — building the muscle 🧠",
          quit:       "Day 1 — every clean day counts 🛡️",
          learning:   "Day 1 — small inputs, big compounding 📚",
          balance:    "Day 1 — the basics, every day 🌅",
        };
        const tips = goal === "fitness" ? [
          [Sparkles, "#7C5CFC", "Today", "Check off the small daily wins — they stack"],
          [Dumbbell, "#EF4444", "Train", "Log every workout — the volume is the receipt"],
          [Shield,   "#F97316", "Forge", "Quitting any habit? Track it here for the streak"],
        ] : goal === "quit" ? [
          [Shield,   "#F97316", "Forge", "Your trackers are live — clean days starting now"],
          [Sparkles, "#7C5CFC", "Today", "Small daily quests give your brain something to win"],
          [Dumbbell, "#EF4444", "Train", "Movement is the best craving-killer — log it"],
        ] : goal === "learning" ? [
          [Sparkles, "#7C5CFC", "Today", "Check off your daily reading + meditation quests"],
          [BookOpen, "#3B82F6", "Learn", "Courses + book summaries — start one course this week"],
          [Shield,   "#F97316", "Forge", "Quitting any distractions? Track them here"],
        ] : [
          [Sparkles, "#7C5CFC", "Today", "Check off your habit quests as you do them"],
          [Dumbbell, "#EF4444", "Train", "Log workouts and follow structured programs"],
          [Shield,   "#F97316", "Forge", "Quit habits and track sober days"],
        ];
        return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.welcomeHint}
        >
          <button
            onClick={() => save({ ...state, welcomeHintDismissed: true })}
            style={styles.welcomeClose}
            aria-label="Dismiss"
          >
            <X size={14} color={TOKENS.color.textTertiary} />
          </button>
          <div style={styles.welcomeTitle}>{titles[goal] || "Welcome to Life OS 🎯"}</div>
          <div style={styles.welcomeBody}>How to use the app this week:</div>
          <div style={styles.welcomeList}>
            {tips.map(([Icon, color, label, copy]) => (
              <div key={label} style={styles.welcomeItem}>
                <Icon size={14} color={color} />
                <div><strong>{label}</strong> — {copy}</div>
              </div>
            ))}
          </div>
        </motion.div>
        );
      })()}

      {/* All done celebration — richer inline banner so the day's win feels
          earned even without the modal popping. */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          style={styles.celebration}
        >
          <div style={styles.celebrationIcon}>
            <Sparkles size={18} color="#fff" strokeWidth={2.4} />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={styles.celebrationKicker}>DAY SEALED</div>
            <div style={styles.celebrationText}>All protocols complete. You showed up.</div>
          </div>
        </motion.div>
      )}

      {/* Daily Bonus Quest */}
      {dailyBonus && !completedIds.includes(dailyBonus.id) && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => toggleQuest(dailyBonus.id, dailyBonus.xp)}
          style={styles.bonusCard}
        >
          <div style={styles.bonusIcon}>
            <Zap size={20} color="#FBBF24" fill="#FBBF24" />
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={styles.bonusLabel}>DAILY BONUS · +{dailyBonus.xp} XP</div>
            <div style={styles.bonusText}>{dailyBonus.text}</div>
          </div>
        </motion.button>
      )}

      {/* Weekly Challenge */}
      {weeklyChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.challengeCard}
        >
          <div style={styles.challengeHeader}>
            <Trophy size={14} color="#7C5CFC" />
            <span style={styles.challengeLabel}>WEEKLY CHALLENGE · +{weeklyChallenge.xpReward} XP</span>
          </div>
          <div style={styles.challengeText}>{weeklyChallenge.text}</div>
          {weeklyChallenge.progress != null && (
            <div style={styles.challengeBar}>
              <div style={{
                ...styles.challengeFill,
                width: `${Math.min((weeklyChallenge.progress / weeklyChallenge.requirement) * 100, 100)}%`,
              }} />
            </div>
          )}
          <div style={styles.challengeMeta}>
            {weeklyChallenge.progress || 0} / {weeklyChallenge.requirement}
          </div>
        </motion.div>
      )}

      {/* Time-blocked quests */}
      <section style={styles.blocks}>
        {TIME_BLOCKS.map((block) => {
          const blockQuests = questsByBlock[block.id] || [];
          if (blockQuests.length === 0) return null;
          const blockCompleted = blockQuests.filter((q) => completedIds.includes(q.id)).length;
          const blockDone = blockCompleted === blockQuests.length;
          const isCollapsed = collapsedBlocks[block.id];
          const BlockIcon = block.icon;

          return (
            <div key={block.id} style={styles.timeBlock}>
              <button onClick={() => toggleBlock(block.id)} style={styles.blockHeader}>
                <div style={{
                  ...styles.blockIconWrap,
                  background: blockDone ? `${block.accent}20` : `${block.accent}10`,
                }}>
                  <BlockIcon size={16} color={block.accent} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={styles.blockTitle}>
                    {block.label}
                    <span style={{ ...styles.blockCount, color: blockDone ? TOKENS.color.success : TOKENS.color.textTertiary }}>
                      {blockCompleted}/{blockQuests.length}
                    </span>
                  </div>
                  <div style={styles.blockTime}>{block.time}</div>
                </div>
                {isCollapsed ? <ChevronDown size={16} color={TOKENS.color.textTertiary} /> : <ChevronUp size={16} color={TOKENS.color.textTertiary} />}
              </button>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={styles.questList}>
                      {blockQuests.map((q) => {
                        const isDone = completedIds.includes(q.id);
                        const cat = CATEGORIES.find((c) => c.id === q.category);
                        const color = DOMAIN_COLORS[q.category] || TOKENS.color.text;
                        return (
                          <button
                            key={q.id}
                            onClick={() => toggleQuest(q.id)}
                            style={{
                              ...styles.questRow,
                              background: isDone ? `${color}08` : "transparent",
                            }}
                          >
                            <div style={{
                              ...styles.questCheck,
                              background: isDone ? color : "transparent",
                              borderColor: isDone ? color : TOKENS.color.border,
                            }}>
                              {isDone && (
                                <svg width="10" height="10" viewBox="0 0 10 10">
                                  <path d="M2 5 L4.5 7.5 L8 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                              <div style={{
                                ...styles.questText,
                                color: isDone ? TOKENS.color.textTertiary : TOKENS.color.text,
                                textDecoration: isDone ? "line-through" : "none",
                              }}>
                                {q.text}
                              </div>
                              <div style={styles.questMeta}>
                                <span>{cat?.icon} {cat?.label}</span>
                                <span style={{ color }}>+{q.xp} XP</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </section>

      {/* Domain tiles — one per active category, taps into DomainPanel */}
      {todayQuests.length > 0 && (() => {
        const domainIds = [...new Set(todayQuests.map((q) => q.category).filter(Boolean))];
        if (domainIds.length < 2) return null;
        return (
          <div style={styles.domainRow}>
            {domainIds.map((catId) => {
              const cat = CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              const catQuests = todayQuests.filter((q) => q.category === catId);
              const done = catQuests.filter((q) => completedIds.includes(q.id)).length;
              const allCatDone = done === catQuests.length;
              const color = DOMAIN_COLORS[catId] || TOKENS.color.text;
              return (
                <button
                  key={catId}
                  onClick={() => onOpenPanel(catId)}
                  style={{
                    ...styles.domainTile,
                    background: allCatDone ? `${color}14` : TOKENS.color.surface,
                    borderColor: allCatDone ? `${color}30` : TOKENS.color.border,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <div style={styles.domainTileText}>
                    <div style={{ ...styles.domainTileLabel, color: allCatDone ? color : TOKENS.color.text }}>
                      {cat.label}
                    </div>
                    <div style={{ ...styles.domainTileMeta, color: allCatDone ? color : TOKENS.color.textTertiary }}>
                      {done}/{catQuests.length}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Browse quests CTA */}
      <button onClick={() => onOpenPanel("quest-library")} style={styles.addQuestBtn}>
        <Plus size={14} color={TOKENS.color.brand} />
        <span style={styles.addQuestText}>
          Browse quests · {(state.activeQuests || []).filter((aq) => !aq.paused).length} active
        </span>
      </button>

      {/* Forge summary strip — shows top 3 trackers + count if there are more */}
      {forgeEntries.length > 0 && (
        <button onClick={() => onOpenPanel("__tab:forge")} style={styles.forgeStrip}>
          <Shield size={14} color="#F97316" />
          <div style={styles.forgeStripText}>
            {forgeEntries.slice(0, 3).map(([id, date], i) => {
              const days = daysBetween(date);
              return (
                <span key={id}>
                  {i > 0 && <span style={styles.forgeDivider}> · </span>}
                  <span style={styles.forgeName}>{id.replace(/_/g, " ")}</span>{" "}
                  <span style={styles.forgeDays}>{days}d</span>
                </span>
              );
            })}
            {forgeEntries.length > 3 && (
              <span style={styles.forgeMore}> · +{forgeEntries.length - 3} more</span>
            )}
          </div>
          <ChevronUp size={14} color={TOKENS.color.textTertiary} style={{ transform: "rotate(90deg)" }} />
        </button>
      )}

      {/* Quick journal CTA — switches copy if user already journaled today */}
      {(() => {
        const journaledToday = !!(state.journal?.[today]?.text || state.moods?.[today]);
        return (
          <button onClick={() => onOpenPanel("journal")} style={styles.journalCta}>
            <BookOpen size={16} color="#7C5CFC" />
            <span style={styles.journalCtaText}>
              {journaledToday ? "✓ Journaled today · edit entry" : "How are you feeling today?"}
            </span>
          </button>
        );
      })()}

      {/* Daily motivation */}
      {dailyQuote && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={styles.quoteCard}
        >
          <div style={styles.quoteText}>"{dailyQuote.quote}"</div>
          <div style={styles.quoteAuthor}>— {dailyQuote.author}</div>
        </motion.section>
      )}

      <AICoachWidget state={state} />
    </div>
  );
}

const styles = {
  screen: { padding: `${TOKENS.space[7]}px ${TOKENS.space[5]}px` },
  domainRow: {
    display: "flex", gap: TOKENS.space[2], overflowX: "auto",
    marginBottom: TOKENS.space[4], paddingBottom: 2,
    scrollbarWidth: "none",
  },
  domainTile: {
    display: "flex", alignItems: "center", gap: TOKENS.space[2],
    padding: `${TOKENS.space[2]}px ${TOKENS.space[3]}px`,
    border: "1px solid", borderRadius: TOKENS.radius.full,
    cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
    transition: TOKENS.transition.fast,
  },
  domainTileText: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
  domainTileLabel: { fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold, lineHeight: 1.2 },
  domainTileMeta: { fontSize: 10, fontWeight: TOKENS.font.weight.semibold, lineHeight: 1.2 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: TOKENS.space[7] },
  greeting: { fontSize: TOKENS.font.size.md, color: TOKENS.color.textSecondary, fontWeight: TOKENS.font.weight.medium },
  dayLabel: { fontSize: TOKENS.font.size.hero, fontWeight: TOKENS.font.weight.heavy, color: TOKENS.color.text, letterSpacing: -1, marginTop: 2 },
  headerRight: { paddingTop: 4, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 },
  levelPill: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold, color: "#fff",
    background: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)",
    padding: "4px 12px", borderRadius: TOKENS.radius.full,
    boxShadow: "0 4px 12px rgba(124,92,252,0.25)",
  },
  progressSection: {
    display: "flex", alignItems: "center", gap: TOKENS.space[5],
    padding: TOKENS.space[5], width: "100%",
    background: "linear-gradient(135deg, rgba(124,92,252,0.06) 0%, rgba(236,72,153,0.04) 100%)",
    border: "1px solid rgba(124,92,252,0.08)",
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[5],
    cursor: "pointer",
  },
  progressText: { flex: 1 },
  progressCount: { fontSize: TOKENS.font.size.xl, fontWeight: TOKENS.font.weight.bold, color: TOKENS.color.text },
  progressLabel: { fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary, marginTop: 2 },
  celebration: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: "linear-gradient(135deg, rgba(34,197,94,0.10) 0%, rgba(16,185,129,0.04) 100%)",
    border: "1px solid rgba(34,197,94,0.22)",
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[5],
  },
  celebrationIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, #22C55E 0%, #10B981 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 16px rgba(34,197,94,0.30)",
    flexShrink: 0,
  },
  celebrationKicker: {
    fontSize: 10, fontWeight: 900, color: "#16A34A",
    letterSpacing: 0.8,
  },
  celebrationText: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
    marginTop: 2,
  },
  bonusCard: {
    display: "flex", alignItems: "center", gap: TOKENS.space[4],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: "linear-gradient(135deg, rgba(251,191,36,0.10) 0%, rgba(249,115,22,0.06) 100%)",
    border: "1px solid rgba(251,191,36,0.20)",
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[3],
    cursor: "pointer", width: "100%",
  },
  bonusIcon: {
    width: 36, height: 36, borderRadius: TOKENS.radius.md,
    background: "rgba(251,191,36,0.18)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  bonusLabel: { fontSize: 10, fontWeight: 900, color: "#B45309", letterSpacing: 0.8 },
  bonusText: { fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.semibold, color: TOKENS.color.text, marginTop: 2 },
  challengeCard: {
    padding: TOKENS.space[5],
    background: "linear-gradient(135deg, rgba(124,92,252,0.06) 0%, rgba(124,92,252,0.02) 100%)",
    border: "1px solid rgba(124,92,252,0.15)",
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[5],
  },
  challengeHeader: { display: "flex", alignItems: "center", gap: 6 },
  challengeLabel: { fontSize: 10, fontWeight: 900, color: "#7C5CFC", letterSpacing: 0.8 },
  challengeText: { fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.semibold, color: TOKENS.color.text, marginTop: TOKENS.space[2] },
  challengeBar: { height: 4, background: "rgba(124,92,252,0.10)", borderRadius: 2, marginTop: TOKENS.space[3], overflow: "hidden" },
  challengeFill: { height: "100%", background: "#7C5CFC", transition: "width 0.4s ease" },
  challengeMeta: { fontSize: 10, color: TOKENS.color.textTertiary, fontWeight: TOKENS.font.weight.semibold, marginTop: 6 },
  blocks: { marginBottom: TOKENS.space[5] },
  timeBlock: { marginBottom: TOKENS.space[4] },
  blockHeader: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px 0`,
    background: "none", border: "none", cursor: "pointer", width: "100%",
  },
  blockIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  blockTitle: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text, display: "flex", alignItems: "center", gap: 8,
  },
  blockCount: { fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold },
  blockTime: { fontSize: 10, color: TOKENS.color.textTertiary, marginTop: 1 },
  questList: { display: "flex", flexDirection: "column", gap: 4 },
  questRow: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    border: "none", cursor: "pointer", width: "100%",
    borderRadius: TOKENS.radius.md,
    transition: TOKENS.transition.fast,
  },
  questCheck: {
    width: 20, height: 20, borderRadius: 10,
    border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: TOKENS.transition.fast,
  },
  questText: { fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.medium, lineHeight: 1.4 },
  questMeta: {
    fontSize: 10, color: TOKENS.color.textTertiary,
    display: "flex", gap: 8, marginTop: 2, fontWeight: TOKENS.font.weight.semibold,
  },
  forgeStrip: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(234,88,12,0.04) 100%)",
    border: "1px solid rgba(249,115,22,0.15)",
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[3],
    cursor: "pointer", width: "100%",
  },
  forgeStripText: { flex: 1, textAlign: "left", fontSize: TOKENS.font.size.xs, color: TOKENS.color.text },
  forgeName: { fontWeight: TOKENS.font.weight.semibold, textTransform: "capitalize" },
  forgeDays: { fontWeight: 900, color: "#F97316" },
  forgeDivider: { color: TOKENS.color.textTertiary },
  forgeMore: { color: TOKENS.color.textTertiary, fontStyle: "italic", fontSize: 11 },
  addQuestBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    width: "100%",
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: "rgba(124,92,252,0.06)",
    border: "1px dashed rgba(124,92,252,0.30)",
    borderRadius: TOKENS.radius.lg,
    cursor: "pointer",
    marginBottom: TOKENS.space[4],
  },
  addQuestText: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.brand,
    letterSpacing: 0.4,
  },
  journalCta: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[4]}px 80px ${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.lg,
    border: "none", cursor: "pointer", width: "100%",
    marginBottom: TOKENS.space[5],
  },
  journalCtaText: { fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary, fontWeight: TOKENS.font.weight.medium },
  quoteCard: {
    padding: TOKENS.space[5],
    background: "linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(249,115,22,0.04) 100%)",
    border: "1px solid rgba(251,191,36,0.12)",
    borderRadius: TOKENS.radius.lg,
  },
  quoteText: {
    fontSize: TOKENS.font.size.sm, fontStyle: "italic",
    lineHeight: 1.5, color: TOKENS.color.text,
  },
  quoteAuthor: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textSecondary,
    marginTop: 6, fontWeight: TOKENS.font.weight.semibold,
  },
  emptyState: {
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", gap: TOKENS.space[2],
    padding: `${TOKENS.space[7]}px ${TOKENS.space[5]}px`,
    background: "linear-gradient(135deg, rgba(124,92,252,0.06) 0%, rgba(236,72,153,0.04) 100%)",
    border: "1px dashed rgba(124,92,252,0.30)",
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[5],
    cursor: "pointer", width: "100%",
  },
  emptyTitle: {
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text, marginTop: TOKENS.space[2],
  },
  emptyBody: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    lineHeight: 1.5, maxWidth: 320,
  },
  emptyCta: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.brand, marginTop: TOKENS.space[2], letterSpacing: 0.3,
  },
  welcomeHint: {
    position: "relative",
    padding: TOKENS.space[5],
    background: "linear-gradient(135deg, rgba(124,92,252,0.08) 0%, rgba(236,72,153,0.04) 100%)",
    border: "1px solid rgba(124,92,252,0.18)",
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[5],
  },
  welcomeClose: {
    position: "absolute", top: 10, right: 10,
    background: "none", border: "none", cursor: "pointer", padding: 4,
  },
  welcomeTitle: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    marginBottom: TOKENS.space[2],
  },
  welcomeBody: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginBottom: TOKENS.space[3],
  },
  welcomeList: {
    display: "flex", flexDirection: "column", gap: TOKENS.space[2],
  },
  welcomeItem: {
    display: "flex", alignItems: "flex-start", gap: TOKENS.space[3],
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textSecondary,
    lineHeight: 1.5,
  },
};
