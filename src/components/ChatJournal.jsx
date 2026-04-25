import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOKENS } from "../styles/theme";
import { useTheme } from "../hooks/useTheme";
import { chatJournal, getJournalStarter, isAIConfigured, AI_ERR_QUOTA, AI_ERR_NETWORK } from "../utils/ai";
import { Send, Sparkles } from "lucide-react";

const T = TOKENS;

// Local fallback starters when AI is not configured
const FALLBACK_STARTERS = [
  "What's one thing that went well today, even if it was small?",
  "How are you feeling right now, honestly? No filter needed.",
  "What's been on your mind the most today?",
  "Is there anything you're proud of from today?",
  "What challenged you today, and how did you handle it?",
  "If today had a theme, what would it be?",
];

// Follow-up prompts that feel coach-like even without AI
const FALLBACK_FOLLOW_UPS = [
  "That's honest. What do you think is underneath that?",
  "Keep going — what else is on your mind right now?",
  "How does that sit with you when you say it out loud?",
  "What would you tell a close friend who shared the same thing?",
  "What's one small thing you could do tomorrow based on what you just wrote?",
  "Is this something that's been building for a while, or did it surface today?",
  "What would change if you let yourself fully accept that?",
  "What's the part of this you haven't fully said yet?",
];

const MOODS_LABELS = ["Rough", "Low", "Neutral", "Good", "Great", "Peak"];

function getContextualStarter(state) {
  const day = state.currentDay;
  const yesterday = day - 1;
  const yMood = state.moods?.[yesterday];
  const yEntry = (() => {
    const raw = state.journal?.[yesterday];
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed[0]?.role) {
        const texts = parsed.filter((m) => m.role === "user").map((m) => m.text);
        return texts.join(" ").slice(0, 120);
      }
    } catch {}
    return typeof raw === "string" ? raw.slice(0, 120) : null;
  })();

  // Build an opener that references yesterday
  if (day === 1) {
    return "Welcome. This is your space — no rules, no judgement. What's on your mind today?";
  }
  if (yMood != null && yEntry) {
    const moodLabel = MOODS_LABELS[yMood] || "okay";
    return `Yesterday you felt ${moodLabel.toLowerCase()} and wrote: "${yEntry.trim()}…"\n\nHow are you carrying that into today?`;
  }
  if (yMood != null) {
    const moodLabel = MOODS_LABELS[yMood] || "okay";
    return `Yesterday you marked your mood as ${moodLabel.toLowerCase()}. How are you doing today compared to that?`;
  }
  if (yEntry) {
    return `Yesterday you wrote: "${yEntry.trim()}…"\n\nWhat's shifted since then?`;
  }
  return FALLBACK_STARTERS[(day - 1) % FALLBACK_STARTERS.length];
}

function getFallbackStarter(day) {
  return FALLBACK_STARTERS[(day - 1) % FALLBACK_STARTERS.length];
}

export default function ChatJournal({ state, journalText, setJournalText, onSaveFull }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const s = getStyles(isDark, colors);

  const day = state.currentDay;
  const existingEntry = state.journal?.[day];

  // Chat messages: { role: "user" | "assistant", text: string }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starterLoading, setStarterLoading] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load conversation from existing journal entry or start fresh
  useEffect(() => {
    if (existingEntry) {
      // If there's an existing entry, try to parse it as conversation
      try {
        const parsed = JSON.parse(existingEntry);
        if (Array.isArray(parsed) && parsed[0]?.role) {
          setMessages(parsed);
          setStarterLoading(false);
          return;
        }
      } catch {
        // Not a conversation format — it's a plain text entry from before
        // Show it as a user message
        setMessages([
          { role: "assistant", text: "Here's what you wrote earlier today:" },
          { role: "user", text: existingEntry },
        ]);
        setStarterLoading(false);
        return;
      }
    }

    // Fresh day — C5: use contextual starter that references yesterday's mood/entry
    const contextualStarter = getContextualStarter(state);
    let cancelled = false;
    if (isAIConfigured()) {
      getJournalStarter(state).then((starter) => {
        if (cancelled) return;
        const isErr = starter === AI_ERR_QUOTA || starter === AI_ERR_NETWORK;
        const text = (starter && !isErr) ? starter : contextualStarter;
        setMessages([{ role: "assistant", text }]);
        setStarterLoading(false);
      });
    } else {
      setMessages([{ role: "assistant", text: contextualStarter }]);
      setStarterLoading(false);
    }
    return () => { cancelled = true; };
  }, [day]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Persist conversation to journal state on every change
  useEffect(() => {
    if (messages.length > 0) {
      const userMessages = messages.filter((m) => m.role === "user").map((m) => m.text);
      // Store full conversation as JSON, but provide plain text for journalText (for sentiment analysis)
      setJournalText(userMessages.join("\n\n"));
      // Save conversation format
      onSaveFull(JSON.stringify(messages));
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    if (isAIConfigured()) {
      const reply = await chatJournal(newMessages, state);
      if (reply === AI_ERR_QUOTA) {
        setMessages([...newMessages, { role: "assistant", text: "The AI coach is on a short cooldown — daily quota reached. Keep writing, your entries are saved. Try again in a few hours." }]);
      } else if (reply === AI_ERR_NETWORK || !reply) {
        setMessages([...newMessages, { role: "assistant", text: "Couldn't reach the AI right now — check your connection. Your writing is saved, keep going." }]);
      } else {
        setMessages([...newMessages, { role: "assistant", text: reply }]);
      }
    } else {
      const userCount = newMessages.filter((m) => m.role === "user").length;
      const followUp = FALLBACK_FOLLOW_UPS[(userCount - 1) % FALLBACK_FOLLOW_UPS.length];
      setMessages([...newMessages, { role: "assistant", text: followUp }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const userMsgCount = messages.filter((m) => m.role === "user").length;

  return (
    <div style={s.wrapper}>
      {/* Chat area */}
      <div ref={scrollRef} style={s.chatArea}>
        <AnimatePresence initial={false}>
          {starterLoading ? (
            <motion.div
              key="starter-loading"
              style={s.typingRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={s.avatarDot}><Sparkles size={12} color="#fff" /></div>
              <div style={s.typingBubble}>
                <span style={s.typingDot} />
                <span style={{ ...s.typingDot, animationDelay: "0.15s" }} />
                <span style={{ ...s.typingDot, animationDelay: "0.3s" }} />
              </div>
            </motion.div>
          ) : (
            messages.map((m, i) => (
              <motion.div
                key={i}
                style={m.role === "user" ? s.userRow : s.assistantRow}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {m.role === "assistant" && <div style={s.avatarDot}>&#10024;</div>}
                <div style={m.role === "user" ? s.userBubble : s.assistantBubble}>
                  {m.text}
                </div>
              </motion.div>
            ))
          )}

          {loading && (
            <motion.div
              key="typing"
              style={s.typingRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={s.avatarDot}><Sparkles size={12} color="#fff" /></div>
              <div style={s.typingBubble}>
                <span style={s.typingDot} />
                <span style={{ ...s.typingDot, animationDelay: "0.15s" }} />
                <span style={{ ...s.typingDot, animationDelay: "0.3s" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div style={s.inputArea}>
        <textarea
          ref={inputRef}
          style={s.input}
          placeholder="Write your thoughts..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <motion.button
          style={{
            ...s.sendBtn,
            opacity: input.trim() ? 1 : 0.4,
          }}
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Send size={16} />
        </motion.button>
      </div>

      {/* Subtle word count */}
      {userMsgCount > 0 && (
        <div style={s.meta}>
          {userMsgCount} message{userMsgCount !== 1 ? "s" : ""} &middot; Day {day}
        </div>
      )}
    </div>
  );
}

function getStyles(isDark, colors) {
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;

  return {
    wrapper: {
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 260px)",
      minHeight: 300,
      margin: "0 -16px",
    },
    chatArea: {
      flex: 1,
      overflowY: "auto",
      padding: "12px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      WebkitOverflowScrolling: "touch",
    },
    assistantRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      maxWidth: "88%",
    },
    userRow: {
      display: "flex",
      justifyContent: "flex-end",
      maxWidth: "88%",
      alignSelf: "flex-end",
    },
    avatarDot: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      flexShrink: 0,
      marginTop: 2,
    },
    assistantBubble: {
      padding: "10px 14px",
      borderRadius: "4px 16px 16px 16px",
      background: sub(0.04),
      border: `1px solid ${sub(0.06)}`,
      fontSize: T.font.sm,
      lineHeight: 1.6,
      color: isDark ? "#E2E8F0" : "#1E293B",
    },
    userBubble: {
      padding: "10px 14px",
      borderRadius: "16px 4px 16px 16px",
      background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
      color: "#fff",
      fontSize: T.font.sm,
      lineHeight: 1.6,
    },
    typingRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
    },
    typingBubble: {
      padding: "12px 16px",
      borderRadius: "4px 16px 16px 16px",
      background: sub(0.04),
      border: `1px solid ${sub(0.06)}`,
      display: "flex",
      gap: 4,
      alignItems: "center",
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "#7C5CFC",
      opacity: 0.5,
      animation: "pulse 1s ease-in-out infinite",
      display: "inline-block",
    },
    inputArea: {
      display: "flex",
      gap: 8,
      padding: "12px 16px",
      borderTop: `1px solid ${sub(0.08)}`,
      background: isDark ? "rgba(15,23,42,0.8)" : "rgba(250,250,249,0.8)",
      backdropFilter: "blur(12px)",
      alignItems: "flex-end",
    },
    input: {
      flex: 1,
      padding: "10px 14px",
      borderRadius: T.radii.lg,
      border: `1px solid ${sub(0.15)}`,
      background: isDark ? "rgba(30,41,59,0.8)" : "rgba(241,245,249,0.9)",
      color: isDark ? "#E2E8F0" : "#1E293B",
      fontSize: T.font.sm,
      lineHeight: 1.5,
      resize: "none",
      outline: "none",
      fontFamily: "inherit",
      maxHeight: 120,
    },
    sendBtn: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      border: "none",
      background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
      color: "#fff",
      fontSize: 16,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(124,92,252,0.3)",
    },
    meta: {
      padding: "6px 16px",
      fontSize: 11,
      color: sub(0.3),
      textAlign: "center",
    },
  };
}
