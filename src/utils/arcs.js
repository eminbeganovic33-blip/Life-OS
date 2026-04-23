// Arc system — named phases of the user journey
// Each arc gives the user a sense of where they are and what they're building toward.

export const ARCS = [
  {
    id: "foundation",
    name: "Foundation",
    subtitle: "Building the base",
    days: [1, 30],
    color: "#7C5CFC",
    icon: "🌱",
    description: "The first 30 days are about building the habit of showing up, not perfection.",
  },
  {
    id: "build",
    name: "Build",
    subtitle: "Momentum is real",
    days: [31, 90],
    color: "#F97316",
    icon: "🔥",
    description: "You've proven you can do it. Now you're stacking consistency.",
  },
  {
    id: "forge",
    name: "Forge",
    subtitle: "Identity-level change",
    days: [91, 180],
    color: "#FBBF24",
    icon: "⚔️",
    description: "The habits are automatic now. This is where character gets built.",
  },
  {
    id: "mastery",
    name: "Mastery",
    subtitle: "A different kind of person",
    days: [181, 365],
    color: "#22C55E",
    icon: "🏆",
    description: "You operate differently than most people. You've earned this.",
  },
  {
    id: "legend",
    name: "Legend",
    subtitle: "Beyond the system",
    days: [366, Infinity],
    color: "#EC4899",
    icon: "✦",
    description: "The system is a part of you now. You don't need reminders.",
  },
];

export function getArc(day) {
  return ARCS.find((a) => day >= a.days[0] && day <= a.days[1]) || ARCS[ARCS.length - 1];
}

/** Progress within the current arc, 0→1 */
export function getArcProgress(day) {
  const arc = getArc(day);
  const [start, end] = arc.days;
  const safeEnd = end === Infinity ? start + 365 : end;
  return Math.min(1, (day - start) / (safeEnd - start + 1));
}

/** Days remaining in current arc (null for Legend) */
export function getArcDaysRemaining(day) {
  const arc = getArc(day);
  if (arc.id === "legend") return null;
  return arc.days[1] - day + 1;
}
