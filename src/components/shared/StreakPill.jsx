import { Flame, Snowflake } from "lucide-react";
import { TOKENS } from "../../styles/tokens";

export default function StreakPill({ streak, freezes = 0, tone = "light" }) {
  if (!streak && !freezes) return null;
  const dark = tone === "dark";

  return (
    <div style={styles.wrap}>
      {streak > 0 && (
        <div style={{
          ...styles.pill,
          background: dark ? "rgba(249, 115, 22, 0.20)" : "rgba(249, 115, 22, 0.10)",
        }}>
          <Flame size={14} color="#FB923C" strokeWidth={2.5} fill="#FB923C" />
          <span style={{ ...styles.count, color: dark ? "#FDBA74" : "#F97316" }}>{streak}</span>
        </div>
      )}
      {freezes > 0 && (
        <div
          style={{
            ...styles.freezePill,
            background: dark ? "rgba(59, 130, 246, 0.22)" : "rgba(59, 130, 246, 0.12)",
          }}
          title={`${freezes} streak freeze${freezes > 1 ? "s" : ""} banked`}
        >
          <Snowflake size={12} color="#60A5FA" strokeWidth={2.5} />
          <span style={{ ...styles.freezeCount, color: dark ? "#93C5FD" : "#3B82F6" }}>{freezes}</span>
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
    borderRadius: TOKENS.radius.full,
  },
  count: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
  },
  freezePill: {
    display: "inline-flex", alignItems: "center", gap: 3,
    padding: "4px 8px",
    borderRadius: TOKENS.radius.full,
  },
  freezeCount: {
    fontSize: TOKENS.font.size.xs, fontWeight: 900,
  },
};
