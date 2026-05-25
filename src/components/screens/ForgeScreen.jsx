import { Flame, Info } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import ForgePanel from "../panels/ForgePanel";
import EmbeddedPanelHost from "../shared/EmbeddedPanelHost";

export default function ForgeScreen({ state, save }) {
  const hardMode = !!state.hardMode;

  function toggleHardMode() {
    if (!hardMode) {
      // Confirm before enabling
      if (!window.confirm(
        "Enable Hard Mode?\n\n" +
        "When enabled, missing a day will reset your streak immediately — no freeze protection. " +
        "Only enable this if you want maximum accountability."
      )) return;
    }
    save({ ...state, hardMode: !hardMode });
  }

  return (
    <div style={styles.screen}>
      {/* Hard Mode toggle */}
      <button onClick={toggleHardMode} style={{
        ...styles.hardModeRow,
        background: hardMode
          ? "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(220,38,38,0.04) 100%)"
          : TOKENS.color.surface,
        border: hardMode ? "1px solid rgba(239,68,68,0.25)" : "1px solid transparent",
      }}>
        <Flame size={18} color={hardMode ? "#EF4444" : TOKENS.color.textTertiary} />
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ ...styles.hardModeLabel, color: hardMode ? "#EF4444" : TOKENS.color.text }}>
            Hard Mode {hardMode ? "ON" : "OFF"}
          </div>
          <div style={styles.hardModeSub}>
            {hardMode
              ? "Streak resets on miss. No freeze protection. Maximum accountability."
              : "Off — streak freezes auto-protect missed days."}
          </div>
        </div>
        <div style={{
          ...styles.toggle,
          background: hardMode ? "#EF4444" : TOKENS.color.border,
        }}>
          <div style={{
            ...styles.toggleKnob,
            transform: hardMode ? "translateX(18px)" : "translateX(0)",
          }} />
        </div>
      </button>

      {/* Embedded Forge */}
      <EmbeddedPanelHost>
        <ForgePanel state={state} save={save} onClose={() => {}} />
      </EmbeddedPanelHost>
    </div>
  );
}

const styles = {
  screen: { padding: TOKENS.space[5], paddingBottom: 0 },
  hardModeRow: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    borderRadius: TOKENS.radius.lg,
    cursor: "pointer", width: "100%",
    marginBottom: TOKENS.space[3],
    transition: TOKENS.transition.fast,
  },
  hardModeLabel: { fontSize: TOKENS.font.size.sm, fontWeight: 900, letterSpacing: 0.4 },
  hardModeSub: { fontSize: TOKENS.font.size.xs, color: TOKENS.color.textSecondary, marginTop: 2, lineHeight: 1.4 },
  toggle: {
    width: 40, height: 22, borderRadius: 11,
    position: "relative",
    transition: "background 0.2s ease",
    flexShrink: 0,
    padding: 2,
  },
  toggleKnob: {
    width: 18, height: 18, borderRadius: 9,
    background: "#fff",
    transition: "transform 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  },
};
