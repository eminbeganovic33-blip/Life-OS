import { createContext, useContext } from "react";
import { usePomodoro } from "./usePomodoro";

const PomodoroContext = createContext(null);

export function PomodoroProvider({ minutes = 25, children }) {
  const pomodoro = usePomodoro(minutes);
  return (
    <PomodoroContext.Provider value={pomodoro}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext() {
  return useContext(PomodoroContext);
}
