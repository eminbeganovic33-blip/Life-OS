import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Dumbbell, Plus, Check, ChevronDown, ChevronUp, Clock, Search, BookOpen, Calendar } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { getTodayStr } from "../../utils";
import { EXERCISE_LIBRARY } from "../../data/exerciseLibrary";
import { EXERCISE_PROGRAMS } from "../../data/exercisePrograms";

const TEMPLATES = [
  {
    id: "push",
    label: "Push Day",
    muscles: "Chest, Shoulders, Triceps",
    duration: "45 min",
    exercises: [
      { name: "Bench Press", sets: 4, reps: "8-10", muscle: "Chest", cue: "Arch back slightly, feet flat, bar path over mid-chest. Elbows 45°." },
      { name: "Overhead Press", sets: 3, reps: "8-10", muscle: "Shoulders", cue: "Brace core, press straight up. Don't lean back excessively." },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", muscle: "Upper Chest", cue: "30° bench angle. Full stretch at bottom, don't clang dumbbells at top." },
      { name: "Lateral Raises", sets: 3, reps: "12-15", muscle: "Side Delts", cue: "Slight bend in elbows, lift to shoulder height. Control the negative." },
      { name: "Tricep Pushdowns", sets: 3, reps: "12-15", muscle: "Triceps", cue: "Pin elbows to sides. Full extension at bottom, slow return." },
    ],
  },
  {
    id: "pull",
    label: "Pull Day",
    muscles: "Back, Biceps",
    duration: "45 min",
    exercises: [
      { name: "Barbell Rows", sets: 4, reps: "8-10", muscle: "Back", cue: "Hinge at hips, pull to lower chest. Squeeze shoulder blades." },
      { name: "Pull-Ups", sets: 3, reps: "6-10", muscle: "Lats", cue: "Full dead hang at bottom. Pull chest to bar, don't kip." },
      { name: "Face Pulls", sets: 3, reps: "15-20", muscle: "Rear Delts", cue: "Pull to forehead level, externally rotate at peak. Pause 1 second." },
      { name: "Dumbbell Curls", sets: 3, reps: "10-12", muscle: "Biceps", cue: "Full supination at top. Don't swing — if you have to, go lighter." },
      { name: "Hammer Curls", sets: 2, reps: "12", muscle: "Brachialis", cue: "Neutral grip throughout. Slow negative (3 seconds)." },
    ],
  },
  {
    id: "legs",
    label: "Leg Day",
    muscles: "Quads, Hamstrings, Glutes",
    duration: "50 min",
    exercises: [
      { name: "Barbell Squat", sets: 4, reps: "6-8", muscle: "Quads/Glutes", cue: "Break at hips first, knees track over toes. Depth = hip crease below knee." },
      { name: "Romanian Deadlift", sets: 3, reps: "8-10", muscle: "Hamstrings", cue: "Soft knees, hinge until hamstrings stretch. Bar stays close to legs." },
      { name: "Leg Press", sets: 3, reps: "10-12", muscle: "Quads", cue: "Feet shoulder-width, don't lock knees. Full range of motion." },
      { name: "Walking Lunges", sets: 3, reps: "12 each", muscle: "Glutes/Quads", cue: "Long stride, back knee nearly touches ground. Torso upright." },
      { name: "Calf Raises", sets: 4, reps: "15-20", muscle: "Calves", cue: "Full stretch at bottom, pause at top. Slow negatives." },
    ],
  },
  {
    id: "upper",
    label: "Full Upper Body",
    muscles: "Chest, Back, Shoulders, Arms",
    duration: "50 min",
    exercises: [
      { name: "Bench Press", sets: 3, reps: "8-10", muscle: "Chest", cue: "Retract scapula, drive feet into floor." },
      { name: "Barbell Rows", sets: 3, reps: "8-10", muscle: "Back", cue: "45° torso angle, pull to lower chest." },
      { name: "Overhead Press", sets: 3, reps: "8-10", muscle: "Shoulders", cue: "Brace core, press and get head through at top." },
      { name: "Pull-Ups", sets: 3, reps: "Max", muscle: "Lats", cue: "Full range of motion. Assisted if needed." },
      { name: "Dumbbell Curls", sets: 2, reps: "12", muscle: "Biceps", cue: "Control the weight. No momentum." },
      { name: "Tricep Dips", sets: 2, reps: "12", muscle: "Triceps", cue: "Lean forward slightly for chest, upright for triceps." },
    ],
  },
  {
    id: "fullbody",
    label: "Full Body",
    muscles: "All Major Groups",
    duration: "55 min",
    exercises: [
      { name: "Barbell Squat", sets: 3, reps: "8", muscle: "Legs", cue: "Break at hips, chest up, full depth." },
      { name: "Bench Press", sets: 3, reps: "8", muscle: "Chest", cue: "Bar to chest, controlled press." },
      { name: "Barbell Rows", sets: 3, reps: "8", muscle: "Back", cue: "Squeeze at top, slow negative." },
      { name: "Overhead Press", sets: 3, reps: "8", muscle: "Shoulders", cue: "Strict press, no leg drive." },
      { name: "Romanian Deadlift", sets: 3, reps: "10", muscle: "Hamstrings", cue: "Feel the stretch, keep back neutral." },
    ],
  },
  {
    id: "hiit",
    label: "HIIT Session",
    muscles: "Full Body (Cardio)",
    duration: "25 min",
    exercises: [
      { name: "Burpees", sets: 4, reps: "10", muscle: "Full Body", cue: "Chest to floor, explosive jump. 30s rest between sets." },
      { name: "Mountain Climbers", sets: 4, reps: "20 each", muscle: "Core/Cardio", cue: "Keep hips level, drive knees to chest fast." },
      { name: "Jump Squats", sets: 4, reps: "15", muscle: "Legs", cue: "Full squat depth, explode up, soft landing." },
      { name: "Push-Ups", sets: 4, reps: "15", muscle: "Chest/Triceps", cue: "Full range, chest to floor." },
      { name: "Plank Hold", sets: 3, reps: "45s", muscle: "Core", cue: "Straight line from head to heels. Breathe." },
    ],
  },
  {
    id: "mobility",
    label: "Mobility & Recovery",
    muscles: "Joints, Flexibility",
    duration: "30 min",
    exercises: [
      { name: "Cat-Cow Stretch", sets: 2, reps: "10", muscle: "Spine", cue: "Flow between arch and round. Breathe with movement." },
      { name: "Hip 90/90 Stretch", sets: 2, reps: "30s each", muscle: "Hips", cue: "Sit tall, rotate between internal and external rotation." },
      { name: "World's Greatest Stretch", sets: 2, reps: "5 each", muscle: "Full Body", cue: "Lunge, twist, reach. Hold each position 3 seconds." },
      { name: "Pigeon Pose", sets: 1, reps: "60s each", muscle: "Hip Flexors", cue: "Square hips, fold forward gently." },
      { name: "Thoracic Spine Rotation", sets: 2, reps: "10 each", muscle: "Upper Back", cue: "Keep hips stacked, rotate through mid-back only." },
    ],
  },
];

function dayDiff(dateA, dateB) {
  const a = new Date(dateA + "T12:00:00");
  const b = new Date(dateB + "T12:00:00");
  return Math.round((b - a) / 86400000);
}

export default function DojoPanel({ state, save, onClose }) {
  const today = getTodayStr();
  const [view, setView] = useState("home");
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [activeProgram, setActiveProgram] = useState(null);
  const [sessionLog, setSessionLog] = useState([]);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [customExercise, setCustomExercise] = useState(null);
  const [customSets, setCustomSets] = useState([{ weight: "", reps: "", done: false }]);

  const todayLog = state.workoutLogs?.[today];
  const streak = state.liftingStreak || 0;

  const recentWorkouts = useMemo(() => {
    const logs = state.workoutLogs || {};
    return Object.entries(logs)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 10)
      .map(([date, log]) => ({ date, ...log }));
  }, [state.workoutLogs]);

  const startWorkout = useCallback((template) => {
    setActiveTemplate(template);
    setSessionLog(template.exercises.map((ex) =>
      Array.from({ length: ex.sets }, () => ({ reps: "", weight: "", done: false }))
    ));
    setView("active");
  }, []);

  const updateSet = useCallback((exIdx, setIdx, field, value) => {
    setSessionLog((prev) => {
      const copy = prev.map((ex) => ex.map((s) => ({ ...s })));
      copy[exIdx][setIdx][field] = value;
      return copy;
    });
  }, []);

  const toggleSetDone = useCallback((exIdx, setIdx) => {
    setSessionLog((prev) => {
      const copy = prev.map((ex) => ex.map((s) => ({ ...s })));
      copy[exIdx][setIdx].done = !copy[exIdx][setIdx].done;
      return copy;
    });
  }, []);

  const finishWorkout = useCallback(() => {
    if (!activeTemplate) return;
    const totalSets = sessionLog.flat().filter((s) => s.done).length;
    const totalVolume = sessionLog.flat()
      .filter((s) => s.done && s.weight)
      .reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0);

    // Merge with any existing log for today so logging a second workout
    // (template or custom) doesn't silently wipe the first one.
    const existing = state.workoutLogs?.[today];
    const log = {
      type: existing ? "mixed" : activeTemplate.id,
      label: existing ? `${existing.label} + ${activeTemplate.label}` : activeTemplate.label,
      ts: Date.now(),
      sets: (existing?.sets || 0) + totalSets,
      volume: Math.round((existing?.volume || 0) + totalVolume),
      exercises: [
        ...(existing?.exercises || []),
        ...sessionLog.map((sets, i) => ({
          name: activeTemplate.exercises[i].name,
          sets: sets.filter((s) => s.done),
        })),
      ],
    };

    const wasYesterday = state.lastLiftDate && dayDiff(state.lastLiftDate, today) === 1;
    const isToday = state.lastLiftDate === today;
    const newStreak = isToday ? (state.liftingStreak || 1) : wasYesterday ? (state.liftingStreak || 0) + 1 : 1;

    save({
      ...state,
      workoutLogs: { ...state.workoutLogs, [today]: log },
      lastLiftDate: today,
      liftingStreak: newStreak,
      bestLiftingStreak: Math.max(newStreak, state.bestLiftingStreak || 0),
    });

    setView("home");
    setActiveTemplate(null);
    setSessionLog([]);
  }, [activeTemplate, sessionLog, state, save, today]);

  const filteredExercises = useMemo(() => {
    if (!exerciseSearch.trim()) return EXERCISE_LIBRARY.filter((e) => e.type === "strength").slice(0, 20);
    const q = exerciseSearch.toLowerCase();
    return EXERCISE_LIBRARY.filter((e) =>
      e.type === "strength" && (e.name.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [exerciseSearch]);

  const saveCustomExercise = useCallback(() => {
    if (!customExercise) return;
    const validSets = customSets.filter((s) => s.done && s.weight && s.reps);
    if (validSets.length === 0) return;

    const totalVolume = validSets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0);
    const existing = state.workoutLogs?.[today];
    const log = {
      type: "custom",
      label: existing ? `${existing.label} + ${customExercise.name}` : customExercise.name,
      ts: Date.now(),
      sets: (existing?.sets || 0) + validSets.length,
      volume: Math.round((existing?.volume || 0) + totalVolume),
      exercises: [
        ...(existing?.exercises || []),
        { name: customExercise.name, sets: validSets.map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })) },
      ],
    };

    const wasYesterday = state.lastLiftDate && dayDiff(state.lastLiftDate, today) === 1;
    const isToday = state.lastLiftDate === today;
    const newStreak = isToday ? (state.liftingStreak || 1) : wasYesterday ? (state.liftingStreak || 0) + 1 : 1;

    save({
      ...state,
      workoutLogs: { ...state.workoutLogs, [today]: log },
      lastLiftDate: today,
      liftingStreak: newStreak,
      bestLiftingStreak: Math.max(newStreak, state.bestLiftingStreak || 0),
    });

    setCustomExercise(null);
    setCustomSets([{ weight: "", reps: "", done: false }]);
    setView("home");
  }, [customExercise, customSets, state, save, today]);

  // Custom exercise picker view
  if (view === "custom-pick") {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button onClick={() => setView("home")} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <span style={styles.headerTitle}>Choose Exercise</span>
        </div>
        <div style={styles.searchBar}>
          <Search size={16} color={TOKENS.color.textTertiary} />
          <input
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
            placeholder="Search exercises..."
            style={styles.searchInput}
          />
        </div>
        <div style={styles.body}>
          {filteredExercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                setCustomExercise(ex);
                setCustomSets(Array.from({ length: 3 }, () => ({ weight: "", reps: "", done: false })));
                setView("custom-log");
              }}
              style={styles.exercisePickCard}
            >
              <div>
                <div style={styles.exercisePickName}>{ex.name}</div>
                <div style={styles.exercisePickMeta}>{ex.muscle} · {ex.difficulty}</div>
              </div>
              <ChevronDown size={14} color={TOKENS.color.textTertiary} style={{ transform: "rotate(-90deg)" }} />
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Custom exercise logging view
  if (view === "custom-log" && customExercise) {
    const doneSets = customSets.filter((s) => s.done).length;
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button onClick={() => setView("custom-pick")} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={styles.headerTitle}>{customExercise.name}</div>
            <div style={styles.headerSub}>{customExercise.muscle} · {doneSets}/{customSets.length} sets</div>
          </div>
          <button onClick={saveCustomExercise} style={styles.finishBtn}>Save</button>
        </div>
        <div style={styles.body}>
          {customExercise.instructions && (
            <div style={styles.formCue}>
              {customExercise.instructions[0]}
            </div>
          )}
          <div style={styles.setHeader}>
            <span style={styles.setHeaderLabel}>Set</span>
            <span style={styles.setHeaderLabel}>Weight</span>
            <span style={styles.setHeaderLabel}>Reps</span>
            <span style={{ width: 32 }} />
          </div>
          {customSets.map((set, i) => (
            <div key={i} style={styles.setRow}>
              <span style={styles.setNum}>{i + 1}</span>
              <input
                type="number"
                placeholder="kg"
                value={set.weight}
                onChange={(e) => {
                  const copy = [...customSets];
                  copy[i] = { ...copy[i], weight: e.target.value };
                  setCustomSets(copy);
                }}
                style={styles.setInput}
              />
              <input
                type="number"
                placeholder="reps"
                value={set.reps}
                onChange={(e) => {
                  const copy = [...customSets];
                  copy[i] = { ...copy[i], reps: e.target.value };
                  setCustomSets(copy);
                }}
                style={styles.setInput}
              />
              <button
                onClick={() => {
                  const copy = [...customSets];
                  copy[i] = { ...copy[i], done: !copy[i].done };
                  setCustomSets(copy);
                }}
                style={{
                  ...styles.checkBtn,
                  background: set.done ? TOKENS.color.success : TOKENS.color.surface,
                }}
              >
                <Check size={14} color={set.done ? "#fff" : TOKENS.color.textTertiary} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setCustomSets([...customSets, { weight: "", reps: "", done: false }])}
            style={styles.addSetBtn}
          >
            <Plus size={14} /> Add Set
          </button>
        </div>
      </motion.div>
    );
  }

  // Active workout view
  if (view === "active" && activeTemplate) {
    const totalDone = sessionLog.flat().filter((s) => s.done).length;
    const totalSets = sessionLog.flat().length;

    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button onClick={() => setView("home")} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={styles.headerTitle}>{activeTemplate.label}</div>
            <div style={styles.headerSub}>{totalDone}/{totalSets} sets complete</div>
          </div>
          <button onClick={finishWorkout} style={styles.finishBtn}>Finish</button>
        </div>

        <div style={styles.body}>
          {activeTemplate.exercises.map((ex, exIdx) => {
            const isExpanded = expandedExercise === exIdx;
            const setsForEx = sessionLog[exIdx] || [];

            return (
              <div key={exIdx} style={styles.exerciseBlock}>
                <button
                  onClick={() => setExpandedExercise(isExpanded ? null : exIdx)}
                  style={styles.exerciseHeader}
                >
                  <div>
                    <div style={styles.exerciseName}>{ex.name}</div>
                    <div style={styles.exerciseMeta}>{ex.muscle} — {ex.sets}×{ex.reps}</div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} color={TOKENS.color.textTertiary} /> : <ChevronDown size={16} color={TOKENS.color.textTertiary} />}
                </button>

                {isExpanded && (
                  <>
                    <div style={styles.formCue}>{ex.cue}</div>
                    <div style={styles.setHeader}>
                      <span style={styles.setHeaderLabel}>Set</span>
                      <span style={styles.setHeaderLabel}>Weight</span>
                      <span style={styles.setHeaderLabel}>Reps</span>
                      <span style={{ width: 32 }} />
                    </div>
                    {setsForEx.map((set, setIdx) => (
                      <div key={setIdx} style={styles.setRow}>
                        <span style={styles.setNum}>{setIdx + 1}</span>
                        <input
                          type="number"
                          placeholder="kg"
                          value={set.weight}
                          onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                          style={styles.setInput}
                        />
                        <input
                          type="number"
                          placeholder="reps"
                          value={set.reps}
                          onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                          style={styles.setInput}
                        />
                        <button
                          onClick={() => toggleSetDone(exIdx, setIdx)}
                          style={{
                            ...styles.checkBtn,
                            background: set.done ? TOKENS.color.success : TOKENS.color.surface,
                          }}
                        >
                          <Check size={14} color={set.done ? "#fff" : TOKENS.color.textTertiary} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // History view
  if (view === "history") {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button onClick={() => setView("home")} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <span style={styles.headerTitle}>Workout History</span>
        </div>
        <div style={styles.body}>
          {recentWorkouts.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🏋️</div>
              <div style={styles.emptyTitle}>No workouts logged yet</div>
              <div style={styles.emptyBody}>Pick a quick workout or a structured program from the Dojo to log your first session.</div>
            </div>
          ) : (
            recentWorkouts.map((w) => {
              const dateLabel = new Date(w.date + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
              return (
                <div key={w.date} style={styles.historyCard}>
                  <div style={styles.historyTop}>
                    <div style={styles.historyLabel}>{w.label}</div>
                    <div style={styles.historyDate}>{dateLabel}</div>
                  </div>
                  <div style={styles.historyStats}>
                    {w.sets && <span>{w.sets} sets</span>}
                    {w.volume > 0 && <span>{w.volume.toLocaleString()} kg</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    );
  }

  // Program detail view — shows weeks → days → tap-to-start
  if (view === "program-detail" && activeProgram) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={styles.panel}
      >
        <div style={styles.header}>
          <button onClick={() => { setView("home"); setActiveProgram(null); }} style={styles.backBtn} aria-label="Close">
            <ChevronLeft size={20} color={TOKENS.color.text} />
          </button>
          <span style={{ fontSize: 22 }}>{activeProgram.icon}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={styles.headerTitle}>{activeProgram.title}</div>
            <div style={styles.headerSub}>{activeProgram.duration} · {activeProgram.frequency} · {activeProgram.level}</div>
          </div>
        </div>

        <div style={styles.body}>
          <div style={styles.programDescription}>{activeProgram.description}</div>

          {activeProgram.weeks.map((week) => (
            <div key={week.week} style={styles.weekBlock}>
              <div style={styles.weekHeader}>
                <span style={styles.weekNumber}>WEEK {week.week}</span>
                <span style={styles.weekFocus}>{week.focus}</span>
              </div>
              {week.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => {
                    // Convert program day to a workout template and start it
                    const template = {
                      id: `${activeProgram.id}-w${week.week}-d${day.day}`,
                      label: `${activeProgram.title} · W${week.week} D${day.day}`,
                      muscles: day.title,
                      duration: `${day.exercises.length * 8} min`,
                      exercises: day.exercises.map((e) => ({
                        name: e.name,
                        sets: e.sets,
                        reps: e.reps,
                        muscle: day.title,
                        cue: e.cue,
                      })),
                    };
                    startWorkout(template);
                  }}
                  style={styles.dayCard}
                >
                  <div style={styles.dayHead}>
                    <span style={styles.dayLabel}>Day {day.day} · {day.title}</span>
                    <ChevronUp size={12} color={TOKENS.color.textTertiary} style={{ transform: "rotate(90deg)" }} />
                  </div>
                  <div style={styles.dayExercises}>
                    {day.exercises.slice(0, 3).map((e) => `${e.name} ${e.sets}×${e.reps}`).join(" · ")}
                    {day.exercises.length > 3 && ` · +${day.exercises.length - 3} more`}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Home view
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
        <Dumbbell size={20} color={TOKENS.color.text} />
        <span style={styles.headerTitle}>Dojo</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setView("history")} style={styles.historyBtn}>History</button>
      </div>

      <div style={styles.body}>
        {streak > 0 && (
          <div style={styles.streakBanner}>
            <span style={{ fontSize: TOKENS.font.size.xl, fontWeight: TOKENS.font.weight.bold }}>
              {streak}
            </span>
            <span style={{ fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary }}>
              day lifting streak
            </span>
          </div>
        )}

        {todayLog && (
          <div style={styles.doneCard}>
            <Check size={32} color={TOKENS.color.success} />
            <div style={styles.doneTitle}>Workout logged</div>
            <div style={styles.doneSub}>
              {todayLog.label} — {todayLog.sets || 0} sets{todayLog.volume > 0 ? `, ${todayLog.volume.toLocaleString()} kg volume` : ""}
            </div>
            <div style={styles.doneActions}>
              <button onClick={() => { setExerciseSearch(""); setView("custom-pick"); }} style={styles.logAnotherBtn}>
                <Plus size={14} color={TOKENS.color.text} />
                Add exercise
              </button>
            </div>
          </div>
        )}

        {/* Multi-week structured programs */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Structured programs</div>
          <div style={styles.programGrid}>
            {EXERCISE_PROGRAMS.map((p) => (
              <button key={p.id} onClick={() => { setActiveProgram(p); setView("program-detail"); }} style={styles.programCard}>
                <div style={styles.programIcon}>{p.icon}</div>
                <div style={styles.programInfo}>
                  <div style={styles.programTitle}>{p.title}</div>
                  <div style={styles.programSub}>{p.subtitle}</div>
                  <div style={styles.programMeta}>
                    <Calendar size={10} color={TOKENS.color.textTertiary} />
                    <span>{p.duration}</span>
                    <span>·</span>
                    <span>{p.frequency}</span>
                    <span>·</span>
                    <span>{p.level}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Single-session workout templates */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>
            {todayLog ? "Log another workout" : "Quick workouts"}
          </div>
          <div style={styles.templateList}>
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => startWorkout(t)} style={styles.templateCard}>
                <div>
                  <div style={styles.templateLabel}>{t.label}</div>
                  <div style={styles.templateSub}>{t.muscles}</div>
                </div>
                <div style={styles.templateMeta}>
                  <Clock size={12} color={TOKENS.color.textTertiary} />
                  <span>{t.duration}</span>
                </div>
              </button>
            ))}
            <button
              onClick={() => { setExerciseSearch(""); setView("custom-pick"); }}
              style={{ ...styles.templateCard, justifyContent: "center", gap: TOKENS.space[2] }}
            >
              <Plus size={16} color={TOKENS.color.brand} />
              <div style={{ ...styles.templateLabel, color: TOKENS.color.brand }}>Custom Exercise</div>
            </button>
          </div>
        </div>
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
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  headerTitle: {
    fontSize: TOKENS.font.size.lg,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  headerSub: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 1,
  },
  historyBtn: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.brand,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  finishBtn: {
    padding: "8px 16px",
    borderRadius: TOKENS.radius.md,
    border: "none",
    background: TOKENS.color.text,
    color: "#fff",
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
  },
  streakBanner: {
    display: "flex",
    alignItems: "baseline",
    gap: TOKENS.space[3],
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[6],
  },
  section: {},
  sectionLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: TOKENS.space[4],
  },
  templateList: {
    display: "flex",
    flexDirection: "column",
    gap: TOKENS.space[3],
  },
  templateCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    transition: TOKENS.transition.fast,
  },
  templateLabel: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  templateSub: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
  },
  templateMeta: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
  },
  programGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: TOKENS.space[3],
  },
  programCard: {
    display: "flex", alignItems: "center", gap: TOKENS.space[4],
    padding: TOKENS.space[4],
    background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(249,115,22,0.04) 100%)",
    border: "1px solid rgba(239,68,68,0.15)",
    borderRadius: TOKENS.radius.lg,
    cursor: "pointer",
  },
  programIcon: {
    width: 44, height: 44, borderRadius: TOKENS.radius.md,
    background: "rgba(239,68,68,0.12)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, flexShrink: 0,
  },
  programInfo: { flex: 1, textAlign: "left", minWidth: 0 },
  programTitle: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  programSub: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textSecondary,
    marginTop: 1,
  },
  programMeta: {
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 10, color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.semibold,
    marginTop: 4,
  },
  programDescription: {
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    lineHeight: 1.5,
    marginBottom: TOKENS.space[5],
  },
  weekBlock: { marginBottom: TOKENS.space[5] },
  weekHeader: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    marginBottom: TOKENS.space[3],
  },
  weekNumber: {
    fontSize: 11, fontWeight: 900, color: "#EF4444",
    letterSpacing: 1.2,
  },
  weekFocus: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary,
    fontWeight: TOKENS.font.weight.semibold,
  },
  dayCard: {
    width: "100%",
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
    border: "none", cursor: "pointer", textAlign: "left",
    marginBottom: TOKENS.space[2],
  },
  dayHead: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  dayLabel: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  dayExercises: {
    fontSize: 11, color: TOKENS.color.textTertiary,
    marginTop: 3, lineHeight: 1.4,
  },
  doneCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: TOKENS.space[8],
    textAlign: "center",
  },
  doneTitle: {
    fontSize: TOKENS.font.size.xl,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
    marginTop: TOKENS.space[4],
  },
  doneSub: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginTop: TOKENS.space[2],
  },
  logAnotherBtn: {
    marginTop: TOKENS.space[5],
    padding: "10px 20px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    background: TOKENS.color.surface,
    color: TOKENS.color.textSecondary,
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer",
  },
  exerciseBlock: {
    marginBottom: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    overflow: "hidden",
  },
  exerciseHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: `${TOKENS.space[4]}px ${TOKENS.space[4]}px`,
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  exerciseName: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  exerciseMeta: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
  },
  formCue: {
    padding: `0 ${TOKENS.space[4]}px ${TOKENS.space[3]}px`,
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.brand,
    fontStyle: "italic",
    lineHeight: 1.4,
  },
  setHeader: {
    display: "flex",
    alignItems: "center",
    padding: `0 ${TOKENS.space[4]}px`,
    marginBottom: 4,
  },
  setHeaderLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
  },
  setRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: `4px ${TOKENS.space[4]}px`,
    marginBottom: 2,
  },
  setNum: {
    width: 24,
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary,
    textAlign: "center",
  },
  setInput: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: TOKENS.radius.sm,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: TOKENS.color.border,
    background: TOKENS.color.bg,
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.text,
    textAlign: "center",
    outline: "none",
    boxSizing: "border-box",
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: TOKENS.radius.sm,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  historyCard: {
    padding: TOKENS.space[4],
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[3],
  },
  historyTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyLabel: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  historyDate: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
  },
  historyStats: {
    display: "flex",
    gap: TOKENS.space[4],
    marginTop: 6,
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textSecondary,
    fontWeight: TOKENS.font.weight.medium,
  },
  emptyState: {
    textAlign: "center",
    padding: `${TOKENS.space[9]}px ${TOKENS.space[5]}px`,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: TOKENS.space[3],
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textTertiary,
    lineHeight: 1.5,
    maxWidth: 260,
    marginLeft: "auto", marginRight: "auto",
  },
  doneActions: {
    display: "flex",
    gap: TOKENS.space[3],
    marginTop: TOKENS.space[5],
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[3],
    margin: `${TOKENS.space[4]}px ${TOKENS.space[5]}px 0`,
    padding: `${TOKENS.space[3]}px ${TOKENS.space[4]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.md,
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.text,
    fontFamily: "inherit",
  },
  exercisePickCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    marginBottom: TOKENS.space[2],
  },
  exercisePickName: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  exercisePickMeta: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  addSetBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    padding: "10px",
    marginTop: TOKENS.space[3],
    borderRadius: TOKENS.radius.md,
    border: `1px dashed ${TOKENS.color.border}`,
    background: "transparent",
    color: TOKENS.color.brand,
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer",
  },
};
