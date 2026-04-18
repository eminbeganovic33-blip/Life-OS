import { useState, useCallback, useMemo } from "react";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { getTodayStr } from "../../utils";
import { chatWithCoach } from "../../utils/ai";
import { Bot, Pencil, Trash2, Flame, TrendingUp, History } from "lucide-react";
import {
  EXERCISE_LIBRARY, MUSCLE_GROUPS, WORKOUT_TEMPLATES,
  getExerciseById,
} from "../../data/exerciseLibrary";
import { MuscleTag, DifficultyBadge } from "./dojo/shared";
import ExerciseLibraryTab from "./dojo/ExerciseLibraryTab";
import ProgramsTab from "./dojo/ProgramsTab";

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

// ── Main Component ──

export default function DojoView({ state, onSaveWorkout, onUpdateEntry, onDeleteEntry }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;

  // Theme overrides for styles that use hardcoded rgba(255,255,255,...)
  const ds = useMemo(() => {
    if (isDark) return styles; // dark mode is the default, no overrides needed
    return {
      ...styles,
      tabBtn: { ...styles.tabBtn, border: `1px solid ${colors.cardBorder}`, color: colors.textSecondary },
      actionSection: { ...styles.actionSection, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      templateChip: { ...styles.templateChip, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg },
      planOverview: { ...styles.planOverview, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      planItem: { ...styles.planItem, borderBottom: `1px solid ${colors.cardBorder}` },
      searchInput: { ...styles.searchInput, border: `1px solid ${colors.inputBorder}`, background: colors.inputBg, color: colors.text },
      exerciseList: { ...styles.exerciseList, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      exerciseItem: { ...styles.exerciseItem, borderBottom: `1px solid ${colors.cardBorder}` },
      summaryRow: { ...styles.summaryRow, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      historyDay: { ...styles.historyDay, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      historyExercise: { ...styles.historyExercise, background: `rgba(0,0,0,0.04)` },
      filterChip: { ...styles.filterChip, border: `1px solid ${colors.cardBorder}`, color: colors.textSecondary },
      libraryItem: { ...styles.libraryItem, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      detailCard: { ...styles.detailCard, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      equipmentTag: { ...styles.equipmentTag, background: `rgba(0,0,0,0.04)`, border: `1px solid ${colors.cardBorder}` },
      programCard: { ...styles.programCard, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` },
      programExercise: { ...styles.programExercise, borderBottom: `1px solid ${colors.cardBorder}` },
    };
  }, [isDark, colors]);

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

  // Edit logged exercise state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editSets, setEditSets] = useState([]);

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

  // ── Smart Workout Generator (local fallback + AI enhancement) ──

  function generateLocalWorkout() {
    // Determine recently worked muscles (last 3 sessions)
    const recentMuscles = {};
    sortedDates.slice(0, 3).forEach((d) => {
      (workoutLogs[d] || []).forEach((entry) => {
        const ex = getExerciseById(entry.exercise);
        if (ex) {
          recentMuscles[ex.muscle] = (recentMuscles[ex.muscle] || 0) + 1;
          (ex.secondary || []).forEach((s) => { recentMuscles[s] = (recentMuscles[s] || 0) + 0.5; });
        }
      });
    });

    // Pick muscle groups that haven't been worked recently — ensure variety
    const muscleOrder = ["chest", "back", "legs", "shoulders", "arms", "core"];
    const sortedMuscles = [...muscleOrder].sort((a, b) => (recentMuscles[a] || 0) - (recentMuscles[b] || 0));
    // Pick top 4 least-worked muscles but ensure at least one push, one pull, one lower
    const pushMuscles = ["chest", "shoulders"];
    const pullMuscles = ["back", "arms"];
    const lowerMuscles = ["legs", "core"];
    const targetMuscles = [];
    const addBest = (group) => {
      const best = sortedMuscles.find((m) => group.includes(m) && !targetMuscles.includes(m));
      if (best) targetMuscles.push(best);
    };
    addBest(pushMuscles);
    addBest(pullMuscles);
    addBest(lowerMuscles);
    // Fill remaining slot(s) with least-worked
    for (const m of sortedMuscles) {
      if (targetMuscles.length >= 4) break;
      if (!targetMuscles.includes(m)) targetMuscles.push(m);
    }

    // Select exercises — shuffle candidates for variety
    const strengthExercises = EXERCISE_LIBRARY.filter((e) => e.type === "strength");
    const picked = [];
    const usedIds = new Set();

    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    targetMuscles.forEach((muscle, idx) => {
      const candidates = shuffle(strengthExercises.filter((e) => e.muscle === muscle && !usedIds.has(e.id)));
      // First target gets 2 exercises, rest get 1
      const count = idx === 0 ? 2 : 1;
      // Prefer compound exercises first
      const compound = candidates.filter((e) => (e.secondary || []).length > 0);
      const isolation = candidates.filter((e) => (e.secondary || []).length === 0);
      const picks = [...compound, ...isolation].slice(0, count);
      picks.forEach((e) => { picked.push(e); usedIds.add(e.id); });
    });

    // Fill to 5-6 exercises from remaining muscles
    if (picked.length < 5) {
      const extras = shuffle(strengthExercises.filter((e) => !usedIds.has(e.id)));
      extras.sort((a, b) => (recentMuscles[a.muscle] || 0) - (recentMuscles[b.muscle] || 0));
      for (const e of extras) {
        if (picked.length >= 6) break;
        // Don't double up on an already-heavy muscle
        const muscleCount = picked.filter((p) => p.muscle === e.muscle).length;
        if (muscleCount < 2) {
          picked.push(e);
          usedIds.add(e.id);
        }
      }
    }

    return picked.slice(0, 6).map((e) => ({
      exerciseId: e.id,
      name: e.name,
      sets: e.difficulty === "advanced" ? 4 : 3,
      reps: e.muscle === "core" ? "30s" : e.difficulty === "advanced" ? "6-8" : "8-12",
      suggestedWeight: e.equipment.includes("none") ? "bodyweight" : "moderate",
    }));
  }

  const generateAIWorkout = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAiPlan(null);

    // Always generate a local plan as fallback
    const localPlan = generateLocalWorkout();

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
      if (raw) {
        const plan = parseAIPlan(raw);
        if (plan && Array.isArray(plan) && plan.length > 0) {
          // Validate exerciseIds exist
          const validPlan = plan.filter((p) => getExerciseById(p.exerciseId));
          if (validPlan.length >= 3) {
            setAiPlan(validPlan);
            setAiExerciseIndex(0);
            setAiSets([{ weight: "", reps: "" }]);
            setMode("ai");
            setAiLoading(false);
            return;
          }
        }
      }
    } catch {
      // Fall through to local plan
    }

    // Fallback: use smart local generator
    setAiPlan(localPlan);
    setAiExerciseIndex(0);
    setAiSets([{ weight: "", reps: "" }]);
    setMode("ai");
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

  // ── Edit/Delete logged exercises ──

  function startEditEntry(index) {
    const entry = todayLogs[index];
    if (!entry) return;
    setEditingIndex(index);
    setEditSets(entry.sets.map((s) => ({ weight: String(s.weight), reps: String(s.reps) })));
  }

  function cancelEdit() {
    setEditingIndex(null);
    setEditSets([]);
  }

  function saveEditEntry() {
    if (editingIndex === null) return;
    const validSets = editSets
      .filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0)
      .map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) }));
    if (validSets.length === 0) return;
    onUpdateEntry(editingIndex, validSets);
    setEditingIndex(null);
    setEditSets([]);
  }

  function confirmDeleteEntry(index) {
    onDeleteEntry(index);
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditSets([]);
    }
  }

  // ── Filter Exercises ──

  const filteredCustomExercises = EXERCISE_LIBRARY.filter(
    (ex) =>
      ex.type === "strength" && (
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Look up the last logged session for an exercise (excluding today)
  function getLastSession(exerciseId) {
    if (!exerciseId) return null;
    const pastDates = Object.keys(workoutLogs)
      .filter((d) => d !== today)
      .sort((a, b) => b.localeCompare(a));
    for (const d of pastDates) {
      const entry = (workoutLogs[d] || []).find((e) => e.exercise === exerciseId);
      if (entry?.sets?.length > 0) {
        const maxWeight = Math.max(...entry.sets.map((s) => Number(s.weight) || 0));
        const totalVol = entry.sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        return { sets: entry.sets, maxWeight, totalVol, date: d };
      }
    }
    return null;
  }

  function renderSetLogger(setsList, setFn, onSave, exerciseName, hint, exerciseId) {
    const filledSets = setsList.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
    const totalVolume = filledSets.reduce((sum, s) => sum + Number(s.weight) * Number(s.reps), 0);
    const lastSession = getLastSession(exerciseId);
    const isBeatingVolume = lastSession && filledSets.length > 0 && totalVolume > lastSession.totalVol;
    const isBeatingWeight = lastSession && filledSets.length > 0 &&
      Math.max(...filledSets.map((s) => Number(s.weight) || 0)) > lastSession.maxWeight;

    return (
      <div style={ds.loggerCard}>
        <div style={ds.loggerHeader}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{exerciseName}</span>
          {hint && <span style={{ fontSize: 11, opacity: 0.4 }}>{hint}</span>}
        </div>

        {/* Last session reference — the key progressive overload cue */}
        {lastSession && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 10px",
            borderRadius: 8,
            background: isBeatingVolume ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${isBeatingVolume ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"}`,
            marginBottom: 10,
            fontSize: 11,
          }}>
            {isBeatingVolume
              ? <TrendingUp size={12} color="#22C55E" strokeWidth={2.5} />
              : <History size={12} style={{ opacity: 0.4 }} strokeWidth={2} />
            }
            <span style={{ opacity: isBeatingVolume ? 1 : 0.5, color: isBeatingVolume ? "#22C55E" : "inherit" }}>
              {isBeatingVolume
                ? `New PR! Last: ${lastSession.maxWeight}kg × ${lastSession.sets[0]?.reps || "?"} — you're beating it`
                : `Last session: ${lastSession.maxWeight}kg × ${lastSession.sets[0]?.reps || "?"} reps (${lastSession.sets.length} sets · ${lastSession.totalVol.toLocaleString()} kg vol)`
              }
            </span>
            {isBeatingWeight && !isBeatingVolume && (
              <span style={{ color: "#F97316", fontWeight: 700, marginLeft: 2 }}>↑ weight PR</span>
            )}
          </div>
        )}

        {setsList.map((set, i) => {
          const prevSet = lastSession?.sets[i];
          return (
            <div key={i} style={ds.setRow}>
              <div style={ds.setLabel}>Set {i + 1}</div>
              <input
                type="number"
                placeholder={prevSet ? `${prevSet.weight}` : "kg"}
                value={set.weight}
                onChange={(e) => handleSetChange(setsList, setFn, i, "weight", e.target.value)}
                style={S.setInput}
              />
              <span style={{ opacity: 0.3, fontSize: 12 }}>&times;</span>
              <input
                type="number"
                placeholder={prevSet ? `${prevSet.reps}` : "reps"}
                value={set.reps}
                onChange={(e) => handleSetChange(setsList, setFn, i, "reps", e.target.value)}
                style={S.setInput}
              />
              {setsList.length > 1 && (
                <button style={ds.removeSetBtn} onClick={() => handleRemoveSet(setsList, setFn, i)}>
                  &times;
                </button>
              )}
            </div>
          );
        })}

        <button style={ds.addSetLink} onClick={() => handleAddSet(setsList, setFn)}>
          + Add Set
        </button>

        {/* Summary before saving */}
        {filledSets.length > 0 && (
          <div style={ds.saveSummary}>
            <span>{filledSets.length} set{filledSets.length !== 1 ? "s" : ""}</span>
            <span style={{ opacity: 0.3 }}>&middot;</span>
            <span style={{ color: isBeatingVolume ? "#22C55E" : "inherit" }}>
              {totalVolume.toLocaleString()} kg total volume
              {isBeatingVolume && " 🏆"}
            </span>
          </div>
        )}

        <div style={ds.loggerActions}>
          <button style={S.timerBtnSec} onClick={resetWorkout}>Cancel</button>
          <button
            style={{ ...ds.doneBtn, opacity: filledSets.length === 0 ? 0.4 : 1 }}
            onClick={() => {
              if (filledSets.length === 0) return;
              onSave();
            }}
            disabled={filledSets.length === 0}
          >
            Log {filledSets.length} Set{filledSets.length !== 1 ? "s" : ""}
          </button>
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
          <div style={ds.actionSection}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, opacity: 0.5 }}>
              Start Today's Session
            </div>
            <div style={ds.actionButtons}>
              <button style={ds.aiButton} onClick={generateAIWorkout} disabled={aiLoading}>
                {aiLoading ? "Generating..." : <><Bot size={14} style={{ marginRight: 4 }} /> AI Workout</>}
              </button>
              <button style={ds.customButton} onClick={() => setMode("custom")}>
                <Pencil size={12} style={{ marginRight: 4 }} /> Custom
              </button>
            </div>
            {aiError && <div style={ds.errorText}>{aiError}</div>}
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
                  style={ds.templateChip}
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
          <div style={ds.loadingCard}>
            <div style={ds.loadingPulse} />
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.6 }}>Generating your workout...</div>
          </div>
        )}

        {/* AI Workout Plan */}
        {mode === "ai" && aiPlan && renderPlanView(
          aiPlan, aiExerciseIndex, aiSets, setAiSets, saveAIExercise, "AI Workout Plan", setAiExerciseIndex
        )}

        {/* Template Workout Plan */}
        {mode === "template" && activeTemplate && renderPlanView(
          activeTemplate.exercises, templateExIndex, templateSets, setTemplateSets,
          saveTemplateExercise, activeTemplate.name, setTemplateExIndex
        )}

        {/* Custom Exercise Picker */}
        {mode === "custom" && !activeExercise && (
          <div style={ds.pickerSection}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>Choose Exercise</span>
              <button style={ds.backLink} onClick={resetWorkout}>Back</button>
            </div>
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={ds.searchInput}
            />
            <div style={ds.exerciseList}>
              {filteredCustomExercises.map((ex) => (
                <div
                  key={ex.id}
                  style={ds.exerciseItem}
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
              getExerciseById(activeExercise)?.name || activeExercise,
              undefined,
              activeExercise
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
              const isEditing = editingIndex === i;

              if (isEditing) {
                return (
                  <div key={i} style={ds.loggerCard}>
                    <div style={ds.loggerHeader}>
                      <span style={{ fontSize: 15, fontWeight: 800 }}>
                        {exercise?.name || entry.exercise}
                      </span>
                      <span style={{ fontSize: 11, opacity: 0.4 }}>Editing</span>
                    </div>

                    {editSets.map((set, si) => (
                      <div key={si} style={ds.setRow}>
                        <div style={ds.setLabel}>Set {si + 1}</div>
                        <input
                          type="number"
                          placeholder="kg"
                          value={set.weight}
                          onChange={(e) => handleSetChange(editSets, setEditSets, si, "weight", e.target.value)}
                          style={S.setInput}
                        />
                        <span style={{ opacity: 0.3, fontSize: 12 }}>&times;</span>
                        <input
                          type="number"
                          placeholder="reps"
                          value={set.reps}
                          onChange={(e) => handleSetChange(editSets, setEditSets, si, "reps", e.target.value)}
                          style={S.setInput}
                        />
                        {editSets.length > 1 && (
                          <button style={ds.removeSetBtn} onClick={() => handleRemoveSet(editSets, setEditSets, si)}>
                            &times;
                          </button>
                        )}
                      </div>
                    ))}

                    <button style={ds.addSetLink} onClick={() => handleAddSet(editSets, setEditSets)}>
                      + Add Set
                    </button>

                    <div style={ds.loggerActions}>
                      <button style={S.timerBtnSec} onClick={cancelEdit}>Cancel</button>
                      <button style={ds.doneBtn} onClick={saveEditEntry}>Save</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} style={ds.summaryRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {exercise?.name || entry.exercise}
                    </span>
                    {exercise && <MuscleTag muscle={exercise.muscle} small />}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, opacity: 0.5 }}>
                        {entry.sets.length}&times;{entry.sets.map((s) => s.reps).join("/")}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#7C5CFC" }}>
                        {vol.toLocaleString()} kg
                      </div>
                    </div>
                    <button
                      style={ds.editBtn}
                      onClick={() => startEditEntry(i)}
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      style={ds.deleteBtn}
                      onClick={() => confirmDeleteEntry(i)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
            <div style={ds.totalRow}>
              <span style={{ opacity: 0.5, fontSize: 12 }}>Total Volume</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#7C5CFC" }}>
                {todayVolume.toLocaleString()} kg
              </span>
            </div>

            {!mode && (
              <div style={{ ...ds.actionButtons, marginTop: 10 }}>
                <button style={ds.aiButton} onClick={generateAIWorkout} disabled={aiLoading}>
                  {aiLoading ? "..." : <><Bot size={14} style={{ marginRight: 4 }} /> AI Workout</>}
                </button>
                <button style={ds.customButton} onClick={() => setMode("custom")}>
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
                  <div key={date} style={ds.historyDay}>
                    <div style={ds.historyHeader}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{formatDate(date)}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#7C5CFC" }}>
                        {dayVolume.toLocaleString()} kg
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {entries.map((entry, i) => {
                        const exercise = getExerciseById(entry.exercise);
                        return (
                          <span key={i} style={ds.historyExercise}>
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

  function renderPlanView(exercises, currentIndex, currentSets, setCurrentSets, onSave, title, setCurrentIndex) {
    return (
      <div style={ds.planSection}>
        <div style={ds.planHeader}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>{title}</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, opacity: 0.4 }}>
              {currentIndex + 1} / {exercises.length}
            </span>
            <button style={ds.backLink} onClick={resetWorkout}>Exit</button>
          </div>
        </div>

        <div style={ds.planOverview}>
          {exercises.map((ex, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const exercise = getExerciseById(ex.exerciseId);
            return (
              <div
                key={i}
                onClick={() => setCurrentIndex?.(i)}
                style={{
                  ...ds.planItem,
                  opacity: done ? 0.4 : 1,
                  borderLeft: active ? "3px solid #7C5CFC" : "3px solid transparent",
                  background: active ? "rgba(124,92,252,0.06)" : "transparent",
                  cursor: "pointer",
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

        {/* Prev/Next navigation */}
        {setCurrentIndex && exercises.length > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 14px" }}>
            <button
              style={{ ...ds.backLink, opacity: currentIndex > 0 ? 1 : 0.3 }}
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            >
              ← Prev
            </button>
            <button
              style={{ ...ds.backLink, opacity: currentIndex < exercises.length - 1 ? 1 : 0.3 }}
              disabled={currentIndex >= exercises.length - 1}
              onClick={() => setCurrentIndex(Math.min(exercises.length - 1, currentIndex + 1))}
            >
              Next →
            </button>
          </div>
        )}

        {exercises[currentIndex] && (() => {
          const current = exercises[currentIndex];
          const exercise = getExerciseById(current.exerciseId);
          const exerciseName = current.name || exercise?.name || current.exerciseId;
          const hint = current.suggestedWeight
            ? `${current.sets}×${current.reps} | ${current.suggestedWeight}`
            : `${current.sets}×${current.reps}${current.rest ? ` | Rest: ${current.rest}` : ""}`;
          return renderSetLogger(currentSets, setCurrentSets, onSave, exerciseName, hint, current.exerciseId);
        })()}
      </div>
    );
  }

  // ── Library log handler ──
  function handleLogFromLibrary(exercise) {
    const filledSets = sets.filter(s => s.weight && s.reps);
    if (activeExercise && filledSets.length > 0) {
      onSaveWorkout(activeExercise, filledSets.map(s => ({ weight: Number(s.weight), reps: Number(s.reps) })));
    }
    setActiveExercise(exercise.id);
    setSets([{ weight: "", reps: "" }]);
    setMode("custom");
    setTab("workout");
    setSelectedExercise(null);
  }

  // (ExerciseLibraryTab and ProgramsTab extracted to dojo/ subdirectory)

  // ── Removed: renderLibraryTab, renderExerciseDetail, renderProgramsTab ──
  // These are now in dojo/ExerciseLibraryTab.jsx and dojo/ProgramsTab.jsx

  // ── Main Render ──

  return (
    <div style={S.vc}>
      {/* Header */}
      <div style={ds.header}>
        <div style={ds.headerTitle}>The Dojo</div>
        <div style={ds.headerSub}>Train hard. Log everything. Level up.</div>
        {state.liftingStreak > 0 && (
          <div style={{ fontSize: 12, marginTop: 4 }}>
            <Flame size={13} color="#F97316" style={{ marginRight: 3 }} /> <strong>{state.liftingStreak}</strong> day lifting streak
            <span style={{ opacity: 0.3, marginLeft: 6 }}>Best: {state.bestLiftingStreak || 0}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={ds.tabBar}>
        {[
          { id: "workout", label: "Workout" },
          { id: "library", label: `Library (${EXERCISE_LIBRARY.length})` },
          { id: "programs", label: "Programs" },
        ].map((t) => (
          <button
            key={t.id}
            style={{
              ...ds.tabBtn,
              ...(tab === t.id ? ds.tabBtnActive : {}),
            }}
            onClick={() => { setTab(t.id); setSelectedExercise(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "workout" && renderWorkoutTab()}
      {tab === "library" && (
        <ExerciseLibraryTab
          libraryFilter={libraryFilter} setLibraryFilter={setLibraryFilter}
          librarySearch={librarySearch} setLibrarySearch={setLibrarySearch}
          selectedExercise={selectedExercise} setSelectedExercise={setSelectedExercise}
          ds={ds}
          onLogExercise={handleLogFromLibrary}
        />
      )}
      {tab === "programs" && (
        <ProgramsTab
          ds={ds}
          onStartTemplate={(t) => { startTemplate(t); setTab("workout"); }}
        />
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
    background: "rgba(124,92,252,0.06)",
    border: "1px dashed rgba(124,92,252,0.35)",
    color: "#7C5CFC",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    padding: "11px 0",
    display: "block",
    width: "100%",
    borderRadius: 10,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 4,
    boxSizing: "border-box",
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
  saveSummary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    opacity: 0.5,
    padding: "6px 0 2px",
    justifyContent: "center",
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
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "1px solid rgba(124,92,252,0.15)",
    background: "rgba(124,92,252,0.06)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    flexShrink: 0,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "1px solid rgba(239,68,68,0.15)",
    background: "rgba(239,68,68,0.06)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    flexShrink: 0,
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
