import { useState } from "react";
import { Sparkles, Wand2, X } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import DojoPanel from "../panels/DojoPanel";
import EmbeddedPanelHost from "../shared/EmbeddedPanelHost";
import { isAIConfigured, chatWithCoach } from "../../utils/ai";

export default function TrainScreen({ state, save }) {
  const [genOpen, setGenOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  async function generate() {
    setError(null);
    setLoading(true);
    setPlan(null);
    try {
      const userMsg = `Generate a workout plan for: ${prompt}. Return 4-6 exercises with sets and reps. Format as a simple list with each exercise on its own line, e.g.:
1. Squats — 4 sets × 8 reps
2. Bench Press — 4 sets × 6 reps`;
      const reply = await chatWithCoach(userMsg, state);
      if (reply && typeof reply === "object" && reply.__aiError) {
        setError(reply.__aiError === "quota"
          ? "Rate limit hit. Try again in a few minutes."
          : "AI is offline. Check connection or try again later.");
      } else if (typeof reply === "string") {
        setPlan(reply);
      } else {
        setError("No response received. Try a different prompt.");
      }
    } catch (e) {
      setError(e?.message || "Couldn't generate a plan. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const aiOn = isAIConfigured();

  return (
    <div style={styles.screen}>
      {/* AI Workout Generator — hidden when no API key is configured.
          Clicking a card that opens to "AI key not configured" is a worse UX
          than just not showing the card. */}
      {aiOn && (!genOpen ? (
        <button onClick={() => setGenOpen(true)} style={styles.aiCard}>
          <div style={styles.aiIconWrap}>
            <Wand2 size={20} color="#fff" />
          </div>
          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
            <div style={styles.aiLabel}>AI WORKOUT GENERATOR</div>
            <div style={styles.aiText}>Describe it — AI writes your plan</div>
          </div>
          <Sparkles size={16} color="#7C5CFC" />
        </button>
      ) : (
        <div style={styles.aiOpen}>
          <div style={styles.aiOpenHeader}>
            <div style={styles.aiOpenTitle}>
              <Wand2 size={16} color="#7C5CFC" />
              <span>AI Workout Generator</span>
            </div>
            <button onClick={() => { setGenOpen(false); setPlan(null); setPrompt(""); }} style={styles.closeBtn} aria-label="Close">
              <X size={16} color={TOKENS.color.textTertiary} />
            </button>
          </div>
          {!isAIConfigured() && (
            <div style={styles.aiWarning}>
              AI key not configured. Set <code>VITE_GEMINI_API_KEY</code> in your env to enable.
            </div>
          )}
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 45-min push day, dumbbells only"
            style={styles.aiInput}
            disabled={loading || !isAIConfigured()}
          />
          <button
            onClick={generate}
            disabled={loading || !prompt.trim() || !isAIConfigured()}
            style={{
              ...styles.aiGen,
              opacity: (loading || !prompt.trim() || !isAIConfigured()) ? 0.5 : 1,
              cursor: (loading || !prompt.trim() || !isAIConfigured()) ? "default" : "pointer",
            }}
          >
            {loading ? "Generating..." : "Generate plan"}
          </button>
          {error && <div style={styles.aiError}>{error}</div>}
          {plan && (
            <div style={styles.aiPlan}>
              <div style={styles.aiPlanTitle}>Your plan</div>
              <pre style={styles.aiPlanText}>{plan}</pre>
            </div>
          )}
        </div>
      ))}

      {/* Embedded Dojo */}
      <EmbeddedPanelHost>
        <DojoPanel state={state} save={save} onClose={() => {}} />
      </EmbeddedPanelHost>
    </div>
  );
}

const styles = {
  screen: { padding: TOKENS.space[5], paddingBottom: 0 },
  aiCard: {
    display: "flex", alignItems: "center", gap: TOKENS.space[3],
    padding: `${TOKENS.space[4]}px ${TOKENS.space[5]}px`,
    background: "linear-gradient(135deg, rgba(124,92,252,0.08) 0%, rgba(236,72,153,0.04) 100%)",
    border: "1px solid rgba(124,92,252,0.15)",
    borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[3],
    cursor: "pointer", width: "100%",
  },
  aiIconWrap: {
    width: 36, height: 36, borderRadius: TOKENS.radius.md,
    background: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 6px 16px rgba(124,92,252,0.3)",
  },
  aiLabel: { fontSize: 10, fontWeight: 900, color: "#7C5CFC", letterSpacing: 0.8 },
  aiText: { fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.semibold, color: TOKENS.color.text, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  aiOpen: {
    padding: TOKENS.space[5],
    background: TOKENS.color.surface, borderRadius: TOKENS.radius.lg,
    marginBottom: TOKENS.space[3],
  },
  aiOpenHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: TOKENS.space[3] },
  aiOpenTitle: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold, color: TOKENS.color.text,
  },
  closeBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  aiWarning: {
    padding: `${TOKENS.space[2]}px ${TOKENS.space[3]}px`,
    background: "rgba(251,191,36,0.10)",
    borderRadius: TOKENS.radius.md,
    fontSize: TOKENS.font.size.xs,
    color: "#92400E",
    marginBottom: TOKENS.space[3],
  },
  aiInput: {
    width: "100%", padding: "12px 14px",
    border: `1px solid ${TOKENS.color.border}`,
    background: TOKENS.color.surfaceElevated,
    borderRadius: TOKENS.radius.md,
    fontSize: TOKENS.font.size.sm,
    fontFamily: "inherit", outline: "none",
    boxSizing: "border-box",
    marginBottom: TOKENS.space[3],
  },
  aiGen: {
    width: "100%", padding: "12px",
    background: TOKENS.color.text, color: "#fff",
    border: "none", borderRadius: TOKENS.radius.md,
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
  },
  aiError: {
    fontSize: TOKENS.font.size.xs, color: TOKENS.color.danger,
    marginTop: TOKENS.space[3],
  },
  aiPlan: {
    marginTop: TOKENS.space[4],
    padding: TOKENS.space[4],
    background: TOKENS.color.surfaceElevated,
    borderRadius: TOKENS.radius.md,
  },
  aiPlanTitle: {
    fontSize: 10, fontWeight: 900, color: TOKENS.color.textTertiary,
    letterSpacing: 0.8, marginBottom: TOKENS.space[2],
  },
  aiPlanText: {
    fontSize: TOKENS.font.size.sm, lineHeight: 1.6,
    color: TOKENS.color.text,
    whiteSpace: "pre-wrap",
    margin: 0,
    fontFamily: "inherit",
  },
};
