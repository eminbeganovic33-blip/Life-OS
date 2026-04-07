import { useState } from "react";
import { motion } from "framer-motion";
import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";
import { MOODS } from "../../data";
import { analyzeJournalSentiment } from "../../utils/intelligence";
import SmartInsights from "../SmartInsights";
import AIJournalInsight from "../AIJournalInsight";
import ChatJournal from "../ChatJournal";

export default function JournalView({ state, journalText, setJournalText, selectedMood, setSelectedMood, onSave, onSaveRaw }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;
  const day = state.currentDay;

  const [viewMode, setViewMode] = useState("chat"); // "chat" | "classic" | "history"

  const tabStyle = (active) => ({
    padding: "6px 14px",
    borderRadius: 20,
    border: "none",
    background: active ? "rgba(124,92,252,0.15)" : "transparent",
    color: active ? "#7C5CFC" : sub(0.4),
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div style={S.vc}>
      <div style={{ ...S.secTitle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>Day {day} Journal</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={tabStyle(viewMode === "chat")} onClick={() => setViewMode("chat")}>Chat</button>
          <button style={tabStyle(viewMode === "classic")} onClick={() => setViewMode("classic")}>Write</button>
          <button style={tabStyle(viewMode === "history")} onClick={() => setViewMode("history")}>History</button>
        </div>
      </div>

      {/* Mood selector — always visible */}
      <div style={{ padding: "0 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 8 }}>How are you feeling?</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {MOODS.map((m, i) => (
            <div
              key={i}
              onClick={() => setSelectedMood(i)}
              style={{
                ...S.moodItem,
                background: selectedMood === i ? "rgba(124,92,252,0.2)" : sub(0.03),
                border: selectedMood === i ? "1px solid #7C5CFC" : `1px solid ${sub(0.08)}`,
                transform: selectedMood === i ? "scale(1.08)" : "scale(1)",
              }}
            >
              <div style={{ fontSize: 22 }}>{m.emoji}</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {viewMode === "chat" && (
        <ChatJournal
          state={state}
          journalText={journalText}
          setJournalText={setJournalText}
          onSaveFull={(raw) => onSaveRaw && onSaveRaw(raw)}
        />
      )}

      {viewMode === "classic" && (
        <>
          <textarea
            style={S.journalInput}
            placeholder="What happened today? Write about your wins, struggles, or anything on your mind..."
            value={journalText || state.journal[day] || ""}
            onChange={(e) => setJournalText(e.target.value)}
            rows={6}
          />
          <button style={S.primaryBtn} onClick={onSave}>Save Entry</button>
          <AIJournalInsight entry={journalText || state.journal[day] || ""} state={state} />
          <SmartInsights sentiment={analyzeJournalSentiment(state)} />
        </>
      )}

      {viewMode === "history" && (
        <>
          <SmartInsights sentiment={analyzeJournalSentiment(state)} />
          {Object.keys(state.journal).length === 0 ? (
            <div style={{
              margin: "0 14px", padding: 20, borderRadius: 12, background: sub(0.02),
              textAlign: "center", fontSize: 12, color: colors.textSecondary, lineHeight: 1.6,
            }}>
              Your journal entries will appear here. Start writing to record your first entry.
            </div>
          ) : (
            Object.keys(state.journal)
              .sort((a, b) => b - a)
              .slice(0, 10)
              .map((d) => {
                let displayText = state.journal[d];
                // Try to extract user messages from chat format
                try {
                  const parsed = JSON.parse(displayText);
                  if (Array.isArray(parsed) && parsed[0]?.role) {
                    displayText = parsed
                      .filter((m) => m.role === "user")
                      .map((m) => m.text)
                      .join("\n\n");
                  }
                } catch {}
                return (
                  <div key={d} style={S.pastEntry}>
                    <div style={S.pastHead}>
                      <span>Day {d}</span>
                      {state.moods[d] != null && <span>{MOODS[state.moods[d]]?.emoji}</span>}
                    </div>
                    <div style={S.pastText}>{displayText}</div>
                  </div>
                );
              })
          )}
        </>
      )}
    </div>
  );
}
