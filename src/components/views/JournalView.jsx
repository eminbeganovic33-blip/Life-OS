import { S } from "../../styles/theme";
import { MOODS } from "../../data";
import { analyzeJournalSentiment } from "../../utils/intelligence";
import SmartInsights from "../SmartInsights";
import AIJournalInsight from "../AIJournalInsight";

const emptyJournal = {
  margin: "0 14px",
  padding: 20,
  borderRadius: 12,
  background: "rgba(255,255,255,0.02)",
  textAlign: "center",
  fontSize: 12,
  opacity: 0.4,
  lineHeight: 1.6,
};

export default function JournalView({ state, journalText, setJournalText, selectedMood, setSelectedMood, onSave }) {
  const day = state.currentDay;
  return (
    <div style={S.vc}>
      <div style={S.secTitle}>Day {day} Journal</div>
      <div style={{ padding: "0 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 8 }}>How are you feeling?</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {MOODS.map((m, i) => (
            <div
              key={i}
              onClick={() => setSelectedMood(i)}
              style={{
                ...S.moodItem,
                background: selectedMood === i ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.03)",
                border: selectedMood === i ? "1px solid #7C5CFC" : "1px solid rgba(255,255,255,0.06)",
                transform: selectedMood === i ? "scale(1.08)" : "scale(1)",
              }}
            >
              <div style={{ fontSize: 22 }}>{m.emoji}</div>
              <div style={{ fontSize: 9, opacity: 0.5, marginTop: 1 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
      <textarea
        style={S.journalInput}
        placeholder="What happened today? Write about your wins, struggles, or anything on your mind..."
        value={journalText || state.journal[day] || ""}
        onChange={(e) => setJournalText(e.target.value)}
        rows={6}
      />
      <button style={S.primaryBtn} onClick={onSave}>Save Entry</button>

      {/* AI Journal Insights */}
      <AIJournalInsight entry={journalText || state.journal[day] || ""} state={state} />

      {/* Journal Sentiment Analysis */}
      <SmartInsights sentiment={analyzeJournalSentiment(state)} />

      <div style={{ ...S.secTitle, marginTop: 20 }}>Past Entries</div>
      {Object.keys(state.journal).length === 0 ? (
        <div style={emptyJournal}>
          Your journal entries will appear here. Start writing above to record your first entry.
        </div>
      ) : (
        Object.keys(state.journal)
          .sort((a, b) => b - a)
          .slice(0, 5)
          .map((d) => (
            <div key={d} style={S.pastEntry}>
              <div style={S.pastHead}>
                <span>Day {d}</span>
                {state.moods[d] != null && <span>{MOODS[state.moods[d]]?.emoji}</span>}
              </div>
              <div style={S.pastText}>{state.journal[d]}</div>
            </div>
          ))
      )}
    </div>
  );
}
