import { createContext, useContext, useCallback } from "react";
import { usePomodoro } from "./usePomodoro";
import { playSound } from "../utils/audio";

const PomodoroContext = createContext(null);

const XP_PER_SESSION = 15;

export function PomodoroProvider({ minutes = 25, state, save, onWorkComplete, children }) {
  const handlePhaseComplete = useCallback(
    ({ phase, sessions }) => {
      playSound(phase === "work" ? "workComplete" : "breakComplete");

      if (phase === "work" && state && save) {
        const today = new Date().toISOString().slice(0, 10);
        const history = state.pomodoroHistory || {};
        const todayCount = (history[today] || 0) + 1;
        const newState = {
          ...state,
          pomodoroHistory: { ...history, [today]: todayCount },
          totalPomodoros: (state.totalPomodoros || 0) + 1,
          xp: (state.xp || 0) + XP_PER_SESSION,
        };
        save(newState);
        onWorkComplete?.(XP_PER_SESSION);
      }
    },
    [state, save, onWorkComplete]
  );

  const pomodoro = usePomodoro(minutes, handlePhaseComplete);
  return (
    <PomodoroContext.Provider value={pomodoro}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext() {
  return useContext(PomodoroContext);
}
