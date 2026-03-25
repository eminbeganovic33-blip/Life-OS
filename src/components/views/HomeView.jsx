import React, { useState, useRef, useCallback } from "react";
import { S } from "../../styles/theme";
import { CATEGORIES, findGuideForQuest } from "../../data";
import { getDayQuests, getLevel, getNextLevel, getLevelIndex, getQuestTier } from "../../utils";
import { getQuestSuggestions } from "../../utils/intelligence";
import QuestGuidePanel from "../QuestGuidePanel";
import SmartInsights from "../SmartInsights";
import AICoach from "../AICoach";

const SWIPE_THRESHOLD = 60;

export default function HomeView({
  state, xpPopup, onCheckQuest, onUncheckQuest, onCompleteDay, onOpenDojo,
  canCompleteDay, calendarDay, onOpenCustomQuest, onRemoveCustomQuest,
  unlockedCustomCategories,
}) {
  const day = state.currentDay;
  const quests = getDayQuests(day, state.customQuests);
  const completed = state.completedQuests[day] || [];
  const allDone = completed.length === quests.length && quests.length > 0;
  const level = getLevel(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const levelIdx = getLevelIndex(state.xp);
  const xpProgress = nextLevel ? (state.xp - level.xpReq) / (nextLevel.xpReq - level.xpReq) : 1;
  const maxDay = state.masteryMode ? "∞" : 66;
  const dayProgress = state.masteryMode ? Math.min(100, (day / 365) * 100) : (day / 66) * 100;

  // Quest guide panel
  const [activeGuide, setActiveGuide] = useState(null); // { questId, guide }

  // Swipe-to-uncheck state
  const [swipeHint, setSwipeHint] = useState(null); // questId showing "swipe to undo"
  const swipeHintTimer = useRef(null);
  const touchStartX = useRef(0);
  const touchStartId = useRef(null);

  const showSwipeHint = useCallback((questId) => {
    if (swipeHintTimer.current) clearTimeout(swipeHintTimer.current);
    setSwipeHint(questId);
    swipeHintTimer.current = setTimeout(() => setSwipeHint(null), 2000);
  }, []);

  function handleQuestClick(q) {
    const done = completed.includes(q.id);
    if (done) {
      // Show swipe hint instead of unchecking
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
      // Swiped left — uncheck
      setSwipeHint(null);
      onUncheckQuest(q.id, q.xp);
    }
    touchStartId.current = null;
  }

  // Temporal lock status
  const isTimeLocked = !canCompleteDay && allDone;

  return (
    <div style={S.vc}>
      <div style={S.headerCard}>
        <div style={S.headerTop}>
          <div>
            <div style={S.dayLabel}>
              Day {day}{" "}
              <span style={{ fontSize: 14, opacity: 0.4, fontWeight: 400 }}>
                {state.masteryMode ? "Mastery Mode" : `of ${maxDay}`}
              </span>
            </div>
            <div style={S.levelName}>Lv.{levelIdx + 1} {level.name}</div>
          </div>
          <div style={S.streakBadge}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={S.streakNum}>{state.streak}</span>
          </div>
        </div>
        <div style={S.pLabel}><span>Journey</span><span>{Math.round(dayProgress)}%</span></div>
        <div style={S.pBarOut}>
          <div style={{ ...S.pBarIn, width: `${dayProgress}%`, background: "linear-gradient(90deg,#7C5CFC,#EC4899)" }} />
        </div>
        <div style={S.pLabel}>
          <span>{state.xp} XP {nextLevel ? `/ ${nextLevel.xpReq}` : "(MAX)"}</span>
          <span>{nextLevel ? nextLevel.name : "🏆"}</span>
        </div>
        <div style={S.pBarOut}>
          <div style={{ ...S.pBarIn, width: `${xpProgress * 100}%`, background: "linear-gradient(90deg,#F97316,#FACC15)" }} />
        </div>
      </div>

      {xpPopup && <div key={xpPopup.id} style={S.xpPop}>+{xpPopup.xp} XP</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 18px" }}>
        <div style={S.secTitle}>Daily Quests</div>
        <span
          style={addQuestBtn}
          onClick={onOpenCustomQuest}
          title="Add custom quest"
        >
          + Add
        </span>
      </div>

      <div style={S.qList}>
        {quests.map((q) => {
          const cat = CATEGORIES.find((c) => c.id === q.category);
          const done = completed.includes(q.id);
          const isExercise = q.category === "exercise";
          const tier = getQuestTier(q.text);
          const isShowingHint = swipeHint === q.id;
          return (
            <React.Fragment key={q.id}>
              <div
                style={{
                  ...S.qCard,
                  borderLeft: `3px solid ${cat?.color || "#555"}`,
                  opacity: done ? 0.6 : 1,
                  position: "relative",
                  overflow: "hidden",
                }}
                onClick={() => handleQuestClick(q)}
                onTouchStart={(e) => handleTouchStart(e, q)}
                onTouchEnd={(e) => handleTouchEnd(e, q)}
              >
                {/* Swipe hint overlay */}
                {isShowingHint && (
                  <div style={swipeHintOverlay}>
                    <span style={swipeHintArrow}>←</span>
                    <span style={swipeHintText}>Swipe left to undo</span>
                  </div>
                )}
                <div style={S.qLeft}>
                  <div style={{ ...S.cb, background: done ? cat?.color : "transparent", borderColor: cat?.color || "#555" }}>
                    {done && <span style={{ fontSize: 11 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ ...S.qText, textDecoration: done ? "line-through" : "none" }}>{q.text}</div>
                    <div style={S.qCat}>
                      {cat?.icon} {cat?.label}
                      <span style={{ ...tierBadge, color: tier.color, borderColor: `${tier.color}44` }}>
                        {tier.label}
                      </span>
                      {findGuideForQuest(q.text) && (
                        <span
                          style={S.dojoLink}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveGuide(activeGuide?.questId === q.id ? null : { questId: q.id, guide: findGuideForQuest(q.text) });
                          }}
                        >
                          {" "}· {activeGuide?.questId === q.id ? "Hide Guide" : "Guide →"}
                        </span>
                      )}
                      {isExercise && (
                        <span style={S.dojoLink} onClick={(e) => { e.stopPropagation(); onOpenDojo(); }}>
                          {" "}· Open Dojo →
                        </span>
                      )}
                      {q.isCustom && (
                        <span
                          style={{ ...S.dojoLink, color: "#EF4444" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Quest ID format: "custom-{category}-{cq.id}-{day}"
                            // Extract the original cq.id (e.g. "cq_1234567890") between category and day
                            const prefix = `custom-${q.category}-`;
                            const suffix = `-${state.currentDay}`;
                            let rawId = q.id;
                            if (rawId.startsWith(prefix)) rawId = rawId.slice(prefix.length);
                            if (rawId.endsWith(suffix)) rawId = rawId.slice(0, -suffix.length);
                            onRemoveCustomQuest(rawId);
                          }}
                        >
                          {" "}· Remove
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ ...S.qXp, color: cat?.color || "#7C5CFC" }}>+{q.xp}</div>
              </div>
              {activeGuide?.questId === q.id && (
                <QuestGuidePanel
                  guide={activeGuide.guide}
                  onAddQuest={(questText) => {
                    if (onOpenCustomQuest) onOpenCustomQuest();
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Temporal Lock Warning */}
      {isTimeLocked && (
        <div style={timeLockBox}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            Day {day} quests complete. Come back tomorrow to advance to Day {day + 1}.
          </span>
        </div>
      )}

      <button
        style={{
          ...S.primaryBtn,
          opacity: allDone && canCompleteDay ? 1 : 0.35,
          cursor: allDone && canCompleteDay ? "pointer" : "default",
          marginTop: 10,
        }}
        onClick={onCompleteDay}
        disabled={!allDone || !canCompleteDay}
      >
        {allDone
          ? canCompleteDay
            ? (day >= 66 && !state.masteryMode ? "Complete Journey!" : `Complete Day ${day} →`)
            : "⏳ Waiting for tomorrow..."
          : `${completed.length}/${quests.length} Quests`}
      </button>

      {state.liftingStreak > 0 && (
        <div style={S.subStreak}>
          <span>Lifting Streak: <strong>{state.liftingStreak} days</strong></span>
          <span style={{ opacity: 0.3, fontSize: 11 }}>Best: {state.bestLiftingStreak || 0}</span>
        </div>
      )}

      {/* Smart Quest Suggestions */}
      <SmartInsights
        suggestions={getQuestSuggestions(state)}
        onAddQuest={(text, category) => {
          if (onOpenCustomQuest) onOpenCustomQuest();
        }}
      />

      {/* AI Coach */}
      <AICoach state={state} />

      {/* Custom quest unlock hint */}
      {unlockedCustomCategories.length === 0 && (state.customQuests || []).length === 0 && (
        <div style={hintBox}>
          Unlock custom quest slots by maintaining a 7-day streak in any category.
        </div>
      )}
    </div>
  );
}

const addQuestBtn = {
  fontSize: 12,
  fontWeight: 700,
  color: "#7C5CFC",
  cursor: "pointer",
  padding: "4px 10px",
  borderRadius: 8,
  border: "1px solid rgba(124,92,252,0.2)",
  background: "rgba(124,92,252,0.06)",
};

const tierBadge = {
  fontSize: 9,
  fontWeight: 700,
  padding: "1px 6px",
  borderRadius: 4,
  border: "1px solid",
  marginLeft: 6,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const timeLockBox = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "10px 14px 0",
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(124,92,252,0.06)",
  border: "1px solid rgba(124,92,252,0.1)",
};

const hintBox = {
  margin: "10px 14px 0",
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.04)",
  fontSize: 11,
  opacity: 0.4,
  textAlign: "center",
  lineHeight: 1.5,
};

const swipeHintOverlay = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(90deg, rgba(239,68,68,0.25) 0%, rgba(30,30,50,0.95) 40%, rgba(30,30,50,0.95) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  zIndex: 5,
  borderRadius: 12,
  animation: "swipeHintSlide 0.3s ease",
  pointerEvents: "none",
  backdropFilter: "blur(2px)",
};

const swipeHintArrow = {
  fontSize: 18,
  fontWeight: 800,
  color: "#EF4444",
  animation: "swipeArrowBounce 0.8s ease infinite",
};

const swipeHintText = {
  fontSize: 12,
  fontWeight: 700,
  color: "#EF4444",
  letterSpacing: 0.3,
};
