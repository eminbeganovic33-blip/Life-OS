import { motion } from "framer-motion";
import { TOKENS, DARK_COLORS } from "../../styles/theme";
import { useTheme, usePomodoroContext } from "../../hooks";
import { getLevel, getNextLevel, getLevelIndex, getDayQuests, getTodayStr, daysBetween } from "../../utils";
import { getPersonalizedQuote, getProactiveNudges } from "../../utils/intelligence";
import { MOTIVATION_CARDS, SOBRIETY_DEFAULTS } from "../../data";
import NudgeBanner from "../NudgeBanner";
import Icon from "../Icon";
import { Flame, Swords, Calendar, PenLine, Dumbbell, GraduationCap, BarChart3, Trophy, Quote, Play, Pause, RotateCcw, Shield } from "lucide-react";

const T = TOKENS;

// Deterministic daily greeting based on time of day
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Format date like "Wednesday, April 1"
function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardView({ state, user, onNavigate }) {
  const { themed, theme, colors } = useTheme();
  const isDark = theme === "dark";
  const styles = getStyles(colors, isDark);
  const pomodoro = usePomodoroContext();
  const day = state.currentDay;
  const level = getLevel(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const levelIdx = getLevelIndex(state.xp);
  const xpProgress = nextLevel ? (state.xp - level.xpReq) / (nextLevel.xpReq - level.xpReq) : 1;

  const quests = getDayQuests(day, state.customQuests, state);
  const completed = state.completedQuests[day] || [];
  const questsDone = completed.length;
  const questsTotal = quests.length;
  const allDone = questsDone === questsTotal && questsTotal > 0;

  const userName = user?.displayName || state.userName || "Warrior";
  const quote = getPersonalizedQuote(state, MOTIVATION_CARDS);
  const allNudges = getProactiveNudges(state);
  const topNudge = allNudges[0] || null;
  const nudges = allNudges.slice(1);

  // Forge tracker summaries
  const activeTrackers = Object.entries(state.sobrietyDates || {})
    .filter(([, date]) => !!date)
    .map(([id, date]) => {
      const meta = SOBRIETY_DEFAULTS.find((s) => s.id === id) || { label: id, icon: "🔥", color: "#7C5CFC" };
      return { ...meta, days: daysBetween(date) };
    });

  // Today's workout count
  const todayWorkouts = (state.workoutLogs?.[getTodayStr()] || []).length;

  // Journal status
  const hasJournaledToday = !!state.journal?.[day];
  const latestMood = state.moods?.[day];
  const moodEmojis = ["😫", "😔", "😐", "😊", "🔥"];

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div style={styles.wrapper}>
      <motion.div variants={stagger} initial="hidden" animate="show">
        {/* Greeting — tappable, opens Profile */}
        <motion.div variants={fadeUp}>
          <motion.div
            style={styles.greetSection}
            onClick={() => onNavigate("profile")}
            whileTap={{ scale: 0.98 }}
          >
            <div style={styles.greetRow}>
              <div style={styles.greetAvatar}>
                <Flame size={18} color="#fff" strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={styles.dateText}>{formatDate()}</p>
                <h1 style={styles.greeting}>{getGreeting()}, {userName}</h1>
                <p style={styles.levelBadge}>
                  Lv. {levelIdx + 1} {level.name} &middot; {state.xp} XP
                </p>
              </div>
              <span style={styles.greetChevron}>&#8250;</span>
            </div>
          </motion.div>
        </motion.div>

        {/* XP Progress Bar */}
        <motion.div variants={fadeUp} style={styles.xpBar}>
          <div style={styles.xpBarTrack}>
            <motion.div
              style={{ ...styles.xpBarFill, width: `${Math.round(xpProgress * 100)}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(xpProgress * 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div style={styles.xpBarLabel}>
            {nextLevel ? `${nextLevel.xpReq - state.xp} XP to ${nextLevel.name}` : "Max level reached"}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={fadeUp} style={styles.statsRow}>
          <div style={styles.statPill}>
            <Flame size={18} color="#F97316" />
            <div>
              <div style={styles.statValue}>{state.streak}</div>
              <div style={styles.statLabel}>
                Streak
                {(state.streakFreezes || 0) > 0 && (
                  <span style={styles.freezeBadge}>
                    <Shield size={8} color="#3B82F6" />
                    {state.streakFreezes}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={styles.statPill}>
            <Swords size={18} color="#7C5CFC" />
            <div>
              <div style={styles.statValue}>{questsDone}/{questsTotal}</div>
              <div style={styles.statLabel}>Quests</div>
            </div>
          </div>
          <div style={styles.statPill}>
            <Calendar size={18} color="#3B82F6" />
            <div>
              <div style={styles.statValue}>Day {day}</div>
              <div style={styles.statLabel}>Journey</div>
            </div>
          </div>
        </motion.div>

        {/* Promoted Nudge Banner */}
        {topNudge && (
          <motion.div variants={fadeUp}>
            <NudgeBanner nudge={topNudge} onNavigate={onNavigate} />
          </motion.div>
        )}

        {/* Today's Focus — quest progress card */}
        <motion.div variants={fadeUp}>
          <div
            style={{ ...styles.card, ...styles.questCard, cursor: "pointer" }}
            onClick={() => onNavigate("home")}
          >
            <div style={styles.cardHeader}>
              <Swords size={18} color="#7C5CFC" />
              <span style={styles.cardTitle}>Today's Quests</span>
              <span style={styles.cardArrow}>&#8250;</span>
            </div>
            {allDone ? (
              <div style={styles.allDoneBanner}>
                <Trophy size={18} color="#22C55E" />
                <span>All quests completed! You're crushing it.</span>
              </div>
            ) : (
              <>
                <div style={styles.questProgress}>
                  <div style={styles.questProgressTrack}>
                    <motion.div
                      style={{
                        ...styles.questProgressFill,
                        background: questsDone === 0 ? colors.surface : "linear-gradient(90deg, #7C5CFC, #EC4899)",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: questsTotal > 0 ? `${(questsDone / questsTotal) * 100}%` : "0%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span style={styles.questProgressText}>
                    {questsDone} of {questsTotal} done
                  </span>
                </div>
                {/* Show next incomplete quest */}
                {quests.filter((q) => !completed.includes(q.id)).slice(0, 1).map((q) => (
                  <div key={q.id} style={styles.nextQuest}>
                    <span style={styles.nextQuestDot}>&#9679;</span>
                    <span style={styles.nextQuestText}>Next: {q.text}</span>
                    <span style={styles.nextQuestXp}>+{q.xp} XP</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={fadeUp} style={styles.quickActions}>
          <QuickAction
            lucideIcon={<PenLine size={22} />}
            label="Journal"
            sub={hasJournaledToday ? (latestMood != null ? `Mood: ${moodEmojis[latestMood]}` : "Done") : "Not yet"}
            color="#22C55E"
            onClick={() => onNavigate("journal")}
            done={hasJournaledToday}
            styles={styles} colors={colors}
          />
          <QuickAction
            lucideIcon={<Dumbbell size={22} />}
            label="Dojo"
            sub={todayWorkouts > 0 ? `${todayWorkouts} logged` : "No lifts yet"}
            color="#F97316"
            onClick={() => onNavigate("dojo")}
            done={todayWorkouts > 0}
            styles={styles} colors={colors}
          />
          <QuickAction
            lucideIcon={<GraduationCap size={22} />}
            label="Academy"
            sub="Learn"
            color="#3B82F6"
            onClick={() => onNavigate("academy")}
            styles={styles} colors={colors}
          />
          <QuickAction
            lucideIcon={<BarChart3 size={22} />}
            label="Insights"
            sub="Analytics"
            color="#8B5CF6"
            onClick={() => onNavigate("analytics")}
            styles={styles} colors={colors}
          />
        </motion.div>

        {/* Forge Trackers */}
        {activeTrackers.length > 0 && (
          <motion.div variants={fadeUp}>
            <div
              style={{ ...styles.card, cursor: "pointer" }}
              onClick={() => onNavigate("forge")}
            >
              <div style={styles.cardHeader}>
                <Flame size={18} color="#F97316" />
                <span style={styles.cardTitle}>Forge Trackers</span>
                <span style={styles.cardArrow}>&#8250;</span>
              </div>
              <div style={styles.trackerList}>
                {activeTrackers.map((t) => (
                  <div key={t.id} style={styles.trackerRow}>
                    <span style={{ fontSize: 16 }}>{t.icon}</span>
                    <span style={styles.trackerLabel}>{t.label}</span>
                    <span style={{ ...styles.trackerDays, color: t.color }}>
                      {t.days} day{t.days !== 1 ? "s" : ""} clean
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Proactive Nudges */}
        {nudges.length > 0 && (
          <motion.div variants={fadeUp}>
            <div style={styles.sectionLabel}>Insights for you</div>
            <div style={styles.nudgeList}>
              {nudges.map((n, i) => (
                <motion.div
                  key={n.type + i}
                  style={styles.nudgeCard}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => n.action && onNavigate(n.action)}
                >
                  <span style={styles.nudgeIcon}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={styles.nudgeTitle}>{n.title}</div>
                    <div style={styles.nudgeMsg}>{n.message}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Compact Focus Timer */}
        {pomodoro && <CompactTimer pomodoro={pomodoro} pomodoroMinutes={state.pomodoroMinutes || 25} styles={styles} />}

        {/* Daily Quote */}
        <motion.div variants={fadeUp}>
          <div style={styles.quoteCard}>
            <div style={styles.quoteMark}><Quote size={24} color="#7C5CFC" strokeWidth={1.5} /></div>
            <p style={styles.quoteText}>{quote.quote}</p>
            <p style={styles.quoteAuthor}>&mdash; {quote.author}</p>
            {quote.reason && quote.reason !== "Daily motivation pick" && (
              <p style={styles.quoteReason}>{quote.reason}</p>
            )}
          </div>
        </motion.div>

        <div style={{ height: T.space.xxl }} />
      </motion.div>
    </div>
  );
}

function CompactTimer({ pomodoro, pomodoroMinutes, styles }) {
  const { pomodoroActive, pomodoroTime, toggle, reset, phase, phaseLabel, sessionsCompleted, skipPhase } = pomodoro;
  const phaseTotalSecs =
    phase === "work" ? pomodoroMinutes * 60 : phase === "longBreak" ? 15 * 60 : 5 * 60;
  const progress = 1 - pomodoroTime / phaseTotalSecs;
  const mins = Math.floor(pomodoroTime / 60);
  const secs = pomodoroTime % 60;
  const circumference = 2 * Math.PI * 22; // r=22
  const isDone = pomodoroTime === 0;
  const isBreak = phase !== "work";
  const ringColor = isBreak ? "#22C55E" : "#7C5CFC";

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
      <div style={styles.timerCard}>
        {/* Mini ring */}
        <div style={styles.timerRingWrap}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="22" fill="none"
              stroke={isDone ? "#22C55E" : pomodoroActive ? ringColor : `${ringColor}66`}
              strokeWidth="4"
              strokeDasharray={`${progress * circumference} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
              style={{ transition: "stroke-dasharray 0.5s, stroke 0.3s" }}
            />
          </svg>
          <div style={styles.timerRingLabel}>
            {isDone ? "✓" : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
          </div>
        </div>

        {/* Info + controls */}
        <div style={{ flex: 1 }}>
          <div style={styles.timerTitle}>{phaseLabel}</div>
          <div style={styles.timerSub}>
            {isDone
              ? "Done — tap to continue"
              : pomodoroActive
                ? `Running · ${sessionsCompleted} session${sessionsCompleted === 1 ? "" : "s"} today`
                : sessionsCompleted > 0
                  ? `${sessionsCompleted} session${sessionsCompleted === 1 ? "" : "s"} today`
                  : "Ready to focus"}
          </div>
        </div>

        <div style={styles.timerBtns}>
          <button aria-label={pomodoroActive ? "Pause timer" : "Start timer"} style={styles.timerPlayBtn(pomodoroActive)} onClick={toggle}>
            {pomodoroActive ? <Pause size={14} /> : isDone ? <RotateCcw size={14} /> : <Play size={14} />}
          </button>
          {!pomodoroActive && !isDone && (
            <button aria-label="Reset timer" style={styles.timerResetBtn} onClick={reset}><RotateCcw size={14} /></button>
          )}
          {pomodoroActive && (
            <button aria-label="Skip phase" style={styles.timerResetBtn} onClick={skipPhase}>›</button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ lucideIcon, label, sub, color, onClick, done, styles, colors }) {
  return (
    <motion.div
      style={{
        ...styles.quickAction,
        borderColor: done ? `${color}33` : colors.cardBorder,
        background: done ? `${color}0A` : colors.cardBg,
      }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      <div style={{ color: done ? color : colors.textSecondary }}>{lucideIcon}</div>
      <div style={styles.qaLabel}>{label}</div>
      <div style={{ ...styles.qaSub, color: done ? color : colors.textSecondary }}>{sub}</div>
    </motion.div>
  );
}

function getStyles(colors, isDark) {
  return {
  wrapper: {
    padding: `${T.space.md}px ${T.space.lg}px`,
  },

  // Greeting
  greetSection: {
    marginBottom: T.space.md,
    marginTop: T.space.sm,
    padding: T.space.lg,
    borderRadius: T.radii.xl,
    background: "linear-gradient(135deg, rgba(124,92,252,0.07), rgba(236,72,153,0.03))",
    border: "1px solid rgba(124,92,252,0.1)",
    cursor: "pointer",
  },
  greetRow: {
    display: "flex",
    alignItems: "center",
    gap: T.space.md,
  },
  greetAvatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7C5CFC, #EC4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#fff",
  },
  greetChevron: {
    fontSize: T.font.xxl,
    color: colors.textSecondary,
    fontWeight: T.weight.normal,
    flexShrink: 0,
  },
  dateText: {
    fontSize: T.font.xs,
    color: colors.textSecondary,
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: T.weight.medium,
  },
  greeting: {
    fontSize: T.font.xl,
    fontWeight: T.weight.heavy,
    margin: `2px 0 0`,
    background: isDark
      ? "linear-gradient(135deg, #E2E8F0, #CBD5E1)"
      : "linear-gradient(135deg, #1C1917, #374151)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: -0.3,
  },
  levelBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: T.space.xs,
    fontSize: T.font.xs,
    color: "#7C5CFC",
    fontWeight: T.weight.bold,
    margin: `2px 0 0`,
  },
  levelIcon: {
    fontSize: 12,
  },

  // XP bar
  xpBar: {
    marginBottom: T.space.lg,
  },
  xpBarTrack: {
    height: 5,
    borderRadius: 3,
    background: colors.surface,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    borderRadius: 3,
    background: "linear-gradient(90deg, #7C5CFC, #EC4899)",
  },
  xpBarLabel: {
    fontSize: T.font.xs,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },

  // Stats row
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: T.space.sm,
    marginBottom: T.space.lg,
  },
  statPill: {
    display: "flex",
    alignItems: "center",
    gap: T.space.sm,
    padding: `${T.space.md}px ${T.space.md}px`,
    borderRadius: T.radii.md,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
  },
  statIcon: {
    fontSize: 18,
    flexShrink: 0,
  },
  statValue: {
    fontSize: T.font.lg,
    fontWeight: T.weight.black,
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: T.font.xs,
    color: colors.textSecondary,
    lineHeight: 1.2,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  freezeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    padding: "1px 4px",
    borderRadius: 4,
    background: "rgba(59,130,246,0.1)",
    border: "1px solid rgba(59,130,246,0.15)",
    fontSize: 9,
    color: "#3B82F6",
    fontWeight: T.weight.bold,
  },

  // Cards
  card: {
    padding: T.space.lg,
    borderRadius: T.radii.lg,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    marginBottom: T.space.md,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: T.space.sm,
    marginBottom: T.space.md,
  },
  cardTitle: {
    flex: 1,
    fontSize: T.font.md,
    fontWeight: T.weight.bold,
  },
  cardArrow: {
    fontSize: T.font.xl,
    color: colors.textSecondary,
    fontWeight: T.weight.normal,
  },

  // Quest card
  questCard: {
    background: "linear-gradient(135deg, rgba(124,92,252,0.06), rgba(236,72,153,0.03))",
    border: "1px solid rgba(124,92,252,0.1)",
  },
  questProgress: {
    marginBottom: T.space.sm,
  },
  questProgressTrack: {
    height: 6,
    borderRadius: 3,
    background: colors.surface,
    overflow: "hidden",
    marginBottom: T.space.xs,
  },
  questProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  questProgressText: {
    fontSize: T.font.xs,
    color: colors.textSecondary,
  },
  allDoneBanner: {
    display: "flex",
    alignItems: "center",
    gap: T.space.sm,
    padding: `${T.space.md}px`,
    borderRadius: T.radii.sm,
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.12)",
    fontSize: T.font.sm,
    color: "#22C55E",
    fontWeight: T.weight.medium,
  },
  nextQuest: {
    display: "flex",
    alignItems: "center",
    gap: T.space.sm,
    fontSize: T.font.sm,
    color: colors.textSecondary,
  },
  nextQuestDot: {
    fontSize: 6,
    color: "#7C5CFC",
  },
  nextQuestText: {
    flex: 1,
    fontSize: T.font.sm,
  },
  nextQuestXp: {
    fontSize: T.font.xs,
    color: "#7C5CFC",
    fontWeight: T.weight.bold,
  },

  // Quick actions
  quickActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: T.space.sm,
    marginBottom: T.space.md,
  },
  quickAction: {
    padding: T.space.lg,
    borderRadius: T.radii.md,
    border: `1px solid ${colors.cardBorder}`,
    background: colors.cardBg,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: T.space.xs,
  },
  qaLabel: {
    fontSize: T.font.md,
    fontWeight: T.weight.bold,
    marginTop: T.space.xs,
  },
  qaSub: {
    fontSize: T.font.xs,
    color: colors.textSecondary,
  },

  // Forge trackers
  trackerList: {
    display: "flex",
    flexDirection: "column",
    gap: T.space.sm,
  },
  trackerRow: {
    display: "flex",
    alignItems: "center",
    gap: T.space.sm,
  },
  trackerLabel: {
    flex: 1,
    fontSize: T.font.sm,
    fontWeight: T.weight.medium,
  },
  trackerDays: {
    fontSize: T.font.sm,
    fontWeight: T.weight.bold,
  },

  // Section label
  sectionLabel: {
    fontSize: T.font.sm,
    fontWeight: T.weight.bold,
    color: colors.textSecondary,
    marginBottom: T.space.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Nudges
  nudgeList: {
    display: "flex",
    flexDirection: "column",
    gap: T.space.sm,
    marginBottom: T.space.md,
  },
  nudgeCard: {
    display: "flex",
    gap: T.space.md,
    padding: T.space.lg,
    borderRadius: T.radii.md,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    cursor: "pointer",
  },
  nudgeIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 1,
  },
  nudgeTitle: {
    fontSize: T.font.sm,
    fontWeight: T.weight.bold,
    marginBottom: 2,
  },
  nudgeMsg: {
    fontSize: T.font.xs,
    color: colors.textSecondary,
    lineHeight: 1.4,
  },

  // Quote
  quoteCard: {
    padding: T.space.xl,
    borderRadius: T.radii.lg,
    background: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(236,72,153,0.04))",
    border: "1px solid rgba(124,92,252,0.1)",
    textAlign: "center",
    marginBottom: T.space.md,
  },
  quoteMark: {
    fontSize: 32,
    color: "#7C5CFC",
    opacity: 0.4,
    lineHeight: 1,
    marginBottom: T.space.xs,
  },
  quoteText: {
    fontSize: T.font.md,
    fontStyle: "italic",
    lineHeight: 1.6,
    margin: `0 0 ${T.space.sm}px`,
    fontWeight: T.weight.normal,
  },
  quoteAuthor: {
    fontSize: T.font.xs,
    color: colors.textSecondary,
    margin: 0,
  },
  quoteReason: {
    fontSize: T.font.xs,
    color: "#7C5CFC",
    marginTop: T.space.sm,
    fontStyle: "normal",
    fontWeight: T.weight.medium,
  },

  // Compact timer
  timerCard: {
    display: "flex",
    alignItems: "center",
    gap: T.space.md,
    padding: T.space.lg,
    borderRadius: T.radii.lg,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    marginBottom: T.space.md,
  },
  timerRingWrap: {
    position: "relative",
    width: 56,
    height: 56,
    flexShrink: 0,
  },
  timerRingLabel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: 11,
    fontWeight: T.weight.black,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: 0.5,
  },
  timerTitle: {
    fontSize: T.font.md,
    fontWeight: T.weight.bold,
  },
  timerSub: {
    fontSize: T.font.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timerBtns: {
    display: "flex",
    gap: T.space.sm,
    flexShrink: 0,
  },
  timerPlayBtn: (active) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: active ? "rgba(124,92,252,0.15)" : "linear-gradient(135deg, #7C5CFC, #6D28D9)",
    color: active ? "#7C5CFC" : "#fff",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: active ? "none" : "0 2px 8px rgba(124,92,252,0.3)",
    transition: "all 0.15s ease",
  }),
  timerResetBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: `1px solid ${colors.cardBorder}`,
    background: "transparent",
    color: colors.textSecondary,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  }; // end getStyles return
}
