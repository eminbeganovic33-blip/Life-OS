import { useState, useEffect, useRef } from "react";
import { isAIConfigured, getAICoachMessage, chatWithCoach } from "../utils/ai";
import { getQuestSuggestions } from "../utils/intelligence";

export default function AICoach({ state }) {
  const [expanded, setExpanded] = useState(false);
  const [coachMessage, setCoachMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const aiEnabled = isAIConfigured();

  // Fetch AI coaching message on mount/expand
  useEffect(() => {
    if (!expanded || !aiEnabled || coachMessage) return;
    let cancelled = false;
    setLoading(true);
    getAICoachMessage(state).then((msg) => {
      if (!cancelled) {
        setCoachMessage(msg);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [expanded, aiEnabled]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatOpen]);

  // Fallback: local intelligence suggestions
  const localSuggestions = getQuestSuggestions(state);
  const fallbackMessage = localSuggestions.length > 0
    ? `Focus area: ${localSuggestions[0].reason}. ${localSuggestions[0].text}.`
    : `Day ${state.currentDay} — keep building momentum. Every quest completed is progress.`;

  async function handleSendChat() {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    setChatLoading(true);

    const reply = await chatWithCoach(msg, state);
    setChatMessages((prev) => [
      ...prev,
      { role: "coach", text: reply || "I couldn't process that right now. Try again in a moment." },
    ]);
    setChatLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  }

  return (
    <div style={s.container}>
      {/* Header — always visible */}
      <div style={s.header} onClick={() => setExpanded(!expanded)}>
        <div style={s.headerLeft}>
          <span style={s.sparkle}>&#10024;</span>
          <span style={s.headerTitle}>
            {aiEnabled ? "AI Coach" : "Smart Coach"}
          </span>
          {aiEnabled && <span style={s.aiBadge}>AI</span>}
        </div>
        <span style={s.arrow}>{expanded ? "\u25BE" : "\u25B8"}</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={s.body}>
          {/* Coach message */}
          <div style={s.messageCard}>
            {loading ? (
              <div style={s.loadingRow}>
                <span style={s.spinner} />
                <span style={s.loadingText}>Coach is thinking...</span>
              </div>
            ) : (
              <div style={s.messageText}>
                {aiEnabled && coachMessage ? coachMessage : fallbackMessage}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={s.actions}>
            {aiEnabled && (
              <button
                style={s.actionBtn}
                onClick={() => setChatOpen(!chatOpen)}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,92,252,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,92,252,0.08)"; }}
              >
                {chatOpen ? "Close Chat" : "Ask Coach"}
              </button>
            )}
            {aiEnabled && !coachMessage && !loading && (
              <button
                style={s.actionBtn}
                onClick={() => {
                  setCoachMessage(null);
                  setLoading(true);
                  getAICoachMessage(state).then((msg) => {
                    setCoachMessage(msg);
                    setLoading(false);
                  });
                }}
              >
                Refresh
              </button>
            )}
          </div>

          {/* Chat interface */}
          {chatOpen && aiEnabled && (
            <div style={s.chatContainer}>
              <div style={s.chatMessages}>
                {chatMessages.length === 0 && (
                  <div style={s.chatEmpty}>
                    Ask me anything about your habits, progress, or how to improve.
                  </div>
                )}
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      ...s.chatBubble,
                      ...(m.role === "user" ? s.chatUser : s.chatCoach),
                    }}
                  >
                    {m.text}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ ...s.chatBubble, ...s.chatCoach }}>
                    <span style={s.spinner} />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={s.chatInputRow}>
                <input
                  ref={inputRef}
                  style={s.chatInput}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your coach..."
                  disabled={chatLoading}
                />
                <button
                  style={{
                    ...s.sendBtn,
                    opacity: chatInput.trim() && !chatLoading ? 1 : 0.4,
                  }}
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || chatLoading}
                >
                  &#10148;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  container: {
    margin: "10px 14px 0",
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(124,92,252,0.06), rgba(236,72,153,0.03))",
    border: "1px solid rgba(124,92,252,0.12)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    cursor: "pointer",
    userSelect: "none",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sparkle: {
    fontSize: 16,
    lineHeight: 1,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#E2E2EE",
  },
  aiBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 4,
    background: "rgba(124,92,252,0.2)",
    color: "#7C5CFC",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  arrow: {
    fontSize: 12,
    color: "rgba(226,226,238,0.45)",
  },
  body: {
    padding: "0 14px 14px",
  },
  messageCard: {
    padding: "12px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    marginBottom: 10,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "rgba(226,226,238,0.85)",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "4px 0",
  },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(124,92,252,0.2)",
    borderTopColor: "#7C5CFC",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
  },
  loadingText: {
    fontSize: 12,
    color: "rgba(226,226,238,0.5)",
    fontStyle: "italic",
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  actionBtn: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid rgba(124,92,252,0.2)",
    background: "rgba(124,92,252,0.08)",
    color: "#7C5CFC",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  chatContainer: {
    marginTop: 10,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
  chatMessages: {
    maxHeight: 220,
    overflowY: "auto",
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  chatEmpty: {
    fontSize: 12,
    color: "rgba(226,226,238,0.35)",
    textAlign: "center",
    padding: "12px 0",
    fontStyle: "italic",
  },
  chatBubble: {
    padding: "8px 12px",
    borderRadius: 10,
    fontSize: 12,
    lineHeight: 1.5,
    maxWidth: "85%",
    wordBreak: "break-word",
  },
  chatUser: {
    background: "rgba(124,92,252,0.15)",
    color: "#E2E2EE",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  chatCoach: {
    background: "rgba(255,255,255,0.05)",
    color: "rgba(226,226,238,0.85)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  chatInputRow: {
    display: "flex",
    gap: 8,
    padding: "8px 10px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
  },
  chatInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#E2E2EE",
    fontSize: 12,
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};
