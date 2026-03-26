import { useState, useRef } from "react";
import { S } from "../../styles/theme";
import { LEVELS } from "../../data";
import { getLevelIndex } from "../../utils";
import { usePremium } from "../../hooks/usePremium";
import { FEATURE_IDS } from "../../data/premium";

const SWIPE_THRESHOLD = 60;

export default function AcademyView({ state, onCheckStep, onUncheckStep, allCourses }) {
  const levelIdx = getLevelIndex(state.xp);
  const bossClears = state.bossClears || {};
  const { isPremium, checkFeatureAccess, setShowUpgrade } = usePremium();
  const hasAllCourses = checkFeatureAccess(FEATURE_IDS.ALL_COURSES);

  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null); // "courseId-stepIdx"
  const [filter, setFilter] = useState("recommended"); // "recommended", "all", "completed"

  // Swipe state
  const touchStartX = useRef(0);
  const touchStartKey = useRef(null);

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

    // Is this recommended based on user's focus categories?
    const isRecommended = !locked && !isCompleted && (
      course.category === "general" ||
      !state.focusCategories ||
      state.focusCategories.includes(course.category)
    );

    let lockReason = "";
    if (premiumLocked) lockReason = "Premium · Upgrade to unlock";
    else if (tierLocked) lockReason = "Complete Day 21 to unlock";
    else if (levelLocked) lockReason = `Unlocks at Lv.${course.levelReq + 1} ${LEVELS[course.levelReq]?.name}`;

    return { course, locked, isCompleted, xpAwarded, completedSteps, pct, lockReason, isRecommended, premiumLocked };
  });

  const recommended = courseStates.filter((c) => c.isRecommended);
  const completed = courseStates.filter((c) => c.isCompleted);
  const inProgress = courseStates.filter((c) => !c.locked && !c.isCompleted && c.completedSteps.length > 0);

  let filteredCourses;
  if (filter === "recommended") {
    // Show in-progress first, then recommended, then locked
    filteredCourses = [
      ...inProgress.filter((c) => c.isRecommended),
      ...recommended.filter((c) => c.completedSteps.length === 0),
      ...courseStates.filter((c) => c.locked),
    ];
  } else if (filter === "completed") {
    filteredCourses = completed;
  } else {
    filteredCourses = courseStates.filter((c) => !c.isCompleted);
  }

  function handleStepClick(courseId, stepIdx, isChecked) {
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
        Learn the science behind every quest. Complete courses for +50 XP.
      </div>

      {/* Filter tabs */}
      <div style={filterRow}>
        {[
          { id: "recommended", label: "For You", count: recommended.length },
          { id: "all", label: "All Courses", count: courseStates.filter((c) => !c.isCompleted).length },
          { id: "completed", label: "Completed", count: completed.length },
        ].map((tab) => (
          <button
            key={tab.id}
            style={{
              ...filterTab,
              background: filter === tab.id ? "rgba(124,92,252,0.15)" : "transparent",
              color: filter === tab.id ? "#7C5CFC" : "rgba(255,255,255,0.4)",
              borderColor: filter === tab.id ? "rgba(124,92,252,0.3)" : "rgba(255,255,255,0.06)",
            }}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{ ...filterCount, background: filter === tab.id ? "#7C5CFC" : "rgba(255,255,255,0.1)" }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Premium upsell banner for free users */}
      {!hasAllCourses && filter !== "completed" && (
        <div style={premiumCourseBanner} onClick={() => setShowUpgrade(true)}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>👑</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD700" }}>Unlock Advanced Courses</div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>Premium includes Tier 2 deep-dive courses</div>
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>Upgrade</span>
        </div>
      )}

      {/* Empty state */}
      {filteredCourses.length === 0 && filter === "completed" && (
        <div style={emptyState}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No completed courses yet</div>
          <div style={{ fontSize: 11, opacity: 0.4 }}>Start a course and complete all steps to earn +50 XP</div>
        </div>
      )}

      {filteredCourses.map(({ course, locked, isCompleted, xpAwarded, completedSteps, pct, lockReason, premiumLocked }) => {
        const isExpanded = expandedCourse === course.id;
        const skillBadge = course.skillLevel || "beginner";

        return (
          <div
            key={course.id}
            style={{
              ...S.courseCard,
              opacity: locked ? 0.4 : 1,
              cursor: locked && premiumLocked ? "pointer" : "default",
              border: isCompleted
                ? "1px solid rgba(16,185,129,0.15)"
                : isExpanded
                  ? "1px solid rgba(124,92,252,0.15)"
                  : "1px solid rgba(255,255,255,0.04)",
              background: isCompleted
                ? "rgba(16,185,129,0.04)"
                : "rgba(255,255,255,0.025)",
            }}
            onClick={locked && premiumLocked ? () => setShowUpgrade(true) : undefined}
          >
            {/* Course header */}
            <div
              style={{ ...S.courseHead, cursor: locked ? "default" : "pointer" }}
              onClick={locked ? undefined : () => setExpandedCourse(isExpanded ? null : course.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <span style={{ fontSize: 24 }}>{course.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{course.title}</span>
                    {premiumLocked && <span style={{ fontSize: 12 }}>🔒</span>}
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
                        ? "Mastered ✓"
                        : course.description || `${completedSteps.length}/${course.steps.length} steps`}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {xpAwarded && <span style={{ color: "#10B981", fontSize: 12, fontWeight: 700 }}>+50 XP</span>}
                {isCompleted && <span style={{ fontSize: 18 }}>🎓</span>}
                {!locked && !isCompleted && pct > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#7C5CFC" }}>{pct}%</span>
                )}
                {!locked && (
                  <span style={{ fontSize: 12, opacity: 0.3, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {!locked && !isCompleted && completedSteps.length > 0 && (
              <div style={{ ...progressBarOuter, marginTop: 10 }}>
                <div style={{ ...progressBarInner, width: `${pct}%` }} />
              </div>
            )}

            {/* Expanded steps */}
            {isExpanded && !locked && (
              <div style={{ marginTop: 12 }}>
                {course.steps.map((step, idx) => {
                  const checked = completedSteps.includes(idx);
                  const stepKey = `${course.id}-${idx}`;
                  const isStepExpanded = expandedStep === stepKey;
                  const stepObj = typeof step === "string" ? { title: step, content: step, why: null } : step;

                  return (
                    <div key={idx} style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                      <div
                        style={{
                          ...stepRow,
                          opacity: checked ? 0.5 : 1,
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
                            background: checked ? "#10B981" : "transparent",
                            borderColor: checked ? "#10B981" : "rgba(255,255,255,0.15)",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepClick(course.id, idx, checked);
                          }}
                        >
                          {checked && <span style={{ fontSize: 10 }}>✓</span>}
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
                          ▼
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Completion celebration */}
                {isCompleted && (
                  <div style={completionBox}>
                    <span style={{ fontSize: 24 }}>🎓</span>
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
  fontSize: 9,
  fontWeight: 700,
  padding: "1px 6px",
  borderRadius: 4,
  border: "1px solid",
  textTransform: "capitalize",
  letterSpacing: 0.3,
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

const progressBarOuter = {
  height: 3,
  borderRadius: 2,
  background: "rgba(255,255,255,0.05)",
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
