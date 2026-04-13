import { WORKOUT_TEMPLATES, getExerciseById } from "../../../data/exerciseLibrary";
import { MuscleTag } from "./shared";

export default function ProgramsTab({ ds, onStartTemplate }) {
  return (
    <div style={{ padding: "0 14px", paddingBottom: 20 }}>
      <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 12 }}>
        Structured workout programs to follow. Pick one and stick with it for best results.
      </div>

      {WORKOUT_TEMPLATES.map((t) => {
        const exercises = t.exercises.map((e) => getExerciseById(e.exerciseId)).filter(Boolean);
        const muscleGroups = [...new Set(exercises.map((e) => e.muscle))];

        return (
          <div key={t.id} style={ds.programCard}>
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
                <div key={i} style={ds.programExercise}>
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
              style={{ ...ds.aiButton, marginTop: 10, width: "100%" }}
              onClick={() => onStartTemplate(t)}
            >
              Start This Workout
            </button>
          </div>
        );
      })}
    </div>
  );
}
