import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { TOKENS } from "../../styles/tokens";

// "New version ready" prompt. The service worker no longer takes over on its
// own (that reloaded the page mid-workout); the user picks the moment.
export default function UpdateBanner() {
  const [reg, setReg] = useState(() => (typeof window !== "undefined" ? window.__lifeosSwWaiting || null : null));
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onUpdate = (e) => setReg(e.detail?.registration || window.__lifeosSwWaiting || null);
    window.addEventListener("sw-update-available", onUpdate);
    return () => window.removeEventListener("sw-update-available", onUpdate);
  }, []);

  if (!reg || dismissed) return null;

  function update() {
    if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" }); // main.jsx reloads on controllerchange
    else window.location.reload();
  }

  return (
    <div role="status" style={styles.wrap}>
      <RefreshCw size={16} color={TOKENS.color.brand} />
      <span style={styles.text}>A new version of Life OS is ready.</span>
      <button onClick={update} style={styles.primary}>Update</button>
      <button onClick={() => setDismissed(true)} style={styles.later} aria-label="Update later">Later</button>
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed", left: 12, right: 12, bottom: 88, zIndex: 60,
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 14,
    background: TOKENS.color.surfaceElevated, border: `1px solid ${TOKENS.color.border}`,
    boxShadow: "0 8px 24px rgba(17,17,26,0.12)",
    maxWidth: 520, margin: "0 auto",
  },
  text: { flex: 1, fontSize: TOKENS.font.size.sm, color: TOKENS.color.text, fontWeight: 600 },
  primary: {
    minHeight: 36, padding: "0 14px", borderRadius: 10, border: "none",
    background: TOKENS.color.brand, color: "#fff", fontWeight: 800, cursor: "pointer",
  },
  later: {
    minHeight: 36, padding: "0 8px", border: "none", background: "transparent",
    color: TOKENS.color.textSecondary, fontWeight: 700, cursor: "pointer",
  },
};
