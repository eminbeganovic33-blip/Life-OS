import { useState, useEffect, useRef } from "react";

export function usePomodoro(defaultMinutes = 25) {
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(defaultMinutes * 60);
  const timerRef = useRef(null);

  useEffect(() => {
    if (pomodoroActive && pomodoroTime > 0) {
      timerRef.current = setInterval(() => {
        setPomodoroTime((t) => {
          if (t <= 1) {
            setPomodoroActive(false);
            clearInterval(timerRef.current);
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
      if (pomodoroTime === 0) setPomodoroTime(defaultMinutes * 60);
      setPomodoroActive(true);
    }
  }

  function reset() {
    setPomodoroActive(false);
    clearInterval(timerRef.current);
    setPomodoroTime(defaultMinutes * 60);
  }

  return { pomodoroActive, pomodoroTime, toggle, reset };
}
