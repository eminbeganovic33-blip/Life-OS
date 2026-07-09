import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, Sun, Sunset, Moon, ChevronDown, ChevronUp, Zap, Trophy, BookOpen, Plus, Dumbbell, X, Inbox, PauseCircle, PlayCircle, Ban, AlertTriangle, Play } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import { getTodayStr, getDayQuests, daysBetween, getLevelIndex } from "../../utils";
import { getDailyBonusQuest, getWeeklyChallenge } from "../../utils/xpEngine";
import { CATEGORIES } from "../../data/categories";
import { LEVELS, MOTIVATION_CARDS } from "../../data/constants";
import { QUEST_LIBRARY } from "../../data/questLibrary";
import StreakPill from "../shared/StreakPill";
import ProgressRing from "../shared/ProgressRing";
import AICoachWidget from "../shared/AICoachWidget";
import RoutineModeModal from "../shared/RoutineModeModal";
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
  const allTodayQuests = getDayQuests(dayNumber, state.customQuests, state);
  // 10B: separate build quests from avoidance quests
  const todayQuests = allTodayQuests.filter((q) => q.type !== "avoid");
  const avoidQuests  = allTodayQuests.filter((q) => q.type === "avoid");
  const completedIds = state.completedQuests?.[today] || [];
  const completedToday = todayQuests.filter((q) => completedIds.includes(q.id));
  const progress = todayQuests.length > 0 ? completedToday.length / todayQuests.length : 0;
  const allDone = todayQuests.length > 0 && completedToday.length === todayQuests.length;
  const [collapsedBlocks, setCollapsedBlocks] = useState({});
  const [routineBlock, setRoutineBlock] = useState(null); // 10C: { block, quests }

  // 10A: Pause Day
  const isPaused = (state.pausedDates || []).includes(today);
  function togglePause() {
    const paused = state.pausedDates || [];
    const next = isPaused ? paused.filter((d) => d !== today) : [...paused, today];
    save({ ...state, pausedDates: next });
  }

  // 10D: Habit Load Coach
  const activeCount = (state.activeQuests || []).filter((aq) => !aq.paused).length;
  const showOverload = activeCount >= 8 && state.habitOverloadDismissedAt !== today;
  function dismissOverload() { save({ ...state, habitOverloadDismissedAt: today }); }
  function enterFocusMode() {
    const active = (state.activeQuests || []).filter((aq) => !aq.paused);
    // Keep the 5 with most recently added first, pause the rest
    const keep = new Set(active.slice(0, 5).map((aq) => aq.id));
    const updated = (state.activeQuests || []).map((aq) =>
      keep.has(aq.id) ? aq : { ...aq, paused: true }
    );
    save({ ...state, activeQuests: updated, habitOverloadDismissedAt: today });
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const levelIdx = getLevelIndex(state.xp || 0);
  const levelName = LEVELS[levelIdx]?.name || "Beginner";
  const forgeEntries = Object.entries(state.sobrietyDates || {});

  // Group build quests by time block (avoidance quests get their own section)
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
    if (isPaused) return; // 10A: no quest toggles on paused days
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
      {/* Spotlight hero — the one place the RPG identity lives. Everything
          below stays calm/neutral so this reads as the day's "headline". */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={styles.hero}
      >
        <div style={styles.heroGlow} />
        <div style={styles.heroTopRow}>
          <span style={styles.heroKicker}>LIFE OS</span>
          <div style={styles.heroTopRight}>
            <StreakPill streak={state.streak || 0} freezes={state.streakFreezes || 0} tone="dark" />
            {/* 10A: Pause Day toggle */}
            <button
              onClick={togglePause}
              title={isPaused ? "Resume today" : "Pause today (travel / sick day)"}
              style={{
                ...styles.heroIconBtn,
                background: isPaused ? "rgba(249,115,22,0.22)" : "rgba(255,255,255,0.10)",
                borderColor: isPaused ? "rgba(249,115,22,0.45)" : "rgba(255,255,255,0.16)",
              }}
            >
              {isPaused
                ? <PlayCircle size={16} color="#FDBA74" />
                : <PauseCircle size={16} color="rgba(255,255,255,0.7)" />}
            </button>
          </div>
        </div>
        <div style={styles.heroMain}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.heroGreeting}>
              {greeting}{state.userName ? `, ${state.userName}` : ""}
            </div>
            <div style={styles.heroDay}>Day {dayNumber}</div>
            <div style={styles.heroLevelRow}>
              <span style={styles.heroLevelPill}>Lv.{levelIdx + 1}</span>
              <span style={styles.heroLevelName}>{levelName}</span>
            </div>
          </div>
          {todayQuests.length > 0 && (
            <button
              onClick={() => onOpenPanel("progress")}
              style={styles.heroRingBtn}
              title="View progress"
            >
              <ProgressRing
                progress={progress}
                size={76}
                strokeWidth={6}
                color={allDone ? "#34D399" : "#FFFFFF"}
                trackColor="rgba(255,255,255,0.16)"
                textColor="#FFFFFF"
              />
              <span style={styles.heroRingCaption}>
                {completedToday.length}/{todayQuests.length} done
              </span>
            </button>
          )}
        </div>
      </motion.header>

      {/* 10A: Paused-day banner */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.pauseBanner}
        >
          <Shield size={15} color="#F97316" />
          <div style={{ flex: 1 }}>
            <div style={styles.pauseBannerTitle}>Day Paused — streaks are safe 🛡️</div>
            <div style={styles.pauseBannerSub}>Travel day, sick day, or just a rest. Come back tomorrow.</div>
          </div>
          <button onClick={togglePause} style={styles.pauseResume}>Resume</button>
        </motion.div>
      )}

      {/* 10D: Habit overload warning */}
      {showOverload && !isPaused && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.overloadCard}
        >
          <AlertTriangle size={15} color="#F59E0B" />
          <div style={{ flex: 1 }}>
            <div style={styles.overloadTitle}>You have {activeCount} active habits</div>
            <div style={styles.overloadSub}>Research shows 3–5 stick best long-term. Focus Mode keeps your top 5 active and pauses the rest.</div>
          </div>
          <div style={styles.overloadActions}>
            <button onClick={enterFocusMode} style={styles.focusModeBtn}>Focus Mode</button>
            <button onClick={dismissOverload} style={styles.dismissBtn}><X size={13} /></button>
          </div>
        </motion.div>
      )}

      {/* Progress now lives in the hero ring above. */}

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
            Browse {QUEST_LIBRARY.length} vetted habits and pick the ones that fit your life. Add as many or as few as you want.
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
              <div style={styles.blockHeaderRow}>
              <button onClick={() => toggleBlock(block.id)} style={{ ...styles.blockHeader, flex: 1 }}>
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
              {/* 10C: Start Routine button — only for morning/evening, when there are quests */}
              {(block.id === "morning" || block.id === "evening") && !blockDone && !isPaused && (
                <button
                  onClick={() => setRoutineBlock({ block, quests: blockQuests })}
                  style={styles.startRoutineBtn}
                  title="Focus mode — step through one at a time"
                >
                  <Play size={11} color={block.accent} fill={block.accent} />
                  <span style={{ color: block.accent }}>Start</span>
                </button>
              )}
              </div>

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

      {/* Quick-capture inbox strip — only when there are notes to triage */}
      {(() => {
        const openInbox = (state.inbox || []).filter((i) => i.status === "open").length;
        if (openInbox === 0) return null;
        return (
          <button onClick={() => onOpenPanel("inbox")} style={styles.inboxStrip}>
            <Inbox size={16} color="#10B981" />
            <span style={styles.inboxStripText}>
              Inbox · {openInbox} to triage
            </span>
            <ChevronDown size={14} color={TOKENS.color.textTertiary} style={{ transform: "rotate(-90deg)", marginLeft: "auto" }} />
          </button>
        );
      })()}

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

      {/* 10B: Avoidance quests section */}
      {avoidQuests.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.avoidSection}
        >
          <div style={styles.avoidHeader}>
            <Ban size={13} color="#EF4444" />
            <span style={styles.avoidTitle}>Avoidance Habits</span>
            <span style={styles.avoidSub}>Check off if you kept the line today</span>
          </div>
          {avoidQuests.map((q) => {
            const isDone = completedIds.includes(q.id);
            return (
              <button
                key={q.id}
                onClick={() => toggleQuest(q.id)}
                disabled={isPaused}
                style={{
                  ...styles.avoidRow,
                  background: isDone ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.04)",
                  borderColor: isDone ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.15)",
                  opacity: isPaused ? 0.5 : 1,
                }}
              >
                <div style={{
                  ...styles.avoidCheck,
                  background: isDone ? "#10B981" : "transparent",
                  borderColor: isDone ? "#10B981" : "#EF4444",
                }}>
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path d="M2 5 L4.5 7.5 L8 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Ban size={9} color="#EF4444" />
                  )}
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ ...styles.questText, color: isDone ? TOKENS.color.textTertiary : TOKENS.color.text }}>
                    {q.text}
                  </div>
                  <div style={styles.questMeta}>
                    <span style={{ color: isDone ? "#10B981" : TOKENS.color.textTertiary }}>
                      {isDone ? "✓ Kept today" : "Tap when you hold the line"}
                    </span>
                    <span style={{ color: isDone ? "#10B981" : "#EF4444" }}>+{q.xp} XP</span>
                  </div>
                </div>
              </button>
            );
          })}
        </motion.section>
      )}

      <AICoachWidget state={state} />

      {/* 10C: Routine Mode Modal */}
      <AnimatePresence>
        {routineBlock && (
          <RoutineModeModal
            key="routine"
            block={routineBlock.block}
            quests={routineBlock.quests}
            completedIds={completedIds}
            onToggle={toggleQuest}
            onClose={() => setRoutineBlock(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  screen: { padding: `${TOKENS.space[7]}px ${TOKENS.space[5]}px 120px` },
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
  domainTileMeta: { fontSize: 11, fontWeight: TOKENS.font.weight.semibold, lineHeight: 1.2 },
  // ── Spotlight hero (the "game layer") ──────────────────────────────────
  hero: {
    position: "relative",
    overflow: "hidden",
    background: TOKENS.game.spotlight,
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: TOKENS.radius.xl,
    padding: TOKENS.space[5],
    marginBottom: TOKENS.space[5],
    boxShadow: TOKENS.shadow.lg,
  },
  heroGlow: {
    position: "absolute", top: -50, right: -30,
    width: 180, height: 180, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,92,252,0.55) 0%, rgba(236,72,153,0.18) 55%, transparent 72%)",
    filter: "blur(8px)", pointerEvents: "none",
  },
  heroTopRow: {
    position: "relative", zIndex: 1,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: TOKENS.space[4],
  },
  heroKicker: {
    fontSize: 11, fontWeight: TOKENS.font.weight.heavy,
    letterSpacing: TOKENS.track.caps, textTransform: "uppercase",
    color: TOKENS.game.spotlightTextSoft,
  },
  heroTopRight: { display: "flex", alignItems: "center", gap: 8 },
  heroIconBtn: {
    width: 32, height: 32, borderRadius: TOKENS.radius.full,
    border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
  heroMain: {
    position: "relative", zIndex: 1,
    display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: TOKENS.space[4],
  },
  heroGreeting: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.medium,
    color: TOKENS.game.spotlightTextSoft,
  },
  heroDay: {
    fontSize: TOKENS.font.size.hero, fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.game.spotlightText, letterSpacing: TOKENS.track.tighter,
    lineHeight: 1, marginTop: 4,
  },
  heroLevelRow: { display: "flex", alignItems: "center", gap: 8, marginTop: TOKENS.space[3] },
  heroLevelPill: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.heavy, color: "#fff",
    background: TOKENS.game.gradient,
    padding: "4px 12px", borderRadius: TOKENS.radius.full,
    boxShadow: TOKENS.shadow.glowBrand,
  },
  heroLevelName: { fontSize: 13, fontWeight: TOKENS.font.weight.semibold, color: TOKENS.game.spotlightTextSoft },
  heroRingBtn: {
    background: "none", border: "none", cursor: "pointer", flexShrink: 0,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  },
  heroRingCaption: {
    fontSize: 11, fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.game.spotlightTextSoft,
  },
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
    fontSize: 11, fontWeight: 900, color: "#16A34A",
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
  bonusLabel: { fontSize: 11, fontWeight: 900, color: "#B45309", letterSpacing: 0.8 },
  bonusText: { fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.semibold, color: TOKENS.color.text, marginTop: 2 },
  challengeCard: {
    padding: TOKENS.space[5],
    background: "linear-gradient(135deg, rgba(124,92,252,0.06) 0%, rgba(124,92,252,0.02) 100%)",
    border: "1px solid rgba(124,92,252,0.15)",
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[5],
  },
  challengeHeader: { display: "flex", alignItems: "center", gap: 6 },
  challengeLabel: { fontSize: 11, fontWeight: 900, color: "#7C5CFC", letterSpacing: 0.8 },
  challengeText: { fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.semibold, color: TOKENS.color.text, marginTop: TOKENS.space[2] },
  challengeBar: { height: 4, background: "rgba(124,92,252,0.10)", borderRadius: 2, marginTop: TOKENS.space[3], overflow: "hidden" },
  challengeFill: { height: "100%", background: "#7C5CFC", transition: "width 0.4s ease" },
  challengeMeta: { fontSize: 11, color: TOKENS.color.textTertiary, fontWeight: TOKENS.font.weight.semibold, marginTop: 6 },
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
  blockTime: { fontSize: 11, color: TOKENS.color.textTertiary, marginTop: 1 },
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
    fontSize: 11, color: TOKENS.color.textTertiary,
    display: "flex", gap: 8, marginTop: 2, fontWeight: TOKENS.font.weight.semibold,
  },
  forgeStrip: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface,
    border: `1px solid ${TOKENS.color.border}`,
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[3],
    cursor: "pointer", width: "100%",
  },
  forgeStripText: { flex: 1, textAlign: "left", fontSize: TOKENS.font.size.xs, color: TOKENS.color.text },
  forgeName: { fontWeight: TOKENS.font.weight.semibold, textTransform: "capitalize" },
  forgeDays: { fontWeight: 900, color: "#F97316" },
  forgeDivider: { color: TOKENS.color.textTertiary },
  forgeMore: { color: TOKENS.color.textTertiary, fontStyle: "italic", fontSize: 12 },
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
  inboxStrip: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface,
    border: `1px solid ${TOKENS.color.border}`,
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[3],
    cursor: "pointer", width: "100%",
  },
  inboxStripText: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  journalCtaText: { fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary, fontWeight: TOKENS.font.weight.medium },
  quoteCard: {
    padding: TOKENS.space[5],
    background: TOKENS.color.surface,
    border: `1px solid ${TOKENS.color.borderSubtle}`,
    borderRadius: TOKENS.radius.lg,
    borderLeft: `3px solid ${TOKENS.color.brandBorder}`,
  },
  quoteText: {
    fontSize: TOKENS.font.size.md, fontStyle: "italic",
    lineHeight: 1.5, color: TOKENS.color.text, fontWeight: TOKENS.font.weight.medium,
    letterSpacing: TOKENS.track.tight,
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

  // 10A: Pause Day
  pauseBtn: {
    width: 32, height: 32, borderRadius: 10,
    border: "1px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
  pauseBanner: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "12px 14px",
    background: "rgba(249,115,22,0.08)",
    border: "1px solid rgba(249,115,22,0.20)",
    borderRadius: 12,
    marginBottom: TOKENS.space[4],
  },
  pauseBannerTitle: {
    fontSize: 13, fontWeight: 700, color: "#F97316", marginBottom: 2,
  },
  pauseBannerSub: {
    fontSize: 13, color: TOKENS.color.textSecondary,
  },
  pauseResume: {
    alignSelf: "center",
    padding: "6px 12px", borderRadius: 8,
    background: "#F97316", color: "#fff",
    border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 700, flexShrink: 0,
  },

  // 10D: Habit Load Coach
  overloadCard: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "12px 14px",
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.22)",
    borderRadius: 12,
    marginBottom: TOKENS.space[4],
  },
  overloadTitle: {
    fontSize: 13, fontWeight: 700, color: "#F59E0B", marginBottom: 2,
  },
  overloadSub: {
    fontSize: 13, color: TOKENS.color.textSecondary, lineHeight: 1.45,
  },
  overloadActions: {
    display: "flex", alignItems: "center", gap: 6, flexShrink: 0, alignSelf: "flex-start", marginTop: 2,
  },
  focusModeBtn: {
    padding: "5px 10px", borderRadius: 7,
    background: "#F59E0B", color: "#fff",
    border: "none", cursor: "pointer",
    fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
  },
  dismissBtn: {
    width: 26, height: 26, borderRadius: 8,
    background: TOKENS.color.surfaceAlt,
    border: `1px solid ${TOKENS.color.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },

  // 10C: Routine Mode start button
  blockHeaderRow: {
    display: "flex", alignItems: "center",
  },
  startRoutineBtn: {
    display: "flex", alignItems: "center", gap: 4,
    padding: "5px 10px", marginRight: 4,
    borderRadius: 20, border: "1px solid",
    background: "transparent", cursor: "pointer",
    fontSize: 12, fontWeight: 700,
    borderColor: "currentColor", flexShrink: 0,
  },

  // 10B: Avoidance habits section
  avoidSection: {
    marginBottom: TOKENS.space[4],
    borderRadius: 14,
    border: "1px solid rgba(239,68,68,0.12)",
    overflow: "hidden",
    background: "rgba(239,68,68,0.02)",
  },
  avoidHeader: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "10px 14px",
    borderBottom: "1px solid rgba(239,68,68,0.10)",
  },
  avoidTitle: {
    fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
    color: "#EF4444", textTransform: "uppercase",
  },
  avoidSub: {
    fontSize: 12, color: TOKENS.color.textTertiary,
    marginLeft: "auto",
  },
  avoidRow: {
    width: "100%", display: "flex", alignItems: "center", gap: 12,
    padding: "11px 14px",
    border: "none", borderTop: "1px solid transparent",
    cursor: "pointer", background: "transparent", textAlign: "left",
  },
  avoidCheck: {
    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
    border: "2px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};
