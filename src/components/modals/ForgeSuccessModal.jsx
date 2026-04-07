import { S } from "../../styles/theme";
import { useTheme } from "../../hooks/useTheme";

export default function ForgeSuccessModal({ story, trackerLabel, daysClean, onDismiss }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  if (!story) return null;
  return (
    <div style={S.overlay} onClick={onDismiss}>
      <div style={{
        ...cardStyle,
        ...(isLight ? {
          background: "linear-gradient(145deg,#F0FDF4,#ECFDF5)",
          border: "1px solid rgba(16,185,129,0.25)",
          color: "#1A1A2E",
        } : {}),
      }} onClick={(e) => e.stopPropagation()}>
        <div style={glowBg} />
        <div style={{ fontSize: 48, position: "relative", zIndex: 2 }}>{story.icon}</div>
        <div style={badge}>{trackerLabel} · Day {daysClean}</div>
        <div style={titleStyle}>{story.title}</div>
        <div style={{
          ...factBox,
          ...(isLight ? {
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.15)",
          } : {}),
        }}>
          <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.85 }}>{story.fact}</div>
        </div>
        <div style={{ ...keepGoing, color: isLight ? "#374151" : undefined }}>Your body is healing. Keep going.</div>
        <button style={{ ...S.motBtn, position: "relative", zIndex: 10 }} onClick={(e) => { e.stopPropagation(); onDismiss(); }}>Continue →</button>
      </div>
    </div>
  );
}

const cardStyle = {
  maxWidth: 360,
  width: "100%",
  padding: 32,
  borderRadius: 24,
  background: "linear-gradient(145deg,#0F1A28,#0A1E1A)",
  border: "1px solid rgba(16,185,129,0.2)",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 20px 80px rgba(16,185,129,0.12)",
  color: "#E2E2EE",
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
  marginBottom: 12,
  position: "relative",
  zIndex: 2,
};

const titleStyle = {
  fontSize: 22,
  fontWeight: 900,
  background: "linear-gradient(135deg,#10B981,#22D3EE)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  position: "relative",
  zIndex: 2,
  marginBottom: 16,
};

const factBox = {
  padding: "14px 18px",
  borderRadius: 14,
  background: "rgba(16,185,129,0.06)",
  border: "1px solid rgba(16,185,129,0.1)",
  marginBottom: 16,
  position: "relative",
  zIndex: 2,
  textAlign: "left",
};

const keepGoing = {
  fontSize: 12,
  opacity: 0.4,
  fontStyle: "italic",
  marginBottom: 16,
  position: "relative",
  zIndex: 2,
};
