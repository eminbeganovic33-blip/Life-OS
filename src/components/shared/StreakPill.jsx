import { Flame, Snowflake } from "lucide-react";
import { TOKENS } from "../../styles/tokens";

export default function StreakPill({ streak, freezes = 0 }) {
  if (!streak && !freezes) return null;

  return (
    <div style={styles.wrap}>
      {streak > 0 && (
        <div style={styles.pill}>
          <Flame size={14} color="#F97316" strokeWidth={2.5} />
          <span style={styles.count}>{streak}</span>
        </div>
      )}
      {freezes > 0 && (
        <div style={styles.freezePill} title={`${freezes} streak freeze${freezes > 1 ? "s" : ""} banked`}>
          <Snowflake size={12} color="#3B82F6" strokeWidth={2.5} />
          <span style={styles.freezeCount}>{freezes}</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: "inline-flex", gap: 6, alignItems: "center" },
  pill: {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "5px 10px",
    background: "rgba(249, 115, 22, 0.08)",
    borderRadius: TOKENS.radius.full,
  },
  count: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    color: "#F97316",
  },
  freezePill: {
    display: "inline-flex", alignItems: "center", gap: 3,
    padding: "4px 8px",
    background: "rgba(59, 130, 246, 0.1)",
    borderRadius: TOKENS.radius.full,
  },
  freezeCount: {
    fontSize: TOKENS.font.size.xs, fontWeight: 900,
    color: "#3B82F6",
  },
};
