import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft, Shield, Flame, Trophy, CircleDot,
  Diamond, Crown, Star, DollarSign, BookOpen, PartyPopper,
} from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { getTodayStr, daysBetween } from "../../utils";
import { getProgramDay } from "../../data/forgePrograms";

const DEFAULT_HABITS = [
  { id: "smoking",       label: "Smoking",       icon: "🚬", color: "#EF4444" },
  { id: "alcohol",       label: "Alcohol",       icon: "🍺", color: "#F59E0B" },
  { id: "vaping",        label: "Vaping",        icon: "💨", color: "#64748B" },
  { id: "doomscrolling", label: "Doomscrolling", icon: "📱", color: "#8B5CF6" },
  { id: "social_media",  label: "Social Media",  icon: "📲", color: "#3B82F6" },
  { id: "junkfood",      label: "Junk Food",     icon: "🍔", color: "#F97316" },
  { id: "porn",          label: "Porn",          icon: "⚡", color: "#EC4899" },
  { id: "caffeine",      label: "Caffeine",      icon: "☕", color: "#78716C" },
  { id: "weed",          label: "Weed",          icon: "🌿", color: "#22C55E" },
  { id: "gambling",      label: "Gambling",      icon: "🎰", color: "#EAB308" },
];

const MILESTONES = [
  { days: 1, label: "Day 1" },
  { days: 3, label: "3 Days" },
  { days: 7, label: "1 Week" },
  { days: 14, label: "2 Weeks" },
  { days: 21, label: "3 Weeks" },
  { days: 30, label: "1 Month" },
  { days: 60, label: "2 Months" },
  { days: 90, label: "3 Months" },
  { days: 180, label: "6 Months" },
  { days: 365, label: "1 Year" },
];

const GOAL_OPTIONS = [
  { days: 21, label: "21 days" },
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
  { days: 90, label: "90 days" },
];

const HABIT_MILESTONES = {
  smoking: {
    1: "Carbon monoxide levels dropping to normal. Oxygen levels rising.",
    3: "Nicotine has left your body. Taste and smell are sharpening.",
    7: "Lungs starting to repair. Breathing getting easier.",
    14: "Withdrawal symptoms fading. Heart attack risk already reducing.",
    21: "Brain's nicotine receptors returning to normal. Cravings weakening.",
    30: "Lung function increasing. Shortness of breath decreasing.",
    60: "Circulation improving. Exercise feels significantly easier.",
    90: "Lung function improved up to 30%. Breathing problems decreasing.",
    180: "Heart disease risk dropped to half that of a smoker.",
    365: "Heart disease risk halved. Lung cancer risk dropping.",
  },
  alcohol: {
    1: "Body beginning to detox. Blood sugar stabilizing.",
    3: "Sleep quality improving. Body fully detoxed from alcohol.",
    7: "Skin clearer, more hydrated. Sleep deeper and restorative.",
    14: "Stomach lining healing. Acid reflux symptoms reducing.",
    21: "Liver fat reducing up to 15%. Mental clarity improved.",
    30: "Blood pressure normalizing. Liver function improving.",
    60: "Liver inflammation reduced. Immune system stronger.",
    90: "Liver fat significantly reduced. Cognitive function improved.",
    180: "Cardiovascular risk significantly reduced.",
    365: "Cancer risk meaningfully reduced. You're a different person.",
  },
  doomscrolling: {
    1: "Broken the automatic reach-for-phone habit for one day.",
    3: "Dopamine system recalibrating. Boredom tolerance improving.",
    7: "Attention span measurably longer. More present in conversations.",
    14: "Deep focus feels natural again. Reading and thinking more clearly.",
    21: "Habit loop rewired. Urge to scroll significantly reduced.",
    30: "Creativity improved. You've reclaimed ~60 hours this month.",
    90: "Relationship with technology fundamentally different.",
  },
  junkfood: {
    1: "Blood sugar spikes from yesterday leveling out.",
    3: "Cravings peaking — hardest part. Palate resetting.",
    7: "Taste buds regenerating. Whole foods taste better.",
    14: "Gut microbiome shifting. Bloating and inflammation reducing.",
    21: "Sugar cravings significantly weakened. Energy more stable.",
    30: "Skin clearer. Digestion improved. Body composition changing.",
    90: "Metabolic markers improved. New habits solidified.",
  },
  porn: {
    1: "Chosen real presence over artificial stimulation.",
    3: "Dopamine receptors beginning to recalibrate.",
    7: "Increased motivation and energy. Brain seeking real-world rewards.",
    14: "Emotional sensitivity returning. Real connections feel deeper.",
    21: "Neural pathways weakening. Automatic habit loop breaking.",
    30: "Significant dopamine receptor recovery.",
    90: "Full reboot period. Brain reward system substantially reset.",
  },
  caffeine: {
    1: "Withdrawal headaches may hit. Adenosine receptors adjusting.",
    3: "Headaches subsiding. Sleep quality improving.",
    7: "Energy stabilizing without caffeine. Morning alertness improving.",
    14: "Adenosine receptors reset. Natural energy regulation restored.",
    21: "Sleep architecture normalized. Anxiety levels lower.",
    30: "Blood pressure dropped. Energy steady all day.",
  },
};

const IMPACT_CONFIG = {
  smoking:        { label: "cigarettes skipped",  perDay: 20,  moneyPerUnit: 0.50, icon: "🚬" },
  alcohol:        { label: "drinks skipped",      perDay: 3,   moneyPerUnit: 7,    icon: "🍺" },
  porn:           { label: "hours reclaimed",     perDay: 1.5, moneyPerUnit: null, icon: "⏱️" },
  doomscrolling:  { label: "hours reclaimed",     perDay: 2,   moneyPerUnit: null, icon: "📱" },
  social_media:   { label: "hours reclaimed",     perDay: 2,   moneyPerUnit: null, icon: "📱" },
  weed:           { label: "sessions skipped",    perDay: 2,   moneyPerUnit: 5,    icon: "🌿" },
  gambling:       { label: "bets avoided",        perDay: 3,   moneyPerUnit: 20,   icon: "🎰" },
  junkfood:       { label: "bad meals skipped",   perDay: 1,   moneyPerUnit: 8,    icon: "🍔" },
  vaping:         { label: "pods skipped",        perDay: 0.5, moneyPerUnit: 8,    icon: "💨" },
  caffeine:       { label: "cups skipped",        perDay: 3,   moneyPerUnit: 4,    icon: "☕" },
};

function getPhase(days) {
  if (days <= 7) return { name: "Acute Phase", color: "#EF4444" };
  if (days <= 21) return { name: "Building Phase", color: "#F59E0B" };
  return { name: "Freedom Phase", color: "#10B981" };
}

function getStreakIcon(days) {
  if (days >= 90) return { Icon: Diamond, color: "#A78BFA" };
  if (days >= 60) return { Icon: Crown, color: "#FBBF24" };
  if (days >= 30) return { Icon: Star, color: "#F59E0B" };
  if (days >= 7) return { Icon: Flame, color: "#F97316" };
  return null;
}

function getDefaultMilestone(days) {
  if (days >= 365) return "One full year. This isn't willpower — it's identity.";
  if (days >= 180) return "Six months of freedom. This habit no longer defines you.";
  if (days >= 90) return "Ninety days. Old neural pathways weakening significantly.";
  if (days >= 60) return "Two months strong. Your brain has built robust new patterns.";
  if (days >= 30) return "One month. You're past the 21-66 day habit formation window.";
  if (days >= 21) return "Three weeks. The habit loop is significantly weakened.";
  if (days >= 14) return "Two weeks of discipline. Willpower muscle getting stronger.";
  if (days >= 7) return "One full week. Your brain is building new patterns.";
  if (days >= 3) return "Three days — the hardest part is behind you.";
  return "Day one. The journey begins here.";
}

function getCurrentMilestone(habitId, days) {
  const data = HABIT_MILESTONES[habitId];
  if (!data) return getDefaultMilestone(days);
  const thresholds = Object.keys(data).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (days >= t) return data[t];
  }
  return getDefaultMilestone(days);
}

function getNextMilestone(days) {
  return MILESTONES.find((m) => m.days > days);
}

export default function ForgePanel({ state, save, onClose }) {
  const sobrietyDates = state.sobrietyDates || {};
  const forgeGoals = state.forgeGoals || {};
  const [activeTab, setActiveTab] = useState("trackers");
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [relapseTarget, setRelapseTarget] = useState(null);
  const [relapseText, setRelapseText] = useState("");
  const [journalFilter, setJournalFilter] = useState("all");

  const activeHabits = useMemo(() => {
    return DEFAULT_HABITS.filter((h) => sobrietyDates[h.id]).map((h) => ({
      ...h,
      days: daysBetween(sobrietyDates[h.id]),
      startDate: sobrietyDates[h.id],
    }));
  }, [sobrietyDates]);

  const availableHabits = DEFAULT_HABITS.filter((h) => !sobrietyDates[h.id]);
  const hasActive = activeHabits.length > 0;

  function startTracking(habitId, goalDays) {
    save({
      ...state,
      sobrietyDates: { ...sobrietyDates, [habitId]: getTodayStr() },
      forgeGoals: { ...forgeGoals, [habitId]: goalDays || 30 },
    });
    setExpandedGoal(null);
  }

  function handleRelapse() {
    if (!relapseTarget || !relapseText.trim()) return;
    const prevDays = daysBetween(sobrietyDates[relapseTarget]);
    const entry = {
      tracker: relapseTarget,
      text: relapseText.trim().slice(0, 2000),
      date: getTodayStr(),
      daysCleanBefore: prevDays,
    };
    save({
      ...state,
      sobrietyDates: { ...sobrietyDates, [relapseTarget]: getTodayStr() },
      recoveryJournals: [...(state.recoveryJournals || []), entry],
      xp: (state.xp || 0) + 25,
      lifetimeXp: (state.lifetimeXp || 0) + 25,
    });
    setRelapseTarget(null);
    setRelapseText("");
  }

  function extendGoal(habitId) {
    const current = forgeGoals[habitId] || 30;
    save({ ...state, forgeGoals: { ...forgeGoals, [habitId]: current + 30 } });
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={styles.panel}
    >
      <div style={styles.header}>
        <button onClick={onClose} style={styles.backBtn} data-panel-back aria-label="Close">
          <ChevronLeft size={20} color={TOKENS.color.text} />
        </button>
        <Shield size={20} color={TOKENS.color.text} />
        <span style={styles.title}>Forge</span>
      </div>

      {hasActive && (
        <div style={styles.tabBar}>
          {["trackers", "journal"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {}),
              }}
            >
              {tab === "trackers" ? "Trackers" : "Recovery Log"}
              {tab === "journal" && (state.recoveryJournals || []).length > 0 && (
                <span style={styles.tabBadge}>{state.recoveryJournals.length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div style={styles.body}>
        {activeTab === "trackers" && (
          <>
            {activeHabits.map((habit) => (
              <TrackerCard
                key={habit.id}
                habit={habit}
                goal={forgeGoals[habit.id] || 30}
                onRelapse={() => { setRelapseTarget(habit.id); setRelapseText(""); }}
                onExtend={() => extendGoal(habit.id)}
              />
            ))}

            {availableHabits.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>
                  {hasActive ? "Track more" : "What are you working to quit?"}
                </div>
                {availableHabits.map((habit) => (
                  <div key={habit.id} style={styles.startCard}>
                    <div style={styles.startLeft}>
                      <span style={{ fontSize: 24 }}>{habit.icon}</span>
                      <span style={styles.startLabel}>{habit.label}</span>
                    </div>
                    {expandedGoal === habit.id ? (
                      <div style={styles.goalPicker}>
                        <div style={styles.goalPickerLabel}>Set your goal</div>
                        <div style={styles.goalOptions}>
                          {GOAL_OPTIONS.map((opt) => (
                            <button
                              key={opt.days}
                              style={styles.goalBtn}
                              onClick={() => startTracking(habit.id, opt.days)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        style={{ ...styles.startBtn, color: habit.color, borderColor: `${habit.color}44` }}
                        onClick={() => setExpandedGoal(expandedGoal === habit.id ? null : habit.id)}
                      >
                        Start
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "journal" && (
          <JournalTab
            journals={state.recoveryJournals || []}
            filter={journalFilter}
            setFilter={setJournalFilter}
            state={state}
            save={save}
          />
        )}
      </div>

      {relapseTarget && (
        <div style={styles.overlay} onClick={() => setRelapseTarget(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Recovery Protocol</div>
            <div style={styles.modalIcon}>
              {DEFAULT_HABITS.find((h) => h.id === relapseTarget)?.icon}
            </div>
            <div style={styles.modalSub}>
              Resetting {DEFAULT_HABITS.find((h) => h.id === relapseTarget)?.label} streak
            </div>
            <div style={styles.modalEncourage}>
              Setbacks are part of the process. Reflecting on what happened earns you <strong>+25 XP</strong>.
            </div>
            <textarea
              style={styles.modalInput}
              placeholder="What triggered this? What will you do differently?"
              value={relapseText}
              onChange={(e) => setRelapseText(e.target.value)}
              rows={4}
            />
            <button
              style={{ ...styles.modalSubmit, opacity: relapseText.trim() ? 1 : 0.4 }}
              disabled={!relapseText.trim()}
              onClick={handleRelapse}
            >
              Submit & Reset (+25 XP)
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TrackerCard({ habit, goal, onRelapse, onExtend }) {
  const days = habit.days;
  const phase = getPhase(days);
  const streakIcon = getStreakIcon(days);
  const milestone = getCurrentMilestone(habit.id, days);
  const next = getNextMilestone(days);
  const passed = MILESTONES.filter((m) => days >= m.days);
  const lastPassed = passed.length > 0 ? passed[passed.length - 1].days : 0;
  const progressToNext = next ? (days - lastPassed) / (next.days - lastPassed) : 1;
  const goalProgress = Math.min(days / goal, 1);
  const goalReached = days >= goal;
  const dayInfo = getProgramDay(habit.id, days || 1);
  const impact = IMPACT_CONFIG[habit.id];

  const units = impact ? Math.round(days * impact.perDay) : 0;
  const money = impact?.moneyPerUnit ? Math.round(days * impact.perDay * impact.moneyPerUnit) : null;

  return (
    <div style={styles.habitCard}>
      <div style={styles.habitTop}>
        <div style={styles.habitLeft}>
          <span style={{ fontSize: 28 }}>{habit.icon}</span>
          <div>
            <div style={styles.habitLabel}>{habit.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: habit.color }}>
                {days}
              </span>
              <span style={styles.habitSub}>
                {days === 0 ? "started today" : `day${days > 1 ? "s" : ""} free`}
              </span>
              {streakIcon && (
                <streakIcon.Icon size={14} color={streakIcon.color} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phase badge */}
      {days > 0 && (
        <div style={styles.phaseRow}>
          <CircleDot size={10} color={phase.color} />
          <span style={{ ...styles.phaseText, color: phase.color }}>{phase.name}</span>
          <span style={styles.goalLabel}>Goal: {goal}d</span>
        </div>
      )}

      {/* Goal progress bar */}
      {days > 0 && (
        <div style={styles.goalBarOuter}>
          <div style={{
            ...styles.goalBarInner,
            width: `${goalProgress * 100}%`,
            background: goalReached
              ? "linear-gradient(90deg, #10B981, #34D399)"
              : `linear-gradient(90deg, ${habit.color}, ${habit.color}88)`,
          }} />
        </div>
      )}

      {/* Goal reached celebration */}
      {goalReached && (
        <div style={styles.celebration}>
          <PartyPopper size={18} color="#10B981" />
          <span style={styles.celebrationText}>Goal reached! {goal} days of freedom!</span>
          <button style={styles.extendBtn} onClick={onExtend}>
            Extend +30d
          </button>
        </div>
      )}

      {/* Milestone message */}
      <div style={styles.milestoneBox}>
        <div style={styles.milestoneText}>{milestone}</div>
      </div>

      {/* Impact stats */}
      {impact && days >= 1 && (
        <div style={{ ...styles.impactRow, background: `${habit.color}08`, borderColor: `${habit.color}18` }}>
          <div style={styles.impactStat}>
            <div style={{ ...styles.impactValue, color: habit.color }}>{units.toLocaleString()}</div>
            <div style={styles.impactLabel}>{impact.icon} {impact.label}</div>
          </div>
          {money !== null && (
            <div style={styles.impactStat}>
              <div style={{ ...styles.impactValue, color: "#22C55E" }}>${money.toLocaleString()}</div>
              <div style={styles.impactLabel}><DollarSign size={10} /> saved</div>
            </div>
          )}
        </div>
      )}

      {/* Progress to next milestone */}
      {next && (
        <div style={styles.nextMilestone}>
          <div style={styles.progressBarOuter}>
            <div style={{
              ...styles.progressBarInner,
              width: `${Math.min(progressToNext * 100, 100)}%`,
              background: habit.color,
            }} />
          </div>
          <div style={styles.nextLabel}>Next: {next.label}</div>
        </div>
      )}

      {/* Day-specific tip */}
      {dayInfo && (
        <div style={styles.tipCard}>
          <div style={styles.tipPhase}>Day {dayInfo.day} · {dayInfo.phase}</div>
          <div style={styles.tipText}>{dayInfo.tip}</div>
          <div style={styles.tipAction}>
            <strong style={{ color: habit.color }}>Action:</strong> {dayInfo.action}
          </div>
        </div>
      )}

      {/* Timeline dots — show a 7-step window centered on user progress so
          long-term users still see milestones ahead (60d → 90d → 6mo → 1yr). */}
      <div style={styles.timeline}>
        {(() => {
          const nextIdx = MILESTONES.findIndex((m) => days < m.days);
          // No upcoming milestones (>= 1yr): show last 7
          let start = nextIdx === -1
            ? Math.max(0, MILESTONES.length - 7)
            : Math.max(0, nextIdx - 4);
          const end = Math.min(MILESTONES.length, start + 7);
          start = Math.max(0, end - 7);
          return MILESTONES.slice(start, end).map((m) => {
            const reached = days >= m.days;
            return (
              <div key={m.days} style={styles.timelineDot}>
                <div style={{
                  ...styles.dot,
                  background: reached ? habit.color : TOKENS.color.border,
                }}>
                  {reached && <Trophy size={8} color="#fff" />}
                </div>
                <div style={{
                  ...styles.dotLabel,
                  color: reached ? TOKENS.color.text : TOKENS.color.textTertiary,
                }}>{m.label}</div>
              </div>
            );
          });
        })()}
      </div>

      <button onClick={onRelapse} style={styles.resetBtn}>
        I relapsed — reset streak
      </button>
    </div>
  );
}

function JournalTab({ journals, filter, setFilter, state, save }) {
  const [newEntry, setNewEntry] = useState("");
  const activeTrackers = Object.keys(state.sobrietyDates || {}).filter((k) => state.sobrietyDates[k]);

  const handleAdd = useCallback(() => {
    if (!newEntry.trim()) return;
    // If the user has filtered to a specific tracker, default the new entry
    // to that tracker. Otherwise fall back to the first active one.
    const tracker = (filter && filter !== "all" ? filter : activeTrackers[0]) || "general";
    const entry = {
      tracker,
      text: newEntry.trim().slice(0, 2000),
      date: getTodayStr(),
    };
    save({ ...state, recoveryJournals: [...(state.recoveryJournals || []), entry] });
    setNewEntry("");
  }, [newEntry, activeTrackers, filter, state, save]);

  const filtered = filter === "all" ? journals : journals.filter((e) => e.tracker === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <div style={styles.journalInputWrap}>
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Log how you're feeling, what triggered you, what helped..."
          style={styles.journalInput}
          rows={3}
        />
        <button
          style={{ ...styles.saveEntryBtn, opacity: newEntry.trim() ? 1 : 0.4 }}
          disabled={!newEntry.trim()}
          onClick={handleAdd}
        >
          Save Entry
        </button>
      </div>

      <div style={styles.filterBar}>
        <button
          style={{ ...styles.filterBtn, ...(filter === "all" ? styles.filterBtnActive : {}) }}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {DEFAULT_HABITS.filter((h) => activeTrackers.includes(h.id)).map((h) => (
          <button
            key={h.id}
            style={{
              ...styles.filterBtn,
              ...(filter === h.id ? { ...styles.filterBtnActive, borderColor: h.color, color: h.color } : {}),
            }}
            onClick={() => setFilter(h.id)}
          >
            {h.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <div style={styles.emptyJournal}>
          <BookOpen size={28} color={TOKENS.color.textTertiary} />
          <div style={styles.emptyText}>No journal entries yet</div>
          <div style={styles.emptySubtext}>Write above to log a trigger, craving, or win</div>
        </div>
      )}

      {sorted.map((entry, i) => {
        const tr = DEFAULT_HABITS.find((h) => h.id === entry.tracker);
        return (
          <div key={i} style={styles.journalEntry}>
            <div style={styles.journalEntryHeader}>
              <div style={styles.journalEntryMeta}>
                <span style={{ fontSize: 16 }}>{tr?.icon || "📝"}</span>
                <div>
                  <div style={styles.journalTracker}>{tr?.label || entry.tracker}</div>
                  <div style={styles.journalDate}>{entry.date}</div>
                </div>
              </div>
              {entry.daysCleanBefore != null && (
                <div style={styles.daysCleanBadge}>{entry.daysCleanBefore}d clean</div>
              )}
            </div>
            <div style={styles.journalText}>{entry.text}</div>
          </div>
        );
      })}
    </>
  );
}

const styles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    maxWidth: 480,
    background: TOKENS.color.bg,
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    boxShadow: TOKENS.shadow.xl,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  title: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  tabBar: {
    display: "flex",
    gap: 0,
    margin: `0 ${TOKENS.space[5]}px`,
    marginTop: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    background: "transparent",
    border: "none",
    color: TOKENS.color.textTertiary,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    borderRadius: TOKENS.radius.sm,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tabActive: {
    background: TOKENS.color.bg,
    color: TOKENS.color.text,
  },
  tabBadge: {
    fontSize: 10,
    fontWeight: TOKENS.font.weight.bold,
    background: TOKENS.color.surface,
    color: TOKENS.color.textSecondary,
    padding: "1px 6px",
    borderRadius: TOKENS.radius.full,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
  },
  section: {
    marginBottom: TOKENS.space[7],
  },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: TOKENS.space[4],
  },
  habitCard: {
    padding: TOKENS.space[5],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[4],
  },
  habitTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: TOKENS.space[3],
  },
  habitLeft: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
  },
  habitLabel: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  habitSub: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
  },
  phaseRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: TOKENS.space[3],
  },
  phaseText: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  goalLabel: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginLeft: "auto",
  },
  goalBarOuter: {
    height: 4,
    background: TOKENS.color.border,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: TOKENS.space[3],
  },
  goalBarInner: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.4s ease",
  },
  celebration: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: "rgba(16, 185, 129, 0.06)",
    borderRadius: TOKENS.radius.md,
    marginBottom: TOKENS.space[3],
  },
  celebrationText: {
    flex: 1,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    color: "#10B981",
  },
  extendBtn: {
    padding: "4px 12px",
    borderRadius: TOKENS.radius.md,
    border: "1px solid rgba(16, 185, 129, 0.3)",
    background: "rgba(16, 185, 129, 0.1)",
    color: "#10B981",
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
  milestoneBox: {
    padding: TOKENS.space[4],
    background: TOKENS.color.bg,
    borderRadius: TOKENS.radius.md,
    marginBottom: TOKENS.space[3],
  },
  milestoneText: {
    fontSize: TOKENS.font.size.sm,
    lineHeight: 1.5,
    color: TOKENS.color.textSecondary,
  },
  impactRow: {
    display: "flex",
    gap: TOKENS.space[3],
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    borderStyle: "solid",
    marginBottom: TOKENS.space[3],
  },
  impactStat: {
    flex: 1,
    textAlign: "center",
  },
  impactValue: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.heavy,
  },
  impactLabel: {
    fontSize: 10,
    color: TOKENS.color.textTertiary,
    marginTop: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  nextMilestone: {
    marginBottom: TOKENS.space[3],
  },
  progressBarOuter: {
    height: 4,
    background: TOKENS.color.border,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarInner: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.4s ease",
  },
  nextLabel: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.medium,
  },
  tipCard: {
    padding: TOKENS.space[4],
    background: TOKENS.color.bg,
    borderRadius: TOKENS.radius.md,
    marginBottom: TOKENS.space[3],
  },
  tipPhase: {
    fontSize: 10,
    fontWeight: TOKENS.font.weight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: TOKENS.color.textTertiary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: TOKENS.font.size.sm,
    lineHeight: 1.5,
    color: TOKENS.color.textSecondary,
    marginBottom: 6,
  },
  tipAction: {
    fontSize: TOKENS.font.size.sm,
    lineHeight: 1.4,
    color: TOKENS.color.textTertiary,
  },
  timeline: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: TOKENS.space[4],
    overflowX: "auto",
    gap: 2,
  },
  timelineDot: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    minWidth: 36,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: TOKENS.radius.full,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dotLabel: {
    fontSize: 9,
    fontWeight: TOKENS.font.weight.medium,
    textAlign: "center",
  },
  resetBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: TOKENS.radius.md,
    border: "none",
    background: "transparent",
    color: TOKENS.color.textTertiary,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.medium,
    cursor: "pointer",
    textAlign: "center",
  },
  startCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[3],
  },
  startLeft: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
  },
  startLabel: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  startBtn: {
    padding: "6px 16px",
    borderRadius: TOKENS.radius.full,
    borderWidth: 1,
    borderStyle: "solid",
    background: "transparent",
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
  goalPicker: {
    width: "100%",
    marginTop: TOKENS.space[3],
  },
  goalPickerLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: TOKENS.space[2],
  },
  goalOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: TOKENS.space[2],
  },
  goalBtn: {
    padding: "6px 14px",
    borderRadius: TOKENS.radius.md,
    border: `1px solid ${TOKENS.color.border}`,
    background: "transparent",
    color: TOKENS.color.text,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer",
  },
  // Journal tab
  journalInputWrap: {
    marginBottom: TOKENS.space[4],
  },
  journalInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: TOKENS.radius.lg,
    border: `1px solid ${TOKENS.color.border}`,
    background: TOKENS.color.surface,
    color: TOKENS.color.text,
    fontSize: TOKENS.font.size.sm,
    lineHeight: 1.5,
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  saveEntryBtn: {
    marginTop: TOKENS.space[2],
    padding: "8px 16px",
    borderRadius: TOKENS.radius.md,
    border: "none",
    background: TOKENS.color.text,
    color: TOKENS.color.bg,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
    float: "right",
  },
  filterBar: {
    display: "flex",
    gap: TOKENS.space[2],
    marginBottom: TOKENS.space[4],
    flexWrap: "wrap",
    clear: "both",
  },
  filterBtn: {
    padding: "5px 12px",
    borderRadius: TOKENS.radius.md,
    border: `1px solid ${TOKENS.color.border}`,
    background: "transparent",
    color: TOKENS.color.textTertiary,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer",
  },
  filterBtnActive: {
    borderColor: TOKENS.color.text,
    color: TOKENS.color.text,
    background: TOKENS.color.surface,
  },
  emptyJournal: {
    textAlign: "center",
    padding: `${TOKENS.space[8]}px 0`,
  },
  emptyText: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textTertiary,
    marginTop: TOKENS.space[3],
  },
  emptySubtext: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: TOKENS.space[2],
    opacity: 0.6,
  },
  journalEntry: {
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[3],
  },
  journalEntryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: TOKENS.space[3],
  },
  journalEntryMeta: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
  },
  journalTracker: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  journalDate: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
  },
  daysCleanBadge: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    padding: "3px 8px",
    borderRadius: TOKENS.radius.md,
    background: "rgba(239, 68, 68, 0.08)",
    color: "#EF4444",
  },
  journalText: {
    fontSize: TOKENS.font.size.sm,
    lineHeight: 1.6,
    color: TOKENS.color.textSecondary,
  },
  // Relapse modal
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300,
    padding: TOKENS.space[5],
  },
  modal: {
    width: "100%",
    maxWidth: 380,
    background: TOKENS.color.bg,
    borderRadius: TOKENS.radius.xl,
    padding: TOKENS.space[6],
  },
  modalTitle: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    textAlign: "center",
    marginBottom: TOKENS.space[4],
  },
  modalIcon: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: TOKENS.space[2],
  },
  modalSub: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textTertiary,
    textAlign: "center",
    marginBottom: TOKENS.space[4],
  },
  modalEncourage: {
    fontSize: TOKENS.font.size.sm,
    color: "#F59E0B",
    background: "rgba(245, 158, 11, 0.08)",
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    borderRadius: TOKENS.radius.md,
    lineHeight: 1.5,
    marginBottom: TOKENS.space[4],
  },
  modalInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: TOKENS.radius.lg,
    border: `1px solid ${TOKENS.color.border}`,
    background: TOKENS.color.surface,
    color: TOKENS.color.text,
    fontSize: TOKENS.font.size.sm,
    lineHeight: 1.5,
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    marginBottom: TOKENS.space[4],
  },
  modalSubmit: {
    width: "100%",
    padding: "14px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    background: TOKENS.color.text,
    color: TOKENS.color.bg,
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
};
