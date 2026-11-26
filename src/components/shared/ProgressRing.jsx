import { TOKENS } from "../../styles/tokens";

export default function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 5,
  color = TOKENS.color.text,
  trackColor = TOKENS.color.border,
  textColor,
  showLabel = true,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));

  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      {showLabel && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size >= 56 ? TOKENS.font.size.md : TOKENS.font.size.xs,
          fontWeight: TOKENS.font.weight.bold,
          color: textColor || color,
          letterSpacing: TOKENS.track.tight,
        }}>
          {Math.round(progress * 100)}%
        </div>
      )}
    </div>
  );
}
