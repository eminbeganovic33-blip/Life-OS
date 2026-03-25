import { S } from "../../styles/theme";
import { SOBRIETY_DEFAULTS } from "../../data";

export default function RelapseModal({ trackerId, relapseText, setRelapseText, onSubmit, onClose }) {
  const tracker = SOBRIETY_DEFAULTS.find((t) => t.id === trackerId);
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>Recovery Protocol</span>
          <span style={S.modalClose} onClick={onClose}>✕</span>
        </div>
        <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
          <div style={{ fontSize: 32 }}>{tracker?.icon}</div>
          <div style={{ fontSize: 13, opacity: 0.5, marginTop: 4 }}>Resetting {tracker?.label} streak</div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#F59E0B",
            background: "rgba(245,158,11,0.1)",
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          Setbacks are part of the process. Reflecting on what happened earns you <strong>+25 Resilience XP</strong>.
        </div>
        <textarea
          style={S.journalInput}
          placeholder="What triggered this? What will you do differently next time?"
          value={relapseText}
          onChange={(e) => setRelapseText(e.target.value)}
          rows={4}
        />
        <button
          style={{ ...S.primaryBtn, margin: "12px 0 0", width: "100%", opacity: relapseText.trim() ? 1 : 0.4 }}
          onClick={onSubmit}
          disabled={!relapseText.trim()}
        >
          Submit & Reset (+25 XP)
        </button>
      </div>
    </div>
  );
}
