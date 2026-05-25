import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { isAIConfigured, chatWithCoach } from "../../utils/ai";

// Suggested first-prompts tailored to what the AI Coach actually knows.
function buildSuggestions(state) {
  const goal = state?.profile?.primaryGoal;
  const hasForge = Object.keys(state?.sobrietyDates || {}).length > 0;
  const base = ["How am I doing?", "What should I focus on today?"];
  const byGoal = {
    fitness:    ["Suggest a workout for today", "How's my training trending?"],
    discipline: ["Where am I slipping this week?", "Give me one habit to lock in"],
    quit:       ["Help me through a craving", "What's my best win this week?"],
    learning:   ["Recommend a course to start", "Summarise this week"],
    balance:    ["What's my weakest area?", "Suggest tomorrow's priority"],
  };
  const pool = [...base, ...(byGoal[goal] || [])];
  if (hasForge) pool.push("Send me a forge pep talk");
  // De-dupe + max 4
  return Array.from(new Set(pool)).slice(0, 4);
}

export default function AICoachWidget({ state }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAIConfigured()) return null;

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setHistory((h) => [...h, { from: "user", text: msg }]);
    setLoading(true);
    try {
      const reply = await chatWithCoach(msg, state);
      // chatWithCoach can return { __aiError: "quota" | "network" } instead of a string
      if (reply && typeof reply === "object" && reply.__aiError) {
        const msg = reply.__aiError === "quota"
          ? "I've hit my rate limit for now. Try again in a few minutes."
          : "I'm offline right now. Try again in a moment.";
        setHistory((h) => [...h, { from: "coach", text: msg }]);
      } else if (typeof reply === "string") {
        setHistory((h) => [...h, { from: "coach", text: reply }]);
      } else {
        setHistory((h) => [...h, { from: "coach", text: "Hmm, I didn't get a response. Try rephrasing." }]);
      }
    } catch (e) {
      setHistory((h) => [...h, { from: "coach", text: "I'm offline right now. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={styles.fab} aria-label="Open AI Coach">
        <Sparkles size={18} color="#fff" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              style={styles.sheet}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.header}>
                <div style={styles.headerLeft}>
                  <div style={styles.coachAvatar}>
                    <Sparkles size={16} color="#fff" />
                  </div>
                  <div>
                    <div style={styles.headerTitle}>AI Coach</div>
                    <div style={styles.headerSub}>Ask me anything about your day</div>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} style={styles.closeBtn} aria-label="Close">
                  <X size={18} color={TOKENS.color.textTertiary} />
                </button>
              </div>

              <div style={styles.messages}>
                {history.length === 0 && (
                  <div style={styles.emptyWrap}>
                    <div style={styles.empty}>
                      I know your goals, streak, mood, and what you've checked off today. Ask me anything.
                    </div>
                    <div style={styles.suggestRow}>
                      {buildSuggestions(state).map((s) => (
                        <button
                          key={s}
                          onClick={() => { setInput(s); }}
                          style={styles.suggestChip}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {history.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.msg,
                      alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                      background: m.from === "user"
                        ? TOKENS.color.text
                        : TOKENS.color.surface,
                      color: m.from === "user" ? "#fff" : TOKENS.color.text,
                    }}
                  >
                    {m.text}
                  </div>
                ))}
                {loading && (
                  <div style={{ ...styles.msg, background: TOKENS.color.surface, alignSelf: "flex-start" }}>
                    Thinking…
                  </div>
                )}
              </div>

              <div style={styles.inputRow}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  style={styles.input}
                  disabled={loading}
                />
                <button onClick={send} disabled={loading || !input.trim()} style={styles.sendBtn} aria-label="Send">
                  <Send size={16} color="#fff" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const styles = {
  fab: {
    position: "fixed", bottom: 84, right: 16,
    width: 52, height: 52, borderRadius: 26,
    background: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)",
    border: "none", cursor: "pointer",
    boxShadow: "0 12px 32px rgba(124,92,252,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 90,
  },
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
    zIndex: 300,
  },
  sheet: {
    width: "100%", maxWidth: 480,
    background: TOKENS.color.bg,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    display: "flex", flexDirection: "column",
    maxHeight: "80vh", minHeight: "60vh",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: TOKENS.space[5],
    borderBottom: `1px solid ${TOKENS.color.border}`,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: TOKENS.space[3] },
  coachAvatar: {
    width: 36, height: 36, borderRadius: 18,
    background: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.bold, color: TOKENS.color.text },
  headerSub: { fontSize: TOKENS.font.size.xs, color: TOKENS.color.textTertiary, marginTop: 1 },
  closeBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  messages: {
    flex: 1, overflowY: "auto",
    padding: TOKENS.space[4],
    display: "flex", flexDirection: "column", gap: TOKENS.space[2],
  },
  emptyWrap: {
    display: "flex", flexDirection: "column",
    gap: TOKENS.space[4],
    padding: `${TOKENS.space[5]}px ${TOKENS.space[4]}px`,
    alignItems: "center",
  },
  empty: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textTertiary,
    textAlign: "center", lineHeight: 1.6,
    maxWidth: 320,
  },
  suggestRow: {
    display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center",
  },
  suggestChip: {
    padding: "8px 14px", borderRadius: TOKENS.radius.full,
    background: "rgba(124,92,252,0.08)",
    border: "1px solid rgba(124,92,252,0.18)",
    color: "#7C5CFC",
    fontSize: 12, fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer", transition: TOKENS.transition.fast,
  },
  msg: {
    maxWidth: "78%", padding: `10px 14px`,
    borderRadius: 16, fontSize: TOKENS.font.size.sm,
    lineHeight: 1.5, whiteSpace: "pre-wrap",
  },
  inputRow: {
    display: "flex", gap: TOKENS.space[2],
    padding: TOKENS.space[4],
    borderTop: `1px solid ${TOKENS.color.border}`,
  },
  input: {
    flex: 1, padding: "10px 14px",
    border: `1px solid ${TOKENS.color.border}`,
    background: TOKENS.color.surface,
    borderRadius: TOKENS.radius.full,
    fontSize: TOKENS.font.size.sm,
    outline: "none", fontFamily: "inherit",
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    background: TOKENS.color.text,
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};
