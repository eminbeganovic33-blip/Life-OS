import { TOKENS } from "../../styles/tokens";
import { downloadJson } from "../../utils/backup";
import { Emoji } from "../shared/Emoji";

// Shown when saved data exists but can't be loaded. Nothing is written to the
// main storage key until the user picks "Start fresh" — the old behaviour was
// a silent fresh onboarding whose first save overwrote the real history.
export default function RecoveryScreen({ raw, message, onStartFresh }) {
  const day = new Date().toISOString().slice(0, 10);
  return (
    <div style={styles.page}>
      <div style={styles.badge}><Emoji e="🛟" size="1.1em" /></div>
      <h1 style={styles.title}>We couldn't open your saved data</h1>
      <p style={styles.sub}>
        Your history is still on this device and a recovery copy has been kept. Download it first —
        you can restore it later from Me → Import backup, or send it to us so we can fix the problem.
      </p>
      <div style={styles.btns}>
        <button style={styles.primary} onClick={() => downloadJson(raw, `life-os-recovery-${day}.json`)}>
          Download my data
        </button>
        <button style={styles.secondary} onClick={() => window.location.reload()}>Try again</button>
        <button
          style={styles.danger}
          onClick={() => {
            if (window.confirm("Start fresh? Your old data stays saved as a recovery copy (Me → Download recovered data).")) onStartFresh();
          }}
        >
          Start fresh
        </button>
      </div>
      {message && <pre style={styles.err}>{message}</pre>}
    </div>
  );
}

const btn = { minHeight: 44, padding: "0 18px", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" };
const styles = {
  page: {
    minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: 24, textAlign: "center", background: TOKENS.color.bg, color: TOKENS.color.text,
  },
  badge: { fontSize: 52, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 900, margin: "0 0 8px" },
  sub: { fontSize: 15, lineHeight: 1.5, color: TOKENS.color.textSecondary, maxWidth: 380, margin: 0 },
  btns: { display: "flex", flexDirection: "column", gap: 10, marginTop: 24, width: "100%", maxWidth: 320 },
  primary: { ...btn, border: "none", background: TOKENS.color.primary, boxShadow: TOKENS.shadow.press, color: "#fff" },
  secondary: { ...btn, border: `1px solid ${TOKENS.color.border}`, background: TOKENS.color.surface, color: TOKENS.color.text },
  danger: { ...btn, border: "none", background: "transparent", color: TOKENS.color.danger },
  err: { marginTop: 20, fontSize: 11, color: TOKENS.color.textTertiary, whiteSpace: "pre-wrap", maxWidth: 360 },
};
