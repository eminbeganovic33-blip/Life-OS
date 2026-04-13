import { EXERCISE_LIBRARY, MUSCLE_GROUPS, EQUIPMENT, getExerciseById } from "../../../data/exerciseLibrary";
import { S } from "../../../styles/theme";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { MuscleTag, DifficultyBadge } from "./shared";

export default function ExerciseLibraryTab({
  libraryFilter, setLibraryFilter, librarySearch, setLibrarySearch,
  selectedExercise, setSelectedExercise,
  ds,
  onLogExercise,
}) {
  const filteredLibrary = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch = !librarySearch ||
      ex.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      ex.muscle.toLowerCase().includes(librarySearch.toLowerCase());
    const matchesFilter = libraryFilter === "all" || ex.muscle === libraryFilter;
    return matchesSearch && matchesFilter;
  });

  if (selectedExercise) {
    return <ExerciseDetail exercise={selectedExercise} ds={ds} onBack={() => setSelectedExercise(null)} onLogExercise={onLogExercise} />;
  }

  return (
    <>
      <input
        type="text"
        placeholder="Search exercises..."
        value={librarySearch}
        onChange={(e) => setLibrarySearch(e.target.value)}
        style={{ ...ds.searchInput, margin: "8px 14px", width: "calc(100% - 28px)" }}
      />

      {/* Muscle Group Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 14px", marginBottom: 10 }}>
        <button
          style={{
            ...ds.filterChip,
            ...(libraryFilter === "all" ? ds.filterChipActive : {}),
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
                ...ds.filterChip,
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
            style={ds.libraryItem}
            onClick={() => setSelectedExercise(ex)}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{ex.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                <MuscleTag muscle={ex.muscle} small />
                <DifficultyBadge level={ex.difficulty} />
                <span style={{ fontSize: 11, opacity: 0.3 }}>
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

function ExerciseDetail({ exercise, ds, onBack, onLogExercise }) {
  return (
    <div style={{ padding: "0 14px", paddingBottom: 20 }}>
      <button style={ds.backLink} onClick={onBack}>
        ← Back to Library
      </button>

      <div style={ds.detailCard}>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 4px", letterSpacing: -0.5 }}>
          {exercise.name}
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <MuscleTag muscle={exercise.muscle} />
          <DifficultyBadge level={exercise.difficulty} />
          <span style={{ fontSize: 10, opacity: 0.4, textTransform: "capitalize" }}>{exercise.type}</span>
        </div>

        {/* Equipment */}
        <div style={ds.detailSection}>
          <div style={ds.detailLabel}>Equipment</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {exercise.equipment.map((eq) => (
              <span key={eq} style={ds.equipmentTag}>{EQUIPMENT[eq] || eq}</span>
            ))}
          </div>
        </div>

        {/* Secondary Muscles */}
        {exercise.secondary?.length > 0 && (
          <div style={ds.detailSection}>
            <div style={ds.detailLabel}>Also Works</div>
            <div style={{ display: "flex", gap: 4 }}>
              {exercise.secondary.map((m) => <MuscleTag key={m} muscle={m} small />)}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={ds.detailSection}>
          <div style={ds.detailLabel}>How To Perform</div>
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
          <div style={{ ...ds.detailSection, ...ds.tipBox }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#22C55E", marginBottom: 4 }}>
              <Lightbulb size={12} style={{ marginRight: 4 }} /> PRO TIP
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85 }}>
              {exercise.tips}
            </div>
          </div>
        )}

        {/* Common Mistakes */}
        {exercise.commonMistakes?.length > 0 && (
          <div style={ds.detailSection}>
            <div style={ds.detailLabel}>Common Mistakes</div>
            {exercise.commonMistakes.map((mistake, i) => (
              <div key={i} style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.8, paddingLeft: 12 }}>
                <AlertTriangle size={11} color="#F59E0B" style={{ marginRight: 4, flexShrink: 0 }} /> {mistake}
              </div>
            ))}
          </div>
        )}

        {/* Quick Log Button */}
        <button
          style={{ ...ds.aiButton, marginTop: 16, width: "100%" }}
          onClick={() => onLogExercise(exercise)}
        >
          Log This Exercise
        </button>
      </div>
    </div>
  );
}
