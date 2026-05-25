import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Trophy } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { TROPHIES, getTrophyTierColor } from "../../data/trophies";

export default function TrophyPanel({ state, onClose }) {
  const unlocked = state.unlockedTrophies || {};

  const { earned, locked } = useMemo(() => {
    const earned = [];
    const locked = [];
    TROPHIES.forEach((t) => {
      if (unlocked[t.id]) earned.push(t);
      else locked.push(t);
    });
    return { earned, locked };
  }, [unlocked]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={styles.panel}
    >
      <div style={styles.header}>
        <button onClick={onClose} style={styles.backBtn} aria-label="Close">
          <ChevronLeft size={20} color={TOKENS.color.text} />
        </button>
        <Trophy size={20} color={TOKENS.color.text} />
        <div style={styles.headerTitle}>Trophies</div>
        <div style={styles.countBadge}>{earned.length}/{TROPHIES.length}</div>
      </div>

      <div style={styles.list}>
        {earned.length > 0 && (
          <>
            <div style={styles.sectionLabel}>Earned</div>
            {earned.map((t) => {
              const tc = getTrophyTierColor(t.tier || 1);
              return (
                <div key={t.id} style={{ ...styles.card, background: tc.bg, borderColor: tc.border }}>
                  <div style={styles.icon}>{t.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.name}>{t.name}</div>
                    <div style={styles.desc}>{t.desc}</div>
                  </div>
                  <div style={{ ...styles.tierBadge, color: tc.text }}>{tc.label}</div>
                </div>
              );
            })}
          </>
        )}

        {locked.length > 0 && (
          <>
            <div style={styles.sectionLabel}>Locked</div>
            {locked.map((t) => (
              <div key={t.id} style={styles.lockedCard}>
                <div style={{ ...styles.icon, opacity: 0.3 }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...styles.name, color: TOKENS.color.textTertiary }}>{t.name}</div>
                  <div style={styles.desc}>{t.desc}</div>
                </div>
              </div>
            ))}
          </>
        )}
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
    justifyContent: "space-between",
    padding: `${TOKENS.space[5]}px ${TOKENS.space[5]}px`,
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
  countBadge: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary,
    background: TOKENS.color.surface,
    padding: "2px 8px",
    borderRadius: TOKENS.radius.full,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: TOKENS.space[5],
    display: "flex",
    flexDirection: "column",
    gap: TOKENS.space[3],
  },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: TOKENS.space[2],
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[4],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
  },
  lockedCard: {
    display: "flex",
    alignItems: "center",
    gap: TOKENS.space[4],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    opacity: 0.6,
  },
  icon: {
    fontSize: 28,
    width: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  name: {
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.semibold,
    color: TOKENS.color.text,
  },
  desc: {
    fontSize: TOKENS.font.size.xs,
    color: TOKENS.color.textTertiary,
    marginTop: 1,
  },
  tierBadge: {
    fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.bold,
    flexShrink: 0,
  },
};
