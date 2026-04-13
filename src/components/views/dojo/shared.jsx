import { MUSCLE_GROUPS } from "../../../data/exerciseLibrary";

const DIFFICULTY_COLORS = {
  beginner: "#22C55E",
  intermediate: "#F59E0B",
  advanced: "#EF4444",
};

export function MuscleTag({ muscle, small }) {
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

export function DifficultyBadge({ level }) {
  const color = DIFFICULTY_COLORS[level] || "#888";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      color, opacity: 0.8,
    }}>
      {level}
    </span>
  );
}
