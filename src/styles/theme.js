export const DARK_COLORS = {
  bg: "#08080F",
  bgGrad1: "#08080F",
  bgGrad2: "#0D0D18",
  surface: "rgba(255,255,255,0.025)",
  surfaceBorder: "rgba(255,255,255,0.04)",
  text: "#E2E2EE",
  textSecondary: "rgba(255,255,255,0.4)",
  accent: "#7C5CFC",
  cardBg: "rgba(255,255,255,0.025)",
  cardBorder: "rgba(255,255,255,0.04)",
  navBg: "rgba(8,8,15,0.97)",
  inputBg: "rgba(255,255,255,0.03)",
  inputBorder: "rgba(255,255,255,0.08)",
};

export const LIGHT_COLORS = {
  bg: "#F5F5F7",
  bgGrad1: "#F0F0F5",
  bgGrad2: "#F5F5F7",
  surface: "#FFFFFF",
  surfaceBorder: "rgba(0,0,0,0.08)",
  text: "#1A1A2E",
  textSecondary: "rgba(0,0,0,0.5)",
  accent: "#7C5CFC",
  cardBg: "#FFFFFF",
  cardBorder: "rgba(0,0,0,0.06)",
  navBg: "rgba(245,245,247,0.95)",
  inputBg: "#F0F0F5",
  inputBorder: "rgba(0,0,0,0.1)",
};

// Light-theme versions for modal/overlay backgrounds
const LIGHT_MODAL_BG = "linear-gradient(145deg,#FFFFFF,#F0F0F5)";
const LIGHT_MODAL_BORDER = "1px solid rgba(0,0,0,0.08)";
const LIGHT_BOSS_BG = "linear-gradient(145deg,#F5F5FF,#EEEAF8)";
const LIGHT_OVERLAY = "rgba(0,0,0,0.35)";

export const S = {
  app: { width: "100%", maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: `linear-gradient(180deg,${DARK_COLORS.bgGrad1} 0%,${DARK_COLORS.bgGrad2} 50%,${DARK_COLORS.bgGrad1} 100%)`, fontFamily: "'SF Pro Display','Segoe UI',system-ui,sans-serif", color: DARK_COLORS.text, position: "relative", display: "flex", flexDirection: "column" },
  content: { flex: 1, overflowY: "auto", paddingBottom: 76 },
  vc: { paddingTop: 6, paddingBottom: 12 },

  // Loading
  loadScreen: { width: "100%", minHeight: "100vh", background: DARK_COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" },
  loadPulse: { fontSize: 48, animation: "pulse 1.4s ease-in-out infinite" },
  loadText: { marginTop: 14, fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#7C5CFC,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 1 },
  loadSub: { marginTop: 6, fontSize: 12, opacity: 0.3 },

  // Onboarding
  onboarding: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 28, textAlign: "center" },
  obTitle: { fontSize: 38, fontWeight: 900, background: "linear-gradient(135deg,#7C5CFC,#EC4899,#F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, letterSpacing: -1 },
  obSub: { fontSize: 14, opacity: 0.5, marginTop: 6, marginBottom: 24 },
  obGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20, width: "100%", maxWidth: 340 },
  obCard: { padding: 14, borderRadius: 14, background: DARK_COLORS.cardBg, border: `1px solid ${DARK_COLORS.cardBorder}`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  obChips: { display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 24 },
  obChip: { padding: "4px 12px", borderRadius: 16, border: "1px solid", fontSize: 12, fontWeight: 600, background: DARK_COLORS.inputBg },

  // Header
  headerCard: { margin: "12px 14px", padding: 18, borderRadius: 18, background: "linear-gradient(135deg,rgba(124,92,252,0.1),rgba(236,72,153,0.05))", border: "1px solid rgba(124,92,252,0.12)" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  dayLabel: { fontSize: 24, fontWeight: 900, letterSpacing: -0.5 },
  levelName: { fontSize: 12, color: "#7C5CFC", fontWeight: 700, marginTop: 1 },
  streakBadge: { display: "flex", alignItems: "center", gap: 4, background: "rgba(249,115,22,0.12)", padding: "5px 12px", borderRadius: 16, border: "1px solid rgba(249,115,22,0.15)" },
  streakNum: { fontSize: 16, fontWeight: 800, color: "#F97316" },
  pLabel: { display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.4, marginBottom: 3, marginTop: 8 },
  pBarOut: { height: 5, borderRadius: 3, background: DARK_COLORS.surface, overflow: "hidden" },
  pBarIn: { height: "100%", borderRadius: 3, transition: "width 0.5s ease" },

  // Quests
  secTitle: { fontSize: 15, fontWeight: 800, padding: "0 18px", marginTop: 18, marginBottom: 10, letterSpacing: -0.2 },
  qList: { display: "flex", flexDirection: "column", gap: 6, padding: "0 14px" },
  qCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, background: DARK_COLORS.cardBg, cursor: "pointer", border: `1px solid ${DARK_COLORS.cardBorder}` },
  qLeft: { display: "flex", alignItems: "center", gap: 10 },
  cb: { width: 20, height: 20, borderRadius: 6, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontWeight: 700, transition: "all 0.15s" },
  qText: { fontSize: 13, fontWeight: 500 },
  qCat: { fontSize: 10, opacity: 0.35, marginTop: 1 },
  qXp: { fontSize: 12, fontWeight: 700, flexShrink: 0 },
  dojoLink: { color: "#F97316", fontWeight: 600, cursor: "pointer", fontSize: 10 },
  subStreak: { margin: "10px 14px 0", padding: "10px 14px", borderRadius: 10, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 },
  xpPop: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 26, fontWeight: 800, color: "#FACC15", textShadow: "0 0 20px rgba(250,204,21,0.4)", animation: "fadeUp 1.2s ease forwards", pointerEvents: "none", zIndex: 999 },

  // Buttons
  primaryBtn: { display: "block", width: "calc(100% - 28px)", margin: "10px 14px 0", padding: "14px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7C5CFC,#6D28D9)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(124,92,252,0.25)", transition: "all 0.2s" },

  // Modals
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 },
  modalBox: { maxWidth: 380, width: "100%", padding: 24, borderRadius: 20, background: "linear-gradient(145deg,#111122,#161630)", border: "1px solid rgba(124,92,252,0.15)", maxHeight: "80vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalClose: { cursor: "pointer", opacity: 0.4, fontSize: 18, padding: 4 },
  motCard: { maxWidth: 340, width: "100%", padding: 28, borderRadius: 22, background: "linear-gradient(145deg,#12122A,#1A1A3E)", border: "1px solid rgba(124,92,252,0.18)", textAlign: "center", boxShadow: "0 20px 60px rgba(124,92,252,0.12)" },
  motBadge: { display: "inline-block", padding: "3px 14px", borderRadius: 16, background: "rgba(124,92,252,0.12)", color: "#7C5CFC", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 18 },
  motQuote: { fontSize: 17, fontWeight: 500, lineHeight: 1.6, fontStyle: "italic", marginBottom: 12 },
  motAuthor: { fontSize: 12, opacity: 0.35, marginBottom: 20 },
  motBtn: { padding: "11px 28px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#7C5CFC,#EC4899)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,92,252,0.25)" },

  // Boss
  bossCard: { maxWidth: 340, width: "100%", padding: 36, borderRadius: 24, background: "linear-gradient(145deg,#0F0F28,#1A0A2E)", border: "1px solid rgba(249,115,22,0.2)", textAlign: "center", position: "relative", overflow: "hidden" },
  bossGlow: { position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 60%)", animation: "pulse 3s ease infinite" },
  bossTitle: { fontSize: 22, fontWeight: 900, marginTop: 12, background: "linear-gradient(135deg,#F97316,#FACC15)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", position: "relative", zIndex: 2, letterSpacing: 1 },
  bossSub: { fontSize: 13, opacity: 0.5, marginTop: 8, marginBottom: 12, lineHeight: 1.5, position: "relative", zIndex: 2 },
  bossXp: { fontSize: 20, fontWeight: 800, color: "#FACC15", marginBottom: 16, position: "relative", zIndex: 2 },

  // Workout Modal
  exGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  exCard: { padding: 14, borderRadius: 12, background: DARK_COLORS.cardBg, border: `1px solid ${DARK_COLORS.cardBorder}`, textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  setInput: { flex: 2, padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK_COLORS.inputBorder}`, background: DARK_COLORS.inputBg, color: DARK_COLORS.text, fontSize: 14, textAlign: "center", outline: "none", fontFamily: "inherit", fontVariantNumeric: "tabular-nums" },
  addSetBtn: { width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${DARK_COLORS.inputBorder}`, background: "transparent", color: DARK_COLORS.textSecondary, fontSize: 12, cursor: "pointer", marginTop: 6 },

  // Journal
  journalInput: { width: "calc(100% - 28px)", margin: "0 14px", padding: 14, borderRadius: 12, border: `1px solid ${DARK_COLORS.cardBorder}`, background: DARK_COLORS.cardBg, color: DARK_COLORS.text, fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  moodItem: { display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 6px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s", minWidth: 48 },
  pastEntry: { margin: "0 14px 8px", padding: 12, borderRadius: 10, background: DARK_COLORS.cardBg, border: `1px solid ${DARK_COLORS.cardBorder}` },
  pastHead: { display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#7C5CFC", marginBottom: 4 },
  pastText: { fontSize: 12, opacity: 0.5, lineHeight: 1.5 },

  // Academy
  courseCard: { margin: "0 14px 10px", padding: 16, borderRadius: 14, background: DARK_COLORS.cardBg, border: `1px solid ${DARK_COLORS.cardBorder}` },
  courseHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  courseStep: { display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", cursor: "pointer", borderTop: `1px solid ${DARK_COLORS.cardBorder}` },

  // Forge
  forgeCard: { margin: "0 14px 10px", padding: 16, borderRadius: 14, background: DARK_COLORS.cardBg, border: `1px solid ${DARK_COLORS.cardBorder}` },
  forgeBtn: { padding: "6px 16px", borderRadius: 8, border: "1px solid", background: "transparent", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  forgeMeter: { height: 4, borderRadius: 2, background: DARK_COLORS.surface, overflow: "hidden", marginTop: 10 },
  forgeFill: { height: "100%", borderRadius: 2, transition: "width 0.5s", opacity: 0.6 },

  // Trophies
  trophyGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, padding: "0 14px" },
  trophyCard: { padding: 14, borderRadius: 12, background: DARK_COLORS.surface, border: `1px solid ${DARK_COLORS.cardBorder}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  trophyUnlocked: { background: "rgba(124,92,252,0.06)", border: "1px solid rgba(124,92,252,0.15)", boxShadow: "0 0 20px rgba(124,92,252,0.08)" },

  // Pomodoro
  pomCard: { margin: "0 14px", padding: 20, borderRadius: 16, background: DARK_COLORS.cardBg, border: `1px solid ${DARK_COLORS.cardBorder}`, display: "flex", flexDirection: "column", alignItems: "center" },
  timerText: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 32, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: 2 },
  timerBtn: { padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#7C5CFC,#6D28D9)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 12px rgba(124,92,252,0.2)" },
  timerBtnSec: { padding: "10px 24px", borderRadius: 10, border: `1px solid ${DARK_COLORS.inputBorder}`, background: "transparent", color: DARK_COLORS.textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer" },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, padding: "0 14px" },
  statCard: { padding: 12, borderRadius: 12, background: DARK_COLORS.cardBg, border: `1px solid ${DARK_COLORS.cardBorder}`, textAlign: "center" },
  statVal: { fontSize: 18, fontWeight: 800 },
  statLbl: { fontSize: 9, opacity: 0.35, marginTop: 2 },

  // Day Grid
  dayGrid: { display: "grid", gridTemplateColumns: "repeat(11,1fr)", gap: 3, padding: "0 14px" },
  dayDot: { aspectRatio: "1", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, transition: "all 0.15s" },

  // Bottom Nav
  bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, display: "flex", justifyContent: "space-around", alignItems: "center", padding: "8px 0 16px", background: `linear-gradient(180deg,rgba(8,8,15,0.8),${DARK_COLORS.navBg})`, backdropFilter: "blur(12px)", borderTop: `1px solid ${DARK_COLORS.surfaceBorder}`, zIndex: 100 },
  navItem: { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", position: "relative", padding: "3px 10px", transition: "color 0.15s" },
  navDot: { width: 3, height: 3, borderRadius: 2, background: "#7C5CFC", marginTop: 2 },
};

/**
 * Returns theme overrides for the given theme.
 * Components should use getThemedStyle(key) instead of S[key] for theme-aware styles.
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
        ? `linear-gradient(180deg,rgba(245,245,247,0.8),${c.navBg})`
        : `linear-gradient(180deg,rgba(8,8,15,0.8),${c.navBg})`,
      borderTop: `1px solid ${c.surfaceBorder}`,
    },
    overlay: { background: isLight ? LIGHT_OVERLAY : "rgba(0,0,0,0.75)" },
    modalBox: {
      background: isLight ? LIGHT_MODAL_BG : "linear-gradient(145deg,#111122,#161630)",
      border: isLight ? LIGHT_MODAL_BORDER : "1px solid rgba(124,92,252,0.15)",
    },
    motCard: {
      background: isLight ? "linear-gradient(145deg,#FFFFFF,#F5F0FF)" : "linear-gradient(145deg,#12122A,#1A1A3E)",
      border: isLight ? "1px solid rgba(124,92,252,0.12)" : "1px solid rgba(124,92,252,0.18)",
      boxShadow: isLight ? "0 20px 60px rgba(124,92,252,0.08)" : "0 20px 60px rgba(124,92,252,0.12)",
    },
    bossCard: { background: isLight ? LIGHT_BOSS_BG : "linear-gradient(145deg,#0F0F28,#1A0A2E)" },
  };
}

// No-op for backwards compat — theme is now applied via useTheme().themed()
export function updateThemeStyles() {}
