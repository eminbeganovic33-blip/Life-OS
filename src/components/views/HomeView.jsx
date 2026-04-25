import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { CATEGORIES, SOBRIETY_DEFAULTS, MOTIVATION_CARDS, MOODS } from "../../data";
import { getDayQuests, getLevel, getNextLevel, getLevelIndex, getCategoryStreak, daysBetween } from "../../utils";
import { getArc, getArcProgress } from "../../utils/arcs";
import { getQuestSuggestions, getProactiveNudges, getPersonalizedQuote } from "../../utils/intelligence";
import { getVoice } from "../../utils/voice";

import { getAIQuestSuggestions, isAIConfigured } from "../../utils/ai";
import { getStreakMultiplier, getCategoryMastery, getDailyBonusQuest, getWeeklyChallenge } from "../../utils/xpEngine";
import NudgeBanner from "../NudgeBanner";
import { CategoryIcon } from "../Icon";
import TimeBlockSection from "./home/TimeBlockSection";
import QuestCard from "./home/QuestCard";
import { Flame, Target, Dumbbell, Check, ChevronDown, Plus, Sparkles, Sunrise, Zap, Moon, CircleCheck, Trophy, Star, Shield, Quote, Calendar, BookOpen } from "lucide-react";

function formatDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

const SWIPE_THRESHOLD = 60;

// ── Time-of-day blocks (now driven by each quest's own timeOfDay tag) ──
const TIME_BLOCKS = {
  morning: {
    label: "Morning Ritual",
    LucideIcon: Sunrise,
    gradient: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(249,115,22,0.02))",
    accent: "#FBBF24",
  },
  afternoon: {
    label: "Daily Challenges",
    LucideIcon: Zap,
    gradient: "linear-gradient(135deg, rgba(124,92,252,0.06), rgba(59,130,246,0.02))",
    accent: "#7C5CFC",
  },
  evening: {
    label: "Evening Growth",
    LucideIcon: Moon,
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(236,72,153,0.02))",
    accent: "#A78BFA",
  },
};

// "anytime" quests fall into afternoon by default.
function getTimeBlockKey(q) {
  const t = q?.timeOfDay;
  if (t === "morning" || t === "afternoon" || t === "evening") return t;
  return "afternoon";
}

// Flat-list threshold: small rosters render as a single list (no accordion).
const FLAT_LIST_MAX = 6;

// ── Circular Progress Ring ──
function ProgressRing({ progress, size = 64, stroke = 5, color = "#7C5CFC", trackColor = "rgba(0,0,0,0.08)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - progress * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={trackColor} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
    </svg>
  );
}

export default function HomeView({
  state, save, user, xpPopup, onCheckQuest, onUncheckQuest, onCompleteDay,
  canCompleteDay, calendarDay, onOpenCustomQuest, onAddSuggestedQuest, onRemoveCustomQuest,
  unlockedCustomCategories, onNavigate, onMarkRestDay, onLogMood,
  onOpenActiveQuestPicker, onRetireActiveQuest,
}) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const ts = useMemo(() => getStyles(isDark, colors), [isDark, colors]);

  const day = state.currentDay;
  // H1 fix: include state.activeQuests so list refreshes when quests are added/retired
  const quests = useMemo(() => getDayQuests(day, state.customQuests, state), [day, state.customQuests, state.activeQuests, state.currentDay]);
  const completed = state.completedQuests[day] || [];
  // A: Exclude bonus quest IDs from the regular count so counter never shows "7/6"
  const completedRegular = useMemo(() => completed.filter(id => !id.startsWith("bonus-")), [completed]);
  const completedBonus = useMemo(() => completed.filter(id => id.startsWith("bonus-")), [completed]);
  const allDone = completedRegular.length === quests.length && quests.length > 0;
  const level = getLevel(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const levelIdx = getLevelIndex(state.xp);
  const xpProgress = nextLevel ? (state.xp - level.xpReq) / (nextLevel.xpReq - level.xpReq) : 1;
  const dayProgress = quests.length > 0 ? completedRegular.length / quests.length : 0;
  // Arc system
  const arc = getArc(day);
  const arcProgress = getArcProgress(day);

  // Dashboard-layer data
  const userName = user?.displayName?.split(" ")[0] || state.userName || null;
  const activeTrackers = useMemo(() =>
    Object.entries(state.sobrietyDates || {})
      .filter(([, date]) => !!date)
      .map(([id, date]) => {
        const meta = SOBRIETY_DEFAULTS.find((s) => s.id === id) || { label: id, color: "#7C5CFC" };
        return { ...meta, days: daysBetween(date) };
      }),
    [state.sobrietyDates]
  );
  const topNudge = useMemo(() => getProactiveNudges(state)[0] || null, [state]);
  const dailyQuote = useMemo(() => getPersonalizedQuote(state, MOTIVATION_CARDS), [state.currentDay]);

  const [activeGuide, setActiveGuide] = useState(null);
  // H7: Default to current time-of-day block expanded, others collapsed
  const [collapsedBlocks, setCollapsedBlocks] = useState(() => {
    const h = new Date().getHours();
    const current = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
    return { morning: current !== "morning", afternoon: current !== "afternoon", evening: current !== "evening" };
  });
  const [swipeHint, setSwipeHint] = useState(null);
  const swipeHintTimer = useRef(null);
  const touchStartX = useRef(0);
  const touchStartId = useRef(null);

  const showSwipeHint = useCallback((questId) => {
    if (swipeHintTimer.current) clearTimeout(swipeHintTimer.current);
    setSwipeHint(questId);
    swipeHintTimer.current = setTimeout(() => setSwipeHint(null), 2000);
  }, []);

  // ── Quest grouping by quest.timeOfDay ──
  const groupedQuests = useMemo(() => {
    const groups = { morning: [], afternoon: [], evening: [] };
    quests.forEach((q) => {
      groups[getTimeBlockKey(q)].push(q);
    });
    return groups;
  }, [quests]);

  const useFlatList = quests.length <= FLAT_LIST_MAX;

  // ── Category streaks ──
  const categoryStreaks = useMemo(() => {
    const streaks = {};
    CATEGORIES.forEach((cat) => {
      const s = getCategoryStreak(state.completedQuests, cat.id, day - 1);
      if (s > 0) streaks[cat.id] = s;
    });
    return streaks;
  }, [state.completedQuests, day]);

  // ── Category mastery (Novice/Initiate/Adept/Expert/Master/Grandmaster) ──
  // Only surface badges beyond Novice to avoid cluttering day-1 cards.
  const categoryMastery = useMemo(() => {
    const out = {};
    CATEGORIES.forEach((cat) => {
      const m = getCategoryMastery(state, cat.id);
      if (m.levelIndex > 0) out[cat.id] = m;
    });
    return out;
  }, [state.completedQuests]);

  // ── Focus quest — most impactful uncompleted quest ──
  const focusQuest = useMemo(() => {
    const uncompleted = quests.filter((q) => !completedRegular.includes(q.id));
    if (uncompleted.length === 0) return null;
    return uncompleted.sort((a, b) => {
      const aStreak = categoryStreaks[a.category] || 0;
      const bStreak = categoryStreaks[b.category] || 0;
      if (aStreak > 2 && bStreak <= 2) return -1;
      if (bStreak > 2 && aStreak <= 2) return 1;
      return b.xp - a.xp;
    })[0];
  }, [quests, completed, categoryStreaks]);

  // ── Post-quest voice flash (transient micro-line) ──
  const [postQuestVoice, setPostQuestVoice] = useState(null);
  const postQuestTimerRef = useRef(null);

  // ── Handlers ──
  function handleQuestClick(q) {
    if (completed.includes(q.id)) {
      showSwipeHint(q.id);
    } else {
      onCheckQuest(q.id, q.xp);
      // Fire post-quest voice using projected next state (1 more completion)
      const projected = {
        ...state,
        completedQuests: {
          ...(state.completedQuests || {}),
          [day]: [...(state.completedQuests?.[day] || []), q.id],
        },
      };
      const catId = String(q.id).split("-")[0];
      const catStreak = getCategoryStreak(projected.completedQuests, catId, day);
      const v = getVoice("post_quest", projected, { questId: q.id, categoryStreak: catStreak });
      if (v) {
        setPostQuestVoice(v);
        if (postQuestTimerRef.current) clearTimeout(postQuestTimerRef.current);
        postQuestTimerRef.current = setTimeout(() => setPostQuestVoice(null), 3600);
      }
    }
  }

  function handleTouchStart(e, q) {
    if (!completed.includes(q.id)) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartId.current = q.id;
  }

  function handleTouchEnd(e, q) {
    if (touchStartId.current !== q.id) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (dx > SWIPE_THRESHOLD) {
      setSwipeHint(null);
      onUncheckQuest(q.id, q.xp);
    }
    touchStartId.current = null;
  }

  function toggleBlock(key) {
    setCollapsedBlocks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const isTimeLocked = !canCompleteDay && allDone;

  // ── Quest card callbacks for extracted component ──
  function handleToggleGuide(questId, guide) {
    setActiveGuide(activeGuide?.questId === questId ? null : { questId, guide });
  }

  // Shared QuestCard props
  // C: navigate to Academy and open the linked course
  const handleLearnWhy = useCallback((courseId) => {
    onNavigate?.("academy", { openCourse: courseId });
  }, [onNavigate]);

  const questCardProps = {
    isDark, colors, ts,
    categoryStreaks, categoryMastery, focusQuest, swipeHint, activeGuide,
    onCheck: onCheckQuest, onUncheck: onUncheckQuest,
    onSwipeHintShow: showSwipeHint,
    onSwipeHintClear: () => setSwipeHint(null),
    onToggleGuide: handleToggleGuide,
    onNavigate, onOpenCustomQuest, onRemoveCustomQuest,
    onRetireActiveQuest,
    onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd,
    currentDay: state.currentDay,
    onLearnWhy: handleLearnWhy,
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const streakRingColor = allDone
    ? "#22C55E"
    : state.streak === 0
    ? "#6B7280"
    : state.streak >= 14
    ? "#FBBF24"
    : state.streak >= 7
    ? "#F97316"
    : "#7C5CFC";

  const streakChipBg = state.streak === 0
    ? "rgba(107,114,128,0.1)"
    : state.streak >= 14
    ? "rgba(251,191,36,0.1)"
    : "rgba(249,115,22,0.1)";

  const streakChipBorder = state.streak === 0
    ? "1px solid rgba(107,114,128,0.2)"
    : state.streak >= 14
    ? "1px solid rgba(251,191,36,0.2)"
    : "1px solid rgba(249,115,22,0.15)";

  const streakChipColor = state.streak === 0
    ? "#6B7280"
    : state.streak >= 14
    ? "#FBBF24"
    : "#F97316";

  return (
    <div style={S.vc}>
      {/* ── Dashboard Header ── */}
      <motion.div
        style={ts.hero}
        onClick={() => onNavigate?.("profile")}
        whileTap={{ scale: 0.985 }}
      >
        <div style={ts.heroLeft}>
          <div style={ts.dateText}>{formatDate()}</div>
          <div style={ts.greetingText}>
            {greeting}{userName ? `, ${userName}` : ""}
          </div>
          {/* C1: Progressive disclosure — Day 1–6 shows only level name, Day 7+ shows arc + XP bar */}
          {day >= 7 ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{arc.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: arc.color, letterSpacing: 0.3 }}>{arc.name}</span>
                <span style={{ fontSize: 10, color: colors.textSecondary, opacity: 0.5 }}>· {arc.subtitle}</span>
              </div>
              <div style={ts.heroLevelXp}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <span style={{ ...ts.levelXpText, fontSize: 11 }}>
                    {level.name}
                    {state.prestige > 0 && <span style={ts.prestigeInline}> ✦{state.prestige}</span>}
                  </span>
                  {nextLevel && (
                    <span style={{ fontSize: 10, color: colors.textSecondary, opacity: 0.5 }}>
                      → {nextLevel.name}
                    </span>
                  )}
                </div>
                <div style={{ width: "100%", height: 4, borderRadius: 2, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <motion.div
                    style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${arc.color}, ${arc.color}CC)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div style={{ fontSize: 9, color: colors.textSecondary, opacity: 0.4, marginTop: 2 }}>
                  {nextLevel ? `${nextLevel.xpReq - state.xp} XP to next level` : `${state.xp} XP · Max level`}
                </div>
              </div>
            </>
          ) : (
            <div style={{ ...ts.heroLevelXp, paddingBottom: 2 }}>
              <span style={{ ...ts.levelXpText, fontSize: 11, opacity: 0.6 }}>
                {level.name} · Day {day} of your journey
              </span>
            </div>
          )}
        </div>

        <div style={ts.heroRight}>
          {/* Progress ring */}
          <div style={ts.ringWrap}>
            <ProgressRing
              progress={dayProgress}
              size={72}
              stroke={5}
              color={streakRingColor}
              trackColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}
            />
            <div style={ts.ringCenter}>
              <div style={{ ...ts.ringNumber, color: colors.text }}>{completedRegular.length}</div>
              <div style={ts.ringLabel}>/{quests.length}</div>
              {completedBonus.length > 0 && (
                <div style={{ fontSize: 8, color: "#FBBF24", fontWeight: 700, marginTop: 1 }}>+{completedBonus.length}✦</div>
              )}
            </div>
          </div>
          {/* Streak + Multiplier */}
          <div style={{ ...ts.streakChip, background: streakChipBg, border: streakChipBorder }}>
            <Flame size={13} color={streakChipColor} />
            <span style={{ ...ts.streakNumber, color: streakChipColor }}>{state.streak}</span>
            {day >= 7 && state.streak >= 7 && getStreakMultiplier(state.streak).tier !== "none" && (
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                color: state.streak >= 14 ? "#FBBF24" : "#F97316",
                background: state.streak >= 14 ? "rgba(251,191,36,0.15)" : "rgba(249,115,22,0.12)",
                padding: "1px 5px",
                borderRadius: 6,
                marginLeft: 2,
              }}>
                {getStreakMultiplier(state.streak).label}
              </span>
            )}
            {(state.streakFreezes || 0) > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 2,
                fontSize: 9, fontWeight: 700, color: "#3B82F6",
                background: "rgba(59,130,246,0.12)", padding: "1px 5px",
                borderRadius: 6, marginLeft: 3,
              }}>
                <Shield size={8} color="#3B82F6" />
                {state.streakFreezes}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {xpPopup && (
          <motion.div
            key={xpPopup.id}
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1.2, y: -20 }}
            exit={{ opacity: 0, scale: 1.5, y: -60 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            style={S.xpPop}
          >
            +{xpPopup.xp} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── R4: Day 7 milestone banner ── */}
      {day === 7 && !state.completedDays?.[7] && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            margin: "6px 14px 0",
            padding: "12px 14px",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(249,115,22,0.06))",
            border: "1px solid rgba(251,191,36,0.25)",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#FBBF24" }}>One week in.</div>
            <div style={{ fontSize: 11, color: colors.textSecondary, opacity: 0.7, lineHeight: 1.4, marginTop: 1 }}>
              Most people quit by Day 3. You're still here. Finish Day 7 and the streak multiplier kicks in.
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Forge Tracker Row ── */}
      {activeTrackers.length > 0 && (
        <motion.div
          style={ts.forgeRow}
          onClick={() => onNavigate?.("forge")}
          whileTap={{ scale: 0.98 }}
        >
          <div style={ts.forgeRowTop}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Flame size={14} color="#F97316" strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>Forge</span>
            </div>
            <span style={{ fontSize: 11, color: colors.textSecondary, fontWeight: 500 }}>View all ›</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {activeTrackers.map((t) => (
              <div key={t.id} style={ts.forgeChip}>
                <div style={{ ...ts.forgeDot, background: t.color }} />
                <span style={ts.forgeLabel}>{t.label}</span>
                <span style={{ ...ts.forgeDays, color: t.color }}>
                  {t.days} {t.days === 1 ? "day" : "days"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Inline Mood Picker ── */}
      <MoodPickerRow
        currentMood={state.moods?.[day]}
        onLogMood={onLogMood}
        ts={ts}
        colors={colors}
      />

      {/* ── Top Nudge ── */}
      {topNudge && (
        <div style={{ padding: "0 14px", marginBottom: 4 }}>
          <NudgeBanner nudge={topNudge} onNavigate={onNavigate} />
        </div>
      )}

      {/* ── Voice Banner (ambient, adaptive) ── */}
      <AnimatePresence mode="wait">
        {postQuestVoice ? (
          <motion.div
            key="post-quest-voice"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            style={{
              margin: "0 14px 10px",
              padding: "10px 14px",
              borderLeft: "2px solid #22C55E",
              borderRadius: 4,
              fontSize: 13,
              lineHeight: 1.45,
              fontWeight: 500,
              fontStyle: "italic",
              color: colors.text,
              opacity: 0.85,
              letterSpacing: 0.1,
            }}
          >
            {postQuestVoice.line}
          </motion.div>
        ) : (
          <VoiceBanner key="voice-banner" state={state} colors={colors} arcColor={arc.color} />
        )}
      </AnimatePresence>

      {/* ── Section Header ── */}
      <div style={ts.sectionHeader}>
        <div>
          <div style={{ ...ts.sectionTitle, color: colors.text }}>Today's Quests</div>
          {day <= 4 && (
            <div style={{ fontSize: 10, color: colors.textSecondary, opacity: 0.45, marginTop: 2 }}>
              Complete each habit to earn XP and build your streak
            </div>
          )}
        </div>
        <button
          style={ts.addBtn}
          onClick={() => (onOpenActiveQuestPicker || onOpenCustomQuest)?.()}
        >
          + Add
        </button>
      </div>

      {/* ── Focus Quest Highlight — only shown in accordion mode (>6 quests) to avoid duplication in flat list ── */}
      <AnimatePresence>
        {!useFlatList && focusQuest && !completed.includes(focusQuest.id) && (
          <motion.div
            key={focusQuest.id}
            style={ts.focusCard}
            onClick={() => handleQuestClick(focusQuest)}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.22 }}
            layout
          >
            <div style={ts.focusHeader}>
              <Target size={11} strokeWidth={2.5} />
              <span style={ts.focusLabel}>Priority Quest</span>
            </div>
            <div style={{ ...ts.focusText, color: colors.text }}>{focusQuest.text}</div>
            <div style={ts.focusFooter}>
              <span style={{ color: CATEGORIES.find((c) => c.id === focusQuest.category)?.color, fontSize: 11 }}>
                {CATEGORIES.find((c) => c.id === focusQuest.category)?.icon}{" "}
                {CATEGORIES.find((c) => c.id === focusQuest.category)?.label}
              </span>
              <span style={ts.focusXp}>+{focusQuest.xp} XP →</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── H12: Empty state when no quests configured ── */}
      {quests.length === 0 && (
        <div style={{
          margin: "8px 14px 4px",
          padding: "28px 20px",
          borderRadius: 14,
          background: isDark ? "rgba(124,92,252,0.04)" : "rgba(124,92,252,0.04)",
          border: `1px dashed ${isDark ? "rgba(124,92,252,0.18)" : "rgba(124,92,252,0.2)"}`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}>
          <Target size={24} color="#7C5CFC" strokeWidth={1.5} style={{ opacity: 0.5 }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>No quests yet</div>
          <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.5, maxWidth: 240 }}>
            Tap <strong style={{ color: "#7C5CFC" }}>+ Add</strong> above to pick your first quests. Start with 2–4 and build up.
          </div>
        </div>
      )}

      {/* ── Quest list: flat (≤6 quests) or time-block accordion (>6) ── */}
      {useFlatList ? (
        <FlatQuestList
          quests={quests}
          completed={completed}
          ts={ts}
          colors={colors}
          {...questCardProps}
        />
      ) : (
        ["morning", "afternoon", "evening"].map((key) => (
          <TimeBlockSection
            key={key}
            blockKey={key}
            block={TIME_BLOCKS[key]}
            quests={groupedQuests[key]}
            completed={completed}
            isCollapsed={collapsedBlocks[key]}
            onToggle={() => toggleBlock(key)}
            ts={ts}
            colors={colors}
            {...questCardProps}
          />
        ))
      )}

      {/* ── H3: Bonus Quest — elevated directly after quest list ── */}
      <BonusQuestCard state={state} completed={completed} colors={colors} onCheckQuest={onCheckQuest} />

      {/* ── Weekly Challenge Tracker ── */}
      <WeeklyChallengeBanner state={state} ts={ts} />

      {/* ── Inline AI Quest Suggestions ── */}
      {day > 3 && !allDone && (
        <InlineQuestSuggestions
          state={state}
          quests={quests}
          isDark={isDark}
          colors={colors}
          onOpenCustomQuest={onOpenCustomQuest}
          onAddSuggestedQuest={onAddSuggestedQuest}
        />
      )}

      {/* ── Daily Quote — only after quests are done or only 1 remaining ── */}
      {(allDone || quests.length - completedRegular.length <= 1) && <div style={ts.quoteCard}>
        <Quote size={18} color="#7C5CFC" strokeWidth={1.5} style={{ opacity: 0.5, flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <p style={ts.quoteText}>"{dailyQuote.quote}"</p>
          <p style={ts.quoteAuthor}>— {dailyQuote.author}</p>
        </div>
      </div>}


      {/* ── C2: Quests Cleared moment — fires the instant allDone becomes true ── */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            key="quests-cleared"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{
              margin: "8px 14px 0",
              padding: "16px 16px 14px",
              borderRadius: 16,
              background: isDark
                ? "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(124,92,252,0.06))"
                : "linear-gradient(135deg, rgba(34,197,94,0.07), rgba(124,92,252,0.04))",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.15 }}
                style={{ fontSize: 22, lineHeight: 1 }}
              >
                🎯
              </motion.span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#22C55E" }}>
                  All quests cleared!
                </div>
                <div style={{ fontSize: 11, color: colors.textSecondary, opacity: 0.6, marginTop: 1 }}>
                  Want to do more, or call it a great day?
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                style={{
                  flex: 1, minWidth: 90,
                  padding: "9px 12px", borderRadius: 10,
                  background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)",
                  color: "#7C5CFC", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
                onClick={(e) => { e.stopPropagation(); onOpenActiveQuestPicker?.() || onOpenCustomQuest?.(); }}
              >
                + Add a quest
              </button>
              <button
                style={{
                  flex: 1, minWidth: 90,
                  padding: "9px 12px", borderRadius: 10,
                  background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)",
                  color: "#F97316", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
                onClick={(e) => { e.stopPropagation(); onNavigate?.("dojo"); }}
              >
                🥊 Dojo
              </button>
              <button
                style={{
                  flex: 1, minWidth: 90,
                  padding: "9px 12px", borderRadius: 10,
                  background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)",
                  color: "#22C55E", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
                onClick={(e) => { e.stopPropagation(); onNavigate?.("academy"); }}
              >
                📚 Academy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Complete Day Button / Status ── */}
      {isTimeLocked ? (
        // All quests done but calendar hasn't advanced yet — explain the lock
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            margin: "10px 14px 0",
            padding: "16px 18px",
            borderRadius: 16,
            background: `linear-gradient(135deg, rgba(124,92,252,0.1), rgba(124,92,252,0.04))`,
            border: "1px solid rgba(124,92,252,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
            >
              <CircleCheck size={22} color="#7C5CFC" strokeWidth={2.5} />
            </motion.div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#7C5CFC", lineHeight: 1.2 }}>
                All quests complete ✓
              </div>
              <div style={{ fontSize: 11, color: colors.textSecondary, opacity: 0.6, marginTop: 2 }}>
                {arc.icon} {arc.name} · Day {day - arc.days[0] + 1} of {arc.days[1] - arc.days[0] + 1}
              </div>
            </div>
            {completedBonus.length > 0 && (
              <div style={{ marginLeft: "auto", fontSize: 10, color: "#FBBF24", fontWeight: 600 }}>+bonus ✦</div>
            )}
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary, opacity: 0.7, lineHeight: 1.5 }}>
            🔒 Seal Day {day} at midnight — come back then to lock in your streak and advance to Day {day + 1}.
          </div>

          {/* Pre-seal reflection prompt */}
          <PreSealReflection state={state} save={save} day={day} colors={colors} arcColor={arc.color} />
        </motion.div>
      ) : (
        <button
          style={{
            ...ts.completeBtn,
            opacity: allDone && canCompleteDay ? 1 : 0.4,
            cursor: allDone && canCompleteDay ? "pointer" : "default",
            background: allDone && canCompleteDay
              ? "linear-gradient(135deg, #22C55E, #16A34A)"
              : "linear-gradient(135deg, #7C5CFC, #6D28D9)",
          }}
          onClick={onCompleteDay}
          disabled={!allDone || !canCompleteDay}
        >
          {allDone ? `Seal Day ${day}` : `${completedRegular.length} / ${quests.length} Quests`}
        </button>
      )}

      {/* ── Rest Day: prominent when streak is at risk, subtle otherwise ── */}
      <RestDayControl
        state={state}
        day={day}
        allDone={allDone}
        canCompleteDay={canCompleteDay}
        isDark={isDark}
        colors={colors}
        onMarkRestDay={onMarkRestDay}
      />

      {/* ── Lifting Streak ── */}
      {state.liftingStreak > 0 && (
        <div style={ts.subStreak}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Dumbbell size={12} strokeWidth={2.5} />
            Lifting: <strong>{state.liftingStreak} days</strong>
          </span>
          <span style={{ opacity: 0.3, fontSize: 11 }}>Best: {state.bestLiftingStreak || 0}</span>
        </div>
      )}

      {/* ── H10: Discovery cards for new users — labeled section ── */}
      {day <= 5 && (
        <div style={ts.discoverySection}>
          <div style={{
            fontSize: 10, fontWeight: 700, opacity: 0.4,
            textTransform: "uppercase", letterSpacing: 0.8,
            padding: "0 2px 4px", color: colors.textSecondary,
          }}>
            New here? Explore
          </div>
          {day <= 2 && (
            <div style={ts.discoveryCard} onClick={() => onNavigate?.("academy")}>
              <BookOpen size={16} color={colors.textSecondary} strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>Learn the science</div>
                <div style={{ fontSize: 11, color: colors.textSecondary }}>Why each quest works — start with "Getting Started"</div>
              </div>
              <span style={{ color: colors.textSecondary, fontSize: 14 }}>→</span>
            </div>
          )}
          {Object.keys(state.sobrietyDates || {}).length > 0 && day <= 3 && (
            <div style={ts.discoveryCard} onClick={() => onNavigate?.("forge")}>
              <Flame size={16} color="#F97316" strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>Check your Forge</div>
                <div style={{ fontSize: 11, color: colors.textSecondary }}>Tips and support for breaking bad habits</div>
              </div>
              <span style={{ color: colors.textSecondary, fontSize: 14 }}>→</span>
            </div>
          )}
          {day === 3 && (
            <div style={{ ...ts.discoveryCard, borderColor: "rgba(124,92,252,0.15)", background: "rgba(124,92,252,0.04)" }}>
              <Target size={16} color="#7C5CFC" strokeWidth={2.5} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7C5CFC" }}>Custom quests unlock tomorrow!</div>
                <div style={{ fontSize: 11, color: colors.textSecondary }}>Add your own personalized quests</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Custom quest unlock hint ── */}
      {unlockedCustomCategories.length === 0 && (state.customQuests || []).length === 0 && day < 4 && (
        <div style={ts.hintBox}>
          Custom quests unlock on Day 4. Complete your first 3 days to add your own.
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}

// ── Voice Banner — ambient, adaptive narrator line above the quest list ──
function VoiceBanner({ state, colors, arcColor }) {
  const voice = getVoice("home_banner", state);
  if (!voice) return null;

  // Tone-based accent (fallback to arc color)
  const toneColor = {
    recovery: "#F97316",
    boss: "#FBBF24",
    milestone: "#FBBF24",
    seal: "#22C55E",
    morning: arcColor || "#7C5CFC",
    nudge: "#F97316",
    close: "#7C5CFC",
  }[voice.tone] || arcColor || "#7C5CFC";

  return (
    <motion.div
      key={voice.line}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        margin: "0 14px 10px",
        padding: "10px 14px",
        borderLeft: `2px solid ${toneColor}`,
        borderRadius: 4,
        background: "transparent",
        fontSize: 13,
        lineHeight: 1.45,
        fontWeight: 500,
        fontStyle: "italic",
        color: colors.text,
        opacity: 0.78,
        letterSpacing: 0.1,
      }}
    >
      {voice.line}
    </motion.div>
  );
}

// ── Pre-seal reflection — one optional question before sealing the day ──
function PreSealReflection({ state, save, day, colors, arcColor }) {
  const existing = state.sealReflections?.[day];
  const [answer, setAnswer] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const prompt = useMemo(() => getVoice("pre_seal", state), [state.currentDay]);

  if (!prompt || !save || dismissed) return null;

  // Already answered — show it quietly
  if (existing) {
    return (
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${colors.cardBorder || "rgba(255,255,255,0.08)"}`,
        fontSize: 11, opacity: 0.55,
      }}>
        <div style={{ fontStyle: "italic", marginBottom: 4, color: arcColor }}>{existing.prompt}</div>
        <div style={{ color: colors.text, opacity: 0.75 }}>{existing.answer}</div>
      </div>
    );
  }

  const handleSave = () => {
    if (!answer.trim()) return;
    save({
      ...state,
      sealReflections: {
        ...(state.sealReflections || {}),
        [day]: {
          prompt: prompt.line,
          answer: answer.trim(),
          date: new Date().toISOString(),
        },
      },
    });
    setAnswer("");
  };

  return (
    <div style={{
      marginTop: 14, paddingTop: 12,
      borderTop: `1px dashed ${colors.cardBorder || "rgba(255,255,255,0.1)"}`,
    }}>
      <div style={{
        fontSize: 12, fontStyle: "italic", color: arcColor, marginBottom: 8,
        opacity: 0.9, fontWeight: 500,
      }}>
        {prompt.line}
      </div>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="A sentence is enough. Or skip."
        rows={2}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${colors.cardBorder || "rgba(255,255,255,0.08)"}`,
          borderRadius: 8, padding: "8px 10px",
          fontSize: 12, color: colors.text, resize: "none",
          fontFamily: "inherit", outline: "none",
        }}
      />
      <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "transparent", border: "none",
            color: colors.textSecondary, opacity: 0.5,
            fontSize: 11, cursor: "pointer", padding: "4px 8px",
          }}
        >
          Skip
        </button>
        <button
          onClick={handleSave}
          disabled={!answer.trim()}
          style={{
            background: answer.trim() ? arcColor : "transparent",
            border: `1px solid ${arcColor}`,
            color: answer.trim() ? "#fff" : arcColor,
            fontSize: 11, fontWeight: 700,
            padding: "4px 12px", borderRadius: 6,
            cursor: answer.trim() ? "pointer" : "default",
            opacity: answer.trim() ? 1 : 0.5,
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ── Flat quest list (small-roster render path) ──
function FlatQuestList({ quests, completed, ts, colors, ...questCardProps }) {
  // Preserve natural day order; the active-quests list is already
  // user-curated so we don't need to force-group by timeOfDay here.
  return (
    <div style={{ ...ts.timeBlock, padding: "4px 6px" }}>
      {quests.map((q) => (
        <QuestCard
          key={q.id}
          quest={q}
          done={completed.includes(q.id)}
          colors={colors}
          ts={ts}
          {...questCardProps}
        />
      ))}
    </div>
  );
}

// ── Extracted JSX helpers (avoid IIFE-in-JSX which breaks rolldown/SWC) ──

function RestDayControl({ state, day, allDone, canCompleteDay, isDark, colors, onMarkRestDay }) {
  const isRest = (state.restDays || []).includes(day);
  const [showInfo, setShowInfo] = useState(false);

  // Already marked — show confirmation strip
  if (isRest) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        margin: "6px 14px 0", padding: "10px 14px",
        borderRadius: 10, background: "rgba(59,130,246,0.08)",
        border: "1px solid rgba(59,130,246,0.18)",
      }}>
        <Shield size={14} color="#3B82F6" strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6", flex: 1 }}>
          Rest day — your streak is safe
        </span>
        <span style={{ fontSize: 10, color: "#3B82F6", opacity: 0.6 }}>🛡️ {state.streak}d streak held</span>
      </div>
    );
  }

  // Day already fully done — no need to show rest option
  if (allDone) return null;

  // At-risk: streak active and it's late (8pm+)
  const hour = new Date().getHours();
  const hasStreak = (state.streak || 0) > 0;
  const atRisk = hasStreak && hour >= 20;
  const freezesAvailable = (state.streakFreezes || 0) > 0;

  if (atRisk) {
    return (
      <div style={{
        margin: "10px 14px 0", padding: "12px 14px", borderRadius: 12,
        background: isDark
          ? "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(124,92,252,0.05))"
          : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(124,92,252,0.06))",
        border: "1px solid rgba(59,130,246,0.25)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Shield size={18} color="#3B82F6" strokeWidth={2} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, lineHeight: 1.3 }}>
            Protect your {state.streak}-day streak
          </div>
          <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 1.4 }}>
            {freezesAvailable
              ? `You have ${state.streakFreezes} streak freeze${state.streakFreezes > 1 ? "s" : ""}. Mark as rest day and keep the streak.`
              : "Can't finish today? Mark as rest day — your streak stays intact."}
          </div>
        </div>
        <button
          onClick={() => onMarkRestDay?.(day)}
          style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, border: "none", background: "#3B82F6", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
        >
          Rest day
        </button>
      </div>
    );
  }

  // B: Always visible — clear, informative entry point
  return (
    <div style={{ margin: "8px 14px 0" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", borderRadius: 10,
        background: isDark ? "rgba(59,130,246,0.05)" : "rgba(59,130,246,0.04)",
        border: `1px solid ${isDark ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.12)"}`,
      }}>
        <Shield size={14} color="#3B82F6" strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.7 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#3B82F6" }}>Taking a rest day?</div>
          <div style={{ fontSize: 10, color: colors.textSecondary, opacity: 0.6, marginTop: 1 }}>
            Your streak is preserved. Best used 1–2× per week intentionally.
          </div>
        </div>
        <button
          onClick={() => onMarkRestDay?.(day)}
          style={{
            flexShrink: 0, padding: "6px 12px", borderRadius: 8,
            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
            color: "#3B82F6", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}
        >
          Mark rest
        </button>
      </div>
    </div>
  );
}

function MoodPickerRow({ currentMood, onLogMood, ts, colors }) {
  if (!onLogMood) return null;
  const selected = typeof currentMood === "number" ? currentMood : null;
  return (
    <div style={{ ...ts.moodRow, flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
      <span style={{ ...ts.moodLabel, color: colors.textSecondary }}>
        {selected !== null ? `Mood: ${MOODS[selected].label}` : "How are you today?"}
      </span>
      {/* H6: show mood label below each dot so users know what each color means */}
      <div style={{ display: "flex", gap: 6, width: "100%" }}>
        {MOODS.map((m, i) => {
          const isActive = selected === i;
          return (
            <motion.button
              key={m.label}
              type="button"
              aria-label={`Log mood: ${m.label}`}
              aria-pressed={isActive}
              onClick={() => onLogMood(i)}
              whileTap={{ scale: 0.88 }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "5px 2px",
                borderRadius: 8,
                cursor: "pointer",
                background: isActive ? `${m.color}18` : "transparent",
                border: isActive ? `1px solid ${m.color}50` : "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: isActive ? m.color : `${m.color}30`,
                border: isActive ? `2px solid ${m.color}` : `2px solid transparent`,
                boxShadow: isActive ? `0 0 0 3px ${m.color}25` : "none",
                transition: "all 0.15s",
              }} />
              <span style={{
                fontSize: 9,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? m.color : colors.textSecondary,
                opacity: isActive ? 1 : 0.5,
                letterSpacing: 0.1,
                lineHeight: 1,
              }}>
                {m.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyChallengeBanner({ state, ts }) {
  const wc = getWeeklyChallenge(state);
  if (!wc) return null;
  const claimedKey = `wc_${wc.weekNum}_${wc.id}`;
  const claimed = state.weeklyChallengeClaimed?.[claimedKey];
  return (
    <div style={ts.weeklyCard}>
      <div style={ts.weeklyHeader}>
        <Trophy size={14} color="#FBBF24" />
        <span style={ts.weeklyTitle}>Weekly Challenge</span>
        {claimed && <span style={ts.weeklyDone}>Claimed!</span>}
      </div>
      <div style={ts.weeklyDesc}>{wc.description}</div>
      <div style={ts.weeklyProgressRow}>
        <div style={ts.weeklyBar}>
          <div style={{ ...ts.weeklyBarFill, width: `${wc.percentComplete}%` }} />
        </div>
        <span style={ts.weeklyCount}>{wc.progress}/{wc.target}</span>
      </div>
      {!claimed && <div style={ts.weeklyReward}>+{wc.xpReward} XP on completion</div>}
    </div>
  );
}

function BonusQuestCard({ state, completed, colors, onCheckQuest }) {
  const bonus = getDailyBonusQuest(state);
  if (!bonus) return null;
  const bonusDone = completed.includes(bonus.id);
  const bonusCat = CATEGORIES.find((c) => c.id === bonus.category);
  return (
    <div style={{
      margin: "12px 14px 0", padding: "14px 16px", borderRadius: 14,
      background: bonusDone ? "rgba(34,197,94,0.06)" : "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(249,115,22,0.03))",
      border: bonusDone ? "1px solid rgba(34,197,94,0.15)" : "1px solid rgba(251,191,36,0.15)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Star size={14} color="#FBBF24" />
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "#FBBF24" }}>
          Bonus Quest
        </span>
        <span style={{ fontSize: 10, opacity: 0.4, marginLeft: "auto" }}>2x XP</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: bonusDone ? 0.5 : 1, textDecoration: bonusDone ? "line-through" : "none" }}>
        <div
          style={{ width: 22, height: 22, borderRadius: 7, border: bonusDone ? "none" : "2px solid rgba(251,191,36,0.4)", background: bonusDone ? "#22C55E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: bonusDone ? "default" : "pointer", flexShrink: 0 }}
          onClick={() => !bonusDone && onCheckQuest(bonus.id, bonus.xp)}
        >
          {bonusDone && <Check size={13} color="#fff" strokeWidth={3} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>{bonus.text}</div>
          <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>
            {bonusCat && <CategoryIcon id={bonusCat.id} size={10} color={bonusCat.color} />}{" "}
            {bonusCat?.label}
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#FBBF24" }}>+{bonus.xp} XP</span>
      </div>
    </div>
  );
}

// ── Inline AI Quest Suggestions ──
function InlineQuestSuggestions({ state, quests, isDark, colors, onOpenCustomQuest, onAddSuggestedQuest }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [addedIndexes, setAddedIndexes] = useState(new Set());
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || !isAIConfigured()) return;
    hasFetched.current = true;
    setLoading(true);

    getAIQuestSuggestions(state).then((result) => {
      if (Array.isArray(result) && result.length > 0) {
        setSuggestions(result.slice(0, 3));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fall back to local suggestions if no AI — pass current quest texts to avoid duplicates
  const localSuggestions = useMemo(() => {
    const existingTexts = (quests || []).map((q) => q.text);
    return getQuestSuggestions(state, existingTexts).slice(0, 3);
  }, [state, quests]);
  const displaySuggestions = suggestions || (isAIConfigured() ? null : localSuggestions);

  if (dismissed || (!loading && !displaySuggestions)) return null;

  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;

  return (
    <div style={{
      margin: "8px 0 12px",
      padding: 14,
      borderRadius: 12,
      background: isDark ? "rgba(124,92,252,0.04)" : "rgba(124,92,252,0.03)",
      border: `1px solid ${isDark ? "rgba(124,92,252,0.08)" : "rgba(124,92,252,0.06)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={13} color="#7C5CFC" strokeWidth={2} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#7C5CFC" }}>Suggested for You</span>
        </div>
        <span
          style={{ fontSize: 11, color: sub(0.3), cursor: "pointer" }}
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </span>
      </div>

      {loading ? (
        <div style={{ padding: "8px 0", fontSize: 11, color: sub(0.3), textAlign: "center" }}>
          Loading suggestions...
        </div>
      ) : (
        displaySuggestions?.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.25 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              marginBottom: i < displaySuggestions.length - 1 ? 6 : 0,
              background: sub(0.02),
              cursor: "pointer",
            }}
            onClick={() => {
              if (addedIndexes.has(i)) return;
              setAddedIndexes((prev) => new Set([...prev, i]));
              if (onAddSuggestedQuest) {
                onAddSuggestedQuest({ id: `ai_${Date.now()}_${i}`, text: s.text, category: s.category || "mind" });
              } else {
                onOpenCustomQuest();
              }
            }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: s.difficulty === "hard" ? "#EF4444" : s.difficulty === "easy" ? "#22C55E" : "#7C5CFC",
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: colors.text, lineHeight: 1.4 }}>
                {s.text}
              </div>
              <div style={{ fontSize: 10, color: sub(0.35), marginTop: 2 }}>
                {s.reason}
              </div>
            </div>
            <span style={{ fontSize: 10, color: addedIndexes.has(i) ? "#22C55E" : "#7C5CFC", fontWeight: 600, flexShrink: 0 }}>
              {addedIndexes.has(i) ? "✓ Added" : "+ Add"}
            </span>
          </motion.div>
        ))
      )}
    </div>
  );
}

// ── Theme-aware styles generator ──
function getStyles(isDark, colors) {
  // Adaptive alpha helper
  const subtle = (opacity) => isDark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;

  return {
    // Hero
    hero: {
      position: "relative",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 18px 14px",
      margin: "0 12px 4px",
      borderRadius: 16,
      background: isDark
        ? "linear-gradient(145deg, rgba(124,92,252,0.06), rgba(236,72,153,0.03))"
        : "linear-gradient(145deg, rgba(124,92,252,0.08), rgba(236,72,153,0.04))",
      border: `1px solid ${isDark ? "rgba(124,92,252,0.08)" : "rgba(124,92,252,0.12)"}`,
      cursor: "pointer",
    },
    heroLeft: { flex: 1 },
    dateText: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.textSecondary,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    greetingText: {
      fontSize: 20,
      fontWeight: 800,
      color: colors.text,
      letterSpacing: -0.3,
      lineHeight: 1.2,
    },
    heroPhase: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontWeight: 500, opacity: 0.4 },
    heroLevelXp: { marginTop: 8 },
    levelXpText: { fontSize: 12, fontWeight: 600, color: "#7C5CFC" },
    prestigeInline: { fontSize: 10, fontWeight: 800, color: "#FBBF24" },
    heroRight: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" },
    ringWrap: { position: "relative", width: 72, height: 72 },

    // Forge tracker row
    forgeRow: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      padding: "12px 14px",
      margin: "4px 12px 2px",
      borderRadius: 12,
      background: isDark
        ? "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(251,191,36,0.02))"
        : "linear-gradient(135deg, rgba(249,115,22,0.07), rgba(251,191,36,0.03))",
      border: `1px solid ${isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.15)"}`,
      cursor: "pointer",
    },
    forgeRowTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    forgeChip: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "5px 10px",
      borderRadius: 8,
      background: subtle(0.04),
      border: `1px solid ${subtle(0.06)}`,
      flexShrink: 0,
    },
    forgeDot: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      flexShrink: 0,
    },
    forgeLabel: { fontSize: 12, fontWeight: 600, color: colors.text },
    forgeDays: { fontSize: 12, fontWeight: 800 },

    // Inline mood picker
    moodRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "8px 14px",
      margin: "4px 12px 2px",
    },
    moodLabel: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 0.2,
      flexShrink: 0,
    },
    moodDots: {
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    moodDot: {
      width: 22,
      height: 22,
      borderRadius: "50%",
      cursor: "pointer",
      padding: 0,
      transition: "all 0.15s ease",
    },

    // Quote
    quoteCard: {
      display: "flex",
      gap: 10,
      margin: "12px 14px 0",
      padding: "14px 16px",
      borderRadius: 12,
      background: isDark ? "rgba(124,92,252,0.04)" : "rgba(124,92,252,0.03)",
      border: `1px solid ${isDark ? "rgba(124,92,252,0.08)" : "rgba(124,92,252,0.08)"}`,
    },
    quoteText: {
      fontSize: 12,
      fontStyle: "italic",
      color: colors.textSecondary,
      lineHeight: 1.6,
      margin: "0 0 4px",
    },
    quoteAuthor: {
      fontSize: 11,
      color: colors.textSecondary,
      opacity: 0.6,
      margin: 0,
      fontWeight: 500,
    },
    ringCenter: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    ringNumber: { fontSize: 20, fontWeight: 900, lineHeight: 1, color: colors.text },
    ringLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: 600 },
    streakChip: {
      display: "flex",
      alignItems: "center",
      gap: 3,
      padding: "3px 10px",
      borderRadius: 12,
      background: "rgba(249,115,22,0.1)",
      border: "1px solid rgba(249,115,22,0.15)",
    },
    streakNumber: { fontSize: 13, fontWeight: 800, color: "#F97316" },

    // Category streaks row
    streaksRow: {
      display: "flex",
      gap: 6,
      padding: "0 14px",
      marginBottom: 6,
      overflowX: "auto",
      scrollbarWidth: "none",
    },
    streakItem: {
      display: "flex",
      alignItems: "center",
      gap: 3,
      padding: "3px 8px",
      borderRadius: 8,
      border: "1px solid",
      background: subtle(0.03),
      flexShrink: 0,
    },

    // Section header
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 18px 4px",
    },
    sectionTitle: { fontSize: 16, fontWeight: 800, letterSpacing: -0.3, color: colors.text },
    addBtn: {
      fontSize: 11,
      fontWeight: 700,
      color: "#7C5CFC",
      cursor: "pointer",
      padding: "5px 12px",
      borderRadius: 8,
      border: "1px solid rgba(124,92,252,0.2)",
      background: "rgba(124,92,252,0.06)",
    },

    // Focus quest
    focusCard: {
      margin: "8px 14px",
      padding: "14px 16px",
      borderRadius: 14,
      background: isDark
        ? "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(236,72,153,0.04))"
        : "linear-gradient(135deg, rgba(124,92,252,0.1), rgba(236,72,153,0.05))",
      border: "1px solid rgba(124,92,252,0.15)",
      cursor: "pointer",
    },
    focusHeader: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 },
    focusLabel: { fontSize: 10, fontWeight: 800, color: "#7C5CFC", textTransform: "uppercase", letterSpacing: 0.5 },
    focusText: { fontSize: 15, fontWeight: 700, lineHeight: 1.3, color: colors.text },
    focusFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
    focusXp: { fontSize: 13, fontWeight: 800, color: "#7C5CFC" },

    // Weekly challenge
    weeklyCard: {
      margin: "10px 14px",
      padding: "12px 14px",
      borderRadius: 14,
      background: "rgba(251,191,36,0.04)",
      border: "1px solid rgba(251,191,36,0.12)",
    },
    weeklyHeader: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 6,
    },
    weeklyTitle: {
      fontSize: 12,
      fontWeight: 700,
      color: "#FBBF24",
      flex: 1,
    },
    weeklyDone: {
      fontSize: 10,
      fontWeight: 700,
      color: "#22C55E",
      background: "rgba(34,197,94,0.12)",
      padding: "2px 8px",
      borderRadius: 6,
    },
    weeklyDesc: {
      fontSize: 12,
      opacity: 0.6,
      lineHeight: 1.4,
      marginBottom: 8,
    },
    weeklyProgressRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    weeklyBar: {
      flex: 1,
      height: 5,
      borderRadius: 3,
      background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      overflow: "hidden",
    },
    weeklyBarFill: {
      height: "100%",
      borderRadius: 3,
      background: "linear-gradient(90deg, #FBBF24, #F97316)",
      transition: "width 0.3s ease",
    },
    weeklyCount: {
      fontSize: 11,
      fontWeight: 700,
      color: "#FBBF24",
      fontVariantNumeric: "tabular-nums",
    },
    weeklyReward: {
      fontSize: 10,
      opacity: 0.35,
      marginTop: 4,
    },

    // Time blocks
    timeBlock: {
      margin: "6px 14px",
      borderRadius: 14,
      background: isDark ? "rgba(255,255,255,0.015)" : colors.cardBg,
      border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : colors.cardBorder}`,
      overflow: "hidden",
    },
    blockHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 14px",
      cursor: "pointer",
      userSelect: "none",
    },
    blockLeft: { display: "flex", alignItems: "center", gap: 10 },
    blockTitle: { fontSize: 13, fontWeight: 800, letterSpacing: -0.2, color: colors.text },
    blockCount: { fontSize: 10, color: colors.textSecondary, marginTop: 1, display: "flex", alignItems: "center", gap: 6 },
    blockDoneBadge: {
      fontSize: 11,
      fontWeight: 800,
      color: "#22C55E",
      background: "rgba(34,197,94,0.12)",
      padding: "1px 6px",
      borderRadius: 4,
    },
    blockRight: { display: "flex", alignItems: "center", gap: 10 },
    miniProgress: {
      width: 48,
      height: 4,
      borderRadius: 2,
      background: subtle(0.08),
      overflow: "hidden",
    },
    miniProgressFill: {
      height: "100%",
      borderRadius: 2,
      transition: "width 0.3s ease",
    },
    blockQuests: {
      padding: "0 6px 8px",
    },

    // Quest card
    questCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      margin: "3px 0",
      borderRadius: 10,
      cursor: "pointer",
      transition: "all 0.15s",
      background: subtle(0.02),
    },
    questLeft: { display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      border: "2px solid",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "all 0.2s",
    },
    questText: { fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: colors.text },
    questMeta: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      marginTop: 2,
      flexWrap: "wrap",
    },
    streakPill: {
      fontSize: 11,
      fontWeight: 700,
      padding: "1px 5px",
      borderRadius: 4,
      border: "1px solid",
    },
    focusBadge: {
      fontSize: 11,
      fontWeight: 800,
      color: "#7C5CFC",
      background: "rgba(124,92,252,0.15)",
      padding: "1px 5px",
      borderRadius: 4,
      letterSpacing: 0.5,
    },
    tierBadge: {
      fontSize: 11,
      fontWeight: 700,
      padding: "1px 5px",
      borderRadius: 4,
      border: "1px solid",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    questRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 },
    questXp: { fontSize: 14, fontWeight: 800 },
    questActions: { display: "flex", gap: 6 },
    actionLink: {
      fontSize: 10,
      fontWeight: 600,
      color: "rgba(124,92,252,0.6)",
      cursor: "pointer",
    },

    // Undo overlay
    undoOverlay: {
      position: "absolute",
      inset: 0,
      background: isDark
        ? "linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(30,30,50,0.95) 35%)"
        : "linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(245,245,247,0.97) 35%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      zIndex: 5,
      borderRadius: 10,
      cursor: "pointer",
      backdropFilter: "blur(2px)",
    },
    undoIcon: { fontSize: 18, fontWeight: 800, color: "#EF4444" },
    undoText: { fontSize: 12, fontWeight: 700, color: "#EF4444" },

    // Complete button
    completeBtn: {
      width: "calc(100% - 28px)",
      margin: "12px 14px 0",
      padding: "14px 24px",
      borderRadius: 14,
      border: "none",
      color: "#fff",
      fontSize: 15,
      fontWeight: 800,
      cursor: "pointer",
      letterSpacing: 0.3,
      boxShadow: "0 4px 20px rgba(124,92,252,0.2)",
      transition: "all 0.2s",
    },

    lockBox: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      margin: "10px 14px 0",
      padding: "10px 14px",
      borderRadius: 10,
      background: "rgba(124,92,252,0.06)",
      border: "1px solid rgba(124,92,252,0.1)",
    },

    subStreak: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 18px",
      fontSize: 12,
      color: colors.textSecondary,
    },

    // Proactive nudges
    nudgesSection: {
      padding: "0 14px",
      marginTop: 12,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    nudgeCard: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "12px 14px",
      borderRadius: 12,
      background: isDark
        ? "linear-gradient(135deg, rgba(124,92,252,0.06), rgba(59,130,246,0.03))"
        : "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(59,130,246,0.04))",
      border: `1px solid ${isDark ? "rgba(124,92,252,0.1)" : "rgba(124,92,252,0.12)"}`,
      cursor: "pointer",
    },

    // Discovery
    discoverySection: {
      padding: "0 14px",
      marginTop: 10,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    discoveryCard: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 14px",
      borderRadius: 12,
      background: isDark ? "rgba(255,255,255,0.025)" : colors.cardBg,
      border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : colors.cardBorder}`,
      cursor: "pointer",
    },

    hintBox: {
      margin: "10px 14px 0",
      padding: "10px 14px",
      borderRadius: 10,
      background: subtle(0.03),
      border: `1px solid ${subtle(0.06)}`,
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 1.5,
    },
  };
}
