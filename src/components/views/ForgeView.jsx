import { useState, useMemo } from "react";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { SOBRIETY_DEFAULTS } from "../../data";
import { getProgramDay } from "../../data/forgePrograms";
import { daysBetween } from "../../utils";
import { getTriggerMap } from "../../utils/intelligence";
import SmartInsights from "../SmartInsights";
import { usePremium } from "../../hooks/usePremium";
import { FREE_LIMITS, FEATURE_IDS } from "../../data/premium";
import { Flame, Crown, Diamond, Star, CircleDot, PartyPopper, BookOpen, PenLine, AlertTriangle, DollarSign, Zap } from "lucide-react";

// ── Cross-module: related quests per tracker ──

const TRACKER_RELATED_QUESTS = {
  smoking: { text: "Take a 15 min walk when a craving hits", category: "exercise", color: "#F97316" },
  alcohol: { text: "Replace your evening drink with herbal tea and journaling", category: "mind", color: "#EC4899" },
  vaping: { text: "Do 10 deep breaths whenever you feel the urge", category: "mind", color: "#EC4899" },
  porn: { text: "When tempted, do 20 push-ups and take a cold shower", category: "exercise", color: "#F97316" },
  doomscrolling: { text: "Put your phone in another room for the next hour", category: "screen", color: "#22D3EE" },
  weed: { text: "Drink a large glass of water and go for a walk", category: "water", color: "#38BDF8" },
  gambling: { text: "Track every impulse to gamble in your journal today", category: "mind", color: "#EC4899" },
  junkfood: { text: "Prep healthy snacks before you get hungry", category: "nutrition", color: "#84CC16" },
  caffeine: { text: "Go for a 10 min walk instead of reaching for coffee", category: "exercise", color: "#F97316" },
};

// ── Constants ──

const DEFAULT_TRACKER_IDS = SOBRIETY_DEFAULTS.map((t) => t.id);

const GOAL_OPTIONS = [
  { days: 21, label: "21 days" },
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
  { days: 90, label: "90 days" },
  { days: 0, label: "Custom" },
];

const MILESTONE_DAYS = [7, 14, 21, 30, 60, 90];

function getPhase(daysClean) {
  if (daysClean <= 7) return { name: "Acute Phase", color: "#EF4444", LucideIcon: CircleDot };
  if (daysClean <= 21) return { name: "Building Phase", color: "#F59E0B", LucideIcon: CircleDot };
  return { name: "Freedom Phase", color: "#10B981", LucideIcon: CircleDot };
}

function getStreakIcon(daysClean) {
  if (daysClean >= 90) return { Icon: Diamond, color: "#A78BFA" };
  if (daysClean >= 60) return { Icon: Crown, color: "#FBBF24" };
  if (daysClean >= 30) return { Icon: Star, color: "#F59E0B" };
  if (daysClean >= 7) return { Icon: Flame, color: "#F97316" };
  return null;
}

// ── Main Component ──

export default function ForgeView({ state, save, onStart, onTriggerRelapse }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const fs = useMemo(() => {
    if (isDark) return styles;
    return {
      ...styles,
      tabBar: { ...styles.tabBar, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      tab: { ...styles.tab, color: colors.textSecondary },
      goalBtn: { ...styles.goalBtn, border: `1px solid ${colors.cardBorder}`, background: colors.inputBg, color: colors.text },
      customGoalInput: { ...styles.customGoalInput, background: colors.inputBg, color: colors.text, border: `1px solid ${colors.inputBorder}` },
      tipCard: { ...styles.tipCard, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      miniJournalEntry: { ...styles.miniJournalEntry, background: colors.cardBg },
      filterBtn: { ...styles.filterBtn, border: `1px solid ${colors.cardBorder}`, background: colors.inputBg, color: colors.textSecondary },
      journalEntry: { ...styles.journalEntry, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
    };
  }, [isDark, colors]);
  const { isPremium, checkFeatureAccess, setShowUpgrade } = usePremium();
  const hasUnlimitedForge = checkFeatureAccess(FEATURE_IDS.UNLIMITED_FORGE);

  const [activeTab, setActiveTab] = useState("trackers");
  const [expandedGoal, setExpandedGoal] = useState(null); // trackerId being goal-picked
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [journalFilter, setJournalFilter] = useState("all");

  const forgeGoals = state.forgeGoals || {};

  // Count active trackers beyond the 4 defaults
  const customTrackerCount = Object.keys(state.sobrietyDates || {}).filter(
    (k) => !!state.sobrietyDates[k] && !DEFAULT_TRACKER_IDS.includes(k)
  ).length;
  const canAddCustom = hasUnlimitedForge || customTrackerCount === 0;

  function handleSelectGoal(trackerId, days) {
    if (days === 0) return; // custom — handled separately
    const newGoals = { ...forgeGoals, [trackerId]: days };
    save({ ...state, forgeGoals: newGoals });
    onStart(trackerId);
    setExpandedGoal(null);
    setCustomGoalInput("");
  }

  function handleCustomGoalSubmit(trackerId) {
    const val = parseInt(customGoalInput, 10);
    if (!val || val < 21) return;
    const newGoals = { ...forgeGoals, [trackerId]: val };
    save({ ...state, forgeGoals: newGoals });
    onStart(trackerId);
    setExpandedGoal(null);
    setCustomGoalInput("");
  }

  function handleExtendGoal(trackerId) {
    const current = forgeGoals[trackerId] || 30;
    const newGoal = current + 30;
    save({ ...state, forgeGoals: { ...forgeGoals, [trackerId]: newGoal } });
  }

  // ── Render ──
  return (
    <div style={S.vc}>
      <div style={S.secTitle}>The Forge</div>
      <div style={fs.subtitle}>
        Track what you're breaking free from. Every day without is a victory.
      </div>

      {/* Tab Bar */}
      <div style={fs.tabBar}>
        {["trackers", "journal"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...fs.tab,
              ...(activeTab === tab ? fs.tabActive : {}),
            }}
          >
            {tab === "trackers" ? "Trackers" : "Recovery Log"}
            {tab === "journal" && (state.recoveryJournals?.length || 0) > 0 && (
              <span style={fs.tabBadge}>{state.recoveryJournals.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "trackers" && (
        <TrackersTab
          state={state}
          forgeGoals={forgeGoals}
          expandedGoal={expandedGoal}
          setExpandedGoal={setExpandedGoal}
          customGoalInput={customGoalInput}
          setCustomGoalInput={setCustomGoalInput}
          onSelectGoal={handleSelectGoal}
          onCustomGoalSubmit={handleCustomGoalSubmit}
          onExtendGoal={handleExtendGoal}
          onTriggerRelapse={onTriggerRelapse}
          canAddCustom={canAddCustom}
          hasUnlimitedForge={hasUnlimitedForge}
          setShowUpgrade={setShowUpgrade}
        />
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

      {/* Trigger Pattern Analysis */}
      <SmartInsights triggerMap={getTriggerMap(state)} />

      {/* Premium upsell for free users */}
      {!hasUnlimitedForge && (
        <div style={fs.upgradeBanner} onClick={() => setShowUpgrade(true)}>
          <Crown size={16} color="#FFD700" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD700" }}>Custom Trackers</div>
            <div style={{ fontSize: 10, opacity: 0.5 }}>Premium lets you add custom habits to track</div>
          </div>
          <span style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>Upgrade</span>
        </div>
      )}
    </div>
  );
}

// ── Trackers Tab ──

function TrackersTab({
  state, forgeGoals, expandedGoal, setExpandedGoal,
  customGoalInput, setCustomGoalInput,
  onSelectGoal, onCustomGoalSubmit, onExtendGoal,
  onTriggerRelapse, canAddCustom, hasUnlimitedForge, setShowUpgrade,
}) {
  return (
    <>
      {SOBRIETY_DEFAULTS.map((tracker) => (
        <TrackerCard
          key={tracker.id}
          tracker={tracker}
          state={state}
          forgeGoals={forgeGoals}
          isExpanded={expandedGoal === tracker.id}
          onExpandGoal={() => setExpandedGoal(expandedGoal === tracker.id ? null : tracker.id)}
          customGoalInput={customGoalInput}
          setCustomGoalInput={setCustomGoalInput}
          onSelectGoal={onSelectGoal}
          onCustomGoalSubmit={onCustomGoalSubmit}
          onExtendGoal={onExtendGoal}
          onTriggerRelapse={onTriggerRelapse}
        />
      ))}

      {/* Collapsed recent journal entries */}
      {state.recoveryJournals?.length > 0 && (
        <div style={{ padding: "0 14px", marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.35, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
            Recent Entries
          </div>
          {state.recoveryJournals
            .slice(-3)
            .reverse()
            .map((entry, i) => {
              const tr = SOBRIETY_DEFAULTS.find((t) => t.id === entry.tracker);
              return (
                <div key={i} style={styles.miniJournalEntry}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5,
                    background: `${tr?.color || "#7C5CFC"}18`,
                    border: `1px solid ${tr?.color || "#7C5CFC"}50`,
                    fontSize: 8, fontWeight: 800, color: tr?.color || "#7C5CFC",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {(tr?.label || "?").substring(0, 2).toUpperCase()}
                  </div>
                  <span style={{ opacity: 0.4, fontSize: 10 }}>{entry.date}</span>
                  <span style={{ fontSize: 11, opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {entry.text}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </>
  );
}

// ── Impact Stats (money/time saved — inspired by I Am Sober) ──

const IMPACT_CONFIG = {
  smoking: {
    label: "cigarettes skipped",
    perDay: 20,
    moneyPerUnit: 0.50, // ~$10/pack of 20
    moneyLabel: "saved",
    icon: "🚬",
  },
  alcohol: {
    label: "drinks skipped",
    perDay: 3,
    moneyPerUnit: 7,
    moneyLabel: "saved",
    icon: "🍺",
  },
  porn: {
    label: "hours reclaimed",
    perDay: 1.5,
    moneyPerUnit: null,
    moneyLabel: null,
    icon: "⏱️",
  },
  doomscrolling: {
    label: "hours reclaimed",
    perDay: 2,
    moneyPerUnit: null,
    moneyLabel: null,
    icon: "📱",
  },
  weed: {
    label: "sessions skipped",
    perDay: 2,
    moneyPerUnit: 5,
    moneyLabel: "saved",
    icon: "🌿",
  },
  gambling: {
    label: "bets avoided",
    perDay: 3,
    moneyPerUnit: 20,
    moneyLabel: "protected",
    icon: "🎰",
  },
  junkfood: {
    label: "bad meals skipped",
    perDay: 1,
    moneyPerUnit: 8,
    moneyLabel: "saved",
    icon: "🍔",
  },
};

function ImpactStats({ trackerId, daysClean, color }) {
  const cfg = IMPACT_CONFIG[trackerId];
  if (!cfg) return null;

  const units = Math.round(daysClean * cfg.perDay);
  const money = cfg.moneyPerUnit ? Math.round(daysClean * cfg.perDay * cfg.moneyPerUnit) : null;

  return (
    <div style={{
      display: "flex",
      gap: 8,
      marginTop: 10,
      padding: "10px 12px",
      borderRadius: 10,
      background: `${color}0A`,
      border: `1px solid ${color}20`,
    }}>
      <div style={{ flex: 1, textAlign: "center", borderRight: money ? `1px solid ${color}15` : "none", paddingRight: money ? 8 : 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color }}>{units.toLocaleString()}</div>
        <div style={{ fontSize: 10, opacity: 0.45, marginTop: 1, lineHeight: 1.3 }}>
          {cfg.icon} {cfg.label}
        </div>
      </div>
      {money && (
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#22C55E" }}>${money.toLocaleString()}</div>
          <div style={{ fontSize: 10, opacity: 0.45, marginTop: 1, lineHeight: 1.3, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
            <DollarSign size={10} strokeWidth={2} /> {cfg.moneyLabel}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Single Tracker Card ──

function TrackerCard({
  tracker, state, forgeGoals, isExpanded,
  onExpandGoal, customGoalInput, setCustomGoalInput,
  onSelectGoal, onCustomGoalSubmit, onExtendGoal, onTriggerRelapse,
}) {
  const startDate = state.sobrietyDates?.[tracker.id];
  const daysClean = startDate ? daysBetween(startDate) : 0;
  const isActive = !!startDate;
  const goal = forgeGoals[tracker.id] || 30;
  const progress = Math.min(100, (daysClean / goal) * 100);
  const goalReached = daysClean >= goal;
  const phase = getPhase(daysClean);
  const streakIconData = getStreakIcon(daysClean);
  const [showCustom, setShowCustom] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div style={{ ...S.forgeCard, borderLeft: `3px solid ${tracker.color}` }}>
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${tracker.color}18`,
            border: `1.5px solid ${tracker.color}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: tracker.color,
            flexShrink: 0, letterSpacing: -0.5,
          }}>
            {tracker.label.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{tracker.label}</div>
            {isActive ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: tracker.color }}>
                  {daysClean}
                </span>
                <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.5 }}>days free</span>
                {streakIconData && daysClean >= 7 && (
                  <span style={styles.streakBadge}><streakIconData.Icon size={14} color={streakIconData.color} /></span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 11, opacity: 0.4 }}>Not tracking yet</div>
            )}
          </div>
        </div>
        {isActive ? (
          confirmReset ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 600 }}>
                Erase {daysClean} day{daysClean !== 1 ? "s" : ""}?
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  style={{ ...S.forgeBtn, borderColor: "rgba(239,68,68,0.5)", color: "#EF4444", fontSize: 11, padding: "4px 10px" }}
                  onClick={() => { onTriggerRelapse(tracker.id); setConfirmReset(false); }}
                >
                  Yes, reset
                </button>
                <button
                  style={{ ...S.forgeBtn, fontSize: 11, padding: "4px 10px" }}
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              style={{ ...S.forgeBtn, borderColor: "rgba(239,68,68,0.3)", color: "#EF4444" }}
              onClick={() => setConfirmReset(true)}
            >
              Reset
            </button>
          )
        ) : (
          <button
            style={{ ...S.forgeBtn, borderColor: `${tracker.color}44`, color: tracker.color }}
            onClick={onExpandGoal}
          >
            Start
          </button>
        )}
      </div>

      {/* Goal Selection (inline expand) */}
      {!isActive && isExpanded && (
        <div style={styles.goalPicker}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Choose your goal
          </div>
          <div style={styles.goalOptions}>
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                style={{
                  ...styles.goalBtn,
                  ...(opt.days === 0 && showCustom ? { borderColor: "#7C5CFC", color: "#7C5CFC" } : {}),
                }}
                onClick={() => {
                  if (opt.days === 0) {
                    setShowCustom(true);
                  } else {
                    setShowCustom(false);
                    onSelectGoal(tracker.id, opt.days);
                  }
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {showCustom && (
            <div style={styles.customGoalRow}>
              <input
                type="number"
                min={21}
                placeholder="Min 21 days"
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                style={styles.customGoalInput}
              />
              <button
                style={styles.customGoalSubmit}
                onClick={() => onCustomGoalSubmit(tracker.id)}
              >
                Go
              </button>
            </div>
          )}
        </div>
      )}

      {/* Goal Reached Celebration */}
      {isActive && goalReached && (
        <div style={styles.celebration}>
          <div style={{ marginBottom: 4 }}><PartyPopper size={20} color="#10B981" /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>
            Goal Reached! {goal} days of freedom!
          </div>
          <button
            style={styles.extendBtn}
            onClick={() => onExtendGoal(tracker.id)}
          >
            Extend +30 days
          </button>
        </div>
      )}

      {/* Phase Badge */}
      {isActive && daysClean > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <phase.LucideIcon size={10} color={phase.color} />
          <span style={{ fontSize: 10, fontWeight: 700, color: phase.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {phase.name}
          </span>
          <span style={{ fontSize: 10, opacity: 0.3, marginLeft: "auto" }}>
            Goal: {goal}d
          </span>
        </div>
      )}

      {/* Progress Bar with Milestones */}
      {isActive && daysClean > 0 && (
        <div style={{ position: "relative", marginTop: 6 }}>
          <div style={S.forgeMeter}>
            <div
              style={{
                ...S.forgeFill,
                width: `${progress}%`,
                background: goalReached
                  ? "linear-gradient(90deg, #10B981, #34D399)"
                  : `linear-gradient(90deg, ${tracker.color}, ${tracker.color}88)`,
                opacity: 1,
              }}
            />
          </div>
          {/* Milestone markers */}
          <div style={styles.milestoneRow}>
            {MILESTONE_DAYS.filter((m) => m <= goal).map((m) => {
              const pos = (m / goal) * 100;
              const reached = daysClean >= m;
              return (
                <div
                  key={m}
                  style={{
                    ...styles.milestoneMarker,
                    left: `${pos}%`,
                  }}
                >
                  <div
                    style={{
                      ...styles.milestoneDot,
                      background: reached ? tracker.color : "rgba(255,255,255,0.1)",
                      borderColor: reached ? tracker.color : "rgba(255,255,255,0.15)",
                    }}
                  />
                  <span style={{
                    ...styles.milestoneLabel,
                    color: reached ? tracker.color : "rgba(255,255,255,0.2)",
                  }}>
                    {m}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Impact Stats — money/time saved */}
      {isActive && daysClean >= 1 && (
        <ImpactStats trackerId={tracker.id} daysClean={daysClean} color={tracker.color} />
      )}

      {/* Day-specific tip */}
      {isActive && (() => {
        const dayInfo = getProgramDay(tracker.id, daysClean || 1);
        if (!dayInfo) return null;
        return (
          <div style={styles.tipCard}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.4, marginBottom: 4 }}>
              Day {dayInfo.day} · {dayInfo.phase}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{dayInfo.tip}</div>
            <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>
              <strong style={{ color: tracker.color }}>Action:</strong> {dayInfo.action}
            </div>
          </div>
        );
      })()}

      {/* Cross-module: related quest suggestion */}
      {isActive && TRACKER_RELATED_QUESTS[tracker.id] && (() => {
        const rq = TRACKER_RELATED_QUESTS[tracker.id];
        return (
          <div style={{
            marginTop: 8,
            padding: "10px 12px",
            borderRadius: 10,
            background: `${rq.color}08`,
            border: `1px solid ${rq.color}18`,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}>
            <Zap size={13} color={rq.color} strokeWidth={2} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: rq.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>
                Complementary Quest
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.4 }}>{rq.text}</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Recovery Log Tab ──

function JournalTab({ journals, filter, setFilter, state, save }) {
  const [newEntry, setNewEntry] = useState("");
  const [entryTracker, setEntryTracker] = useState("all");
  const activeTrackers = Object.keys(state?.sobrietyDates || {}).filter(k => state.sobrietyDates[k]);

  const handleAddEntry = () => {
    if (!newEntry.trim() || !save) return;
    const entry = {
      text: newEntry.trim(),
      tracker: entryTracker === "all" ? (activeTrackers[0] || "general") : entryTracker,
      date: new Date().toISOString().split("T")[0],
    };
    save({ ...state, recoveryJournals: [...(state.recoveryJournals || []), entry] });
    setNewEntry("");
  };

  const filtered = filter === "all"
    ? journals
    : journals.filter((e) => e.tracker === filter);

  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return db - da;
  });

  return (
    <div style={{ padding: "0 14px" }}>
      {/* New entry input */}
      {save && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Log how you're feeling, what triggered you, what helped..."
            style={styles.journalInput}
            rows={3}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {activeTrackers.length > 1 && activeTrackers.map((t) => {
              const tr = SOBRIETY_DEFAULTS.find((d) => d.id === t);
              return (
                <button
                  key={t}
                  style={{
                    ...styles.filterBtn,
                    ...(entryTracker === t ? { ...styles.filterBtnActive, borderColor: tr?.color, color: tr?.color } : {}),
                    fontSize: 10,
                    padding: "3px 8px",
                  }}
                  onClick={() => setEntryTracker(t)}
                >
                  {tr?.label || t}
                </button>
              );
            })}
            <button
              style={{ ...styles.saveEntryBtn, opacity: newEntry.trim() ? 1 : 0.4 }}
              disabled={!newEntry.trim()}
              onClick={handleAddEntry}
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div style={styles.filterBar}>
        <button
          style={{ ...styles.filterBtn, ...(filter === "all" ? styles.filterBtnActive : {}) }}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {SOBRIETY_DEFAULTS.map((t) => (
          <button
            key={t.id}
            aria-label={`Filter by ${t.label}`}
            title={t.label}
            style={{
              ...styles.filterBtn,
              ...(filter === t.id ? { ...styles.filterBtnActive, borderColor: t.color, color: t.color } : {}),
            }}
            onClick={() => setFilter(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <div style={styles.emptyJournal}>
          <div style={{ marginBottom: 8, opacity: 0.3 }}><BookOpen size={28} color="currentColor" /></div>
          <div style={{ fontSize: 12, opacity: 0.3 }}>No journal entries yet</div>
          <div style={{ fontSize: 11, opacity: 0.2, marginTop: 4 }}>
            Entries are added when you reset a tracker
          </div>
        </div>
      )}

      {sorted.map((entry, i) => {
        const tr = SOBRIETY_DEFAULTS.find((t) => t.id === entry.tracker);
        return (
          <div key={i} style={styles.journalEntry}>
            <div style={styles.journalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${tr?.color || "#7C5CFC"}18`,
                  border: `1.5px solid ${tr?.color || "#7C5CFC"}40`,
                  fontSize: 9, fontWeight: 800, color: tr?.color || "#7C5CFC",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {(tr?.label || entry.tracker).substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{tr?.label || entry.tracker}</div>
                  <div style={{ fontSize: 10, opacity: 0.35 }}>{entry.date}</div>
                </div>
              </div>
              {entry.daysCleanBefore != null && (
                <div style={styles.daysCleanBadge}>
                  {entry.daysCleanBefore}d clean
                </div>
              )}
            </div>
            <div style={styles.journalText}>{entry.text}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Styles ──

const styles = {
  subtitle: {
    padding: "0 16px",
    marginBottom: 12,
    fontSize: 12,
    opacity: 0.4,
  },
  tabBar: {
    display: "flex",
    gap: 0,
    margin: "0 14px 12px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    padding: 3,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    background: "transparent",
    border: "none",
    color: "rgba(226,226,238,0.4)",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.2s",
  },
  tabActive: {
    background: "rgba(124,92,252,0.15)",
    color: "#7C5CFC",
  },
  tabBadge: {
    fontSize: 11,
    fontWeight: 700,
    background: "rgba(124,92,252,0.25)",
    color: "#7C5CFC",
    padding: "1px 6px",
    borderRadius: 10,
    minWidth: 16,
    textAlign: "center",
  },
  streakBadge: {
    fontSize: 14,
    animation: "pulse 1.5s ease-in-out infinite",
  },
  goalPicker: {
    marginTop: 12,
    padding: "12px 14px",
    borderRadius: 10,
    background: "rgba(124,92,252,0.04)",
    border: "1px solid rgba(124,92,252,0.12)",
  },
  goalOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  goalBtn: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
    color: "#E2E2EE",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  customGoalRow: {
    display: "flex",
    gap: 8,
    marginTop: 8,
  },
  customGoalInput: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid rgba(124,92,252,0.2)",
    background: "rgba(255,255,255,0.03)",
    color: "#E2E2EE",
    fontSize: 12,
    outline: "none",
  },
  customGoalSubmit: {
    padding: "6px 16px",
    borderRadius: 8,
    border: "none",
    background: "#7C5CFC",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  celebration: {
    marginTop: 10,
    padding: "12px 14px",
    borderRadius: 10,
    background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.04))",
    border: "1px solid rgba(16,185,129,0.2)",
    textAlign: "center",
  },
  extendBtn: {
    marginTop: 8,
    padding: "6px 18px",
    borderRadius: 8,
    border: "1px solid rgba(16,185,129,0.3)",
    background: "rgba(16,185,129,0.1)",
    color: "#10B981",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },
  milestoneRow: {
    position: "relative",
    height: 18,
    marginTop: 2,
  },
  milestoneMarker: {
    position: "absolute",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
  },
  milestoneDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    border: "1px solid",
  },
  milestoneLabel: {
    fontSize: 11,
    fontWeight: 700,
  },
  tipCard: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    lineHeight: 1.4,
  },
  miniJournalEntry: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.02)",
    marginBottom: 4,
    fontSize: 11,
  },
  filterBar: {
    display: "flex",
    gap: 6,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "5px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(226,226,238,0.5)",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  filterBtnActive: {
    borderColor: "rgba(124,92,252,0.3)",
    color: "#7C5CFC",
    background: "rgba(124,92,252,0.08)",
  },
  emptyJournal: {
    textAlign: "center",
    padding: "32px 0",
  },
  journalEntry: {
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.04)",
    marginBottom: 8,
  },
  journalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  daysCleanBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 6,
    background: "rgba(239,68,68,0.08)",
    color: "#EF4444",
    border: "1px solid rgba(239,68,68,0.15)",
  },
  journalText: {
    fontSize: 12,
    lineHeight: 1.6,
    opacity: 0.7,
  },
  journalInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "inherit",
    fontSize: 13,
    lineHeight: 1.5,
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  saveEntryBtn: {
    marginLeft: "auto",
    padding: "4px 12px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  upgradeBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "16px 14px 0",
    padding: "12px 14px",
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,165,0,0.04))",
    border: "1px solid rgba(255,215,0,0.12)",
    cursor: "pointer",
  },
};
