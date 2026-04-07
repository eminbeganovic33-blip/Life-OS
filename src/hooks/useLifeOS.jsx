import { createContext, useContext } from "react";

// LifeOS context — provides state + all domain actions to child components
// Eliminates prop drilling through LifeOSInner (was 25+ props)

const LifeOSContext = createContext(null);

export function LifeOSProvider({ value, children }) {
  return (
    <LifeOSContext.Provider value={value}>
      {children}
    </LifeOSContext.Provider>
  );
}

export function useLifeOS() {
  const ctx = useContext(LifeOSContext);
  if (!ctx) {
    throw new Error("useLifeOS must be used within a LifeOSProvider");
  }
  return ctx;
}

// Domain-specific hooks for cleaner imports in views
export function useQuests() {
  const { state, checkQuest, uncheckQuest, completeDay, canCompleteDay, removeCustomQuest } = useLifeOS();
  return { state, checkQuest, uncheckQuest, completeDay, canCompleteDay, removeCustomQuest };
}

export function useWorkout() {
  const { state, doSaveWorkout, updateWorkoutEntry, deleteWorkoutEntry } = useLifeOS();
  return { state, doSaveWorkout, updateWorkoutEntry, deleteWorkoutEntry };
}

export function useForge() {
  const { state, save, startSobriety, triggerRelapse } = useLifeOS();
  return { state, save, startSobriety, triggerRelapse };
}

export function useJournal() {
  const { state, journalText, setJournalText, selectedMood, setSelectedMood, saveJournal } = useLifeOS();
  return { state, journalText, setJournalText, selectedMood, setSelectedMood, saveJournal };
}
