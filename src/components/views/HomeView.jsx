import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { CATEGORIES, findGuideForQuest } from "../../data";
import { getDayQuests, getLevel, getNextLevel, getLevelIndex, getQuestTier, getCategoryStreak } from "../../utils";
import { getQuestSuggestions, getProactiveNudges } from "../../utils/intelligence";
import { getAIQuestSuggestions, isAIConfigured } from "../../utils/ai";
import QuestGuidePanel from "../QuestGuidePanel";
import SmartInsights from "../SmartInsights";

const SWIPE_THRESHOLD = 60;

// ── Quest time-of-day mapping ──
const TIME_BLOCKS = {
  morning: {
    label: "Morning Ritual",
    icon: "🌅",
    categories: ["sleep", "water", "shower", "nutrition"],
    gradient: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(249,115,22,0.04))",
    accent: "#FBBF24",
  },
  afternoon: {
    label: "Daily Challenges",
    icon: "⚡",
    categories: ["exercise", "work", "reading", "finance"],
    gradient: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(59,130,246,0.04))",
    accent: "#7C5CFC",
  },
  evening: {
    label: "Evening Growth",
    icon: "🌙",
    categories: ["mind", "screen", "social", "creative"],
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.04))",
    accent: "#A78BFA",
  },
};

function getTimeBlock(categoryId) {
  for (const [key, block] of Object.entries(TIME_BLOCKS)) {
    if (block.categories.includes(categoryId)) return key;
  }
  return "afternoon"; // default
}

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
  state, xpPopup, onCheckQuest, onUncheckQuest, onCompleteDay, onOpenDojo,
  canCompleteDay, calendarDay, onOpenCustomQuest, onRemoveCustomQuest,
  unlockedCustomCategories, onNavigate,
}) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const ts = useMemo(() => getStyles(isDark, colors), [isDark, colors]);

  const day = state.currentDay;
  const quests = getDayQuests(day, state.customQuests, state);
  const completed = state.completedQuests[day] || [];
  const allDone = completed.length === quests.length && quests.length > 0;
  const level = getLevel(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const levelIdx = getLevelIndex(state.xp);
  const xpProgress = nextLevel ? (state.xp - level.xpReq) / (nextLevel.xpReq - level.xpReq) : 1;
  const dayProgress = quests.length > 0 ? completed.length / quests.length : 0;

  const [activeGuide, setActiveGuide] = useState(null);
  const [collapsedBlocks, setCollapsedBlocks] = useState({});
  const [swipeHint, setSwipeHint] = useState(null);
  const swipeHintTimer = useRef(null);
  const touchStartX = useRef(0);
  const touchStartId = useRef(null);

  const showSwipeHint = useCallback((questId) => {
    if (swipeHintTimer.current) clearTimeout(swipeHintTimer.current);
    setSwipeHint(questId);
    swipeHintTimer.current = setTimeout(() => setSwipeHint(null), 2000);
  }, []);

  // ── Quest grouping by time block ──
  const groupedQuests = useMemo(() => {
    const groups = { morning: [], afternoon: [], evening: [] };
    quests.forEach((q) => {
      const block = getTimeBlock(q.category);
      groups[block].push(q);
    });
    return groups;
  }, [quests]);

  // ── Category streaks ──
  const categoryStreaks = useMemo(() => {
    const streaks = {};
    CATEGORIES.forEach((cat) => {
      const s = getCategoryStreak(state.completedQuests, cat.id, day - 1);
      if (s > 0) streaks[cat.id] = s;
    });
    return streaks;
  }, [state.completedQuests, day]);

  // ── Focus quest — most impactful uncompleted quest ──
  const focusQuest = useMemo(() => {
    const uncompleted = quests.filter((q) => !completed.includes(q.id));
    if (uncompleted.length === 0) return null;
    return uncompleted.sort((a, b) => {
      const aStreak = categoryStreaks[a.category] || 0;
      const bStreak = categoryStreaks[b.category] || 0;
      if (aStreak > 2 && bStreak <= 2) return -1;
      if (bStreak > 2 && aStreak <= 2) return 1;
      return b.xp - a.xp;
    })[0];
  }, [quests, completed, categoryStreaks]);

  // ── Handlers ──
  function handleQuestClick(q) {
    if (completed.includes(q.id)) {
      showSwipeHint(q.id);
    } else {
      onCheckQuest(q.id, q.xp);
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

  // ── Render a single quest card ──
  function renderQuest(q) {
    const cat = CATEGORIES.find((c) => c.id === q.category);
    const done = completed.includes(q.id);
    const tier = getQuestTier(q.text);
    const isShowingHint = swipeHint === q.id;
    const streak = categoryStreaks[q.category] || 0;
    const isFocus = focusQuest?.id === q.id && !done;

    return (
      <React.Fragment key={q.id}>
        <motion.div
          layout
          initial={false}
          animate={{
            scale: done ? [1, 1.03, 1] : 1,
            opacity: done ? 0.55 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            ...ts.questCard,
            borderLeft: `3px solid ${done ? "rgba(34,197,94,0.5)" : cat?.color || "#555"}`,
            background: isFocus && !done
              ? `linear-gradient(135deg, ${cat?.color}08, ${cat?.color}03)`
              : ts.questCard.background,
            position: "relative",
            overflow: "hidden",
          }}
          onClick={() => handleQuestClick(q)}
          onTouchStart={(e) => handleTouchStart(e, q)}
          onTouchEnd={(e) => handleTouchEnd(e, q)}
        >
          {/* Undo overlay */}
          {isShowingHint && (
            <div
              style={ts.undoOverlay}
              onClick={(e) => {
                e.stopPropagation();
                setSwipeHint(null);
                onUncheckQuest(q.id, q.xp);
              }}
            >
              <span style={ts.undoIcon}>↩</span>
              <span style={ts.undoText}>Tap to undo</span>
            </div>
          )}

          <div style={ts.questLeft}>
            {/* Checkbox */}
            <div
              style={{
                ...ts.checkbox,
                background: done ? (cat?.color || "#22C55E") : "transparent",
                borderColor: done ? (cat?.color || "#22C55E") : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"),
                boxShadow: done ? `0 0 8px ${cat?.color}40` : "none",
              }}
            >
              {done && <span style={{ fontSize: 10, color: "#fff" }}>✓</span>}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                ...ts.questText,
                textDecoration: done ? "line-through" : "none",
                opacity: done ? 0.7 : 1,
              }}>
                {q.text}
              </div>
              <div style={ts.questMeta}>
                <span style={{ color: cat?.color, fontSize: 11 }}>{cat?.icon}</span>
                <span style={{ color: cat?.color, fontSize: 10, fontWeight: 600 }}>{cat?.label}</span>
                {streak > 0 && !done && (
                  <span style={{ ...ts.streakPill, color: cat?.color, borderColor: `${cat?.color}30` }}>
                    🔥{streak}d
                  </span>
                )}
                {isFocus && !done && (
                  <span style={ts.focusBadge}>FOCUS</span>
                )}
                <span style={{ ...ts.tierBadge, color: tier.color, borderColor: `${tier.color}30` }}>
                  {tier.label}
                </span>
              </div>
            </div>
          </div>

          <div style={ts.questRight}>
            <span style={{ ...ts.questXp, color: done ? "#22C55E" : (cat?.color || "#7C5CFC") }}>
              {done ? "✓" : `+${q.xp}`}
            </span>
            {/* Action links */}
            <div style={ts.questActions}>
              {findGuideForQuest(q.text) && !done && (
                <span
                  style={ts.actionLink}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveGuide(activeGuide?.questId === q.id ? null : { questId: q.id, guide: findGuideForQuest(q.text) });
                  }}
                >
                  {activeGuide?.questId === q.id ? "Hide" : "Guide"}
                </span>
              )}
              {q.category === "exercise" && !done && (
                <span style={ts.actionLink} onClick={(e) => { e.stopPropagation(); onNavigate?.("dojo"); }}>
                  Dojo
                </span>
              )}
              {q.isCustom && (
                <span
                  style={{ ...ts.actionLink, color: "#EF4444" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const prefix = `custom-${q.category}-`;
                    const suffix = `-${state.currentDay}`;
                    let rawId = q.id;
                    if (rawId.startsWith(prefix)) rawId = rawId.slice(prefix.length);
                    if (rawId.endsWith(suffix)) rawId = rawId.slice(0, -suffix.length);
                    onRemoveCustomQuest(rawId);
                  }}
                >
                  ✕
                </span>
              )}
            </div>
          </div>
        </motion.div>
        {activeGuide?.questId === q.id && (
          <QuestGuidePanel
            guide={activeGuide.guide}
            onAddQuest={() => { if (onOpenCustomQuest) onOpenCustomQuest(); }}
          />
        )}
      </React.Fragment>
    );
  }

  // ── Render a time block section ──
  function renderTimeBlock(key) {
    const block = TIME_BLOCKS[key];
    const blockQuests = groupedQuests[key];
    if (blockQuests.length === 0) return null;

    const blockCompleted = blockQuests.filter((q) => completed.includes(q.id)).length;
    const blockDone = blockCompleted === blockQuests.length;
    const isCollapsed = collapsedBlocks[key];

    return (
      <div key={key} style={ts.timeBlock}>
        {/* Block header */}
        <div
          style={ts.blockHeader}
          onClick={() => toggleBlock(key)}
        >
          <div style={ts.blockLeft}>
            <span style={{ fontSize: 16 }}>{blockDone ? "✅" : block.icon}</span>
            <div>
              <div style={{
                ...ts.blockTitle,
                opacity: blockDone ? 0.5 : 1,
                textDecoration: blockDone ? "line-through" : "none",
              }}>
                {block.label}
              </div>
              <div style={ts.blockCount}>
                {blockCompleted}/{blockQuests.length} complete
                {blockDone && <span style={ts.blockDoneBadge}>+Bonus!</span>}
              </div>
            </div>
          </div>

          <div style={ts.blockRight}>
            {/* Mini progress */}
            <div style={ts.miniProgress}>
              <div style={{
                ...ts.miniProgressFill,
                width: `${(blockCompleted / blockQuests.length) * 100}%`,
                background: blockDone ? "#22C55E" : block.accent,
              }} />
            </div>
            <span style={{ fontSize: 12, opacity: 0.3, transform: isCollapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform 0.2s", color: colors.text }}>
              ▼
            </span>
          </div>
        </div>

        {/* Quest list */}
        {!isCollapsed && (
          <div style={ts.blockQuests}>
            {blockQuests.map(renderQuest)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={S.vc}>
      {/* ── Hero Header ── */}
      <div style={ts.hero}>
        <div style={ts.heroLeft}>
          <div style={{ ...ts.heroDay, color: colors.text }}>Day {day}</div>
          <div style={ts.heroPhase}>
            {day <= 21 ? "Building Foundation" : day <= 66 ? "Gaining Momentum" : "Mastery Mode"}
          </div>
          <div style={ts.heroLevel}>
            <span style={ts.levelBadge}>Lv.{levelIdx + 1}</span>
            <span style={ts.levelName}>{level.name}</span>
          </div>
          <div style={ts.xpRow}>
            <div style={ts.xpBarOuter}>
              <div style={{ ...ts.xpBarInner, width: `${xpProgress * 100}%` }} />
            </div>
            <span style={ts.xpText}>{state.xp} XP</span>
          </div>
        </div>

        <div style={ts.heroRight}>
          {/* Progress ring */}
          <div style={ts.ringWrap}>
            <ProgressRing
              progress={dayProgress}
              size={72}
              stroke={5}
              color={allDone ? "#22C55E" : "#7C5CFC"}
              trackColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}
            />
            <div style={ts.ringCenter}>
              <div style={{ ...ts.ringNumber, color: colors.text }}>{completed.length}</div>
              <div style={ts.ringLabel}>/{quests.length}</div>
            </div>
          </div>
          {/* Streak */}
          <div style={ts.streakChip}>
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={ts.streakNumber}>{state.streak}</span>
          </div>
        </div>
      </div>

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

      {/* ── Active Category Streaks ── */}
      {Object.keys(categoryStreaks).length > 0 && (
        <div style={ts.streaksRow}>
          {Object.entries(categoryStreaks)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([catId, streak]) => {
              const cat = CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              return (
                <div key={catId} style={{ ...ts.streakItem, borderColor: `${cat.color}25` }}>
                  <span style={{ fontSize: 11 }}>{cat.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: cat.color }}>{streak}d</span>
                </div>
              );
            })}
        </div>
      )}

      {/* ── Section Header ── */}
      <div style={ts.sectionHeader}>
        <div style={{ ...ts.sectionTitle, color: colors.text }}>Today's Quests</div>
        <button style={ts.addBtn} onClick={onOpenCustomQuest}>+ Add</button>
      </div>

      {/* ── Focus Quest Highlight ── */}
      {focusQuest && !completed.includes(focusQuest.id) && (
        <div
          style={ts.focusCard}
          onClick={() => handleQuestClick(focusQuest)}
        >
          <div style={ts.focusHeader}>
            <span style={{ fontSize: 11 }}>🎯</span>
            <span style={ts.focusLabel}>Priority Quest</span>
          </div>
          <div style={{ ...ts.focusText, color: colors.text }}>{focusQuest.text}</div>
          <div style={ts.focusFooter}>
            <span style={{ color: CATEGORIES.find((c) => c.id === focusQuest.category)?.color, fontSize: 11 }}>
              {CATEGORIES.find((c) => c.id === focusQuest.category)?.icon}{" "}
              {CATEGORIES.find((c) => c.id === focusQuest.category)?.label}
            </span>
            <span style={ts.focusXp}>+{focusQuest.xp} XP</span>
          </div>
        </div>
      )}

      {/* ── Time Block Sections ── */}
      {["morning", "afternoon", "evening"].map(renderTimeBlock)}

      {/* ── Inline AI Quest Suggestions ── */}
      {day > 3 && !allDone && (
        <InlineQuestSuggestions
          state={state}
          isDark={isDark}
          colors={colors}
          onOpenCustomQuest={onOpenCustomQuest}
        />
      )}

      {/* ── Temporal Lock ── */}
      {isTimeLocked && (
        <div style={ts.lockBox}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, opacity: 0.6, color: colors.text }}>
            All quests complete! Come back tomorrow for Day {day + 1}.
          </span>
        </div>
      )}

      {/* ── Complete Day Button ── */}
      <button
        style={{
          ...ts.completeBtn,
          opacity: allDone && canCompleteDay ? 1 : 0.35,
          cursor: allDone && canCompleteDay ? "pointer" : "default",
          background: allDone && canCompleteDay
            ? "linear-gradient(135deg, #22C55E, #16A34A)"
            : "linear-gradient(135deg, #7C5CFC, #6D28D9)",
        }}
        onClick={onCompleteDay}
        disabled={!allDone || !canCompleteDay}
      >
        {allDone
          ? canCompleteDay
            ? `✨ Complete Day ${day}`
            : "⏳ Come back tomorrow"
          : `${completed.length}/${quests.length} Quests`}
      </button>

      {/* ── Lifting Streak ── */}
      {state.liftingStreak > 0 && (
        <div style={ts.subStreak}>
          <span>🏋️ Lifting: <strong>{state.liftingStreak} days</strong></span>
          <span style={{ opacity: 0.3, fontSize: 11 }}>Best: {state.bestLiftingStreak || 0}</span>
        </div>
      )}

      {/* ── Proactive AI Nudges ── */}
      {(() => {
        const nudges = getProactiveNudges(state);
        if (nudges.length === 0) return null;
        return (
          <div style={ts.nudgesSection}>
            {nudges.map((nudge, i) => (
              <motion.div
                key={nudge.type + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                style={ts.nudgeCard}
                onClick={() => nudge.action && onNavigate?.(nudge.action)}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{nudge.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: colors.text, marginBottom: 2 }}>
                    {nudge.title}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textSecondary, lineHeight: 1.4 }}>
                    {nudge.message}
                  </div>
                </div>
                {nudge.action && (
                  <span style={{ fontSize: 14, color: colors.textSecondary, flexShrink: 0 }}>→</span>
                )}
              </motion.div>
            ))}
          </div>
        );
      })()}

      {/* ── Smart Suggestions ── */}
      <SmartInsights
        suggestions={getQuestSuggestions(state)}
        onAddQuest={() => { if (onOpenCustomQuest) onOpenCustomQuest(); }}
      />

      {/* ── Discovery cards for new users ── */}
      {day <= 5 && (
        <div style={ts.discoverySection}>
          {day <= 2 && (
            <div style={ts.discoveryCard} onClick={() => onNavigate?.("academy")}>
              <span style={{ fontSize: 18 }}>📚</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>Learn the science</div>
                <div style={{ fontSize: 11, color: colors.textSecondary }}>Why each quest works — start with "Getting Started"</div>
              </div>
              <span style={{ color: colors.textSecondary }}>→</span>
            </div>
          )}
          {Object.keys(state.sobrietyDates || {}).length > 0 && day <= 3 && (
            <div style={ts.discoveryCard} onClick={() => onNavigate?.("forge")}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>Check your Forge</div>
                <div style={{ fontSize: 11, color: colors.textSecondary }}>Tips and support for breaking bad habits</div>
              </div>
              <span style={{ color: colors.textSecondary }}>→</span>
            </div>
          )}
          {day === 3 && (
            <div style={{ ...ts.discoveryCard, borderColor: "rgba(124,92,252,0.15)", background: "rgba(124,92,252,0.04)" }}>
              <span style={{ fontSize: 18 }}>🎯</span>
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
    </div>
  );
}

// ── Inline AI Quest Suggestions ──
function InlineQuestSuggestions({ state, isDark, colors, onOpenCustomQuest }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
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

  // Fall back to local suggestions if no AI
  const localSuggestions = useMemo(() => getQuestSuggestions(state).slice(0, 3), [state]);
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
          <span style={{ fontSize: 13 }}>✨</span>
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
            onClick={onOpenCustomQuest}
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
            <span style={{ fontSize: 10, color: "#7C5CFC", fontWeight: 600, flexShrink: 0 }}>+ Add</span>
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
    },
    heroLeft: { flex: 1 },
    heroDay: { fontSize: 28, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, color: colors.text },
    heroPhase: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontWeight: 500 },
    heroLevel: { display: "flex", alignItems: "center", gap: 6, marginTop: 8 },
    levelBadge: {
      fontSize: 10,
      fontWeight: 800,
      color: "#7C5CFC",
      background: "rgba(124,92,252,0.12)",
      padding: "2px 8px",
      borderRadius: 6,
      letterSpacing: 0.3,
    },
    levelName: { fontSize: 13, fontWeight: 700, color: "#7C5CFC" },
    xpRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 },
    xpBarOuter: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      background: subtle(0.08),
      overflow: "hidden",
    },
    xpBarInner: {
      height: "100%",
      borderRadius: 2,
      background: "linear-gradient(90deg,#F97316,#FACC15)",
      transition: "width 0.4s ease",
    },
    xpText: { fontSize: 10, fontWeight: 700, color: colors.textSecondary, flexShrink: 0 },
    heroRight: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
    ringWrap: { position: "relative", width: 72, height: 72 },
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
