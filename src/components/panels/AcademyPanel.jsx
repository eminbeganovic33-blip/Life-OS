import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Lock, GraduationCap, Lightbulb, Trophy } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { COURSES } from "../../data/courses";
import { LEVELS } from "../../data/constants";
import { daysBetween } from "../../utils";
import { useToast } from "../shared/Toast";
import { feedback } from "../../utils/audio";

function getUserLevel(xp) {
  let lvl = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpReq) { lvl = i; break; }
  }
  return lvl;
}

export default function AcademyPanel({ state, save, onClose }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [justCompleted, setJustCompleted] = useState(null); // course object after final step
  const toast = useToast();

  const userLevel = getUserLevel(state.xp || 0);
  // state.currentDay is never written anywhere — always 1. Derive from
  // startDate instead so day-gated courses actually unlock over time.
  const dayNumber = state.startDate ? daysBetween(state.startDate) + 1 : 1;
  const courseProgress = state.courseProgress || {};

  const availableCourses = useMemo(() => {
    return COURSES.filter(
      (c) => userLevel >= (c.levelReq || 0) && dayNumber >= (c.dayUnlock || 1)
    );
  }, [userLevel, dayNumber]);

  const lockedCourses = useMemo(() => {
    return COURSES.filter(
      (c) => userLevel < (c.levelReq || 0) || dayNumber < (c.dayUnlock || 1)
    );
  }, [userLevel, dayNumber]);

  const completeStep = useCallback(() => {
    if (!selectedCourse) return;
    const cid = selectedCourse.id;
    // Defensive: existing entries may be missing stepsCompleted (legacy/seed data),
    // which would crash includes() below.
    const existing = courseProgress[cid] || {};
    const progress = {
      ...existing,
      stepsCompleted: Array.isArray(existing.stepsCompleted) ? [...existing.stepsCompleted] : [],
    };
    const stepIdx = activeStep;

    if (!progress.stepsCompleted.includes(stepIdx)) {
      progress.stepsCompleted = [...progress.stepsCompleted, stepIdx];
    }

    const isCourseDone = progress.stepsCompleted.length >= selectedCourse.steps.length;
    if (isCourseDone) progress.completed = true;

    const xpGain = isCourseDone && !courseProgress[cid]?.completed ? 50 : 0;

    save({
      ...state,
      xp: (state.xp || 0) + xpGain,
      lifetimeXp: (state.lifetimeXp || 0) + xpGain,
      courseProgress: { ...courseProgress, [cid]: progress },
    });

    if (activeStep < selectedCourse.steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else if (isCourseDone) {
      // First-time completion → celebrate. Re-completion → just close.
      if (xpGain > 0) {
        feedback("levelUp");
        setJustCompleted(selectedCourse);
        toast.show(`🎓 ${selectedCourse.title} complete · +${xpGain} XP`, { type: "xp", duration: 3000 });
      } else {
        setSelectedCourse(null);
        setActiveStep(0);
      }
    }
  }, [selectedCourse, activeStep, courseProgress, state, save, toast]);

  // Course-complete celebration screen
  if (justCompleted) {
    const totalSteps = justCompleted.steps.length;
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button
            onClick={() => { setJustCompleted(null); setSelectedCourse(null); setActiveStep(0); }}
            style={styles.backBtn}
            data-panel-back
            aria-label="Close"
          >
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <GraduationCap size={20} color={TOKENS.color.text} />
          <div style={styles.headerTitle}>Course Complete</div>
        </div>
        <div style={styles.completeHero}>
          <motion.div
            initial={{ scale: 0.4, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            style={styles.completeIcon}
          >
            {justCompleted.icon}
          </motion.div>
          <div style={styles.completeKicker}>COURSE COMPLETE</div>
          <div style={styles.completeTitle}>{justCompleted.title}</div>
          <div style={styles.completeBody}>
            {totalSteps} steps mastered. The work is yours now — go apply it.
          </div>
          <div style={styles.completeXpChip}>
            <Trophy size={14} color="#fff" /> +50 XP earned
          </div>
          <button
            onClick={() => { setJustCompleted(null); setSelectedCourse(null); setActiveStep(0); }}
            style={styles.completeContinue}
          >
            Back to Academy
          </button>
        </div>
      </motion.div>
    );
  }

  if (selectedCourse) {
    const step = selectedCourse.steps[activeStep];
    const progress = courseProgress[selectedCourse.id] || { stepsCompleted: [] };
    const stepDone = progress.stepsCompleted?.includes(activeStep);
    const totalSteps = selectedCourse.steps.length;
    const completedSteps = progress.stepsCompleted?.length || 0;

    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button onClick={() => { setSelectedCourse(null); setActiveStep(0); }} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={styles.courseTitle}>{selectedCourse.icon} {selectedCourse.title}</div>
            <div style={styles.stepCounter}>Step {activeStep + 1} of {totalSteps} — {completedSteps} done</div>
          </div>
        </div>

        <div style={styles.stepProgress}>
          {selectedCourse.steps.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.stepDot,
                background: progress.stepsCompleted?.includes(i)
                  ? TOKENS.color.brand
                  : i === activeStep
                  ? TOKENS.color.text
                  : TOKENS.color.border,
              }}
            />
          ))}
        </div>

        <div style={styles.stepContent}>
          <div style={styles.stepBadge}>Step {activeStep + 1}</div>
          <div style={styles.stepTitle}>{step.title}</div>
          <div style={styles.stepBody}>{step.content}</div>
          {step.why && (
            <div style={styles.whyBox}>
              <div style={styles.whyHeader}>
                <Lightbulb size={14} color={TOKENS.color.brand} />
                <div style={styles.whyLabel}>Why this matters</div>
              </div>
              <div style={styles.whyText}>{step.why}</div>
            </div>
          )}
        </div>

        <div style={styles.stepActions}>
          {activeStep > 0 && (
            <button onClick={() => setActiveStep(activeStep - 1)} style={styles.prevBtn}>
              Previous
            </button>
          )}
          <button
            onClick={completeStep}
            style={{
              ...styles.nextBtn,
              background: stepDone ? TOKENS.color.surface : TOKENS.color.text,
              color: stepDone ? TOKENS.color.textSecondary : "#fff",
            }}
          >
            {stepDone
              ? activeStep < totalSteps - 1 ? "Next" : "Done"
              : activeStep < totalSteps - 1 ? "Complete & Next" : "Finish Course"}
          </button>
        </div>
      </motion.div>
    );
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
        <GraduationCap size={20} color={TOKENS.color.text} />
        <div style={styles.headerTitle}>Academy</div>
      </div>

      <div style={styles.courseList}>
        {availableCourses.map((course) => {
          const progress = courseProgress[course.id] || { stepsCompleted: [] };
          const done = !!progress.completed;
          const stepsDone = progress.stepsCompleted?.length || 0;
          const totalSteps = course.steps.length;
          const pct = Math.round((stepsDone / totalSteps) * 100);
          const inProgress = stepsDone > 0 && !done;

          return (
            <button
              key={course.id}
              onClick={() => { setSelectedCourse(course); setActiveStep(Math.min(stepsDone, totalSteps - 1)); }}
              style={{
                ...styles.courseCard,
                background: done
                  ? "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.04) 100%)"
                  : inProgress
                    ? "linear-gradient(135deg, rgba(124,92,252,0.06) 0%, rgba(124,92,252,0.02) 100%)"
                    : TOKENS.color.surface,
                border: done
                  ? "1px solid rgba(34,197,94,0.25)"
                  : inProgress
                    ? "1px solid rgba(124,92,252,0.18)"
                    : "1px solid transparent",
              }}
            >
              <div style={{
                ...styles.courseIcon,
                background: done ? "rgba(34,197,94,0.10)" : inProgress ? "rgba(124,92,252,0.08)" : "transparent",
                borderRadius: 12,
              }}>
                {course.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.courseName}>{course.title}</div>
                <div style={styles.courseDesc}>{course.description}</div>
                {/* Step dots — always shown, conveys length + position at a glance */}
                <div style={styles.stepDotsRow}>
                  {Array.from({ length: totalSteps }).map((_, i) => {
                    const reached = i < stepsDone;
                    return (
                      <div
                        key={i}
                        style={{
                          ...styles.stepDotMini,
                          background: done
                            ? "#22C55E"
                            : reached
                              ? TOKENS.color.brand
                              : TOKENS.color.border,
                          flex: 1,
                        }}
                      />
                    );
                  })}
                </div>
                <div style={styles.courseMeta}>
                  {done ? (
                    <span style={styles.completeBadge}>
                      <Check size={11} strokeWidth={3} /> COMPLETE · +50 XP
                    </span>
                  ) : inProgress ? (
                    <span style={styles.progressMeta}>
                      <span style={{ color: TOKENS.color.brand, fontWeight: 700 }}>{pct}%</span>
                      <span style={{ color: TOKENS.color.textTertiary }}> · Step {stepsDone + 1} of {totalSteps}</span>
                    </span>
                  ) : (
                    <span style={styles.notStartedMeta}>{totalSteps} steps</span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} color={done ? "#22C55E" : inProgress ? TOKENS.color.brand : TOKENS.color.textTertiary} />
            </button>
          );
        })}

        {lockedCourses.length > 0 && (
          <>
            <div style={styles.sectionLabel}>Locked</div>
            {lockedCourses.map((course) => (
              <div key={course.id} style={{ ...styles.courseCard, opacity: 0.5, cursor: "default" }}>
                <div style={styles.courseIcon}><Lock size={18} color={TOKENS.color.textTertiary} /></div>
                <div style={{ flex: 1 }}>
                  <div style={styles.courseName}>{course.title}</div>
                  <div style={styles.courseDesc}>
                    {course.levelReq > userLevel
                      ? `Requires Level ${course.levelReq + 1}`
                      : `Unlocks on Day ${course.dayUnlock}`}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </motion.div>
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
    padding: `${TOKENS.space[5]}px ${TOKENS.space[5]}px`,
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  headerTitle: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  courseTitle: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  stepCounter: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
  },
  courseList: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
    display: "flex",
    flexDirection: "column",
    gap: TOKENS.space[3],
  },
  courseCard: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[4],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  courseIcon: {
    fontSize: 28,
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  courseName: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
    display: "flex",
    alignItems: "center",
  },
  courseDesc: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
  },
  progressBarOuter: {
    marginTop: 8,
    height: 4,
    background: TOKENS.color.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    background: TOKENS.color.brand,
    borderRadius: 2,
    transition: TOKENS.transition.default,
  },
  stepDotsRow: {
    display: "flex",
    gap: 3,
    marginTop: 10,
    marginBottom: 6,
  },
  stepDotMini: {
    height: 4,
    borderRadius: 2,
    transition: TOKENS.transition.default,
  },
  courseMeta: {
    marginTop: 4,
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
  },
  completeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    background: "rgba(34,197,94,0.12)",
    color: "#16A34A",
    borderRadius: TOKENS.radius.full,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 0.6,
  },
  progressMeta: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  notStartedMeta: {
    fontSize: 11,
    color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.medium,
  },
  completedLabel: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.success,
    fontWeight: TOKENS.font.weight.semibold,
    marginTop: 4,
  },
  completeHero: {
    flex: 1,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: `${TOKENS.space[8]}px ${TOKENS.space[5]}px`,
    textAlign: "center",
  },
  completeIcon: {
    fontSize: 88, marginBottom: TOKENS.space[5],
    filter: "drop-shadow(0 8px 24px rgba(34,197,94,0.30))",
  },
  completeKicker: {
    fontSize: 11, fontWeight: 900, color: "#16A34A",
    letterSpacing: 1.5, marginBottom: TOKENS.space[2],
  },
  completeTitle: {
    fontSize: 28, fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text, letterSpacing: -0.5,
    marginBottom: TOKENS.space[3],
  },
  completeBody: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    lineHeight: 1.6, marginBottom: TOKENS.space[5],
    maxWidth: 320,
  },
  completeXpChip: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: TOKENS.radius.full,
    background: "linear-gradient(135deg, #22C55E 0%, #10B981 100%)",
    color: "#fff", fontSize: TOKENS.font.size.sm, fontWeight: 900,
    letterSpacing: 0.4, marginBottom: TOKENS.space[6],
    boxShadow: "0 8px 24px rgba(34,197,94,0.30)",
  },
  completeContinue: {
    padding: "12px 24px", borderRadius: TOKENS.radius.full,
    background: TOKENS.color.text, color: "#fff",
    border: "none", cursor: "pointer",
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
  },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: TOKENS.space[4],
  },
  stepProgress: {
    display: "flex",
    gap: 4,
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    transition: TOKENS.transition.fast,
  },
  stepContent: {
    flex: 1,
    overflowY: "auto",
    padding: `${TOKENS.space[6]}px ${TOKENS.space[5]}px`,
  },
  stepBadge: {
    display: "inline-block",
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.brand,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: TOKENS.space[2],
  },
  stepTitle: {
    fontSize: TOKENS.font.size.xl,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
    lineHeight: 1.3,
    marginBottom: TOKENS.space[5],
  },
  stepBody: {
    fontSize: TOKENS.font.size.md,
    lineHeight: 1.7,
    color: TOKENS.color.textSecondary,
    marginBottom: TOKENS.space[6],
  },
  whyBox: {
    padding: TOKENS.space[5],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    borderLeft: `3px solid ${TOKENS.color.brand}`,
  },
  whyHeader: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[2],
    marginBottom: TOKENS.space[2],
  },
  whyLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.brand,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  whyText: {
    fontSize: TOKENS.font.size.sm,
    lineHeight: 1.6,
    color: TOKENS.color.textSecondary,
  },
  stepActions: {
    display: "flex",
    gap: TOKENS.space[3],
    padding: TOKENS.space[5],
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: TOKENS.color.border,
  },
  prevBtn: {
    padding: "14px 20px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    background: TOKENS.color.surface,
    color: TOKENS.color.textSecondary,
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer",
  },
  nextBtn: {
    flex: 1,
    padding: "14px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
};
