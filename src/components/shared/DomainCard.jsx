import { Check } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";

export default function DomainCard({ domain, completedCount, totalCount, onTap }) {
  const done = completedCount === totalCount && totalCount > 0;
  const color = DOMAIN_COLORS[domain.id] || TOKENS.color.text;

  return (
    <button onClick={onTap} style={styles.card}>
      <div style={styles.left}>
        <div style={{
          ...styles.icon,
          background: done ? color : `${color}10`,
        }}>
          {done ? (
            <Check size={18} color="#fff" strokeWidth={2.5} />
          ) : (
            <span style={{ fontSize: 18 }}>{domain.icon}</span>
          )}
        </div>
        <div>
          <div style={styles.label}>{domain.label}</div>
          <div style={styles.sub}>
            {completedCount} of {totalCount} complete
          </div>
        </div>
      </div>
      <div style={{
        ...styles.badge,
        background: done ? `${color}14` : TOKENS.color.surface,
        color: done ? color : TOKENS.color.textTertiary,
      }}>
        {done ? "Done" : `${totalCount - completedCount} left`}
      </div>
    </button>
  );
}

const styles = {
  card: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surfaceElevated,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.lg,
    cursor: "pointer",
    transition: TOKENS.transition.fast,
    textAlign: "left",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[4],
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: TOKENS.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  label: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  sub: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 1,
  },
  badge: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    padding: "4px 10px",
    borderRadius: TOKENS.radius.full,
  },
};
