import { useState, useCallback } from "react";
import { S } from "../../styles/theme";
import { getTodayStr } from "../../utils";
import { chatWithCoach } from "../../utils/ai";
import {
  EXERCISE_LIBRARY, MUSCLE_GROUPS, EQUIPMENT, WORKOUT_TEMPLATES,
  getExerciseById, getExercisesByMuscle,
} from "../../data/exerciseLibrary";

// ── Helpers ──

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function parseAIPlan(raw) {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

const MUSCLE_COLORS = {};
MUSCLE_GROUPS.forEach((m) => { MUSCLE_COLORS[m.id] = m.color; });

const DIFFICULTY_COLORS = {
  beginner: "#22C55E",
  intermediate: "#F59E0B",
  advanced: "#EF4444",
};

// ── Main Component ──

export default function DojoView({ state, onSaveWorkout }) {
  // Tab: "workout" | "library" | "programs"
  const [tab, setTab] = useState("workout");

  // Workout session state
  const [mode, setMode] = useState(null); // null | "ai" | "custom" | "template"
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(null);

  // Custom mode
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExercise, setActiveExercise] = useState(null);
  const [sets, setSets] = useState([{ weight: "", reps: "" }]);

  // AI mode active exercise tracking
  const [aiExerciseIndex, setAiExerciseIndex] = useState(0);
  const [aiSets, setAiSets] = useState([{ weight: "", reps: "" }]);

  // Template mode tracking
  const [templateExIndex, setTemplateExIndex] = useState(0);
  const [templateSets, setTemplateSets] = useState([{ weight: "", reps: "" }]);

  // Library state
  const [libraryFilter, setLibraryFilter] = useState("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);

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
    .slice(0, 7);

  // ── AI Workout Generation ──

  const generateAIWorkout = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAiPlan(null);

    const exerciseIds = EXERCISE_LIBRARY.filter((e) => e.type === "strength").map(
      (e) => `${e.id}(${e.name}/${e.muscle})`
    ).join(", ");

    const recentExercises = sortedDates
      .slice(0, 3)
      .map((d) => (workoutLogs[d] || []).map((e) => e.exercise).join(", "))
      .filter(Boolean)
      .join("; ");

    const prompt = `Generate a gym workout for today. Available exercises: ${exerciseIds}. Recent workouts: ${recentExercises || "none"}. Pick 5-6 exercises with good muscle balance, avoiding recently worked muscles. Return a JSON array of objects with: exerciseId, name, sets (number), reps (number or string like "30s"), suggestedWeight (string like "moderate" or "bodyweight"). Return ONLY valid JSON array, no markdown.`;

    try {
      const raw = await chatWithCoach(prompt, state);
      if (!raw) {
        setAiError("Could not generate workout. Check your connection and try again.");
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

  // ── Template Workout ──

  function startTemplate(template) {
    setActiveTemplate(template);
    setTemplateExIndex(0);
    setTemplateSets([{ weight: "", reps: "" }]);
    setMode("template");
  }

  // ── Set Handling ──

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

  // ── Save Functions ──

  function saveCustomExercise() {
    const validSets = sets.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
    if (validSets.length === 0 || !activeExercise) return;
    onSaveWorkout(activeExercise, validSets.map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })));
    setActiveExercise(null);
    setSets([{ weight: "", reps: "" }]);
    // Stay in custom mode so user can add more exercises
  }

  function saveAIExercise() {
    if (!aiPlan) return;
    const current = aiPlan[aiExerciseIndex];
    if (!current) return;
    const validSets = aiSets.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
    if (validSets.length === 0) return;
    onSaveWorkout(current.exerciseId, validSets.map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })));
    if (aiExerciseIndex < aiPlan.length - 1) {
      setAiExerciseIndex(aiExerciseIndex + 1);
      setAiSets([{ weight: "", reps: "" }]);
    } else {
      resetWorkout();
    }
  }

  function saveTemplateExercise() {
    if (!activeTemplate) return;
    const current = activeTemplate.exercises[templateExIndex];
    if (!current) return;
    const validSets = templateSets.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
    if (validSets.length === 0) return;
    onSaveWorkout(current.exerciseId, validSets.map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })));
    if (templateExIndex < activeTemplate.exercises.length - 1) {
      setTemplateExIndex(templateExIndex + 1);
      setTemplateSets([{ weight: "", reps: "" }]);
    } else {
      resetWorkout();
    }
  }

  function resetWorkout() {
    setMode(null);
    setAiPlan(null);
    setActiveExercise(null);
    setActiveTemplate(null);
    setSets([{ weight: "", reps: "" }]);
    setSearchQuery("");
    setAiExerciseIndex(0);
    setAiSets([{ weight: "", reps: "" }]);
    setTemplateExIndex(0);
    setTemplateSets([{ weight: "", reps: "" }]);
  }

  // ── Filter Exercises ──

  const filteredLibrary = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch = !librarySearch ||
      ex.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      ex.muscle.toLowerCase().includes(librarySearch.toLowerCase());
    const matchesFilter = libraryFilter === "all" || ex.muscle === libraryFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredCustomExercises = EXERCISE_LIBRARY.filter(
    (ex) =>
      ex.type === "strength" && (
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // ── Shared Components ──

  function MuscleTag({ muscle, small }) {
    const mg = MUSCLE_GROUPS.find((m) => m.id === muscle);
    const color = mg?.color || "#7C5CFC";
    return (
      <span style={{
        display: "inline-block",
        padding: small ? "1px 5px" : "2px 8px",
        borderRadius: 6,
        fontSize: small ? 8 : 9,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
      }}>
        {mg?.name || muscle}
      </span>
    );
  }

  function DifficultyBadge({ level }) {
    const color = DIFFICULTY_COLORS[level] || "#888";
    return (
      <span style={{
        fontSize: 8, fontWeight: 700, textTransform: "uppercase",
        color, opacity: 0.8,
      }}>
        {level}
      </span>
    );
  }

  function renderSetLogger(setsList, setFn, onSave, exerciseName, hint) {
    return (
      <div style={styles.loggerCard}>
        <div style={styles.loggerHeader}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{exerciseName}</span>
          {hint && <span style={{ fontSize: 11, opacity: 0.4 }}>{hint}</span>}
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
          <button style={S.timerBtnSec} onClick={resetWorkout}>Cancel</button>
          <button style={styles.doneBtn} onClick={onSave}>Done</button>
        </div>
      </div>
    );
  }

  // ── TAB: Workout ──

  function renderWorkoutTab() {
    return (
      <>
        {/* Start Session */}
        {!mode && todayLogs.length === 0 && (
          <div style={styles.actionSection}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, opacity: 0.5 }}>
              Start Today's Session
            </div>
            <div style={styles.actionButtons}>
              <button style={styles.aiButton} onClick={generateAIWorkout} disabled={aiLoading}>
                {aiLoading ? "Generating..." : "🤖 AI Workout"}
              </button>
              <button style={styles.customButton} onClick={() => setMode("custom")}>
                ✏️ Custom
              </button>
            </div>
            {aiError && <div style={styles.errorText}>{aiError}</div>}
          </div>
        )}

        {/* Quick Templates */}
        {!mode && (
          <div style={{ padding: "0 14px", marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, opacity: 0.6 }}>
              Quick Start Templates
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {WORKOUT_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  style={styles.templateChip}
                  onClick={() => startTemplate(t)}
                >
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 10, opacity: 0.5 }}>{t.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Loading */}
        {aiLoading && (
          <div style={styles.loadingCard}>
            <div style={styles.loadingPulse} />
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.6 }}>Generating your workout...</div>
          </div>
        )}

        {/* AI Workout Plan */}
        {mode === "ai" && aiPlan && renderPlanView(
          aiPlan, aiExerciseIndex, aiSets, setAiSets, saveAIExercise, "AI Workout Plan"
        )}

        {/* Template Workout Plan */}
        {mode === "template" && activeTemplate && renderPlanView(
          activeTemplate.exercises, templateExIndex, templateSets, setTemplateSets,
          saveTemplateExercise, activeTemplate.name
        )}

        {/* Custom Exercise Picker */}
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
              {filteredCustomExercises.map((ex) => (
                <div
                  key={ex.id}
                  style={styles.exerciseItem}
                  onClick={() => { setActiveExercise(ex.id); setSets([{ weight: "", reps: "" }]); }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</span>
                    <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                      <MuscleTag muscle={ex.muscle} small />
                      <DifficultyBadge level={ex.difficulty} />
                    </div>
                  </div>
                </div>
              ))}
              {filteredCustomExercises.length === 0 && (
                <div style={{ textAlign: "center", padding: 20, fontSize: 12, opacity: 0.3 }}>
                  No exercises found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Active Logger */}
        {mode === "custom" && activeExercise && (
          <div style={{ padding: "0 14px" }}>
            {renderSetLogger(
              sets, setSets, saveCustomExercise,
              getExerciseById(activeExercise)?.name || activeExercise
            )}
          </div>
        )}

        {/* Today's Summary */}
        {todayLogs.length > 0 && (
          <div style={{ padding: "0 14px", marginTop: mode ? 0 : 4 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, marginTop: 14, opacity: 0.6 }}>
              Today's Exercises
            </div>
            {todayLogs.map((entry, i) => {
              const exercise = getExerciseById(entry.exercise);
              const vol = (entry.sets || []).reduce((s, set) => s + set.weight * set.reps, 0);
              return (
                <div key={i} style={styles.summaryRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {exercise?.name || entry.exercise}
                    </span>
                    {exercise && <MuscleTag muscle={exercise.muscle} small />}
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

            {!mode && (
              <div style={{ ...styles.actionButtons, marginTop: 10 }}>
                <button style={styles.aiButton} onClick={generateAIWorkout} disabled={aiLoading}>
                  {aiLoading ? "..." : "🤖 AI Workout"}
                </button>
                <button style={styles.customButton} onClick={() => setMode("custom")}>
                  + Add Exercise
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recent History */}
        {sortedDates.length > 0 && (
          <div style={{ marginTop: 18, paddingBottom: 20 }}>
            <div style={S.secTitle}>Recent Workouts</div>
            <div style={{ padding: "0 14px" }}>
              {sortedDates.map((date) => {
                const entries = workoutLogs[date];
                const dayVolume = entries.reduce(
                  (sum, entry) => sum + entry.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
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
                        const exercise = getExerciseById(entry.exercise);
                        return (
                          <span key={i} style={styles.historyExercise}>
                            {exercise?.name || entry.exercise}
                            <span style={{ opacity: 0.4, marginLeft: 4 }}>{entry.sets.length}s</span>
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
      </>
    );
  }

  // ── Shared Plan View (AI or Template) ──

  function renderPlanView(exercises, currentIndex, currentSets, setCurrentSets, onSave, title) {
    return (
      <div style={styles.planSection}>
        <div style={styles.planHeader}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>{title}</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, opacity: 0.4 }}>
              {currentIndex + 1} / {exercises.length}
            </span>
            <button style={styles.backLink} onClick={resetWorkout}>Exit</button>
          </div>
        </div>

        <div style={styles.planOverview}>
          {exercises.map((ex, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const exercise = getExerciseById(ex.exerciseId);
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
                  <span style={{ fontSize: 12, fontWeight: done ? 500 : 600 }}>
                    {ex.name || exercise?.name || ex.exerciseId}
                  </span>
                  {exercise && <MuscleTag muscle={exercise.muscle} small />}
                </div>
                <span style={{ fontSize: 11, opacity: 0.4 }}>
                  {ex.sets}&times;{ex.reps}
                  {ex.rest ? ` | ${ex.rest}` : ""}
                  {ex.suggestedWeight ? ` | ${ex.suggestedWeight}` : ""}
                </span>
              </div>
            );
          })}
        </div>

        {exercises[currentIndex] && (() => {
          const current = exercises[currentIndex];
          const exercise = getExerciseById(current.exerciseId);
          const exerciseName = current.name || exercise?.name || current.exerciseId;
          const hint = current.suggestedWeight
            ? `${current.sets}×${current.reps} | ${current.suggestedWeight}`
            : `${current.sets}×${current.reps}${current.rest ? ` | Rest: ${current.rest}` : ""}`;
          return renderSetLogger(currentSets, setCurrentSets, onSave, exerciseName, hint);
        })()}
      </div>
    );
  }

  // ── TAB: Exercise Library ──

  function renderLibraryTab() {
    if (selectedExercise) {
      return renderExerciseDetail(selectedExercise);
    }

    return (
      <>
        <input
          type="text"
          placeholder="Search exercises..."
          value={librarySearch}
          onChange={(e) => setLibrarySearch(e.target.value)}
          style={{ ...styles.searchInput, margin: "8px 14px", width: "calc(100% - 28px)" }}
        />

        {/* Muscle Group Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 14px", marginBottom: 10 }}>
          <button
            style={{
              ...styles.filterChip,
              ...(libraryFilter === "all" ? styles.filterChipActive : {}),
            }}
            onClick={() => setLibraryFilter("all")}
          >
            All ({EXERCISE_LIBRARY.length})
          </button>
          {MUSCLE_GROUPS.map((mg) => {
            const count = EXERCISE_LIBRARY.filter((e) => e.muscle === mg.id).length;
            const isActive = libraryFilter === mg.id;
            return (
              <button
                key={mg.id}
                style={{
                  ...styles.filterChip,
                  ...(isActive ? {
                    background: `${mg.color}18`,
                    border: `1px solid ${mg.color}50`,
                    color: mg.color,
                  } : {}),
                }}
                onClick={() => setLibraryFilter(mg.id)}
              >
                {mg.icon} {mg.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Exercise List */}
        <div style={{ padding: "0 14px", paddingBottom: 20 }}>
          {filteredLibrary.map((ex) => (
            <div
              key={ex.id}
              style={styles.libraryItem}
              onClick={() => setSelectedExercise(ex)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{ex.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                  <MuscleTag muscle={ex.muscle} small />
                  <DifficultyBadge level={ex.difficulty} />
                  <span style={{ fontSize: 9, opacity: 0.3 }}>
                    {ex.equipment.map((e) => EQUIPMENT[e]).join(", ")}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: 16, opacity: 0.3 }}>→</span>
            </div>
          ))}
          {filteredLibrary.length === 0 && (
            <div style={{ textAlign: "center", padding: 30, fontSize: 13, opacity: 0.3 }}>
              No exercises found
            </div>
          )}
        </div>
      </>
    );
  }

  // ── Exercise Detail View ──

  function renderExerciseDetail(exercise) {
    const mg = MUSCLE_GROUPS.find((m) => m.id === exercise.muscle);
    return (
      <div style={{ padding: "0 14px", paddingBottom: 20 }}>
        <button style={styles.backLink} onClick={() => setSelectedExercise(null)}>
          ← Back to Library
        </button>

        <div style={styles.detailCard}>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 4px", letterSpacing: -0.5 }}>
            {exercise.name}
          </h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <MuscleTag muscle={exercise.muscle} />
            <DifficultyBadge level={exercise.difficulty} />
            <span style={{ fontSize: 10, opacity: 0.4, textTransform: "capitalize" }}>{exercise.type}</span>
          </div>

          {/* Equipment */}
          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>Equipment</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {exercise.equipment.map((eq) => (
                <span key={eq} style={styles.equipmentTag}>{EQUIPMENT[eq] || eq}</span>
              ))}
            </div>
          </div>

          {/* Secondary Muscles */}
          {exercise.secondary?.length > 0 && (
            <div style={styles.detailSection}>
              <div style={styles.detailLabel}>Also Works</div>
              <div style={{ display: "flex", gap: 4 }}>
                {exercise.secondary.map((m) => <MuscleTag key={m} muscle={m} small />)}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div style={styles.detailSection}>
            <div style={styles.detailLabel}>How To Perform</div>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {exercise.instructions.map((step, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4, opacity: 0.85 }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {exercise.tips && (
            <div style={{ ...styles.detailSection, ...styles.tipBox }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#22C55E", marginBottom: 4 }}>
                💡 PRO TIP
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85 }}>
                {exercise.tips}
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {exercise.commonMistakes?.length > 0 && (
            <div style={styles.detailSection}>
              <div style={styles.detailLabel}>Common Mistakes</div>
              {exercise.commonMistakes.map((mistake, i) => (
                <div key={i} style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.8, paddingLeft: 12 }}>
                  ⚠️ {mistake}
                </div>
              ))}
            </div>
          )}

          {/* Quick Log Button */}
          <button
            style={{ ...styles.aiButton, marginTop: 16, width: "100%" }}
            onClick={() => {
              setActiveExercise(exercise.id);
              setSets([{ weight: "", reps: "" }]);
              setMode("custom");
              setTab("workout");
              setSelectedExercise(null);
            }}
          >
            Log This Exercise
          </button>
        </div>
      </div>
    );
  }

  // ── TAB: Programs ──

  function renderProgramsTab() {
    return (
      <div style={{ padding: "0 14px", paddingBottom: 20 }}>
        <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 12 }}>
          Structured workout programs to follow. Pick one and stick with it for best results.
        </div>

        {WORKOUT_TEMPLATES.map((t) => {
          const exercises = t.exercises.map((e) => getExerciseById(e.exerciseId)).filter(Boolean);
          const muscleGroups = [...new Set(exercises.map((e) => e.muscle))];

          return (
            <div key={t.id} style={styles.programCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{t.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.5 }}>{t.description}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                {muscleGroups.map((m) => <MuscleTag key={m} muscle={m} small />)}
              </div>

              <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>
                {t.exercises.length} exercises
              </div>

              {t.exercises.map((ex, i) => {
                const exercise = getExerciseById(ex.exerciseId);
                return (
                  <div key={i} style={styles.programExercise}>
                    <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>
                      {exercise?.name || ex.exerciseId}
                    </span>
                    <span style={{ fontSize: 11, opacity: 0.4 }}>
                      {ex.sets}×{ex.reps} | Rest: {ex.rest}
                    </span>
                  </div>
                );
              })}

              <button
                style={{ ...styles.aiButton, marginTop: 10, width: "100%" }}
                onClick={() => { startTemplate(t); setTab("workout"); }}
              >
                Start This Workout
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Main Render ──

  return (
    <div style={S.vc}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>The Dojo</div>
        <div style={styles.headerSub}>Train hard. Log everything. Level up.</div>
        {state.liftingStreak > 0 && (
          <div style={{ fontSize: 12, marginTop: 4 }}>
            🔥 <strong>{state.liftingStreak}</strong> day lifting streak
            <span style={{ opacity: 0.3, marginLeft: 6 }}>Best: {state.bestLiftingStreak || 0}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {[
          { id: "workout", label: "Workout" },
          { id: "library", label: `Library (${EXERCISE_LIBRARY.length})` },
          { id: "programs", label: "Programs" },
        ].map((t) => (
          <button
            key={t.id}
            style={{
              ...styles.tabBtn,
              ...(tab === t.id ? styles.tabBtnActive : {}),
            }}
            onClick={() => { setTab(t.id); setSelectedExercise(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "workout" && renderWorkoutTab()}
      {tab === "library" && renderLibraryTab()}
      {tab === "programs" && renderProgramsTab()}
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
  tabBar: {
    display: "flex",
    gap: 4,
    padding: "8px 14px",
    marginBottom: 4,
  },
  tabBtn: {
    flex: 1,
    padding: "8px 4px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "transparent",
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  tabBtnActive: {
    background: "rgba(124,92,252,0.12)",
    borderColor: "rgba(124,92,252,0.3)",
    color: "#7C5CFC",
  },
  actionSection: {
    margin: "8px 14px 0",
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
    padding: "12px 16px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#7C5CFC,#6D28D9)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(124,92,252,0.25)",
  },
  customButton: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(124,92,252,0.3)",
    background: "transparent",
    color: "#7C5CFC",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  templateChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    color: "inherit",
    cursor: "pointer",
    textAlign: "left",
    width: "calc(50% - 4px)",
    boxSizing: "border-box",
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
  planSection: { margin: "12px 14px 0" },
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
  pickerSection: { margin: "12px 14px 0" },
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
    maxHeight: 300,
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  // Library styles
  filterChip: {
    padding: "5px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },
  filterChipActive: {
    background: "rgba(124,92,252,0.12)",
    border: "1px solid rgba(124,92,252,0.3)",
    color: "#7C5CFC",
  },
  libraryItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    marginBottom: 6,
    cursor: "pointer",
  },
  detailCard: {
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.4,
    marginBottom: 6,
  },
  equipmentTag: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 11,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  tipBox: {
    padding: 12,
    borderRadius: 10,
    background: "rgba(34,197,94,0.06)",
    border: "1px solid rgba(34,197,94,0.15)",
  },
  // Program styles
  programCard: {
    padding: 16,
    borderRadius: 16,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 12,
  },
  programExercise: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
};
