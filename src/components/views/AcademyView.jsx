import { useState, useRef, useCallback } from "react";
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

  // Swipe-to-uncheck state
  const [swipeHint, setSwipeHint] = useState(null); // "courseId-stepIdx" showing hint
  const swipeHintTimer = useRef(null);
  const touchStartX = useRef(0);
  const touchStartKey = useRef(null);

  const showSwipeHint = useCallback((key) => {
    if (swipeHintTimer.current) clearTimeout(swipeHintTimer.current);
    setSwipeHint(key);
    swipeHintTimer.current = setTimeout(() => setSwipeHint(null), 2000);
  }, []);

  function handleStepClick(courseId, stepIdx, isChecked) {
    if (isChecked) {
      showSwipeHint(`${courseId}-${stepIdx}`);
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
      setSwipeHint(null);
      onUncheckStep(courseId, stepIdx);
    }
    touchStartKey.current = null;
  }

  return (
    <div style={S.vc}>
      <div style={S.secTitle}>The Academy</div>
      <div style={{ padding: "0 16px", marginBottom: 12, fontSize: 12, opacity: 0.4 }}>
        Learn the science behind every quest. Complete courses for +50 XP.
      </div>
      {/* Premium upsell banner for free users */}
      {!hasAllCourses && (
        <div
          style={premiumCourseBanner}
          onClick={() => setShowUpgrade(true)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>👑</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD700" }}>Unlock All Courses</div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>Premium includes Tier 2 advanced courses</div>
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>Upgrade</span>
        </div>
      )}

      {allCourses.map((course) => {
        const isTier2 = !!course.tier;
        const levelLocked = levelIdx < course.levelReq;
        const tierLocked = isTier2 && !bossClears[21];
        const premiumLocked = isTier2 && !hasAllCourses;
        const locked = levelLocked || tierLocked || premiumLocked;

        const progress = state.courseProgress?.[course.id];
        const completedSteps = progress?.steps || [];
        const isDone = progress?.completed;
        const xpAwarded = state.courseXpAwarded?.[course.id];

        let lockReason = "";
        if (premiumLocked) lockReason = "Premium · Upgrade to unlock";
        else if (tierLocked) lockReason = "Unlocks after Day 21 Boss Clear";
        else if (levelLocked) lockReason = `Unlocks at Lv.${course.levelReq + 1} ${LEVELS[course.levelReq]?.name}`;

        return (
          <div key={course.id} style={{ ...S.courseCard, opacity: locked ? 0.35 : 1 }}>
            <div style={S.courseHead}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{course.icon}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{course.title}</span>
                    {premiumLocked && <span style={{ fontSize: 12 }}>🔒</span>}
                    {isTier2 && (
                      <span style={tier2Badge}>T2</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.4 }}>
                    {locked
                      ? lockReason
                      : isDone
                        ? (xpAwarded ? "Completed ✓" : "Completed")
                        : `${completedSteps.length}/${course.steps.length} steps`}
                  </div>
                </div>
              </div>
              {xpAwarded && <span style={{ color: "#10B981", fontSize: 12, fontWeight: 700 }}>+50 XP</span>}
            </div>
            {!locked && (
              <div style={{ marginTop: 10 }}>
                {course.steps.map((step, idx) => {
                  const checked = completedSteps.includes(idx);
                  const hintKey = `${course.id}-${idx}`;
                  const isShowingHint = swipeHint === hintKey;
                  return (
                    <div
                      key={idx}
                      style={{ ...S.courseStep, position: "relative", overflow: "hidden" }}
                      onClick={() => handleStepClick(course.id, idx, checked)}
                      onTouchStart={(e) => handleTouchStart(e, course.id, idx, checked)}
                      onTouchEnd={(e) => handleTouchEnd(e, course.id, idx)}
                    >
                      {isShowingHint && (
                        <div style={swipeHintOverlay}>
                          <span style={swipeHintArrow}>←</span>
                          <span style={swipeHintTextStyle}>Swipe to undo</span>
                        </div>
                      )}
                      <div
                        style={{
                          ...S.cb,
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          background: checked ? "#10B981" : "transparent",
                          borderColor: checked ? "#10B981" : "rgba(255,255,255,0.15)",
                        }}
                      >
                        {checked && <span style={{ fontSize: 10 }}>✓</span>}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          lineHeight: 1.5,
                          opacity: checked ? 0.5 : 0.8,
                          textDecoration: checked ? "line-through" : "none",
                          flex: 1,
                        }}
                      >
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const tier2Badge = {
  fontSize: 9,
  fontWeight: 800,
  padding: "1px 6px",
  borderRadius: 4,
  background: "rgba(249,115,22,0.12)",
  color: "#F97316",
  border: "1px solid rgba(249,115,22,0.2)",
  letterSpacing: 0.5,
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
  borderRadius: 8,
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

const swipeHintTextStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "#EF4444",
  letterSpacing: 0.3,
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
