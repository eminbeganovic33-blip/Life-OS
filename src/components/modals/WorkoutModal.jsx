import { S } from "../../styles/theme";
import { EXERCISES, EXERCISES_TIER2 } from "../../data";

export default function WorkoutModal({
  workoutExercise,
  setWorkoutExercise,
  workoutSets,
  setWorkoutSets,
  onSave,
  onClose,
  bossClears,
}) {
  const hasTier2 = bossClears && bossClears[21];
  const allExercises = hasTier2 ? [...EXERCISES, ...EXERCISES_TIER2] : EXERCISES;
  const selectedEx = allExercises.find((e) => e.id === workoutExercise);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Workout Logger</span>
          <span style={S.modalClose} onClick={onClose}>✕</span>
        </div>
        {!workoutExercise ? (
          <div>
            <div style={S.exGrid}>
              {EXERCISES.map((ex) => (
                <div key={ex.id} style={S.exCard} onClick={() => setWorkoutExercise(ex.id)}>
                  <div style={{ fontSize: 24 }}>{ex.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{ex.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.4 }}>{ex.muscle}</div>
                </div>
              ))}
            </div>
            {hasTier2 && (
              <>
                <div style={tier2Header}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#F97316", textTransform: "uppercase", letterSpacing: 1 }}>
                    Advanced · Tier 2
                  </span>
                </div>
                <div style={S.exGrid}>
                  {EXERCISES_TIER2.map((ex) => (
                    <div key={ex.id} style={{ ...S.exCard, borderColor: "rgba(249,115,22,0.12)" }} onClick={() => setWorkoutExercise(ex.id)}>
                      <div style={{ fontSize: 24 }}>{ex.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{ex.name}</div>
                      <div style={{ fontSize: 10, opacity: 0.4 }}>{ex.muscle}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!hasTier2 && (
              <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, opacity: 0.3 }}>
                8 more exercises unlock after Day 21 Boss Clear
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "#7C5CFC", fontWeight: 700 }}>
                {selectedEx?.name}
              </span>
              <span
                style={{ fontSize: 11, opacity: 0.3, marginLeft: 8, cursor: "pointer" }}
                onClick={() => setWorkoutExercise(null)}
              >
                ← Change
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: "0 4px" }}>
              <div style={{ flex: 1, fontSize: 10, opacity: 0.4, textAlign: "center" }}>SET</div>
              <div style={{ flex: 2, fontSize: 10, opacity: 0.4, textAlign: "center" }}>KG</div>
              <div style={{ flex: 2, fontSize: 10, opacity: 0.4, textAlign: "center" }}>REPS</div>
              <div style={{ width: 28 }}></div>
            </div>
            {workoutSets.map((set, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                <div style={{ flex: 1, textAlign: "center", fontSize: 12, opacity: 0.3 }}>{i + 1}</div>
                <input
                  style={S.setInput}
                  type="number"
                  placeholder="0"
                  value={set.weight}
                  onChange={(e) => {
                    const s = [...workoutSets];
                    s[i] = { ...s[i], weight: e.target.value };
                    setWorkoutSets(s);
                  }}
                />
                <input
                  style={S.setInput}
                  type="number"
                  placeholder="0"
                  value={set.reps}
                  onChange={(e) => {
                    const s = [...workoutSets];
                    s[i] = { ...s[i], reps: e.target.value };
                    setWorkoutSets(s);
                  }}
                />
                <span
                  style={{ width: 28, textAlign: "center", cursor: "pointer", opacity: 0.3, fontSize: 14 }}
                  onClick={() => {
                    if (workoutSets.length > 1) {
                      const s = [...workoutSets];
                      s.splice(i, 1);
                      setWorkoutSets(s);
                    }
                  }}
                >
                  ✕
                </span>
              </div>
            ))}
            <button style={S.addSetBtn} onClick={() => setWorkoutSets([...workoutSets, { weight: "", reps: "" }])}>
              + Add Set
            </button>
            {workoutSets.some((s) => s.weight && s.reps) && (
              <div style={{ textAlign: "center", margin: "12px 0 4px", fontSize: 12, opacity: 0.4 }}>
                Volume: {workoutSets.reduce((a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)} kg ·
                Bonus: +{Math.floor(workoutSets.reduce((a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0) / 100)} XP
              </div>
            )}
            <button style={{ ...S.primaryBtn, margin: "12px 0 0", width: "100%" }} onClick={onSave}>
              Log Workout (+20 XP)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const tier2Header = {
  textAlign: "center",
  margin: "14px 0 8px",
  padding: "6px 0",
  borderTop: "1px solid rgba(249,115,22,0.1)",
};
