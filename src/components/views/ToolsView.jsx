import { useState } from "react";
import { S } from "../../styles/theme";
import { TROPHIES } from "../../data";
import { getTotalVolume } from "../../utils";
import { useAuth } from "../../hooks/useAuth";
import { usePremium } from "../../hooks/usePremium";
import AISettings from "../AISettings";

export default function ToolsView({ state, user, pomodoro, onReset, onOpenNotifications, onOpenJournal }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const { logout } = useAuth();
  const { isPremium, setShowUpgrade } = usePremium();
  const { pomodoroActive, pomodoroTime, toggle, reset: resetTimer } = pomodoro;
  const pomodoroMins = Math.floor(pomodoroTime / 60);
  const pomodoroSecs = pomodoroTime % 60;
  const pomProg = 1 - pomodoroTime / ((state.pomodoroMinutes || 25) * 60);
  const totalVolume = getTotalVolume(state.workoutLogs);
  const workoutCount = Object.values(state.workoutLogs || {}).reduce((a, b) => a + b.length, 0);
  const day = state.currentDay;

  return (
    <div style={S.vc}>
      {/* Profile */}
      {user && (
        <div style={profileCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={avatar}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: 40, height: 40, borderRadius: "50%" }} />
              ) : (
                <span style={{ fontSize: 18 }}>{(user.displayName || user.email || "U")[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{user.displayName || state.userName || "Warrior"}</div>
              <div style={{ fontSize: 11, opacity: 0.4 }}>{user.email}</div>
            </div>
          </div>
          <button style={logoutBtn} onClick={logout}>Log out</button>
        </div>
      )}

      {/* Premium Status */}
      <div
        style={premiumCard}
        onClick={() => !isPremium && setShowUpgrade(true)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>{isPremium ? "👑" : "⭐"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isPremium ? "#FFD700" : "#E2E2EE" }}>
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

      {/* AI Settings */}
      <AISettings />

      {/* Trophies */}
      <div style={S.secTitle}>Trophy Room</div>
      <div style={S.trophyGrid}>
        {TROPHIES.map((t) => {
          const unlocked = !!state.unlockedTrophies?.[t.id];
          return (
            <div key={t.id} style={{ ...S.trophyCard, ...(unlocked ? S.trophyUnlocked : {}), opacity: unlocked ? 1 : 0.35 }}>
              <div style={{ fontSize: 28, filter: unlocked ? "none" : "grayscale(1)" }}>{t.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, textAlign: "center" }}>{t.name}</div>
              <div style={{ fontSize: 11, opacity: 0.4, textAlign: "center", marginTop: 2 }}>
                {unlocked ? `+${t.xpReward} XP` : t.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Focus Timer */}
      <div style={{ ...S.secTitle, marginTop: 20 }}>Focus Timer</div>
      <div style={S.pomCard}>
        <div style={{ position: "relative" }}>
          <svg viewBox="0 0 120 120" style={{ width: 140, height: 140 }}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
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

      {/* Stats */}
      <div style={{ ...S.secTitle, marginTop: 20 }}>Stats</div>
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

      {/* Day Map */}
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
                      : "rgba(255,255,255,0.04)",
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
                      : "rgba(255,255,255,0.2)",
                fontWeight: cur || isBoss ? 700 : 400,
                fontSize: isBoss && !done ? 11 : 10,
              }}
            >
              {isBoss && !done ? "⚔️" : d}
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px", marginTop: 20 }}>
        <button
          style={{ ...S.timerBtnSec, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onClick={onOpenJournal}
        >
          📖 Journal
        </button>
        <button
          style={{ ...S.timerBtnSec, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onClick={onOpenNotifications}
        >
          🔔 Notifications
        </button>
      </div>

      {!confirmReset ? (
        <button
          style={{ ...S.timerBtnSec, marginTop: 10, color: "#ef4444", borderColor: "rgba(239,68,68,0.15)", marginLeft: 16, marginRight: 16 }}
          onClick={() => setConfirmReset(true)}
        >
          Reset All Data
        </button>
      ) : (
        <div style={resetConfirmBox}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", marginBottom: 6 }}>
            Are you sure? This will erase all your progress permanently.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{ ...S.timerBtnSec, flex: 1, color: "#EF4444", borderColor: "rgba(239,68,68,0.3)", fontWeight: 700 }}
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
    </div>
  );
}

const profileCard = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 16px",
  margin: "0 14px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const avatar = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #7C5CFC, #EC4899)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 16,
  flexShrink: 0,
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

const resetConfirmBox = {
  margin: "10px 16px 0",
  padding: "14px",
  borderRadius: 12,
  background: "rgba(239,68,68,0.06)",
  border: "1px solid rgba(239,68,68,0.15)",
};

const logoutBtn = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid rgba(239,68,68,0.2)",
  background: "transparent",
  color: "#EF4444",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
