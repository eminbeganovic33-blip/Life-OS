/**
 * Skeleton loading placeholders — pulsing shimmer effect for async content.
 * Usage: <Skeleton width={120} height={16} /> or <Skeleton.Card /> etc.
 */

const shimmerKeyframes = `
@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

// Inject shimmer keyframes once
let injected = false;
function injectShimmer() {
  if (injected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
  injected = true;
}

const baseStyle = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.8s ease-in-out infinite",
  borderRadius: 8,
};

/** Basic skeleton block */
export default function Skeleton({ width, height = 16, borderRadius, style: extra, ...props }) {
  injectShimmer();
  return (
    <div
      style={{
        ...baseStyle,
        width: width || "100%",
        height,
        borderRadius: borderRadius ?? 8,
        ...extra,
      }}
      {...props}
    />
  );
}

/** Skeleton text line */
Skeleton.Text = function SkeletonText({ width = "80%", height = 12, style: extra }) {
  injectShimmer();
  return <div style={{ ...baseStyle, width, height, borderRadius: 4, ...extra }} />;
};

/** Skeleton circle (avatar, icon) */
Skeleton.Circle = function SkeletonCircle({ size = 40, style: extra }) {
  injectShimmer();
  return <div style={{ ...baseStyle, width: size, height: size, borderRadius: "50%", flexShrink: 0, ...extra }} />;
};

/** Skeleton card — matches app card styling */
Skeleton.Card = function SkeletonCard({ height = 80, style: extra }) {
  injectShimmer();
  return (
    <div
      style={{
        ...baseStyle,
        width: "100%",
        height,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.04)",
        ...extra,
      }}
    />
  );
};

/** Skeleton stat pill row */
Skeleton.StatRow = function SkeletonStatRow({ count = 3 }) {
  injectShimmer();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            ...baseStyle,
            flex: 1,
            height: 56,
            borderRadius: 10,
          }}
        />
      ))}
    </div>
  );
};

/** Skeleton quest list */
Skeleton.QuestList = function SkeletonQuestList({ count = 4 }) {
  injectShimmer();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ ...baseStyle, width: 22, height: 22, borderRadius: 6, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ ...baseStyle, width: `${65 + (i * 10) % 30}%`, height: 13, borderRadius: 4 }} />
            <div style={{ ...baseStyle, width: "40%", height: 10, borderRadius: 4 }} />
          </div>
          <div style={{ ...baseStyle, width: 36, height: 14, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
};

/** Skeleton chart bars */
Skeleton.BarChart = function SkeletonBarChart({ bars = 7, height = 120 }) {
  injectShimmer();
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, padding: "0 4px" }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          style={{
            ...baseStyle,
            flex: 1,
            height: `${30 + Math.sin(i * 1.2) * 25 + 25}%`,
            borderRadius: "4px 4px 0 0",
          }}
        />
      ))}
    </div>
  );
};
