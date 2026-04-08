import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { MOODS } from "../../data";
import { analyzeJournalSentiment } from "../../utils/intelligence";
import SmartInsights from "../SmartInsights";
import AIJournalInsight from "../AIJournalInsight";
import ChatJournal from "../ChatJournal";
import { MessageCircle, PenLine, Clock, BookOpen, Search, Calendar, Save } from "lucide-react";

export default function JournalView({ state, journalText, setJournalText, selectedMood, setSelectedMood, onSave, onSaveRaw }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;
  const day = state.currentDay;

  const [viewMode, setViewMode] = useState("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Parse all journal entries for history
  const journalEntries = useMemo(() => {
    return Object.keys(state.journal)
      .sort((a, b) => b - a)
      .map((d) => {
        let displayText = state.journal[d];
        let isChat = false;
        try {
          const parsed = JSON.parse(displayText);
          if (Array.isArray(parsed) && parsed[0]?.role) {
            isChat = true;
            displayText = parsed
              .filter((m) => m.role === "user")
              .map((m) => m.text)
              .join("\n\n");
          }
        } catch {}
        return {
          day: Number(d),
          text: displayText || "",
          mood: state.moods[d],
          isChat,
        };
      });
  }, [state.journal, state.moods]);

  // Filtered entries for search
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return journalEntries;
    const q = searchQuery.toLowerCase();
    return journalEntries.filter(
      (e) => e.text.toLowerCase().includes(q) || `day ${e.day}`.includes(q)
    );
  }, [journalEntries, searchQuery]);

  const totalEntries = journalEntries.length;
  const entriesWithMood = journalEntries.filter((e) => e.mood != null).length;

  function handleSave() {
    onSave();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  }

  const tabs = [
    { id: "chat", label: "Chat", Icon: MessageCircle },
    { id: "classic", label: "Write", Icon: PenLine },
    { id: "history", label: "History", Icon: Clock },
  ];

  return (
    <div style={S.vc}>
      {/* Header */}
      <div style={headerRow}>
        <BookOpen size={20} color="#7C5CFC" strokeWidth={2} />
        <div style={{ flex: 1 }}>
          <div style={headerTitle}>Journal</div>
          <div style={headerSub}>Day {day} · {totalEntries} {totalEntries === 1 ? "entry" : "entries"}</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={tabRow}>
        {tabs.map((t) => {
          const active = viewMode === t.id;
          return (
            <button
              key={t.id}
              style={{
                ...tabBtn,
                background: active ? "rgba(124,92,252,0.12)" : "transparent",
                color: active ? "#7C5CFC" : sub(0.4),
                border: active ? "1px solid rgba(124,92,252,0.2)" : "1px solid transparent",
              }}
              onClick={() => setViewMode(t.id)}
            >
              <t.Icon size={13} strokeWidth={active ? 2 : 1.5} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mood selector */}
      <div style={moodSection}>
        <div style={moodLabel}>How are you feeling?</div>
        <div style={moodGrid}>
          {MOODS.map((m, i) => {
            const active = selectedMood === i;
            return (
              <motion.div
                key={i}
                onClick={() => setSelectedMood(i)}
                style={{
                  ...moodItem,
                  background: active ? "rgba(124,92,252,0.15)" : sub(0.03),
                  border: active ? "1px solid rgba(124,92,252,0.3)" : `1px solid ${sub(0.06)}`,
                  boxShadow: active ? "0 2px 12px rgba(124,92,252,0.15)" : "none",
                }}
                whileTap={{ scale: 0.92 }}
              >
                <div style={{ fontSize: 22 }}>{m.emoji}</div>
                <div style={{ fontSize: 10, opacity: active ? 0.8 : 0.4, fontWeight: active ? 600 : 400, marginTop: 2 }}>{m.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "chat" && (
            <ChatJournal
              state={state}
              journalText={journalText}
              setJournalText={setJournalText}
              onSaveFull={(raw) => onSaveRaw && onSaveRaw(raw)}
            />
          )}

          {viewMode === "classic" && (
            <div style={classicSection}>
              <textarea
                style={textArea}
                placeholder="What happened today? Write about your wins, struggles, or anything on your mind..."
                value={journalText || (() => {
                  const raw = state.journal[day];
                  if (!raw) return "";
                  try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed[0]?.role) {
                      return parsed.filter(m => m.role === "user").map(m => m.text).join("\n\n");
                    }
                  } catch {}
                  return raw;
                })()}
                onChange={(e) => setJournalText(e.target.value)}
                rows={8}
              />
              <div style={classicFooter}>
                <div style={charCount}>
                  {(journalText || "").length} chars
                </div>
                <motion.button
                  style={saveBtn}
                  onClick={handleSave}
                  whileTap={{ scale: 0.96 }}
                >
                  <Save size={14} />
                  <span>{savedFeedback ? "Saved!" : "Save Entry"}</span>
                </motion.button>
              </div>
              <AIJournalInsight entry={journalText || state.journal[day] || ""} state={state} />
              <SmartInsights sentiment={analyzeJournalSentiment(state)} />
            </div>
          )}

          {viewMode === "history" && (
            <div style={historySection}>
              {/* Smart Insights at top */}
              <SmartInsights sentiment={analyzeJournalSentiment(state)} />

              {/* Summary stats */}
              <div style={historyStats}>
                <div style={historyStat}>
                  <div style={historyStatVal}>{totalEntries}</div>
                  <div style={historyStatLabel}>Entries</div>
                </div>
                <div style={historyStat}>
                  <div style={historyStatVal}>{entriesWithMood}</div>
                  <div style={historyStatLabel}>Moods</div>
                </div>
                <div style={historyStat}>
                  <div style={historyStatVal}>{journalEntries.filter((e) => e.isChat).length}</div>
                  <div style={historyStatLabel}>Chats</div>
                </div>
              </div>

              {/* Search */}
              {totalEntries > 3 && (
                <div style={searchContainer}>
                  <Search size={14} color={sub(0.3)} style={{ flexShrink: 0 }} />
                  <input
                    style={searchInput}
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {/* Entries */}
              {filteredEntries.length === 0 ? (
                <div style={emptyState}>
                  {searchQuery ? (
                    <>
                      <Search size={20} color={sub(0.15)} strokeWidth={1.5} />
                      <div style={{ marginTop: 8 }}>No entries match "{searchQuery}"</div>
                    </>
                  ) : (
                    <>
                      <BookOpen size={24} color={sub(0.15)} strokeWidth={1.5} />
                      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600 }}>No entries yet</div>
                      <div style={{ marginTop: 4, fontSize: 12, opacity: 0.4 }}>
                        Start writing to record your first journal entry.
                      </div>
                    </>
                  )}
                </div>
              ) : (
                filteredEntries.slice(0, 20).map((entry, i) => (
                  <motion.div
                    key={entry.day}
                    style={entryCard}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div style={entryHeader}>
                      <div style={entryDayBadge}>
                        <Calendar size={10} color="#7C5CFC" />
                        <span>Day {entry.day}</span>
                      </div>
                      <div style={entryMeta}>
                        {entry.isChat && (
                          <span style={chatBadge}>
                            <MessageCircle size={9} />
                            Chat
                          </span>
                        )}
                        {entry.mood != null && (
                          <span style={{ fontSize: 16 }}>{MOODS[entry.mood]?.emoji}</span>
                        )}
                      </div>
                    </div>
                    <div style={entryText}>
                      {entry.text.length > 200 ? entry.text.slice(0, 200) + "..." : entry.text || "No text recorded"}
                    </div>
                  </motion.div>
                ))
              )}

              {filteredEntries.length > 20 && (
                <div style={{ textAlign: "center", padding: 12, fontSize: 11, opacity: 0.3 }}>
                  Showing 20 of {filteredEntries.length} entries
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Styles ──

const headerRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "6px 16px 0",
};
const headerTitle = { fontSize: 18, fontWeight: 800, letterSpacing: -0.3 };
const headerSub = { fontSize: 11, opacity: 0.35, marginTop: 1, fontWeight: 500 };

const tabRow = {
  display: "flex",
  gap: 6,
  padding: "10px 14px 0",
};
const tabBtn = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  padding: "8px 0",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
};

const moodSection = { padding: "12px 16px 6px" };
const moodLabel = { fontSize: 11, opacity: 0.35, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 };
const moodGrid = { display: "flex", gap: 6, justifyContent: "center" };
const moodItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "6px 8px",
  borderRadius: 12,
  cursor: "pointer",
  transition: "all 0.15s",
  minWidth: 50,
};

const classicSection = { padding: "0 14px" };
const textArea = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.03)",
  color: "inherit",
  fontSize: 13,
  lineHeight: 1.7,
  resize: "vertical",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  minHeight: 160,
};
const classicFooter = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 8,
  marginBottom: 4,
};
const charCount = { fontSize: 11, opacity: 0.25, fontVariantNumeric: "tabular-nums" };
const saveBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(124,92,252,0.2)",
};

const historySection = { padding: "0 0" };
const historyStats = {
  display: "flex",
  gap: 8,
  padding: "8px 14px",
};
const historyStat = {
  flex: 1,
  padding: "10px 8px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  textAlign: "center",
};
const historyStatVal = { fontSize: 18, fontWeight: 800 };
const historyStatLabel = { fontSize: 10, opacity: 0.3, marginTop: 2, fontWeight: 500 };

const searchContainer = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "6px 14px 10px",
  padding: "8px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};
const searchInput = {
  flex: 1,
  background: "none",
  border: "none",
  outline: "none",
  color: "inherit",
  fontSize: 13,
  fontFamily: "inherit",
};

const emptyState = {
  margin: "12px 14px",
  padding: "32px 20px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.05)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "rgba(255,255,255,0.4)",
  fontSize: 12,
  lineHeight: 1.6,
};

const entryCard = {
  margin: "0 14px 8px",
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};
const entryHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};
const entryDayBadge = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
  fontWeight: 700,
  color: "#7C5CFC",
};
const entryMeta = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};
const chatBadge = {
  display: "flex",
  alignItems: "center",
  gap: 3,
  fontSize: 10,
  fontWeight: 600,
  padding: "2px 7px",
  borderRadius: 6,
  background: "rgba(124,92,252,0.08)",
  color: "rgba(124,92,252,0.7)",
};
const entryText = {
  fontSize: 12,
  lineHeight: 1.7,
  opacity: 0.55,
  whiteSpace: "pre-wrap",
};
