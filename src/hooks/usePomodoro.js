import { useState, useEffect, useRef, useCallback } from "react";

const PHASES = {
  work: { label: "Focus", next: "shortBreak" },
  shortBreak: { label: "Short Break", next: "work" },
  longBreak: { label: "Long Break", next: "work" },
};

const SHORT_BREAK_MIN = 5;
const LONG_BREAK_MIN = 15;
const SESSIONS_BEFORE_LONG_BREAK = 4;

export function usePomodoro(workMinutes = 25, onPhaseComplete) {
  const [phase, setPhase] = useState("work");
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(workMinutes * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const timerRef = useRef(null);
  const callbackRef = useRef(onPhaseComplete);

  // Keep callback ref fresh without retriggering effects
  useEffect(() => {
    callbackRef.current = onPhaseComplete;
  }, [onPhaseComplete]);

  // Phase duration helper
  const getPhaseDuration = useCallback(
    (p) => {
      if (p === "work") return workMinutes * 60;
      if (p === "longBreak") return LONG_BREAK_MIN * 60;
      return SHORT_BREAK_MIN * 60;
    },
    [workMinutes]
  );

  // When workMinutes changes and we're idle in work phase, sync the timer
  useEffect(() => {
    if (!pomodoroActive && phase === "work") {
      setPomodoroTime(workMinutes * 60);
    }
  }, [workMinutes, phase, pomodoroActive]);

  useEffect(() => {
    if (pomodoroActive && pomodoroTime > 0) {
      timerRef.current = setInterval(() => {
        setPomodoroTime((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setPomodoroActive(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [pomodoroActive]);

  function toggle() {
    if (pomodoroActive) {
      setPomodoroActive(false);
      clearInterval(timerRef.current);
    } else {
      // If at zero, advance phase before resuming
      if (pomodoroTime === 0) {
        advancePhase();
        return;
      }
      setPomodoroActive(true);
    }
  }

  function reset() {
    setPomodoroActive(false);
    clearInterval(timerRef.current);
    setPhase("work");
    setPomodoroTime(workMinutes * 60);
  }

  function advancePhase() {
    const wasWork = phase === "work";
    let newSessions = sessionsCompleted;
    if (wasWork) {
      newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      // Notify completion (for sound + history persistence)
      if (callbackRef.current) callbackRef.current({ phase: "work", sessions: newSessions });
    } else {
      if (callbackRef.current) callbackRef.current({ phase, sessions: sessionsCompleted });
    }

    // Determine next phase
    let nextPhase;
    if (wasWork) {
      nextPhase = newSessions % SESSIONS_BEFORE_LONG_BREAK === 0 ? "longBreak" : "shortBreak";
    } else {
      nextPhase = "work";
    }
    setPhase(nextPhase);
    setPomodoroTime(getPhaseDuration(nextPhase));
    setPomodoroActive(true);
  }

  function skipPhase() {
    setPomodoroActive(false);
    clearInterval(timerRef.current);
    advancePhase();
  }

  return {
    pomodoroActive,
    pomodoroTime,
    phase,
    phaseLabel: PHASES[phase].label,
    sessionsCompleted,
    toggle,
    reset,
    skipPhase,
  };
}
