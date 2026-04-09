import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";

export default function ForgeSuccessModal({ story, trackerLabel, daysClean, milestones, onDismiss }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Support both single milestone (legacy) and multiple milestones
  const items = milestones && milestones.length > 0
    ? milestones
    : story ? [{ story, trackerLabel, daysClean }] : [];

  if (items.length === 0) return null;

  const lightCard = isLight ? {
    background: "linear-gradient(145deg,#F0FDF4,#ECFDF5)",
    border: "1px solid rgba(16,185,129,0.25)",
    color: "#1A1A2E",
  } : {};
  const lightFact = isLight ? {
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.15)",
  } : {};

  return (
    <div style={S.overlay} onClick={onDismiss}>
      <div
        style={{ ...cardStyle, ...lightCard }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={glowBg} />

        {items.length > 1 && (
          <div style={countBadge}>{items.length} milestones reached!</div>
        )}

        <div style={scrollArea}>
          {items.map((item, i) => (
            <div key={i} style={i > 0 ? milestoneItemWithBorder : milestoneItem}>
              <div style={{ fontSize: 40, position: "relative", zIndex: 2 }}>{item.story.icon}</div>
              <div style={badge}>{item.trackerLabel} &middot; Day {item.daysClean}</div>
              <div style={titleStyle}>{item.story.title}</div>
              <div style={{ ...factBox, ...lightFact }}>
                <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.85 }}>{item.story.fact}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...keepGoing, color: isLight ? "#374151" : undefined }}>
          Your body is healing. Keep going.
        </div>
        <button
          style={{ ...S.motBtn, position: "relative", zIndex: 10 }}
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        >
          Continue &rarr;
        </button>
      </div>
    </div>
  );
}

const cardStyle = {
  maxWidth: 380,
  width: "100%",
  padding: "24px 24px 28px",
  borderRadius: 24,
  background: "linear-gradient(145deg,#0F1A28,#0A1E1A)",
  border: "1px solid rgba(16,185,129,0.2)",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 20px 80px rgba(16,185,129,0.12)",
  color: "#E2E2EE",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
};

const scrollArea = {
  overflowY: "auto",
  maxHeight: "50vh",
  position: "relative",
  zIndex: 2,
  WebkitOverflowScrolling: "touch",
};

const milestoneItem = {
  padding: "12px 0",
};

const milestoneItemWithBorder = {
  padding: "16px 0 12px",
  borderTop: "1px solid rgba(16,185,129,0.12)",
  marginTop: 4,
};

const glowBg = {
  position: "absolute",
  top: "-50%",
  left: "-50%",
  width: "200%",
  height: "200%",
  background: "radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 60%)",
  animation: "pulse 3s ease infinite",
};

const countBadge = {
  fontSize: 13,
  fontWeight: 800,
  color: "#10B981",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 4,
  position: "relative",
  zIndex: 2,
};

const badge = {
  display: "inline-block",
  padding: "4px 14px",
  borderRadius: 16,
  background: "rgba(16,185,129,0.12)",
  color: "#10B981",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginTop: 8,
  marginBottom: 10,
  position: "relative",
  zIndex: 2,
};

const titleStyle = {
  fontSize: 20,
  fontWeight: 900,
  background: "linear-gradient(135deg,#10B981,#22D3EE)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  position: "relative",
  zIndex: 2,
  marginBottom: 12,
};

const factBox = {
  padding: "12px 16px",
  borderRadius: 14,
  background: "rgba(16,185,129,0.06)",
  border: "1px solid rgba(16,185,129,0.1)",
  position: "relative",
  zIndex: 2,
  textAlign: "left",
};

const keepGoing = {
  fontSize: 12,
  opacity: 0.4,
  fontStyle: "italic",
  margin: "12px 0",
  position: "relative",
  zIndex: 2,
};
