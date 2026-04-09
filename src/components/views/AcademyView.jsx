import { useState, useEffect, useRef, useMemo } from "react";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { LEVELS } from "../../data";
import { getLevelIndex } from "../../utils";
import { usePremium } from "../../hooks/usePremium";
import { FEATURE_IDS } from "../../data/premium";

const SWIPE_THRESHOLD = 60;
const RATE_LIMIT_MS = 0; // No cooldown — self-paced learning
const MAX_FOCUS_SLOTS = 3;

export default function AcademyView({ state, save, onCheckStep, onUncheckStep, allCourses }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;
  const levelIdx = getLevelIndex(state.xp);
  const bossClears = state.bossClears || {};
  const { isPremium, checkFeatureAccess, setShowUpgrade } = usePremium();
  const hasAllCourses = checkFeatureAccess(FEATURE_IDS.ALL_COURSES);
  const hasUnlimitedFocus = checkFeatureAccess(FEATURE_IDS.UNLIMITED_FOCUS);

  const academyFocus = state.academyFocus || [];
  const stepCompletedAt = state.stepCompletedAt || {};

  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [filter, setFilter] = useState("focused");
  const [now, setNow] = useState(Date.now());

  // Swipe state
  const touchStartX = useRef(0);
  const touchStartKey = useRef(null);

  // Update countdown timers every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Focus management
  const focusedCount = academyFocus.length;
  const maxSlots = hasUnlimitedFocus ? Infinity : MAX_FOCUS_SLOTS;
  const slotsRemaining = hasUnlimitedFocus ? Infinity : maxSlots - focusedCount;

  function addToFocus(courseId) {
    if (academyFocus.includes(courseId)) return;
    if (!hasUnlimitedFocus && focusedCount >= maxSlots) return;
    const newFocus = [...academyFocus, courseId];
    save({ ...state, academyFocus: newFocus });
  }

  function removeFromFocus(courseId) {
    const newFocus = academyFocus.filter((id) => id !== courseId);
    save({ ...state, academyFocus: newFocus });
  }

  // Rate-limiting helper: check if a step is locked
  function getStepLockInfo(courseId, stepIdx) {
    // First step is always available
    if (stepIdx === 0) return { locked: false, remaining: 0 };

    const courseTimestamps = stepCompletedAt[courseId] || {};
    // Find the previous step's completion time
    const prevStepIdx = stepIdx - 1;
    const prevCompletedTime = courseTimestamps[prevStepIdx];

    if (!prevCompletedTime) {
      // Previous step wasn't completed — this step is available if previous step is checked
      return { locked: false, remaining: 0 };
    }

    const elapsed = now - prevCompletedTime;
    if (elapsed >= RATE_LIMIT_MS) {
      return { locked: false, remaining: 0 };
    }

    return { locked: true, remaining: RATE_LIMIT_MS - elapsed };
  }

  function formatCountdown(ms) {
    const totalMinutes = Math.ceil(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // Categorize courses
  const courseStates = allCourses.map((course) => {
    const isTier2 = !!course.tier;
    const levelLocked = levelIdx < course.levelReq;
    const tierLocked = isTier2 && !bossClears[21];
    const premiumLocked = isTier2 && !hasAllCourses;
    const locked = levelLocked || tierLocked || premiumLocked;

    const progress = state.courseProgress?.[course.id];
    const completedSteps = progress?.steps || [];
    const isCompleted = progress?.completed;
    const xpAwarded = state.courseXpAwarded?.[course.id];
    const stepCount = course.steps.length;
    const pct = Math.round((completedSteps.length / stepCount) * 100);

    const isFocused = academyFocus.includes(course.id);

    const isRecommended = !locked && !isCompleted && (
      course.category === "general" ||
      !state.focusCategories ||
      state.focusCategories.includes(course.category)
    );

    let lockReason = "";
    if (premiumLocked) lockReason = "Premium -- Upgrade to unlock";
    else if (tierLocked) lockReason = "Complete Day 21 to unlock";
    else if (levelLocked) lockReason = `Unlocks at Lv.${course.levelReq + 1} ${LEVELS[course.levelReq]?.name}`;

    return { course, locked, isCompleted, xpAwarded, completedSteps, pct, lockReason, isRecommended, premiumLocked, isFocused };
  });

  const focused = courseStates.filter((c) => c.isFocused && !c.isCompleted && !c.locked);
  const mastered = courseStates.filter((c) => c.isCompleted);
  const available = courseStates.filter((c) => !c.locked && !c.isCompleted && !c.isFocused);
  const lockedCourses = courseStates.filter((c) => c.locked);

  let filteredCourses;
  if (filter === "focused") {
    filteredCourses = [...focused, ...available, ...lockedCourses];
  } else if (filter === "mastered") {
    filteredCourses = mastered;
  } else {
    filteredCourses = [...courseStates.filter((c) => !c.isCompleted && !c.locked), ...lockedCourses];
  }

  function handleStepClick(courseId, stepIdx, isChecked, isRateLocked) {
    if (isRateLocked) return;
    if (isChecked) {
      onUncheckStep(courseId, stepIdx);
    } else {
      onCheckStep(courseId, stepIdx);
    }
  }

  function handleTouchStart(e, courseId, stepIdx, isChecked) {
    if (!isChecked) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartKey.current = `${courseId}-${stepIdx}`;
  }

  function handleTouchEnd(e, courseId, stepIdx) {
    const key = `${courseId}-${stepIdx}`;
    if (touchStartKey.current !== key) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (dx > SWIPE_THRESHOLD) {
      onUncheckStep(courseId, stepIdx);
    }
    touchStartKey.current = null;
  }

  function toggleStep(courseId, stepIdx) {
    const key = `${courseId}-${stepIdx}`;
    setExpandedStep(expandedStep === key ? null : key);
  }

  return (
    <div style={S.vc}>
      <div style={S.secTitle}>The Academy</div>
      <div style={{ padding: "0 16px", marginBottom: 14, fontSize: 12, opacity: 0.4, lineHeight: 1.5 }}>
        Focus on 2-3 courses at a time. Complete steps at your own pace.
      </div>

      {/* Focus Slot Indicator */}
      {!hasUnlimitedFocus && (
        <div style={focusSlotBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#7C5CFC" }}>Focus Slots:</span>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: MAX_FOCUS_SLOTS }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: i < focusedCount ? "#7C5CFC" : sub(0.08),
                    border: `1px solid ${i < focusedCount ? "#7C5CFC" : sub(0.12)}`,
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11, opacity: 0.5 }}>{focusedCount}/{MAX_FOCUS_SLOTS} used</span>
          </div>
          {focusedCount >= MAX_FOCUS_SLOTS && (
            <span
              style={{ fontSize: 10, color: "#FFD700", cursor: "pointer", fontWeight: 600 }}
              onClick={() => setShowUpgrade(true)}
            >
              Unlock more
            </span>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div style={filterRow}>
        {[
          { id: "focused", label: "In Focus", count: focused.length },
          { id: "all", label: "All Courses", count: courseStates.filter((c) => !c.isCompleted).length },
          { id: "mastered", label: "Mastered", count: mastered.length },
        ].map((tab) => (
          <button
            key={tab.id}
            style={{
              ...filterTab,
              background: filter === tab.id ? "rgba(124,92,252,0.15)" : "transparent",
              color: filter === tab.id ? "#7C5CFC" : colors.textSecondary,
              borderColor: filter === tab.id ? "rgba(124,92,252,0.3)" : sub(0.06),
            }}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{ ...filterCount, background: filter === tab.id ? "#7C5CFC" : sub(0.1) }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Premium upsell banner for free users */}
      {!hasAllCourses && filter !== "mastered" && (
        <div style={premiumCourseBanner} onClick={() => setShowUpgrade(true)}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>&#x1F451;</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD700" }}>Unlock Advanced Courses</div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>Premium includes Tier 2 deep-dive courses</div>
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>Upgrade</span>
        </div>
      )}

      {/* Empty state for focused tab */}
      {filter === "focused" && focused.length === 0 && available.length > 0 && (
        <div style={emptyState}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>&#x1F3AF;</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Choose courses to focus on below</div>
          <div style={{ fontSize: 11, opacity: 0.4 }}>Pick 2-3 courses to actively work through. Focus beats overwhelm.</div>
        </div>
      )}

      {/* Empty state for mastered tab */}
      {filteredCourses.length === 0 && filter === "mastered" && (
        <div style={emptyState}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>&#x1F4DA;</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No mastered courses yet</div>
          <div style={{ fontSize: 11, opacity: 0.4 }}>Complete all steps in a focused course to master it and earn +50 XP</div>
        </div>
      )}

      {filteredCourses.map(({ course, locked, isCompleted, xpAwarded, completedSteps, pct, lockReason, premiumLocked, isFocused }) => {
        const isExpanded = expandedCourse === course.id;
        const skillBadge = course.skillLevel || "beginner";
        const canExpand = isFocused || isCompleted;

        return (
          <div
            key={course.id}
            style={{
              ...S.courseCard,
              opacity: locked ? 0.4 : 1,
              cursor: locked && premiumLocked ? "pointer" : "default",
              border: isCompleted
                ? "1px solid rgba(16,185,129,0.15)"
                : isFocused
                  ? "1px solid rgba(124,92,252,0.15)"
                  : isExpanded
                    ? "1px solid rgba(124,92,252,0.08)"
                    : `1px solid ${colors.cardBorder}`,
              background: isCompleted
                ? "rgba(16,185,129,0.04)"
                : isFocused
                  ? "rgba(124,92,252,0.03)"
                  : colors.cardBg,
            }}
            onClick={locked && premiumLocked ? () => setShowUpgrade(true) : undefined}
          >
            {/* Course header */}
            <div
              style={{ ...S.courseHead, cursor: locked ? "default" : "pointer" }}
              onClick={locked ? undefined : () => {
                if (canExpand) {
                  setExpandedCourse(isExpanded ? null : course.id);
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <span style={{ fontSize: 24 }}>{course.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{course.title}</span>
                    {premiumLocked && <span style={{ fontSize: 12 }}>&#x1F512;</span>}
                    {isFocused && !isCompleted && (
                      <span style={focusBadge}>IN FOCUS</span>
                    )}
                    {isCompleted && (
                      <span style={masteredBadge}>MASTERED</span>
                    )}
                    <span style={{
                      ...skillBadgeStyle,
                      color: skillBadge === "advanced" ? "#F97316" : skillBadge === "intermediate" ? "#FACC15" : "#10B981",
                      borderColor: skillBadge === "advanced" ? "rgba(249,115,22,0.2)" : skillBadge === "intermediate" ? "rgba(250,204,21,0.2)" : "rgba(16,185,129,0.2)",
                      background: skillBadge === "advanced" ? "rgba(249,115,22,0.08)" : skillBadge === "intermediate" ? "rgba(250,204,21,0.08)" : "rgba(16,185,129,0.08)",
                    }}>
                      {skillBadge}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>
                    {locked
                      ? lockReason
                      : isCompleted
                        ? `Mastered -- ${course.steps.length} steps completed`
                        : isFocused
                          ? `${completedSteps.length}/${course.steps.length} steps`
                          : course.description || `${completedSteps.length}/${course.steps.length} steps`}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {xpAwarded && <span style={{ color: "#10B981", fontSize: 12, fontWeight: 700 }}>+50 XP</span>}
                {isCompleted && <span style={{ fontSize: 18 }}>&#x1F393;</span>}
                {!locked && !isCompleted && pct > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#7C5CFC" }}>{pct}%</span>
                )}
                {!locked && canExpand && (
                  <span style={{ fontSize: 12, opacity: 0.3, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>
                    &#x25BC;
                  </span>
                )}
              </div>
            </div>

            {/* Focus/Unfocus button for non-locked, non-completed courses */}
            {!locked && !isCompleted && (
              <div style={{ padding: "0 0 4px", display: "flex", gap: 8 }}>
                {isFocused ? (
                  <button
                    style={removeFocusBtn}
                    onClick={(e) => { e.stopPropagation(); removeFromFocus(course.id); }}
                  >
                    Remove from Focus
                  </button>
                ) : (
                  <button
                    style={{
                      ...addFocusBtn,
                      opacity: slotsRemaining <= 0 ? 0.4 : 1,
                      cursor: slotsRemaining <= 0 ? "default" : "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (slotsRemaining <= 0) {
                        setShowUpgrade(true);
                        return;
                      }
                      addToFocus(course.id);
                    }}
                  >
                    {slotsRemaining <= 0 && !hasUnlimitedFocus ? "Slots full" : "Add to Focus"}
                  </button>
                )}
              </div>
            )}

            {/* Progress bar */}
            {!locked && !isCompleted && completedSteps.length > 0 && (
              <div style={{ ...progressBarOuter, marginTop: 6 }}>
                <div style={{ ...progressBarInner, width: `${pct}%` }} />
              </div>
            )}

            {/* Expanded steps — only for focused or completed courses */}
            {isExpanded && canExpand && !locked && (
              <div style={{ marginTop: 12 }}>
                {course.steps.map((step, idx) => {
                  const checked = completedSteps.includes(idx);
                  const stepKey = `${course.id}-${idx}`;
                  const isStepExpanded = expandedStep === stepKey;
                  const stepObj = typeof step === "string" ? { title: step, content: step, why: null } : step;

                  // Rate-limiting
                  const { locked: isRateLocked, remaining } = checked
                    ? { locked: false, remaining: 0 }
                    : getStepLockInfo(course.id, idx);

                  // Check if previous step is completed (sequential order)
                  const prevStepDone = idx === 0 || completedSteps.includes(idx - 1);
                  const isStepAvailable = !isRateLocked && prevStepDone && !checked;

                  return (
                    <div key={idx} style={{ borderTop: `1px solid ${sub(0.03)}` }}>
                      <div
                        style={{
                          ...stepRow,
                          opacity: checked ? 0.5 : isRateLocked || !prevStepDone ? 0.4 : 1,
                        }}
                        onTouchStart={(e) => handleTouchStart(e, course.id, idx, checked)}
                        onTouchEnd={(e) => handleTouchEnd(e, course.id, idx)}
                      >
                        {/* Checkbox */}
                        <div
                          style={{
                            ...S.cb,
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            background: checked
                              ? "#10B981"
                              : isRateLocked || !prevStepDone
                                ? sub(0.03)
                                : "transparent",
                            borderColor: checked
                              ? "#10B981"
                              : isRateLocked
                                ? "rgba(255,165,0,0.3)"
                                : !prevStepDone
                                  ? sub(0.08)
                                  : sub(0.2),
                            cursor: isStepAvailable ? "pointer" : checked ? "pointer" : "default",
                            flexShrink: 0,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isRateLocked || (!prevStepDone && !checked)) return;
                            handleStepClick(course.id, idx, checked, false);
                          }}
                        >
                          {checked && <span style={{ fontSize: 10 }}>&#x2713;</span>}
                          {isRateLocked && !checked && (
                            <span style={{ fontSize: 11, color: "rgba(255,165,0,0.7)" }}>&#x1F512;</span>
                          )}
                        </div>

                        {/* Step content */}
                        <div
                          style={{ flex: 1, cursor: "pointer" }}
                          onClick={() => toggleStep(course.id, idx)}
                        >
                          <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: checked ? "line-through" : "none",
                            marginBottom: stepObj.content !== stepObj.title ? 2 : 0,
                          }}>
                            {stepObj.title}
                          </div>

                          {/* Rate-limit countdown */}
                          {isRateLocked && !checked && (
                            <div style={countdownStyle}>
                              &#x23F3; Unlocks in {formatCountdown(remaining)}
                            </div>
                          )}

                          {/* Sequential lock message */}
                          {!prevStepDone && !checked && !isRateLocked && (
                            <div style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>
                              Complete the previous step first
                            </div>
                          )}

                          {isStepExpanded && stepObj.content !== stepObj.title && (
                            <div style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.5, marginTop: 4 }}>
                              {stepObj.content}
                            </div>
                          )}
                          {isStepExpanded && stepObj.why && (
                            <div style={whyBox}>
                              <span style={{ fontWeight: 700, color: "#7C5CFC", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Why it works
                              </span>
                              <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.5, marginTop: 4 }}>
                                {stepObj.why}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expand indicator */}
                        <span style={{ fontSize: 10, opacity: 0.3, flexShrink: 0, transition: "transform 0.2s", transform: isStepExpanded ? "rotate(180deg)" : "rotate(0)" }}>
                          &#x25BC;
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Completion celebration */}
                {isCompleted && (
                  <div style={completionBox}>
                    <span style={{ fontSize: 24 }}>&#x1F393;</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>Course Mastered!</div>
                      <div style={{ fontSize: 11, opacity: 0.4 }}>
                        You've completed all steps. This knowledge is now part of your foundation.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Styles ──

const focusSlotBar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 14px",
  margin: "0 14px 12px",
  borderRadius: 10,
  background: "rgba(124,92,252,0.06)",
  border: "1px solid rgba(124,92,252,0.1)",
};

const filterRow = {
  display: "flex",
  gap: 6,
  padding: "0 14px",
  marginBottom: 14,
};

const filterTab = {
  padding: "6px 12px",
  borderRadius: 10,
  border: "1px solid",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
  transition: "all 0.2s",
};

const filterCount = {
  fontSize: 10,
  fontWeight: 800,
  color: "#fff",
  padding: "1px 6px",
  borderRadius: 8,
  minWidth: 16,
  textAlign: "center",
};

const skillBadgeStyle = {
  fontSize: 11,
  fontWeight: 700,
  padding: "1px 6px",
  borderRadius: 4,
  border: "1px solid",
  textTransform: "capitalize",
  letterSpacing: 0.3,
};

const focusBadge = {
  fontSize: 11,
  fontWeight: 800,
  padding: "2px 6px",
  borderRadius: 4,
  background: "rgba(124,92,252,0.15)",
  color: "#7C5CFC",
  border: "1px solid rgba(124,92,252,0.25)",
  letterSpacing: 0.5,
};

const masteredBadge = {
  fontSize: 11,
  fontWeight: 800,
  padding: "2px 6px",
  borderRadius: 4,
  background: "rgba(16,185,129,0.15)",
  color: "#10B981",
  border: "1px solid rgba(16,185,129,0.25)",
  letterSpacing: 0.5,
};

const addFocusBtn = {
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 8,
  background: "rgba(124,92,252,0.1)",
  color: "#7C5CFC",
  border: "1px solid rgba(124,92,252,0.2)",
  cursor: "pointer",
  transition: "all 0.2s",
};

const removeFocusBtn = {
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 8,
  background: "rgba(128,128,128,0.08)",
  color: "rgba(128,128,128,0.6)",
  border: "1px solid rgba(128,128,128,0.15)",
  cursor: "pointer",
  transition: "all 0.2s",
};

const stepRow = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  padding: "10px 0",
};

const whyBox = {
  marginTop: 8,
  padding: "8px 10px",
  borderRadius: 8,
  background: "rgba(124,92,252,0.06)",
  border: "1px solid rgba(124,92,252,0.1)",
};

const countdownStyle = {
  fontSize: 10,
  fontWeight: 600,
  color: "#FFA500",
  marginTop: 2,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const progressBarOuter = {
  height: 3,
  borderRadius: 2,
  background: "rgba(128,128,128,0.12)",
  overflow: "hidden",
};

const progressBarInner = {
  height: "100%",
  borderRadius: 2,
  background: "linear-gradient(90deg, #7C5CFC, #10B981)",
  transition: "width 0.4s ease",
};

const completionBox = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px",
  marginTop: 8,
  borderRadius: 10,
  background: "rgba(16,185,129,0.06)",
  border: "1px solid rgba(16,185,129,0.12)",
};

const emptyState = {
  textAlign: "center",
  padding: "40px 20px",
  opacity: 0.6,
};

const premiumCourseBanner = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "0 14px 12px",
  padding: "12px 14px",
  borderRadius: 12,
  background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,165,0,0.04))",
  border: "1px solid rgba(255,215,0,0.12)",
  cursor: "pointer",
};
