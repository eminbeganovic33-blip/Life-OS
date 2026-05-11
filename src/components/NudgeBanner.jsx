import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { TOKENS, DARK_COLORS } from "../styles/theme";
import { ChevronRight } from "lucide-react";

const T = TOKENS;

const NUDGE_THEMES = {
  mood_decline: { bg: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.04))", accent: "#3B82F6", border: "rgba(59,130,246,0.12)" },
  journal_gap: { bg: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.04))", accent: "#22C55E", border: "rgba(34,197,94,0.12)" },
  forge_milestone: { bg: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,88,12,0.04))", accent: "#F97316", border: "rgba(249,115,22,0.12)" },
  weak_category: { bg: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(139,92,246,0.04))", accent: "#7C5CFC", border: "rgba(124,92,252,0.12)" },
  streak_celebration: { bg: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))", accent: "#FBBF24", border: "rgba(251,191,36,0.12)" },
  lifting_gap: { bg: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,88,12,0.04))", accent: "#F97316", border: "rgba(249,115,22,0.12)" },
};

const DEFAULT_THEME = { bg: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(236,72,153,0.04))", accent: "#7C5CFC", border: "rgba(124,92,252,0.1)" };

export default function NudgeBanner({ nudge, onNavigate }) {
  const { theme: colorTheme, colors } = useTheme();
  const isDark = colorTheme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;
  if (!nudge) return null;

  const theme = NUDGE_THEMES[nudge.type] || DEFAULT_THEME;
  const styles = getStyles(colors, sub);

  return (
    <motion.div
      style={{
        ...styles.banner,
        background: theme.bg,
        borderColor: theme.border,
      }}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => nudge.action && onNavigate(nudge.action)}
    >
      <div style={styles.iconWrap}>
        <span style={{ fontSize: 20 }}>{nudge.icon}</span>
      </div>
      <div style={styles.body}>
        <div style={{ ...styles.title, color: theme.accent }}>{nudge.title}</div>
        <div style={styles.message}>{nudge.message}</div>
      </div>
      {nudge.action && <ChevronRight size={16} color={colors.textSecondary} />}
    </motion.div>
  );
}

function getStyles(colors, sub) {
  return {
    banner: {
      display: "flex",
      alignItems: "center",
      gap: T.space.md,
      padding: `${T.space.lg}px`,
      borderRadius: T.radii.lg,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "transparent",
      cursor: "pointer",
      marginBottom: T.space.md,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: T.radii.md,
      background: sub(0.06),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    body: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: T.font.sm,
      fontWeight: T.weight.bold,
      marginBottom: 2,
    },
    message: {
      fontSize: T.font.xs,
      color: colors.textSecondary,
      lineHeight: 1.4,
    },
    arrow: {
      fontSize: T.font.xl,
      color: colors.textSecondary,
      flexShrink: 0,
    },
  };
}
