import { S } from "../styles/theme";

// SVG-based animated logo instead of emoji
function LogoSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ animation: "pulse 1.4s ease-in-out infinite" }}>
      {/* Outer ring */}
      <circle cx="40" cy="40" r="36" stroke="url(#grad1)" strokeWidth="2.5" opacity="0.3" />
      <circle cx="40" cy="40" r="36" stroke="url(#grad1)" strokeWidth="2.5"
        strokeDasharray="226" strokeDashoffset="60" strokeLinecap="round"
        style={{ animation: "spin 3s linear infinite" }} />
      {/* Inner shield shape */}
      <path
        d="M40 16L56 24V38C56 50 48 58 40 62C32 58 24 50 24 38V24L40 16Z"
        fill="url(#grad2)" opacity="0.9"
      />
      {/* Lightning bolt */}
      <path
        d="M38 28L32 42H38L36 52L48 36H42L44 28H38Z"
        fill="#fff" opacity="0.95"
      />
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="80" y2="80">
          <stop offset="0%" stopColor="#7C5CFC" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="grad2" x1="24" y1="16" x2="56" y2="62">
          <stop offset="0%" stopColor="#7C5CFC" />
          <stop offset="50%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LoadingScreen() {
  return (
    <div style={S.loadScreen}>
      <LogoSVG />
      <div style={S.loadText}>Life OS</div>
      <div style={S.loadSub}>Loading your journey...</div>
      <div style={loadingDots}>
        <div style={{ ...dot, animationDelay: "0s" }} />
        <div style={{ ...dot, animationDelay: "0.2s" }} />
        <div style={{ ...dot, animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

const loadingDots = {
  display: "flex",
  gap: 6,
  marginTop: 20,
};

const dot = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "rgba(124,92,252,0.4)",
  animation: "dotPulse 1.2s ease-in-out infinite",
};
