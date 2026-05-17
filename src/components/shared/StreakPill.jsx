import { Flame } from "lucide-react";
import { TOKENS } from "../../styles/tokens";

export default function StreakPill({ streak }) {
  if (!streak) return null;

  return (
    <div style={styles.pill}>
      <Flame size={14} color="#F97316" strokeWidth={2.5} />
      <span style={styles.count}>{streak}</span>
    </div>
  );
}

const styles = {
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 10px",
    background: "rgba(249, 115, 22, 0.08)",
    borderRadius: TOKENS.radius.full,
  },
  count: {
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold,
    color: "#F97316",
  },
};
