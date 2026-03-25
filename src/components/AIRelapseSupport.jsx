import { useState, useEffect } from "react";
import { isAIConfigured, getAIRelapseSupport } from "../utils/ai";

export default function AIRelapseSupport({ trackerId, state }) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);

  const aiEnabled = isAIConfigured();
  const startDate = state?.sobrietyDates?.[trackerId];
  const isActive = !!startDate;

  useEffect(() => {
    if (!aiEnabled || !isActive) return;
    let cancelled = false;
    setLoading(true);
    getAIRelapseSupport(trackerId, state).then((msg) => {
      if (!cancelled) {
        setMessage(msg);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [trackerId, aiEnabled, isActive]);

  if (!aiEnabled || !isActive || !visible) return null;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.sparkle}>&#10024;</span>
          <span style={s.title}>AI Support</span>
        </div>
        <span style={s.closeBtn} onClick={() => setVisible(false)}>&times;</span>
      </div>
      {loading ? (
        <div style={s.loadingRow}>
          <span style={s.spinner} />
          <span style={s.loadingText}>Getting encouragement...</span>
        </div>
      ) : message ? (
        <div style={s.messageText}>{message}</div>
      ) : null}
    </div>
  );
}

const s = {
  container: {
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 8,
    background: "linear-gradient(135deg, rgba(124,92,252,0.06), rgba(236,72,153,0.03))",
    border: "1px solid rgba(124,92,252,0.1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  sparkle: {
    fontSize: 12,
    lineHeight: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: 700,
    color: "#7C5CFC",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  closeBtn: {
    fontSize: 16,
    color: "rgba(226,226,238,0.3)",
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
  },
  messageText: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "rgba(226,226,238,0.8)",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  spinner: {
    display: "inline-block",
    width: 12,
    height: 12,
    border: "2px solid rgba(124,92,252,0.2)",
    borderTopColor: "#7C5CFC",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
  },
  loadingText: {
    fontSize: 11,
    color: "rgba(226,226,238,0.45)",
    fontStyle: "italic",
  },
};
