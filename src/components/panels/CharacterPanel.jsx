import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles } from "lucide-react";
import { TOKENS, DOMAIN_COLORS } from "../../styles/tokens";
import {
  getCharacterStats, getCharacterTier, getAllDomainMasteries, STAT_META,
} from "../../utils/character";
import { renderAnimalAvatar } from "../shared/AnimalAvatars";

// SVG radar chart with 5 axes
function RadarChart({ stats, color, max }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;
  const keys = ["strength", "intelligence", "vitality", "wisdom", "focus"];
  const angle = (i) => (Math.PI * 2 * i) / keys.length - Math.PI / 2;

  // Background rings
  const rings = [0.25, 0.5, 0.75, 1].map((scale) => {
    const points = keys.map((_, i) => {
      const x = cx + Math.cos(angle(i)) * r * scale;
      const y = cy + Math.sin(angle(i)) * r * scale;
      return `${x},${y}`;
    }).join(" ");
    return points;
  });

  // Stat polygon
  const statPoints = keys.map((key, i) => {
    const v = Math.min(stats[key] / max, 1);
    const x = cx + Math.cos(angle(i)) * r * v;
    const y = cy + Math.sin(angle(i)) * r * v;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      {/* Rings */}
      {rings.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      {keys.map((_, i) => {
        const x = cx + Math.cos(angle(i)) * r;
        const y = cy + Math.sin(angle(i)) * r;
        return (
          <line
            key={i}
            x1={cx} y1={cy} x2={x} y2={y}
            stroke="rgba(0,0,0,0.06)" strokeWidth="1"
          />
        );
      })}
      {/* Stat polygon */}
      <motion.polygon
        points={statPoints}
        fill={`${color}30`}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Labels */}
      {keys.map((key, i) => {
        const meta = STAT_META[key];
        const labelR = r + 18;
        const x = cx + Math.cos(angle(i)) * labelR;
        const y = cy + Math.sin(angle(i)) * labelR;
        return (
          <text
            key={key}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
          >
            {meta.icon}
          </text>
        );
      })}
    </svg>
  );
}

export default function CharacterPanel({ state, onClose }) {
  const stats = useMemo(() => getCharacterStats(state), [state]);
  const tier = useMemo(() => getCharacterTier(stats), [stats]);
  const masteries = useMemo(() => getAllDomainMasteries(state), [state]);
  const activeMasteries = masteries.filter((m) => m.xp > 0);

  const maxStat = Math.max(50, ...Object.values(stats));

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
        <Sparkles size={20} color={TOKENS.color.text} />
        <span style={styles.title}>Character</span>
      </div>

      <div style={styles.body}>
        {/* Hero */}
        <div style={{
          ...styles.hero,
          background: `linear-gradient(135deg, ${tier.color}18 0%, ${tier.color}04 100%)`,
          borderColor: `${tier.color}30`,
        }}>
          <div style={styles.avatarBig}>
            {state.avatar ? (
              renderAnimalAvatar(state.avatar, 88)
            ) : (
              <span style={{ fontSize: 56 }}>{tier.emoji}</span>
            )}
          </div>
          <div style={{ ...styles.tierLabel, color: tier.color }}>{tier.label}</div>
          <div style={styles.tierTotal}>
            {tier.total} total stats
            {tier.next && (
              <span style={styles.tierNext}>
                {" "}· Next: {tier.next.label} at {tier.next.min}
              </span>
            )}
          </div>
        </div>

        {/* Radar */}
        <div style={styles.radarSection}>
          <div style={styles.sectionLabel}>Attribute Profile</div>
          <RadarChart stats={stats} color={tier.color} max={maxStat} />
        </div>

        {/* Stat list */}
        <div style={styles.statsSection}>
          {Object.entries(STAT_META).map(([key, meta]) => {
            const value = stats[key];
            const pct = Math.min(value / maxStat, 1) * 100;
            return (
              <div key={key} style={styles.statRow}>
                <div style={styles.statRowTop}>
                  <span style={{ fontSize: 18 }}>{meta.icon}</span>
                  <span style={styles.statName}>{meta.label}</span>
                  <span style={{ ...styles.statValue, color: meta.color }}>{value}</span>
                </div>
                <div style={styles.statBarBg}>
                  <motion.div
                    style={{
                      ...styles.statBarFill,
                      background: meta.color,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <div style={styles.statSource}>Built from: {meta.source}</div>
              </div>
            );
          })}
        </div>

        {/* Domain mastery */}
        {activeMasteries.length > 0 && (
          <div style={styles.masterySection}>
            <div style={styles.sectionLabel}>Domain Mastery</div>
            {activeMasteries.map((m) => {
              const color = DOMAIN_COLORS[m.id] || TOKENS.color.text;
              return (
                <div key={m.id} style={styles.masteryRow}>
                  <div style={styles.masteryHeader}>
                    <span style={styles.masteryLabel}>{m.label}</span>
                    <span style={{ ...styles.masteryLevel, color }}>Lv. {m.level}</span>
                  </div>
                  <div style={styles.masteryBar}>
                    <div style={{
                      ...styles.masteryFill,
                      width: `${m.progress * 100}%`,
                      background: color,
                    }} />
                  </div>
                  <div style={styles.masteryMeta}>{m.xp} XP · Next at {m.next}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const styles = {
  panel: {
    position: "fixed", top: 0, right: 0, bottom: 0,
    width: "100%", maxWidth: 480, background: TOKENS.color.bg,
    zIndex: 200, display: "flex", flexDirection: "column",
    boxShadow: TOKENS.shadow.xl,
  },
  header: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: TOKENS.space[5],
    paddingTop: `max(${TOKENS.space[5]}px, env(safe-area-inset-top))`,
    borderBottomWidth: 1, borderBottomStyle: "solid",
    borderBottomColor: TOKENS.color.border,
  },
  backBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  title: {
    fontSize: TOKENS.font.size.lg, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  body: { flex: 1, overflowY: "auto", padding: TOKENS.space[5] },
  hero: {
    padding: TOKENS.space[5], borderRadius: TOKENS.radius.lg,
    border: "1px solid", textAlign: "center",
    marginBottom: TOKENS.space[6],
  },
  avatarBig: { marginBottom: TOKENS.space[3], display: "flex", justifyContent: "center" },
  tierLabel: {
    fontSize: 28, fontWeight: 900, letterSpacing: -0.5,
  },
  tierTotal: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.textSecondary,
    fontWeight: TOKENS.font.weight.semibold, marginTop: 4,
  },
  tierNext: { color: TOKENS.color.textTertiary, fontWeight: TOKENS.font.weight.medium },
  sectionLabel: {
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.textTertiary, textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: TOKENS.space[4],
  },
  radarSection: { marginBottom: TOKENS.space[7] },
  statsSection: { marginBottom: TOKENS.space[7] },
  statRow: { marginBottom: TOKENS.space[5] },
  statRowTop: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    marginBottom: TOKENS.space[2],
  },
  statName: {
    flex: 1, fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.bold, color: TOKENS.color.text,
  },
  statValue: { fontSize: TOKENS.font.size.lg, fontWeight: 900 },
  statBarBg: {
    height: 8, background: "rgba(0,0,0,0.05)",
    borderRadius: 4, overflow: "hidden",
  },
  statBarFill: { height: "100%" },
  statSource: {
    fontSize: 10, color: TOKENS.color.textTertiary,
    marginTop: 4, fontStyle: "italic",
  },
  masterySection: { marginBottom: TOKENS.space[6] },
  masteryRow: {
    padding: TOKENS.space[4], background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg, marginBottom: TOKENS.space[3],
  },
  masteryHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  masteryLabel: {
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    color: TOKENS.color.text,
  },
  masteryLevel: {
    fontSize: TOKENS.font.size.sm, fontWeight: 900,
  },
  masteryBar: {
    height: 4, background: "rgba(0,0,0,0.05)",
    borderRadius: 2, overflow: "hidden",
    marginTop: TOKENS.space[2],
  },
  masteryFill: { height: "100%", transition: "width 0.4s ease" },
  masteryMeta: {
    fontSize: 10, color: TOKENS.color.textTertiary, marginTop: 4,
  },
};
