// ── Design Tokens (2026) ──
// Single source of truth for spacing, radii, typography, and color.

export const TOKENS = {
  // Spacing scale (px) — tighter, more intentional
  space: { xs: 4, sm: 6, md: 10, lg: 14, xl: 18, xxl: 24, xxxl: 32 },

  // Border-radius scale — softer, modern
  radii: { sm: 8, md: 10, lg: 14, xl: 18, pill: 100 },

  // Typography — clean, readable hierarchy
  font: {
    xs: 11,
    sm: 12,
    md: 13,
    lg: 15,
    xl: 18,
    xxl: 22,
    hero: 26,
    display: 34,
  },

  // Font weights — Linear-style: lean on medium/semibold, reserve bold for emphasis
  weight: { normal: 400, medium: 500, semibold: 600, bold: 700, black: 800, heavy: 900 },

  // Transitions
  transition: {
    fast: "0.12s ease",
    normal: "0.2s ease",
    smooth: "0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
};

// ── Color Palettes ──
// Dark: "warm dark" base (not pure black) for OLED comfort
// Light: warm off-white for reduced eye strain

export const DARK_COLORS = {
  bg: "#0C0F1A",             // deeper, more neutral dark
  bgGrad1: "#0C0F1A",
  bgGrad2: "#10131F",
  surface: "rgba(255,255,255,0.05)",
  surfaceElevated: "rgba(255,255,255,0.07)",
  surfaceBorder: "rgba(255,255,255,0.07)",
  text: "#E8ECF4",           // slightly cooler for crisp readability
  textSecondary: "rgba(255,255,255,0.45)",
  accent: "#7C5CFC",
  accentGlow: "rgba(124,92,252,0.12)",
  cardBg: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.06)",
  navBg: "rgba(12,15,26,0.97)",
  inputBg: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(255,255,255,0.1)",
  success: "#22C55E",
  danger: "#EF4444",
  warning: "#F59E0B",
};

export const LIGHT_COLORS = {
  bg: "#FAFAF9",             // stone-50 — warm off-white
  bgGrad1: "#F5F5F4",       // stone-100
  bgGrad2: "#FAFAF9",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceBorder: "rgba(0,0,0,0.08)",
  text: "#1C1917",           // stone-900 — warmer than blue-tinted
  textSecondary: "rgba(0,0,0,0.55)",         // bumped from 0.5
  accent: "#7C5CFC",
  accentGlow: "rgba(124,92,252,0.1)",
  cardBg: "#FFFFFF",
  cardBorder: "rgba(0,0,0,0.07)",
  navBg: "rgba(250,250,249,0.95)",
  inputBg: "#F5F5F4",
  inputBorder: "rgba(0,0,0,0.1)",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
};

// ── Light-theme modal overrides ──
const LIGHT_MODAL_BG = "linear-gradient(145deg,#FFFFFF,#F5F5F4)";
const LIGHT_MODAL_BORDER = "1px solid rgba(0,0,0,0.08)";
const LIGHT_BOSS_BG = "linear-gradient(145deg,#F5F5FF,#EEEAF8)";
const LIGHT_OVERLAY = "rgba(0,0,0,0.35)";

// ── Token helpers ──
const T = TOKENS;
const DC = DARK_COLORS;

export const S = {
  app: { width: "100%", maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: `linear-gradient(180deg,${DC.bgGrad1} 0%,${DC.bgGrad2} 50%,${DC.bgGrad1} 100%)`, fontFamily: "'Inter','SF Pro Display','Segoe UI',system-ui,-apple-system,sans-serif", color: DC.text, position: "relative", display: "flex", flexDirection: "column", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" },
  content: { flex: 1, overflowY: "auto", paddingBottom: 76 },
  vc: { paddingTop: T.space.sm, paddingBottom: T.space.md },

  // Loading
  loadScreen: { width: "100%", minHeight: "100vh", background: DC.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" },
  loadPulse: { fontSize: 48, animation: "pulse 1.4s ease-in-out infinite" },
  loadText: { marginTop: 14, fontSize: T.font.xxl, fontWeight: T.weight.black, background: "linear-gradient(135deg,#7C5CFC,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 1 },
  loadSub: { marginTop: 6, fontSize: T.font.xs, opacity: 0.4 },

  // Onboarding
  onboarding: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: T.space.xxxl, textAlign: "center" },
  obTitle: { fontSize: T.font.display, fontWeight: T.weight.heavy, background: "linear-gradient(135deg,#7C5CFC,#EC4899,#F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, letterSpacing: -1 },
  obSub: { fontSize: T.font.sm, opacity: 0.55, marginTop: T.space.sm, marginBottom: T.space.xxl },
  obGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: T.space.md, marginBottom: T.space.xl, width: "100%", maxWidth: 340 },
  obCard: { padding: T.space.lg, borderRadius: T.radii.lg, background: DC.cardBg, border: `1px solid ${DC.cardBorder}`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: T.space.xs },
  obChips: { display: "flex", flexWrap: "wrap", gap: T.space.sm, justifyContent: "center", marginBottom: T.space.xxl },
  obChip: { padding: "4px 12px", borderRadius: T.radii.sm, border: "1px solid", fontSize: T.font.sm, fontWeight: T.weight.medium, background: DC.inputBg },

  // Header
  headerCard: { margin: `${T.space.md}px ${T.space.lg}px`, padding: T.space.xl, borderRadius: T.radii.xl, background: "linear-gradient(135deg,rgba(124,92,252,0.1),rgba(236,72,153,0.05))", border: "1px solid rgba(124,92,252,0.12)" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: T.space.lg },
  dayLabel: { fontSize: T.font.xxl, fontWeight: T.weight.heavy, letterSpacing: -0.5 },
  levelName: { fontSize: T.font.sm, color: "#7C5CFC", fontWeight: T.weight.bold, marginTop: 1 },
  streakBadge: { display: "flex", alignItems: "center", gap: T.space.xs, background: "rgba(249,115,22,0.12)", padding: "5px 12px", borderRadius: T.radii.sm, border: "1px solid rgba(249,115,22,0.15)" },
  streakNum: { fontSize: T.font.lg, fontWeight: T.weight.black, color: "#F97316" },
  pLabel: { display: "flex", justifyContent: "space-between", fontSize: T.font.xs, opacity: 0.5, marginBottom: 3, marginTop: T.space.sm },
  pBarOut: { height: 5, borderRadius: 3, background: DC.surface, overflow: "hidden" },
  pBarIn: { height: "100%", borderRadius: 3, transition: `width ${T.transition.smooth}` },

  // Quests
  secTitle: { fontSize: T.font.lg, fontWeight: T.weight.black, padding: `0 ${T.space.xl}px`, marginTop: T.space.xl, marginBottom: T.space.md, letterSpacing: -0.2 },
  qList: { display: "flex", flexDirection: "column", gap: T.space.sm, padding: `0 ${T.space.lg}px` },
  qCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${T.space.md}px ${T.space.lg}px`, borderRadius: T.radii.md, background: DC.cardBg, cursor: "pointer", border: `1px solid ${DC.cardBorder}` },
  qLeft: { display: "flex", alignItems: "center", gap: T.space.md },
  cb: { width: 22, height: 22, borderRadius: T.radii.sm, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontWeight: T.weight.bold, transition: `all ${T.transition.fast}` },
  qText: { fontSize: T.font.md, fontWeight: T.weight.normal },
  qCat: { fontSize: T.font.xs, opacity: 0.45, marginTop: 1 },
  qXp: { fontSize: T.font.sm, fontWeight: T.weight.bold, flexShrink: 0 },
  dojoLink: { color: "#F97316", fontWeight: T.weight.medium, cursor: "pointer", fontSize: T.font.xs },
  subStreak: { margin: `${T.space.md}px ${T.space.lg}px 0`, padding: `${T.space.md}px ${T.space.lg}px`, borderRadius: T.radii.md, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: T.font.sm },
  xpPop: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 26, fontWeight: T.weight.black, color: "#FACC15", textShadow: "0 0 20px rgba(250,204,21,0.4)", animation: "fadeUp 1.2s ease forwards", pointerEvents: "none", zIndex: 999 },

  // Buttons
  primaryBtn: { display: "block", width: "calc(100% - 28px)", margin: `${T.space.md}px ${T.space.lg}px 0`, padding: `${T.space.lg}px ${T.space.xl}px`, borderRadius: T.radii.md, border: "none", background: "linear-gradient(135deg,#7C5CFC,#6D28D9)", color: "#fff", fontSize: T.font.sm, fontWeight: T.weight.bold, cursor: "pointer", boxShadow: "0 4px 20px rgba(124,92,252,0.25)", transition: `all ${T.transition.normal}` },

  // Modals
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: T.space.xl },
  modalBox: { maxWidth: 380, width: "100%", padding: T.space.xxl, borderRadius: T.radii.xl, background: `linear-gradient(145deg,${DC.bgGrad1},${DC.bgGrad2})`, border: `1px solid ${DC.surfaceBorder}`, maxHeight: "80vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: T.space.lg },
  modalClose: { cursor: "pointer", opacity: 0.5, fontSize: T.font.xl, padding: T.space.xs },
  motCard: { maxWidth: 340, width: "100%", padding: T.space.xxxl, borderRadius: T.radii.xl, background: "linear-gradient(145deg,#151D35,#1C2545)", border: "1px solid rgba(124,92,252,0.18)", textAlign: "center", boxShadow: "0 20px 60px rgba(124,92,252,0.12)" },
  motBadge: { display: "inline-block", padding: "3px 14px", borderRadius: T.radii.sm, background: "rgba(124,92,252,0.12)", color: "#7C5CFC", fontSize: T.font.xs, fontWeight: T.weight.bold, textTransform: "uppercase", letterSpacing: 1, marginBottom: T.space.xl },
  motQuote: { fontSize: 17, fontWeight: T.weight.normal, lineHeight: 1.6, fontStyle: "italic", marginBottom: T.space.md },
  motAuthor: { fontSize: T.font.sm, opacity: 0.45, marginBottom: T.space.xl },
  motBtn: { padding: `11px ${T.space.xxxl}px`, borderRadius: T.radii.md, border: "none", background: "linear-gradient(135deg,#7C5CFC,#EC4899)", color: "#fff", fontSize: T.font.sm, fontWeight: T.weight.bold, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,92,252,0.25)" },

  // Boss
  bossCard: { maxWidth: 340, width: "100%", padding: 36, borderRadius: T.radii.xl, background: "linear-gradient(145deg,#111830,#1A0F2E)", border: "1px solid rgba(249,115,22,0.2)", textAlign: "center", position: "relative", overflow: "hidden" },
  bossGlow: { position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 60%)", animation: "pulse 3s ease infinite" },
  bossTitle: { fontSize: 22, fontWeight: T.weight.heavy, marginTop: T.space.md, background: "linear-gradient(135deg,#F97316,#FACC15)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", position: "relative", zIndex: 2, letterSpacing: 1 },
  bossSub: { fontSize: T.font.md, opacity: 0.55, marginTop: T.space.sm, marginBottom: T.space.md, lineHeight: 1.5, position: "relative", zIndex: 2 },
  bossXp: { fontSize: T.font.xl, fontWeight: T.weight.black, color: "#FACC15", marginBottom: T.space.lg, position: "relative", zIndex: 2 },

  // Workout Modal
  exGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: T.space.sm },
  exCard: { padding: T.space.lg, borderRadius: T.radii.md, background: DC.cardBg, border: `1px solid ${DC.cardBorder}`, textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  setInput: { flex: 2, padding: `${T.space.sm}px ${T.space.md}px`, borderRadius: T.radii.sm, border: `1px solid ${DC.inputBorder}`, background: DC.inputBg, color: DC.text, fontSize: T.font.sm, textAlign: "center", outline: "none", fontFamily: "inherit", fontVariantNumeric: "tabular-nums" },
  addSetBtn: { width: "100%", padding: `${T.space.md}px`, borderRadius: T.radii.sm, border: `1px dashed ${DC.inputBorder}`, background: "transparent", color: DC.textSecondary, fontSize: T.font.sm, cursor: "pointer", marginTop: T.space.sm },

  // Journal
  journalInput: { width: "calc(100% - 28px)", margin: `0 ${T.space.lg}px`, padding: T.space.lg, borderRadius: T.radii.md, border: `1px solid ${DC.cardBorder}`, background: DC.cardBg, color: DC.text, fontSize: T.font.md, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  moodItem: { display: "flex", flexDirection: "column", alignItems: "center", padding: `${T.space.sm}px ${T.space.sm}px`, borderRadius: T.radii.md, cursor: "pointer", transition: `all ${T.transition.fast}`, minWidth: 48 },
  pastEntry: { margin: `0 ${T.space.lg}px ${T.space.sm}px`, padding: T.space.md, borderRadius: T.radii.md, background: DC.cardBg, border: `1px solid ${DC.cardBorder}` },
  pastHead: { display: "flex", justifyContent: "space-between", fontSize: T.font.xs, fontWeight: T.weight.bold, color: "#7C5CFC", marginBottom: T.space.xs },
  pastText: { fontSize: T.font.sm, opacity: 0.55, lineHeight: 1.5 },

  // Academy
  courseCard: { margin: `0 ${T.space.lg}px ${T.space.md}px`, padding: T.space.lg, borderRadius: T.radii.lg, background: DC.cardBg, border: `1px solid ${DC.cardBorder}` },
  courseHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  courseStep: { display: "flex", gap: T.space.md, alignItems: "flex-start", padding: `${T.space.sm}px 0`, cursor: "pointer", borderTop: `1px solid ${DC.cardBorder}` },

  // Forge
  forgeCard: { margin: `0 ${T.space.lg}px ${T.space.md}px`, padding: T.space.lg, borderRadius: T.radii.lg, background: DC.cardBg, border: `1px solid ${DC.cardBorder}` },
  forgeBtn: { padding: `${T.space.sm}px ${T.space.lg}px`, borderRadius: T.radii.sm, border: "1px solid", background: "transparent", fontSize: T.font.sm, fontWeight: T.weight.bold, cursor: "pointer" },
  forgeMeter: { height: 5, borderRadius: 3, background: DC.surface, overflow: "hidden", marginTop: T.space.md },
  forgeFill: { height: "100%", borderRadius: 3, transition: `width ${T.transition.smooth}`, opacity: 0.7 },

  // Trophies
  trophyGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: T.space.sm, padding: `0 ${T.space.lg}px` },
  trophyCard: { padding: T.space.lg, borderRadius: T.radii.md, background: DC.surface, border: `1px solid ${DC.cardBorder}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  trophyUnlocked: { background: "rgba(124,92,252,0.06)", border: "1px solid rgba(124,92,252,0.15)", boxShadow: "0 0 20px rgba(124,92,252,0.08)" },

  // Pomodoro
  pomCard: { margin: `0 ${T.space.lg}px`, padding: T.space.xl, borderRadius: T.radii.lg, background: DC.cardBg, border: `1px solid ${DC.cardBorder}`, display: "flex", flexDirection: "column", alignItems: "center" },
  timerText: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 32, fontWeight: T.weight.black, fontVariantNumeric: "tabular-nums", letterSpacing: 2 },
  timerBtn: { padding: `${T.space.md}px ${T.space.xxl}px`, borderRadius: T.radii.md, border: "none", background: "linear-gradient(135deg,#7C5CFC,#6D28D9)", color: "#fff", fontSize: T.font.md, fontWeight: T.weight.bold, cursor: "pointer", boxShadow: "0 3px 12px rgba(124,92,252,0.2)" },
  timerBtnSec: { padding: `${T.space.md}px ${T.space.xxl}px`, borderRadius: T.radii.md, border: `1px solid ${DC.inputBorder}`, background: "transparent", color: DC.textSecondary, fontSize: T.font.md, fontWeight: T.weight.medium, cursor: "pointer" },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: T.space.sm, padding: `0 ${T.space.lg}px` },
  statCard: { padding: T.space.md, borderRadius: T.radii.md, background: DC.cardBg, border: `1px solid ${DC.cardBorder}`, textAlign: "center" },
  statVal: { fontSize: T.font.xl, fontWeight: T.weight.black },
  statLbl: { fontSize: T.font.xs, opacity: 0.45, marginTop: 2 },

  // Day Grid
  dayGrid: { display: "grid", gridTemplateColumns: "repeat(11,1fr)", gap: 3, padding: `0 ${T.space.lg}px` },
  dayDot: { aspectRatio: "1", borderRadius: T.radii.sm, display: "flex", alignItems: "center", justifyContent: "center", fontSize: T.font.xs, fontWeight: T.weight.normal, transition: `all ${T.transition.fast}` },

  // Bottom Nav
  bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, display: "flex", justifyContent: "space-around", alignItems: "center", padding: `${T.space.sm}px 0 ${T.space.xl}px`, background: `linear-gradient(180deg,rgba(12,15,26,0.7),${DC.navBg})`, backdropFilter: "blur(20px)", borderTop: `1px solid ${DC.surfaceBorder}`, zIndex: 100 },
  navItem: { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", position: "relative", padding: `4px ${T.space.md}px`, transition: `color ${T.transition.fast}`, gap: 1 },
  navDot: { width: 3, height: 3, borderRadius: 2, background: "#7C5CFC", marginTop: 1 },
};

/**
 * Returns theme overrides for the given theme.
 */
export function getThemeOverrides(theme) {
  const c = theme === "light" ? LIGHT_COLORS : DARK_COLORS;
  const isLight = theme === "light";

  return {
    app: { background: `linear-gradient(180deg,${c.bgGrad1} 0%,${c.bgGrad2} 50%,${c.bgGrad1} 100%)`, color: c.text },
    loadScreen: { background: c.bg },
    obCard: { background: c.cardBg, border: `1px solid ${c.cardBorder}` },
    obChip: { background: c.inputBg },
    pBarOut: { background: c.surface },
    qCard: { background: c.cardBg, border: `1px solid ${c.cardBorder}` },
    exCard: { background: c.cardBg, border: `1px solid ${c.cardBorder}` },
    setInput: { border: `1px solid ${c.inputBorder}`, background: c.inputBg, color: c.text },
    addSetBtn: { border: `1px dashed ${c.inputBorder}`, color: c.textSecondary },
    journalInput: { border: `1px solid ${c.cardBorder}`, background: c.cardBg, color: c.text },
    pastEntry: { background: c.cardBg, border: `1px solid ${c.cardBorder}` },
    courseCard: { background: c.cardBg, border: `1px solid ${c.cardBorder}` },
    courseStep: { borderTop: `1px solid ${c.cardBorder}` },
    forgeCard: { background: c.cardBg, border: `1px solid ${c.cardBorder}` },
    forgeMeter: { background: c.surface },
    trophyCard: { background: c.surface, border: `1px solid ${c.cardBorder}` },
    pomCard: { background: c.cardBg, border: `1px solid ${c.cardBorder}` },
    timerBtnSec: { border: `1px solid ${c.inputBorder}`, color: c.textSecondary },
    statCard: { background: c.cardBg, border: `1px solid ${c.cardBorder}` },
    bottomNav: {
      background: isLight
        ? `linear-gradient(180deg,rgba(250,250,249,0.8),${c.navBg})`
        : `linear-gradient(180deg,rgba(15,23,42,0.8),${c.navBg})`,
      borderTop: `1px solid ${c.surfaceBorder}`,
    },
    overlay: { background: isLight ? LIGHT_OVERLAY : "rgba(0,0,0,0.65)" },
    modalBox: {
      background: isLight ? LIGHT_MODAL_BG : `linear-gradient(145deg,${c.bgGrad1},${c.bgGrad2})`,
      border: isLight ? LIGHT_MODAL_BORDER : `1px solid ${c.surfaceBorder}`,
    },
    motCard: {
      background: isLight ? "linear-gradient(145deg,#FFFFFF,#F5F0FF)" : "linear-gradient(145deg,#151D35,#1C2545)",
      border: isLight ? "1px solid rgba(124,92,252,0.12)" : "1px solid rgba(124,92,252,0.18)",
      boxShadow: isLight ? "0 20px 60px rgba(124,92,252,0.08)" : "0 20px 60px rgba(124,92,252,0.12)",
    },
    bossCard: { background: isLight ? LIGHT_BOSS_BG : "linear-gradient(145deg,#111830,#1A0F2E)" },
  };
}

// No-op for backwards compat
export function updateThemeStyles() {}
