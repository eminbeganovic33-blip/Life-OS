import { useState } from "react";
import { S } from "../../styles/theme";
import { TROPHIES } from "../../data";
import { getTotalVolume } from "../../utils";
import { useAuth } from "../../hooks/useAuth";
import { usePremium } from "../../hooks/usePremium";
import { useTheme } from "../../hooks/useTheme";

export default function ProfileView({ state, user, pomodoro, onReset, onOpenNotifications, onOpenJournal }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const { logout } = useAuth();
  const { isPremium, setShowUpgrade } = usePremium();
  const { theme, toggleTheme, colors } = useTheme();
  const { pomodoroActive, pomodoroTime, toggle, reset: resetTimer } = pomodoro;
  const pomodoroMins = Math.floor(pomodoroTime / 60);
  const pomodoroSecs = pomodoroTime % 60;
  const pomProg = 1 - pomodoroTime / ((state.pomodoroMinutes || 25) * 60);
  const totalVolume = getTotalVolume(state.workoutLogs);
  const workoutCount = Object.values(state.workoutLogs || {}).reduce((a, b) => a + b.length, 0);
  const day = state.currentDay;
  const isDark = theme === "dark";

  return (
    <div style={S.vc}>
      {/* Profile Card */}
      <div style={profileCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={avatar}>
            {user && user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: 48, height: 48, borderRadius: "50%" }} />
            ) : (
              <span style={{ fontSize: 20 }}>
                {((user && (user.displayName || user.email)) || state.userName || "W")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              {(user && user.displayName) || state.userName || "Warrior"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.4, marginTop: 2 }}>
              {user ? user.email : "Local Warrior"}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Status */}
      <div style={premiumCard} onClick={() => !isPremium && setShowUpgrade(true)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>{isPremium ? "\u{1F451}" : "\u2B50"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isPremium ? "#FFD700" : colors.text }}>
              {isPremium ? "Premium Active" : "Free Plan"}
            </div>
            <div style={{ fontSize: 11, opacity: 0.4 }}>
              {isPremium ? "All features unlocked" : "Upgrade for full access"}
            </div>
          </div>
        </div>
        {!isPremium && (
          <span style={{ fontSize: 12, color: "#FFD700", fontWeight: 700 }}>Upgrade</span>
        )}
      </div>

      {/* Theme Toggle */}
      <div style={themeRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{isDark ? "\uD83C\uDF19" : "\u2600\uFE0F"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Appearance</div>
            <div style={{ fontSize: 11, opacity: 0.4 }}>{isDark ? "Dark Mode" : "Light Mode"}</div>
          </div>
        </div>
        <button style={toggleTrack(isDark)} onClick={toggleTheme} aria-label="Toggle theme">
          <span style={toggleIcon(true, isDark)}>{"\u2600\uFE0F"}</span>
          <span style={toggleIcon(false, isDark)}>{"\uD83C\uDF19"}</span>
          <div style={toggleThumb(isDark)} />
        </button>
      </div>

      {/* Stats */}
      <div style={S.secTitle}>Stats</div>
      <div style={S.statsGrid}>
        {[
          { v: day, l: "Day" },
          { v: state.xp, l: "Total XP" },
          { v: state.streak, l: "Streak" },
          { v: state.bestStreak, l: "Best Streak" },
          { v: Object.keys(state.completedDays).length, l: "Days Done" },
          { v: workoutCount, l: "Workouts" },
          { v: `${Math.round(totalVolume / 1000)}t`, l: "Vol. Moved" },
          { v: Object.values(state.courseProgress || {}).filter((p) => p.completed).length, l: "Courses" },
          { v: Object.keys(state.unlockedTrophies || {}).length, l: "Trophies" },
        ].map((s, i) => (
          <div key={i} style={S.statCard}>
            <div style={S.statVal}>{s.v}</div>
            <div style={S.statLbl}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Trophy Room */}
      <div style={{ ...S.secTitle, marginTop: 20 }}>Trophy Room</div>
      <div style={S.trophyGrid}>
        {TROPHIES.map((t) => {
          const unlocked = !!state.unlockedTrophies?.[t.id];
          return (
            <div key={t.id} style={{ ...S.trophyCard, ...(unlocked ? S.trophyUnlocked : {}), opacity: unlocked ? 1 : 0.35 }}>
              <div style={{ fontSize: 28, filter: unlocked ? "none" : "grayscale(1)" }}>{t.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, textAlign: "center" }}>{t.name}</div>
              <div style={{ fontSize: 9, opacity: 0.4, textAlign: "center", marginTop: 2 }}>
                {unlocked ? `+${t.xpReward} XP` : t.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Journey Map */}
      <div style={{ ...S.secTitle, marginTop: 20 }}>
        Journey Map
        {day > 66 && <span style={{ fontSize: 11, opacity: 0.4, fontWeight: 400, marginLeft: 6 }}>Mastery</span>}
      </div>
      <div style={S.dayGrid}>
        {Array.from({ length: Math.max(66, day) }, (_, i) => {
          const d = i + 1;
          const done = state.completedDays[d];
          const cur = d === day;
          const isBoss = d === 21 || d === 66;
          return (
            <div
              key={d}
              style={{
                ...S.dayDot,
                background: done
                  ? "linear-gradient(135deg,#7C5CFC,#EC4899)"
                  : cur
                    ? "rgba(124,92,252,0.25)"
                    : isBoss
                      ? "rgba(249,115,22,0.12)"
                      : isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.04)",
                border: cur
                  ? "2px solid #7C5CFC"
                  : isBoss && !done
                    ? "2px solid rgba(249,115,22,0.3)"
                    : "2px solid transparent",
                color: done
                  ? "#fff"
                  : cur
                    ? "#7C5CFC"
                    : isBoss
                      ? "#F97316"
                      : isDark
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.2)",
                fontWeight: cur || isBoss ? 700 : 400,
                fontSize: isBoss && !done ? 11 : 10,
              }}
            >
              {isBoss && !done ? "\u2694\uFE0F" : d}
            </div>
          );
        })}
      </div>

      {/* Focus Timer */}
      <div style={{ ...S.secTitle, marginTop: 20 }}>Focus Timer</div>
      <div style={S.pomCard}>
        <div style={{ position: "relative" }}>
          <svg viewBox="0 0 120 120" style={{ width: 140, height: 140 }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} strokeWidth="5" />
            <circle
              cx="60" cy="60" r="52" fill="none" stroke="#7C5CFC" strokeWidth="5"
              strokeDasharray={`${pomProg * 327} 327`} strokeLinecap="round"
              transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray 0.5s" }}
            />
          </svg>
          <div style={S.timerText}>
            {String(pomodoroMins).padStart(2, "0")}:{String(pomodoroSecs).padStart(2, "0")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button style={S.timerBtn} onClick={toggle}>
            {pomodoroActive ? "Pause" : pomodoroTime === 0 ? "Again" : "Start"}
          </button>
          <button style={S.timerBtnSec} onClick={resetTimer}>Reset</button>
        </div>
        {pomodoroTime === 0 && (
          <div style={{ marginTop: 10, fontSize: 13, color: "#10B981", fontWeight: 700 }}>Session complete!</div>
        )}
      </div>

      {/* Settings */}
      <div style={{ ...S.secTitle, marginTop: 20 }}>Settings</div>
      <div style={settingsGrid}>
        <button style={settingsBtn} onClick={onOpenNotifications}>
          <span style={settingsIcon}>🔔</span>
          <span>Notifications</span>
        </button>
        <button style={settingsBtn} onClick={onOpenJournal}>
          <span style={settingsIcon}>📖</span>
          <span>Journal</span>
        </button>
      </div>

      {!confirmReset ? (
        <button style={resetBtn} onClick={() => setConfirmReset(true)}>
          Reset All Data
        </button>
      ) : (
        <div style={resetConfirmBox}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 10 }}>
            Are you sure? This will erase all your progress permanently.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{ ...resetBtn, flex: 1, background: "rgba(239,68,68,0.1)", margin: 0 }}
              onClick={() => { onReset(); setConfirmReset(false); }}
            >
              Yes, Reset Everything
            </button>
            <button
              style={{ ...S.timerBtnSec, flex: 1 }}
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {user && (
        <button style={logoutBtn} onClick={logout}>
          Log out
        </button>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

/* ── Inline style objects ── */

const profileCard = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 16px",
  margin: "0 14px 12px",
  borderRadius: 16,
  background: "linear-gradient(135deg,rgba(124,92,252,0.08),rgba(236,72,153,0.04))",
  border: "1px solid rgba(124,92,252,0.12)",
};

const avatar = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #7C5CFC, #EC4899)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 18,
  flexShrink: 0,
  color: "#fff",
};

const premiumCard = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 16px",
  margin: "0 14px 12px",
  borderRadius: 14,
  background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,165,0,0.03))",
  border: "1px solid rgba(255,215,0,0.1)",
  cursor: "pointer",
};

const themeRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 16px",
  margin: "0 14px 12px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const toggleTrack = (isDark) => ({
  position: "relative",
  width: 56,
  height: 30,
  borderRadius: 15,
  border: "none",
  background: isDark
    ? "linear-gradient(135deg, #1A1A3E, #2D2B55)"
    : "linear-gradient(135deg, #87CEEB, #FDB813)",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: isDark
    ? "inset 0 1px 3px rgba(0,0,0,0.4), 0 0 8px rgba(124,92,252,0.15)"
    : "inset 0 1px 3px rgba(0,0,0,0.15), 0 0 8px rgba(253,184,19,0.2)",
  transition: "background 0.3s ease, box-shadow 0.3s ease",
  flexShrink: 0,
});

const toggleIcon = (isSun, isDark) => ({
  fontSize: 12,
  lineHeight: 1,
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  ...(isSun
    ? { left: 7, opacity: isDark ? 0.3 : 0.9 }
    : { right: 7, opacity: isDark ? 0.9 : 0.3 }),
  transition: "opacity 0.3s ease",
  pointerEvents: "none",
  zIndex: 1,
});

const toggleThumb = (isDark) => ({
  position: "absolute",
  top: 3,
  left: isDark ? 29 : 3,
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: isDark
    ? "linear-gradient(135deg, #C4B5FD, #7C5CFC)"
    : "linear-gradient(135deg, #FFF8DC, #FFD700)",
  boxShadow: isDark
    ? "0 2px 6px rgba(124,92,252,0.4)"
    : "0 2px 6px rgba(255,215,0,0.4)",
  transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, box-shadow 0.3s ease",
  zIndex: 2,
});

const settingsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  padding: "0 14px",
};

const settingsBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.025)",
  color: "#E2E2EE",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const settingsIcon = {
  fontSize: 16,
};

const resetBtn = {
  display: "block",
  width: "calc(100% - 28px)",
  margin: "12px 14px 0",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(239,68,68,0.15)",
  background: "transparent",
  color: "#EF4444",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "center",
};

const resetConfirmBox = {
  margin: "12px 14px 0",
  padding: "14px",
  borderRadius: 12,
  background: "rgba(239,68,68,0.06)",
  border: "1px solid rgba(239,68,68,0.15)",
};

const logoutBtn = {
  display: "block",
  width: "calc(100% - 28px)",
  margin: "10px 14px 0",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(239,68,68,0.2)",
  background: "transparent",
  color: "#EF4444",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "center",
};
