import { useState, useEffect } from "react";
import { isAIConfigured, analyzeJournalEntryAI, getAIJournalPrompt } from "../utils/ai";
import { analyzeJournalSentiment } from "../utils/intelligence";

const SENTIMENT_EMOJI = {
  positive: "\uD83D\uDE0A",
  negative: "\uD83D\uDE14",
  neutral: "\uD83D\uDE10",
};

export default function AIJournalInsight({ entry, state }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const aiEnabled = isAIConfigured();
  const hasEntry = entry && entry.trim().length >= 10;

  // Analyze entry when it changes (debounced by entry being saved)
  useEffect(() => {
    if (!hasEntry || !aiEnabled) {
      setAnalysis(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    analyzeJournalEntryAI(entry, state).then((result) => {
      if (!cancelled) {
        setAnalysis(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [entry, aiEnabled]);

  // Fallback to local analysis
  const localAnalysis = analyzeJournalSentiment(state);
  const hasLocalInsights = localAnalysis && localAnalysis.insights && localAnalysis.insights.length > 0;

  async function handleGeneratePrompt() {
    if (!aiEnabled || promptLoading) return;
    setPromptLoading(true);
    const result = await getAIJournalPrompt(state);
    setPrompt(result || "What is one thing you learned about yourself today?");
    setPromptLoading(false);
  }

  // Don't render if nothing to show
  if (!aiEnabled && !hasLocalInsights && !hasEntry) return null;

  return (
    <div style={s.container}>
      <div style={s.header} onClick={() => setExpanded(!expanded)}>
        <div style={s.headerLeft}>
          <span style={s.icon}>&#10024;</span>
          <span style={s.title}>
            {aiEnabled ? "AI Journal Insights" : "Journal Insights"}
          </span>
          {aiEnabled && <span style={s.aiBadge}>AI</span>}
        </div>
        <span style={s.arrow}>{expanded ? "\u25BE" : "\u25B8"}</span>
      </div>

      {expanded && (
        <div style={s.body}>
          {/* AI Analysis of current entry */}
          {aiEnabled && hasEntry && (
            <div style={s.analysisCard}>
              {loading ? (
                <div style={s.loadingRow}>
                  <span style={s.spinner} />
                  <span style={s.loadingText}>Analyzing your entry...</span>
                </div>
              ) : analysis ? (
                <>
                  {/* Sentiment indicator */}
                  <div style={s.sentimentRow}>
                    <span style={s.sentimentEmoji}>
                      {SENTIMENT_EMOJI[analysis.sentiment] || "\uD83D\uDE10"}
                    </span>
                    <span
                      style={{
                        ...s.sentimentLabel,
                        color:
                          analysis.sentiment === "positive"
                            ? "#4ADE80"
                            : analysis.sentiment === "negative"
                              ? "#FBBF24"
                              : "rgba(226,226,238,0.6)",
                      }}
                    >
                      {analysis.sentiment
                        ? analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)
                        : "Neutral"}
                    </span>
                    {analysis.score != null && (
                      <span style={s.scoreTag}>
                        {analysis.score > 0 ? "+" : ""}
                        {typeof analysis.score === "number" ? analysis.score.toFixed(1) : analysis.score}
                      </span>
                    )}
                  </div>

                  {/* Insight */}
                  {analysis.insight && (
                    <div style={s.insightText}>{analysis.insight}</div>
                  )}

                  {/* Pattern */}
                  {analysis.pattern && (
                    <div style={s.patternRow}>
                      <span style={s.patternIcon}>&#128270;</span>
                      <span style={s.patternText}>{analysis.pattern}</span>
                    </div>
                  )}

                  {/* Suggestion */}
                  {analysis.suggestion && (
                    <div style={s.suggestionRow}>
                      <span style={s.suggestionIcon}>&#9889;</span>
                      <span style={s.suggestionText}>{analysis.suggestion}</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={s.emptyText}>
                  Could not analyze this entry. Try writing a bit more.
                </div>
              )}
            </div>
          )}

          {/* Fallback: local insights when AI not configured */}
          {!aiEnabled && hasLocalInsights && (
            <div style={s.analysisCard}>
              <div style={s.sentimentRow}>
                <span style={s.sentimentLabel}>
                  Trend: {localAnalysis.trend || "stable"}
                </span>
              </div>
              {localAnalysis.insights.map((ins, i) => (
                <div key={i} style={s.insightText}>{ins}</div>
              ))}
            </div>
          )}

          {/* Generate Prompt button */}
          {aiEnabled && (
            <div style={s.promptSection}>
              <button
                style={s.promptBtn}
                onClick={handleGeneratePrompt}
                disabled={promptLoading}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,92,252,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,92,252,0.08)"; }}
              >
                {promptLoading ? (
                  <span style={s.loadingRow}>
                    <span style={s.spinner} />
                    <span>Generating...</span>
                  </span>
                ) : (
                  "\u270F\uFE0F Generate Writing Prompt"
                )}
              </button>
              {prompt && (
                <div style={s.promptCard}>
                  <div style={s.promptText}>{prompt}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  container: {
    margin: "12px 14px 0",
    borderRadius: 14,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
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
  icon: {
    fontSize: 16,
    lineHeight: 1,
  },
  title: {
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
  analysisCard: {
    padding: "12px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
    marginBottom: 10,
  },
  sentimentRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sentimentEmoji: {
    fontSize: 18,
    lineHeight: 1,
  },
  sentimentLabel: {
    fontSize: 13,
    fontWeight: 700,
  },
  scoreTag: {
    fontSize: 10,
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: 4,
    background: "rgba(255,255,255,0.06)",
    color: "rgba(226,226,238,0.5)",
    marginLeft: "auto",
  },
  insightText: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "rgba(226,226,238,0.75)",
    marginBottom: 6,
  },
  patternRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
    padding: "6px 8px",
    borderRadius: 6,
    background: "rgba(124,92,252,0.06)",
  },
  patternIcon: {
    fontSize: 12,
    flexShrink: 0,
    marginTop: 1,
  },
  patternText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "rgba(226,226,238,0.65)",
    fontStyle: "italic",
  },
  suggestionRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
    padding: "6px 8px",
    borderRadius: 6,
    background: "rgba(249,115,22,0.06)",
  },
  suggestionIcon: {
    fontSize: 12,
    flexShrink: 0,
    marginTop: 1,
  },
  suggestionText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "rgba(226,226,238,0.65)",
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
  emptyText: {
    fontSize: 12,
    color: "rgba(226,226,238,0.35)",
    fontStyle: "italic",
    textAlign: "center",
    padding: "4px 0",
  },
  promptSection: {
    marginTop: 2,
  },
  promptBtn: {
    width: "100%",
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid rgba(124,92,252,0.2)",
    background: "rgba(124,92,252,0.08)",
    color: "#7C5CFC",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
    textAlign: "center",
  },
  promptCard: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 10,
    background: "linear-gradient(135deg, rgba(124,92,252,0.08), rgba(236,72,153,0.04))",
    border: "1px solid rgba(124,92,252,0.12)",
  },
  promptText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "rgba(226,226,238,0.85)",
    fontStyle: "italic",
  },
};
