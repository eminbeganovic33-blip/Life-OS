import React, { useState, useRef, useCallback, useMemo } from "react";
import { S } from "../../styles/theme";
import { CATEGORIES, findGuideForQuest } from "../../data";
import { getDayQuests, getLevel, getNextLevel, getLevelIndex, getQuestTier, getCategoryStreak } from "../../utils";
import { getQuestSuggestions } from "../../utils/intelligence";
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
function ProgressRing({ progress, size = 64, stroke = 5, color = "#7C5CFC" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - progress * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
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
  const day = state.currentDay;
  const quests = getDayQuests(day, state.customQuests);
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
    // Prioritize: highest XP, then quests with active streaks at risk
    return uncompleted.sort((a, b) => {
      const aStreak = categoryStreaks[a.category] || 0;
      const bStreak = categoryStreaks[b.category] || 0;
      // Streak-at-risk quests are priority
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
        <div
          style={{
            ...styles.questCard,
            borderLeft: `3px solid ${done ? "rgba(34,197,94,0.5)" : cat?.color || "#555"}`,
            opacity: done ? 0.55 : 1,
            background: isFocus && !done
              ? `linear-gradient(135deg, ${cat?.color}08, ${cat?.color}03)`
              : "rgba(255,255,255,0.02)",
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
              style={styles.undoOverlay}
              onClick={(e) => {
                e.stopPropagation();
                setSwipeHint(null);
                onUncheckQuest(q.id, q.xp);
              }}
            >
              <span style={styles.undoIcon}>↩</span>
              <span style={styles.undoText}>Tap to undo</span>
            </div>
          )}

          <div style={styles.questLeft}>
            {/* Checkbox */}
            <div
              style={{
                ...styles.checkbox,
                background: done ? (cat?.color || "#22C55E") : "transparent",
                borderColor: done ? (cat?.color || "#22C55E") : "rgba(255,255,255,0.15)",
                boxShadow: done ? `0 0 8px ${cat?.color}40` : "none",
              }}
            >
              {done && <span style={{ fontSize: 10, color: "#fff" }}>✓</span>}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                ...styles.questText,
                textDecoration: done ? "line-through" : "none",
                opacity: done ? 0.7 : 1,
              }}>
                {q.text}
              </div>
              <div style={styles.questMeta}>
                <span style={{ color: cat?.color, fontSize: 11 }}>{cat?.icon}</span>
                <span style={{ color: cat?.color, fontSize: 10, fontWeight: 600 }}>{cat?.label}</span>
                {streak > 0 && !done && (
                  <span style={{ ...styles.streakPill, color: cat?.color, borderColor: `${cat?.color}30` }}>
                    🔥{streak}d
                  </span>
                )}
                {isFocus && !done && (
                  <span style={styles.focusBadge}>FOCUS</span>
                )}
                <span style={{ ...styles.tierBadge, color: tier.color, borderColor: `${tier.color}30` }}>
                  {tier.label}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.questRight}>
            <span style={{ ...styles.questXp, color: done ? "#22C55E" : (cat?.color || "#7C5CFC") }}>
              {done ? "✓" : `+${q.xp}`}
            </span>
            {/* Action links */}
            <div style={styles.questActions}>
              {findGuideForQuest(q.text) && !done && (
                <span
                  style={styles.actionLink}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveGuide(activeGuide?.questId === q.id ? null : { questId: q.id, guide: findGuideForQuest(q.text) });
                  }}
                >
                  {activeGuide?.questId === q.id ? "Hide" : "Guide"}
                </span>
              )}
              {q.category === "exercise" && !done && (
                <span style={styles.actionLink} onClick={(e) => { e.stopPropagation(); onNavigate?.("dojo"); }}>
                  Dojo
                </span>
              )}
              {q.isCustom && (
                <span
                  style={{ ...styles.actionLink, color: "#EF4444" }}
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
        </div>
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
      <div key={key} style={styles.timeBlock}>
        {/* Block header */}
        <div
          style={styles.blockHeader}
          onClick={() => toggleBlock(key)}
        >
          <div style={styles.blockLeft}>
            <span style={{ fontSize: 16 }}>{blockDone ? "✅" : block.icon}</span>
            <div>
              <div style={{
                ...styles.blockTitle,
                opacity: blockDone ? 0.5 : 1,
                textDecoration: blockDone ? "line-through" : "none",
              }}>
                {block.label}
              </div>
              <div style={styles.blockCount}>
                {blockCompleted}/{blockQuests.length} complete
                {blockDone && <span style={styles.blockDoneBadge}>+Bonus!</span>}
              </div>
            </div>
          </div>

          <div style={styles.blockRight}>
            {/* Mini progress */}
            <div style={styles.miniProgress}>
              <div style={{
                ...styles.miniProgressFill,
                width: `${(blockCompleted / blockQuests.length) * 100}%`,
                background: blockDone ? "#22C55E" : block.accent,
              }} />
            </div>
            <span style={{ fontSize: 12, opacity: 0.3, transform: isCollapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform 0.2s" }}>
              ▼
            </span>
          </div>
        </div>

        {/* Quest list */}
        {!isCollapsed && (
          <div style={styles.blockQuests}>
            {blockQuests.map(renderQuest)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={S.vc}>
      {/* ── Hero Header ── */}
      <div style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.heroDay}>Day {day}</div>
          <div style={styles.heroPhase}>
            {day <= 21 ? "Building Foundation" : day <= 66 ? "Gaining Momentum" : "Mastery Mode"}
          </div>
          <div style={styles.heroLevel}>
            <span style={styles.levelBadge}>Lv.{levelIdx + 1}</span>
            <span style={styles.levelName}>{level.name}</span>
          </div>
          <div style={styles.xpRow}>
            <div style={styles.xpBarOuter}>
              <div style={{ ...styles.xpBarInner, width: `${xpProgress * 100}%` }} />
            </div>
            <span style={styles.xpText}>{state.xp} XP</span>
          </div>
        </div>

        <div style={styles.heroRight}>
          {/* Progress ring */}
          <div style={styles.ringWrap}>
            <ProgressRing
              progress={dayProgress}
              size={72}
              stroke={5}
              color={allDone ? "#22C55E" : "#7C5CFC"}
            />
            <div style={styles.ringCenter}>
              <div style={styles.ringNumber}>{completed.length}</div>
              <div style={styles.ringLabel}>/{quests.length}</div>
            </div>
          </div>
          {/* Streak */}
          <div style={styles.streakChip}>
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={styles.streakNumber}>{state.streak}</span>
          </div>
        </div>
      </div>

      {xpPopup && <div key={xpPopup.id} style={S.xpPop}>+{xpPopup.xp} XP</div>}

      {/* ── Active Category Streaks ── */}
      {Object.keys(categoryStreaks).length > 0 && (
        <div style={styles.streaksRow}>
          {Object.entries(categoryStreaks)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([catId, streak]) => {
              const cat = CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              return (
                <div key={catId} style={{ ...styles.streakItem, borderColor: `${cat.color}25` }}>
                  <span style={{ fontSize: 11 }}>{cat.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: cat.color }}>{streak}d</span>
                </div>
              );
            })}
        </div>
      )}

      {/* ── Section Header ── */}
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitle}>Today's Quests</div>
        <button style={styles.addBtn} onClick={onOpenCustomQuest}>+ Add</button>
      </div>

      {/* ── Focus Quest Highlight ── */}
      {focusQuest && !completed.includes(focusQuest.id) && (
        <div
          style={styles.focusCard}
          onClick={() => handleQuestClick(focusQuest)}
        >
          <div style={styles.focusHeader}>
            <span style={{ fontSize: 11 }}>🎯</span>
            <span style={styles.focusLabel}>Priority Quest</span>
          </div>
          <div style={styles.focusText}>{focusQuest.text}</div>
          <div style={styles.focusFooter}>
            <span style={{ color: CATEGORIES.find((c) => c.id === focusQuest.category)?.color, fontSize: 11 }}>
              {CATEGORIES.find((c) => c.id === focusQuest.category)?.icon}{" "}
              {CATEGORIES.find((c) => c.id === focusQuest.category)?.label}
            </span>
            <span style={styles.focusXp}>+{focusQuest.xp} XP</span>
          </div>
        </div>
      )}

      {/* ── Time Block Sections ── */}
      {["morning", "afternoon", "evening"].map(renderTimeBlock)}

      {/* ── Temporal Lock ── */}
      {isTimeLocked && (
        <div style={styles.lockBox}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            All quests complete! Come back tomorrow for Day {day + 1}.
          </span>
        </div>
      )}

      {/* ── Complete Day Button ── */}
      <button
        style={{
          ...styles.completeBtn,
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
        <div style={styles.subStreak}>
          <span>🏋️ Lifting: <strong>{state.liftingStreak} days</strong></span>
          <span style={{ opacity: 0.3, fontSize: 11 }}>Best: {state.bestLiftingStreak || 0}</span>
        </div>
      )}

      {/* ── Smart Suggestions ── */}
      <SmartInsights
        suggestions={getQuestSuggestions(state)}
        onAddQuest={() => { if (onOpenCustomQuest) onOpenCustomQuest(); }}
      />

      {/* ── Discovery cards for new users ── */}
      {day <= 5 && (
        <div style={styles.discoverySection}>
          {day <= 2 && (
            <div style={styles.discoveryCard} onClick={() => onNavigate?.("academy")}>
              <span style={{ fontSize: 18 }}>📚</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Learn the science</div>
                <div style={{ fontSize: 11, opacity: 0.4 }}>Why each quest works — start with "Getting Started"</div>
              </div>
              <span style={{ opacity: 0.3 }}>→</span>
            </div>
          )}
          {Object.keys(state.sobrietyDates || {}).length > 0 && day <= 3 && (
            <div style={styles.discoveryCard} onClick={() => onNavigate?.("forge")}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Check your Forge</div>
                <div style={{ fontSize: 11, opacity: 0.4 }}>Tips and support for breaking bad habits</div>
              </div>
              <span style={{ opacity: 0.3 }}>→</span>
            </div>
          )}
          {day === 3 && (
            <div style={{ ...styles.discoveryCard, borderColor: "rgba(124,92,252,0.15)", background: "rgba(124,92,252,0.04)" }}>
              <span style={{ fontSize: 18 }}>🎯</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7C5CFC" }}>Custom quests unlock tomorrow!</div>
                <div style={{ fontSize: 11, opacity: 0.4 }}>Add your own personalized quests</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Custom quest unlock hint ── */}
      {unlockedCustomCategories.length === 0 && (state.customQuests || []).length === 0 && day < 4 && (
        <div style={styles.hintBox}>
          Custom quests unlock on Day 4. Complete your first 3 days to add your own.
        </div>
      )}
    </div>
  );
}

// ── Styles ──
const styles = {
  // Hero
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px 14px",
    margin: "0 12px 4px",
    borderRadius: 16,
    background: "linear-gradient(145deg, rgba(124,92,252,0.06), rgba(236,72,153,0.03))",
    border: "1px solid rgba(124,92,252,0.08)",
  },
  heroLeft: { flex: 1 },
  heroDay: { fontSize: 28, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1 },
  heroPhase: { fontSize: 11, opacity: 0.35, marginTop: 2, fontWeight: 500 },
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
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  xpBarInner: {
    height: "100%",
    borderRadius: 2,
    background: "linear-gradient(90deg,#F97316,#FACC15)",
    transition: "width 0.4s ease",
  },
  xpText: { fontSize: 10, fontWeight: 700, opacity: 0.4, flexShrink: 0 },
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
  ringNumber: { fontSize: 20, fontWeight: 900, lineHeight: 1 },
  ringLabel: { fontSize: 10, opacity: 0.35, fontWeight: 600 },
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
    background: "rgba(255,255,255,0.02)",
    flexShrink: 0,
  },

  // Section header
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 18px 4px",
  },
  sectionTitle: { fontSize: 16, fontWeight: 800, letterSpacing: -0.3 },
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
    background: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(236,72,153,0.04))",
    border: "1px solid rgba(124,92,252,0.15)",
    cursor: "pointer",
  },
  focusHeader: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 },
  focusLabel: { fontSize: 10, fontWeight: 800, color: "#7C5CFC", textTransform: "uppercase", letterSpacing: 0.5 },
  focusText: { fontSize: 15, fontWeight: 700, lineHeight: 1.3 },
  focusFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  focusXp: { fontSize: 13, fontWeight: 800, color: "#7C5CFC" },

  // Time blocks
  timeBlock: {
    margin: "6px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.015)",
    border: "1px solid rgba(255,255,255,0.04)",
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
  blockTitle: { fontSize: 13, fontWeight: 800, letterSpacing: -0.2 },
  blockCount: { fontSize: 10, opacity: 0.4, marginTop: 1, display: "flex", alignItems: "center", gap: 6 },
  blockDoneBadge: {
    fontSize: 9,
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
    background: "rgba(255,255,255,0.06)",
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
    background: "rgba(255,255,255,0.02)",
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
  questText: { fontSize: 13, fontWeight: 600, lineHeight: 1.3 },
  questMeta: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
    flexWrap: "wrap",
  },
  streakPill: {
    fontSize: 9,
    fontWeight: 700,
    padding: "1px 5px",
    borderRadius: 4,
    border: "1px solid",
  },
  focusBadge: {
    fontSize: 8,
    fontWeight: 800,
    color: "#7C5CFC",
    background: "rgba(124,92,252,0.15)",
    padding: "1px 5px",
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  tierBadge: {
    fontSize: 8,
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
    background: "linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(30,30,50,0.95) 35%)",
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
    opacity: 0.5,
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
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer",
  },

  hintBox: {
    margin: "10px 14px 0",
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    fontSize: 11,
    opacity: 0.4,
    textAlign: "center",
    lineHeight: 1.5,
  },
};
