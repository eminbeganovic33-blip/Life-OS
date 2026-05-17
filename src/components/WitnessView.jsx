import { useState, useEffect } from "react";
import { getPublicProfile } from "../utils/social";
import { Flame, Shield, Star, Clock } from "lucide-react";

const LEVELS = [
  "Beginner", "Apprentice", "Warrior", "Champion",
  "Elite", "Master", "Legend", "Transcended",
];

export default function WitnessView({ uid }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getPublicProfile(uid).then((p) => {
      if (p) setProfile(p);
      else setNotFound(true);
      setLoading(false);
    });
  }, [uid]);

  if (loading) {
    return (
      <div style={root}>
        <div style={card}>
          <div style={{ fontSize: 13, opacity: 0.4, textAlign: "center" }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={root}>
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Warrior not found</div>
          <div style={{ fontSize: 12, opacity: 0.4, textAlign: "center" }}>This witness link may have expired.</div>
        </div>
      </div>
    );
  }

  const levelLabel = LEVELS[Math.min(profile.level || 0, LEVELS.length - 1)];
  const completedToday = !!profile.completedToday;

  return (
    <div style={root}>
      {/* Header */}
      <div style={header}>
        <div style={logoText}>Life OS</div>
        <div style={witnessLabel}>Witness Mode</div>
      </div>

      <div style={card}>
        {/* Identity */}
        <div style={identity}>
          <div style={avatar}>{(profile.displayName || "W").slice(0, 1).toUpperCase()}</div>
          <div>
            <div style={name}>{profile.displayName || "Warrior"}</div>
            <div style={levelBadge}>{levelLabel} · Day {profile.currentDay || 1}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={statsRow}>
          <div style={statBox}>
            <Flame size={18} color="#F97316" />
            <div style={statVal}>{profile.streak || 0}</div>
            <div style={statLbl}>day streak</div>
          </div>
          <div style={statBox}>
            <Star size={18} color="#FBBF24" />
            <div style={statVal}>{profile.xp || 0}</div>
            <div style={statLbl}>total XP</div>
          </div>
          <div style={statBox}>
            <Clock size={18} color="#7C5CFC" />
            <div style={statVal}>Day {profile.currentDay || 1}</div>
            <div style={statLbl}>journey</div>
          </div>
        </div>

        {/* Today status */}
        <div style={{ ...todayBanner, background: completedToday ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)", borderColor: completedToday ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)" }}>
          <span style={{ fontSize: 16 }}>{completedToday ? "✓" : "○"}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: completedToday ? "#22C55E" : "#EF4444" }}>
            {completedToday ? "Completed today's quests" : "Hasn't completed today's quests yet"}
          </span>
        </div>

        {/* Stake */}
        {profile.stakeWhy && (
          <div style={stakeBlock}>
            <div style={stakeTitle}>
              <Shield size={12} color="#7C5CFC" />
              Their Stake — Why They're Doing This
            </div>
            <div style={stakeText}>"{profile.stakeWhy}"</div>
          </div>
        )}

        {/* Witness CTA */}
        <div style={ctaBlock}>
          <div style={ctaText}>
            You're their witness. Your presence keeps them accountable.
          </div>
          <div style={ctaSub}>
            Check back daily — hold them to it.
          </div>
        </div>
      </div>

      <div style={footer}>
        Want to build your own streak?{" "}
        <a href={window.location.origin} style={{ color: "#7C5CFC", fontWeight: 700, textDecoration: "none" }}>
          Start Life OS →
        </a>
      </div>
    </div>
  );
}

// ── Styles ──

const root = {
  minHeight: "100dvh",
  background: "#0A0A0F",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "24px 16px 40px",
  fontFamily: "'Inter','SF Pro Display',system-ui,sans-serif",
  color: "#fff",
};

const header = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 24,
  width: "100%",
  maxWidth: 440,
  justifyContent: "space-between",
};

const logoText = {
  fontSize: 18,
  fontWeight: 900,
  letterSpacing: -0.5,
  background: "linear-gradient(135deg, #7C5CFC, #A78BFA)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const witnessLabel = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.35)",
};

const card = {
  width: "100%",
  maxWidth: 440,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: "24px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const identity = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const avatar = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
  fontWeight: 900,
  flexShrink: 0,
};

const name = {
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: -0.3,
};

const levelBadge = {
  fontSize: 11,
  opacity: 0.4,
  fontWeight: 600,
  marginTop: 2,
};

const statsRow = {
  display: "flex",
  gap: 10,
};

const statBox = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  padding: "14px 8px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const statVal = {
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: -0.5,
};

const statLbl = {
  fontSize: 10,
  opacity: 0.35,
  fontWeight: 600,
};

const todayBanner = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid",
};

const stakeBlock = {
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(124,92,252,0.06)",
  border: "1px solid rgba(124,92,252,0.18)",
};

const stakeTitle = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "#7C5CFC",
  marginBottom: 8,
};

const stakeText = {
  fontSize: 13,
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.8)",
  fontStyle: "italic",
};

const ctaBlock = {
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.05)",
  textAlign: "center",
};

const ctaText = {
  fontSize: 13,
  fontWeight: 600,
  opacity: 0.7,
  lineHeight: 1.5,
};

const ctaSub = {
  fontSize: 11,
  opacity: 0.35,
  marginTop: 4,
};

const footer = {
  marginTop: 24,
  fontSize: 12,
  opacity: 0.35,
  textAlign: "center",
};
