import { useState, useCallback } from "react";
import { S } from "../../styles/theme";
import { getTotalVolume, getTodayStr } from "../../utils";
import { chatWithCoach } from "../../utils/ai";

// ── Exercise Data ──

const EXERCISES = [
  { id: "bench", name: "Bench Press", muscle: "Chest" },
  { id: "squat", name: "Squat", muscle: "Legs" },
  { id: "deadlift", name: "Deadlift", muscle: "Back" },
  { id: "ohp", name: "Overhead Press", muscle: "Shoulders" },
  { id: "row", name: "Barbell Row", muscle: "Back" },
  { id: "pullup", name: "Pull-ups", muscle: "Back" },
  { id: "dip", name: "Dips", muscle: "Chest" },
  { id: "curl", name: "Bicep Curls", muscle: "Arms" },
  { id: "tricep", name: "Tricep Extension", muscle: "Arms" },
  { id: "lat", name: "Lat Pulldown", muscle: "Back" },
  { id: "legpress", name: "Leg Press", muscle: "Legs" },
  { id: "lunge", name: "Lunges", muscle: "Legs" },
  { id: "plank", name: "Plank", muscle: "Core" },
  { id: "crunch", name: "Crunches", muscle: "Core" },
  { id: "calf", name: "Calf Raises", muscle: "Legs" },
];

const MUSCLE_COLORS = {
  Chest: "#F97316",
  Legs: "#22C55E",
  Back: "#3B82F6",
  Shoulders: "#A855F7",
  Arms: "#EC4899",
  Core: "#FACC15",
};

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getCycleDay(lastLiftDate) {
  if (!lastLiftDate) return 1;
  const last = new Date(lastLiftDate + "T00:00:00");
  const now = new Date(getTodayStr() + "T00:00:00");
  const diff = Math.floor((now - last) / 86400000);
  // 3 gym days, 1 rest day cycle
  return ((diff) % 4) + 1;
}

function parseAIPlan(raw) {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ── Main Component ──

export default function DojoView({ state, onSaveWorkout }) {
  const [mode, setMode] = useState(null); // null | "ai" | "custom"
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Custom mode
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExercise, setActiveExercise] = useState(null);
  const [sets, setSets] = useState([{ weight: "", reps: "" }]);

  // AI mode active exercise tracking
  const [aiExerciseIndex, setAiExerciseIndex] = useState(0);
  const [aiSets, setAiSets] = useState([{ weight: "", reps: "" }]);

  const today = getTodayStr();
  const workoutLogs = state.workoutLogs || {};
  const todayLogs = workoutLogs[today] || [];

  const todayVolume = todayLogs.reduce((sum, entry) => {
    const vol = (entry.sets || []).reduce((s, set) => s + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0);
    return sum + vol;
  }, 0);

  const sortedDates = Object.keys(workoutLogs)
    .sort((a, b) => b.localeCompare(a))
    .filter((d) => d !== today)
    .slice(0, 5);

  // ── AI Workout Generation ──

  const generateAIWorkout = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAiPlan(null);

    const cycleDay = getCycleDay(state.lastLiftDate);
    const isRestDay = cycleDay === 4;

    const recentExercises = sortedDates
      .slice(0, 3)
      .map((d) => (workoutLogs[d] || []).map((e) => e.exercise).join(", "))
      .filter(Boolean)
      .join("; ");

    const prompt = isRestDay
      ? `Today is a rest day in my 3-on/1-off gym cycle. Suggest a light active recovery session with 3 mobility or light exercises. Return a JSON array of objects with: exerciseId (from this list: ${EXERCISES.map((e) => e.id).join(",")}), name, sets (number), reps (number or string like "30s" for plank), suggestedWeight (string like "bodyweight" or "light"). Return ONLY valid JSON array, no markdown.`
      : `Generate a gym workout for day ${cycleDay} of a 3-gym/1-rest cycle. Available exercises: ${EXERCISES.map((e) => `${e.id}(${e.name}/${e.muscle})`).join(", ")}. Recent workouts: ${recentExercises || "none"}. Pick 4-5 exercises that make sense for this day (vary muscle groups across the cycle). Return a JSON array of objects with: exerciseId, name, sets (number), reps (number), suggestedWeight (string guidance like "moderate" or "heavy" or a kg suggestion). Return ONLY valid JSON array, no markdown.`;

    try {
      const raw = await chatWithCoach(prompt, state);
      if (!raw) {
        setAiError("Could not generate workout. Try again.");
        setAiLoading(false);
        return;
      }
      const plan = parseAIPlan(raw);
      if (!plan || !Array.isArray(plan)) {
        setAiError("Invalid response from AI. Try again.");
        setAiLoading(false);
        return;
      }
      setAiPlan(plan);
      setAiExerciseIndex(0);
      setAiSets([{ weight: "", reps: "" }]);
      setMode("ai");
    } catch {
      setAiError("Network error. Check your connection.");
    }
    setAiLoading(false);
  }, [state, sortedDates, workoutLogs]);

  // ── Set Handling (shared) ──

  function handleSetChange(setsList, setFn, index, field, value) {
    const updated = setsList.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    setFn(updated);
  }

  function handleAddSet(setsList, setFn) {
    setFn([...setsList, { weight: "", reps: "" }]);
  }

  function handleRemoveSet(setsList, setFn, index) {
    if (setsList.length <= 1) return;
    setFn(setsList.filter((_, i) => i !== index));
  }

  // ── Save Exercise (Custom) ──

  function saveCustomExercise() {
    const validSets = sets.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
    if (validSets.length === 0 || !activeExercise) return;
    onSaveWorkout(activeExercise, validSets.map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })));
    setActiveExercise(null);
    setSets([{ weight: "", reps: "" }]);
  }

  // ── Save Exercise (AI Plan) ──

  function saveAIExercise() {
    if (!aiPlan) return;
    const current = aiPlan[aiExerciseIndex];
    if (!current) return;
    const validSets = aiSets.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
    if (validSets.length === 0) return;
    onSaveWorkout(current.exerciseId, validSets.map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })));

    // Move to next exercise or finish
    if (aiExerciseIndex < aiPlan.length - 1) {
      setAiExerciseIndex(aiExerciseIndex + 1);
      setAiSets([{ weight: "", reps: "" }]);
    } else {
      // Workout complete
      setAiPlan(null);
      setMode(null);
      setAiExerciseIndex(0);
      setAiSets([{ weight: "", reps: "" }]);
    }
  }

  function resetWorkout() {
    setMode(null);
    setAiPlan(null);
    setActiveExercise(null);
    setSets([{ weight: "", reps: "" }]);
    setSearchQuery("");
    setAiExerciseIndex(0);
    setAiSets([{ weight: "", reps: "" }]);
  }

  // ── Filter Exercises ──

  const filteredExercises = EXERCISES.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Inline Set Logger ──

  function renderSetLogger(setsList, setFn, onSave, exerciseName) {
    return (
      <div style={styles.loggerCard}>
        <div style={styles.loggerHeader}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{exerciseName}</span>
        </div>

        {setsList.map((set, i) => (
          <div key={i} style={styles.setRow}>
            <div style={styles.setLabel}>Set {i + 1}</div>
            <input
              type="number"
              placeholder="kg"
              value={set.weight}
              onChange={(e) => handleSetChange(setsList, setFn, i, "weight", e.target.value)}
              style={S.setInput}
            />
            <span style={{ opacity: 0.3, fontSize: 12 }}>&times;</span>
            <input
              type="number"
              placeholder="reps"
              value={set.reps}
              onChange={(e) => handleSetChange(setsList, setFn, i, "reps", e.target.value)}
              style={S.setInput}
            />
            {setsList.length > 1 && (
              <button style={styles.removeSetBtn} onClick={() => handleRemoveSet(setsList, setFn, i)}>
                &times;
              </button>
            )}
          </div>
        ))}

        <button style={styles.addSetLink} onClick={() => handleAddSet(setsList, setFn)}>
          + Add Set
        </button>

        <div style={styles.loggerActions}>
          <button style={S.timerBtnSec} onClick={resetWorkout}>
            Cancel
          </button>
          <button style={styles.doneBtn} onClick={onSave}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Muscle Tag ──

  function MuscleTag({ muscle }) {
    const color = MUSCLE_COLORS[muscle] || "#7C5CFC";
    return (
      <span
        style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: 6,
          fontSize: 9,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color,
          background: `${color}18`,
          border: `1px solid ${color}30`,
        }}
      >
        {muscle}
      </span>
    );
  }

  // ── Render ──

  return (
    <div style={S.vc}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>The Dojo</div>
        <div style={styles.headerSub}>Train hard. Log everything. Level up.</div>
      </div>

      {/* Today's Session */}
      {!mode && todayLogs.length === 0 && (
        <div style={styles.actionSection}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, opacity: 0.5 }}>
            Start Today's Session
          </div>
          <div style={styles.actionButtons}>
            <button
              style={styles.aiButton}
              onClick={generateAIWorkout}
              disabled={aiLoading}
            >
              {aiLoading ? "Generating..." : "AI Workout"}
            </button>
            <button
              style={styles.customButton}
              onClick={() => setMode("custom")}
            >
              Custom Workout
            </button>
          </div>
          {aiError && (
            <div style={styles.errorText}>{aiError}</div>
          )}
        </div>
      )}

      {/* AI Loading State */}
      {aiLoading && (
        <div style={styles.loadingCard}>
          <div style={styles.loadingPulse} />
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.6 }}>Generating your workout...</div>
        </div>
      )}

      {/* AI Workout Plan - Active */}
      {mode === "ai" && aiPlan && (
        <div style={styles.planSection}>
          <div style={styles.planHeader}>
            <span style={{ fontSize: 13, fontWeight: 800 }}>AI Workout Plan</span>
            <span style={{ fontSize: 11, opacity: 0.4 }}>
              {aiExerciseIndex + 1} / {aiPlan.length}
            </span>
          </div>

          {/* Plan overview */}
          <div style={styles.planOverview}>
            {aiPlan.map((ex, i) => {
              const done = i < aiExerciseIndex;
              const active = i === aiExerciseIndex;
              const exercise = EXERCISES.find((e) => e.id === ex.exerciseId);
              return (
                <div
                  key={i}
                  style={{
                    ...styles.planItem,
                    opacity: done ? 0.4 : 1,
                    borderLeft: active ? "3px solid #7C5CFC" : "3px solid transparent",
                    background: active ? "rgba(124,92,252,0.06)" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    {done && <span style={{ fontSize: 12, color: "#22C55E" }}>&#10003;</span>}
                    <span style={{ fontSize: 12, fontWeight: done ? 500 : 600 }}>{ex.name}</span>
                    {exercise && <MuscleTag muscle={exercise.muscle} />}
                  </div>
                  <span style={{ fontSize: 11, opacity: 0.4 }}>
                    {ex.sets}&times;{ex.reps}
                    {ex.suggestedWeight ? ` | ${ex.suggestedWeight}` : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active exercise logger */}
          {aiPlan[aiExerciseIndex] &&
            renderSetLogger(
              aiSets,
              setAiSets,
              saveAIExercise,
              aiPlan[aiExerciseIndex].name
            )}
        </div>
      )}

      {/* Custom Workout - Exercise Picker */}
      {mode === "custom" && !activeExercise && (
        <div style={styles.pickerSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800 }}>Choose Exercise</span>
            <button style={styles.backLink} onClick={resetWorkout}>Back</button>
          </div>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.exerciseList}>
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                style={styles.exerciseItem}
                onClick={() => {
                  setActiveExercise(ex.id);
                  setSets([{ weight: "", reps: "" }]);
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{ex.name}</span>
                <MuscleTag muscle={ex.muscle} />
              </div>
            ))}
            {filteredExercises.length === 0 && (
              <div style={{ textAlign: "center", padding: 20, fontSize: 12, opacity: 0.3 }}>
                No exercises found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Workout - Active Exercise Logger */}
      {mode === "custom" && activeExercise && (
        <div style={{ padding: "0 14px" }}>
          {renderSetLogger(
            sets,
            setSets,
            saveCustomExercise,
            EXERCISES.find((e) => e.id === activeExercise)?.name || activeExercise
          )}
          {/* Quick pick another after saving */}
        </div>
      )}

      {/* Workout Summary - Today's logged exercises */}
      {todayLogs.length > 0 && (
        <div style={{ padding: "0 14px", marginTop: mode ? 0 : 4 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, marginTop: 14, opacity: 0.6 }}>
            Today's Exercises
          </div>
          {todayLogs.map((entry, i) => {
            const exercise = EXERCISES.find((e) => e.id === entry.exercise);
            const vol = (entry.sets || []).reduce((s, set) => s + set.weight * set.reps, 0);
            return (
              <div key={i} style={styles.summaryRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {exercise?.name || entry.exercise}
                  </span>
                  {exercise && <MuscleTag muscle={exercise.muscle} />}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, opacity: 0.5 }}>
                    {entry.sets.length}&times;{entry.sets.map((s) => s.reps).join("/")}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7C5CFC" }}>
                    {vol.toLocaleString()} kg
                  </div>
                </div>
              </div>
            );
          })}
          <div style={styles.totalRow}>
            <span style={{ opacity: 0.5, fontSize: 12 }}>Total Volume</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: "#7C5CFC" }}>
              {todayVolume.toLocaleString()} kg
            </span>
          </div>

          {/* Continue workout buttons when logs exist but workout not active */}
          {!mode && (
            <div style={{ ...styles.actionButtons, marginTop: 10 }}>
              <button style={styles.aiButton} onClick={generateAIWorkout} disabled={aiLoading}>
                {aiLoading ? "Generating..." : "AI Workout"}
              </button>
              <button style={styles.customButton} onClick={() => setMode("custom")}>
                Add Exercise
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Workouts */}
      {sortedDates.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={S.secTitle}>Recent Workouts</div>
          <div style={{ padding: "0 14px" }}>
            {sortedDates.map((date) => {
              const entries = workoutLogs[date];
              const dayVolume = entries.reduce(
                (sum, entry) => sum + entry.sets.reduce((s, set) => s + set.weight * set.reps, 0),
                0
              );
              return (
                <div key={date} style={styles.historyDay}>
                  <div style={styles.historyHeader}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{formatDate(date)}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#7C5CFC" }}>
                      {dayVolume.toLocaleString()} kg
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {entries.map((entry, i) => {
                      const exercise = EXERCISES.find((e) => e.id === entry.exercise);
                      return (
                        <span key={i} style={styles.historyExercise}>
                          {exercise?.name || entry.exercise}
                          <span style={{ opacity: 0.4, marginLeft: 4 }}>
                            {entry.sets.length}s
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ──

const styles = {
  header: {
    textAlign: "center",
    padding: "18px 14px 6px",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: -0.5,
    background: "linear-gradient(135deg,#7C5CFC,#F97316)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  headerSub: {
    fontSize: 12,
    opacity: 0.35,
    marginTop: 2,
  },
  actionSection: {
    margin: "16px 14px 0",
    padding: 20,
    borderRadius: 16,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    textAlign: "center",
  },
  actionButtons: {
    display: "flex",
    gap: 10,
  },
  aiButton: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#7C5CFC,#6D28D9)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(124,92,252,0.25)",
  },
  customButton: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(124,92,252,0.3)",
    background: "transparent",
    color: "#7C5CFC",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  errorText: {
    marginTop: 10,
    fontSize: 11,
    color: "#EF4444",
    opacity: 0.8,
  },
  loadingCard: {
    margin: "16px 14px 0",
    padding: 28,
    borderRadius: 16,
    background: "rgba(124,92,252,0.04)",
    border: "1px solid rgba(124,92,252,0.1)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  loadingPulse: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "3px solid rgba(124,92,252,0.15)",
    borderTopColor: "#7C5CFC",
    animation: "spin 0.8s linear infinite",
  },
  planSection: {
    margin: "12px 14px 0",
  },
  planHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  planOverview: {
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    overflow: "hidden",
    marginBottom: 10,
  },
  planItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  pickerSection: {
    margin: "12px 14px 0",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#7C5CFC",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: "4px 8px",
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#E2E2EE",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    marginBottom: 8,
  },
  exerciseList: {
    maxHeight: 280,
    overflowY: "auto",
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  exerciseItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    cursor: "pointer",
  },
  loggerCard: {
    padding: 16,
    borderRadius: 14,
    background: "rgba(124,92,252,0.04)",
    border: "1px solid rgba(124,92,252,0.12)",
    marginTop: 8,
  },
  loggerHeader: {
    marginBottom: 12,
  },
  setRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  setLabel: {
    fontSize: 11,
    fontWeight: 700,
    opacity: 0.4,
    minWidth: 36,
  },
  removeSetBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: "1px solid rgba(239,68,68,0.2)",
    background: "rgba(239,68,68,0.06)",
    color: "#EF4444",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  addSetLink: {
    background: "none",
    border: "none",
    color: "rgba(124,92,252,0.6)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: "6px 0",
    display: "block",
  },
  loggerActions: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },
  doneBtn: {
    flex: 1,
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#22C55E,#16A34A)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(34,197,94,0.2)",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.04)",
    marginBottom: 6,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 8,
    background: "rgba(124,92,252,0.06)",
    border: "1px solid rgba(124,92,252,0.1)",
    marginBottom: 4,
  },
  historyDay: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyExercise: {
    fontSize: 11,
    fontWeight: 500,
    padding: "3px 8px",
    borderRadius: 6,
    background: "rgba(255,255,255,0.04)",
  },
};
