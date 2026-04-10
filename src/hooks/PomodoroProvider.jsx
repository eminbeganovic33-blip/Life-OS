import { createContext, useContext, useCallback } from "react";
import { usePomodoro } from "./usePomodoro";
import { playSound } from "../utils/audio";

const PomodoroContext = createContext(null);

export function PomodoroProvider({ minutes = 25, state, save, children }) {
  const handlePhaseComplete = useCallback(
    ({ phase, sessions }) => {
      // Sound feedback
      playSound(phase === "work" ? "workComplete" : "breakComplete");

      // Persist session history if a work phase just finished
      if (phase === "work" && state && save) {
        const today = new Date().toISOString().slice(0, 10);
        const history = state.pomodoroHistory || {};
        const todayCount = (history[today] || 0) + 1;
        save({
          ...state,
          pomodoroHistory: { ...history, [today]: todayCount },
          totalPomodoros: (state.totalPomodoros || 0) + 1,
        });
      }
    },
    [state, save]
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
