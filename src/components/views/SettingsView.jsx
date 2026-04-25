import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { usePomodoroContext } from "../../hooks";
import {
  Sun, Moon, Volume2, VolumeX, Bell, Timer, Sparkles, Download,
  ChevronLeft, AlertTriangle, Zap,
} from "lucide-react";
import { getSoundsEnabled, setSoundsEnabled, playSound } from "../../utils/audio";
import { requestNotificationPermission, getDefaultNotificationSettings } from "../../utils/notifications";
import { loadAISettings, saveAISettings, isAIConfigured, testAIConnection } from "../../utils/ai";
import { TOKENS } from "../../styles/theme";

const T = TOKENS;

const DEFAULT_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4-turbo",
  "gpt-3.5-turbo",
  "claude-3-haiku-20240307",
  "claude-3-5-sonnet-20241022",
];

export default function SettingsView({ state, save, user, onReset, onBack }) {
  const { theme, toggleTheme, colors } = useTheme();
  const isDark = theme === "dark";
  const { logout } = useAuth();
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;

  // ── Preferences state ──────────────────────────────────────────────────────
  const [soundsOn, setSoundsOn] = useState(getSoundsEnabled);

  // ── Notifications state ────────────────────────────────────────────────────
  const [notif, setNotif] = useState(() => state.notificationSettings || getDefaultNotificationSettings());
  const [permStatus, setPermStatus] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unavailable"
  );
  const [notifSaved, setNotifSaved] = useState(false);

  function updateNotif(key, val) {
    setNotif((prev) => ({ ...prev, [key]: val }));
    setNotifSaved(false);
  }
  async function handleEnableNotif() {
    const result = await requestNotificationPermission();
    setPermStatus(result);
    if (result === "granted") updateNotif("enabled", true);
  }
  function saveNotif() {
    save({ ...state, notificationSettings: notif });
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  }

  // ── AI Coach state ─────────────────────────────────────────────────────────
  const [aiSettings, setAiSettings] = useState(loadAISettings);
  const [showKey, setShowKey] = useState(false);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiTestResult, setAiTestResult] = useState(null);
  const [aiSaved, setAiSaved] = useState(false);
  const aiConfigured = isAIConfigured();

  function changeAI(field, value) {
    setAiSettings((prev) => ({ ...prev, [field]: value }));
    setAiSaved(false);
    setAiTestResult(null);
  }
  function saveAI() {
    saveAISettings(aiSettings);
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  }
  async function testAI() {
    saveAISettings(aiSettings);
    setAiTesting(true);
    setAiTestResult(null);
    const result = await testAIConnection();
    setAiTestResult(result);
    setAiTesting(false);
  }
  function clearAI() {
    const cleared = { apiKey: "", apiUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" };
    setAiSettings(cleared);
    saveAISettings(cleared);
    setAiTestResult(null);
    setAiSaved(false);
  }
  function maskKey(key) {
    if (!key || key.length < 8) return key;
    return key.substring(0, 4) + "•".repeat(Math.min(key.length - 8, 20)) + key.substring(key.length - 4);
  }

  // ── Focus Timer state ──────────────────────────────────────────────────────
  const pomodoro = usePomodoroContext();
  const { pomodoroActive, pomodoroTime, toggle, reset: resetTimer, phase, phaseLabel, sessionsCompleted, skipPhase } = pomodoro;
  const phaseDuration =
    phase === "work" ? (state.pomodoroMinutes || 25) * 60 : phase === "longBreak" ? 15 * 60 : 5 * 60;
  const pomProg = 1 - pomodoroTime / phaseDuration;
  const pomMins = Math.floor(pomodoroTime / 60);
  const pomSecs = pomodoroTime % 60;

  // ── Data export ────────────────────────────────────────────────────────────
  function handleExport() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "life-os-v1",
      profile: { userName: state.userName, currentDay: state.currentDay, xp: state.xp, streak: state.streak, bestStreak: state.bestStreak },
      completedDays: state.completedDays,
      completedQuests: state.completedQuests,
      journal: state.journal,
      moods: state.moods,
      workoutLogs: state.workoutLogs,
      sobrietyDates: state.sobrietyDates,
      forgeGoals: state.forgeGoals,
      recoveryJournals: state.recoveryJournals,
      courseProgress: state.courseProgress,
      customQuests: state.customQuests,
      unlockedTrophies: state.unlockedTrophies,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `life-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  const [confirmReset, setConfirmReset] = useState(false);

  // ── Styles ─────────────────────────────────────────────────────────────────
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const row = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: `1px solid ${sub(0.05)}`,
  };
  const rowLeft = { display: "flex", alignItems: "center", gap: 12 };
  const rowIcon = {
    width: 34, height: 34, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: cardBg, border: `1px solid ${cardBorder}`,
    flexShrink: 0,
  };
  const rowTitle = { fontSize: 14, fontWeight: 600, color: colors.text };
  const rowSub = { fontSize: 11, color: colors.textSecondary, marginTop: 1 };

  const sectionLabel = {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 1, color: sub(0.35),
    padding: "20px 16px 6px",
  };
  const card = {
    margin: "0 16px", borderRadius: 14,
    background: cardBg, border: `1px solid ${cardBorder}`,
    overflow: "hidden",
  };

  const togTrack = (active) => ({
    position: "relative", width: 42, height: 24, borderRadius: 12,
    background: active ? "rgba(124,92,252,0.5)" : sub(0.1),
    border: "none", cursor: "pointer", padding: 0, transition: "background 0.2s",
    flexShrink: 0,
  });
  const togThumb = (active) => ({
    position: "absolute", top: 3, left: active ? 21 : 3,
    width: 18, height: 18, borderRadius: "50%",
    background: active ? "#7C5CFC" : sub(0.3),
    transition: "left 0.2s, background 0.2s",
    boxShadow: active ? "0 2px 6px rgba(124,92,252,0.4)" : "none",
  });

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: colors.text, fontSize: 12, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ paddingBottom: 80, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 16px 8px",
        position: "sticky", top: 0,
        background: isDark ? "rgba(9,11,20,0.92)" : "rgba(250,249,247,0.92)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        zIndex: 10,
        borderBottom: `1px solid ${sub(0.06)}`,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: 10, border: "none",
            background: cardBg, color: colors.text,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3, color: colors.text }}>
          Settings
        </div>
      </div>

      {/* ── PREFERENCES ──────────────────────────────────────────────────────── */}
      <div style={sectionLabel}>Preferences</div>
      <div style={card}>
        {/* Appearance */}
        <div style={row}>
          <div style={rowLeft}>
            <div style={{ ...rowIcon, background: isDark ? "rgba(109,40,217,0.15)" : "rgba(245,158,11,0.1)", border: `1px solid ${isDark ? "rgba(109,40,217,0.25)" : "rgba(245,158,11,0.2)"}` }}>
              {isDark ? <Moon size={16} color="#A78BFA" /> : <Sun size={16} color="#F59E0B" />}
            </div>
            <div>
              <div style={rowTitle}>Appearance</div>
              <div style={rowSub}>{isDark ? "Dark mode" : "Light mode"}</div>
            </div>
          </div>
          <button
            style={{
              ...togTrack(isDark),
              background: isDark ? "linear-gradient(135deg, #1A1A3E, #2D2B55)" : "linear-gradient(135deg, #87CEEB, #FDB813)",
              width: 52, height: 28, borderRadius: 14,
            }}
            onClick={toggleTheme}
            role="switch"
            aria-checked={isDark}
          >
            <div style={{
              position: "absolute", top: 3, left: isDark ? 27 : 3,
              width: 22, height: 22, borderRadius: "50%",
              background: isDark ? "linear-gradient(135deg, #C4B5FD, #7C5CFC)" : "linear-gradient(135deg, #FFF8DC, #FFD700)",
              transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: isDark ? "0 2px 6px rgba(124,92,252,0.4)" : "0 2px 6px rgba(255,215,0,0.4)",
            }} />
          </button>
        </div>

        {/* Sound Effects */}
        <div style={{ ...row, borderBottom: "none" }}>
          <div style={rowLeft}>
            <div style={{ ...rowIcon, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
              {soundsOn ? <Volume2 size={16} color="#22C55E" /> : <VolumeX size={16} color={sub(0.35)} />}
            </div>
            <div>
              <div style={rowTitle}>Sound Effects</div>
              <div style={rowSub}>Audio feedback on actions</div>
            </div>
          </div>
          <button
            style={togTrack(soundsOn)}
            role="switch"
            aria-checked={soundsOn}
            onClick={() => {
              const next = !soundsOn;
              setSoundsEnabled(next);
              setSoundsOn(next);
              if (next) playSound("questCheck");
            }}
          >
            <div style={togThumb(soundsOn)} />
          </button>
        </div>
      </div>

      {/* ── FOCUS TIMER ──────────────────────────────────────────────────────── */}
      <div style={sectionLabel}>Focus Timer</div>
      <div style={{ ...card, padding: "16px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
          <div style={{ ...rowIcon, background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)" }}>
            <Timer size={16} color="#7C5CFC" />
          </div>
          <div>
            <div style={rowTitle}>Pomodoro</div>
            <div style={rowSub}>
              {pomodoroActive ? `${phaseLabel} running` : `${String(pomMins).padStart(2,"0")}:${String(pomSecs).padStart(2,"0")} · ${phaseLabel}`}
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: sub(0.3), fontWeight: 600 }}>
            {sessionsCompleted} session{sessionsCompleted !== 1 ? "s" : ""} today
          </div>
        </div>

        {/* Circular timer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", width: 100, height: 100 }}>
            <svg viewBox="0 0 100 100" style={{ width: 100, height: 100 }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke={sub(0.05)} strokeWidth="5" />
              <circle cx="50" cy="50" r="44" fill="none"
                stroke={phase === "work" ? "#7C5CFC" : "#22C55E"} strokeWidth="5"
                strokeDasharray={`${pomProg * 276.5} 276.5`} strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dasharray 0.5s, stroke 0.3s" }}
              />
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums",
              color: colors.text, letterSpacing: 1,
            }}>
              {String(pomMins).padStart(2,"0")}:{String(pomSecs).padStart(2,"0")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg,#7C5CFC,#6D28D9)",
                color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
              onClick={toggle}
            >
              {pomodoroActive ? "Pause" : pomodoroTime === 0 ? "Continue" : "Start"}
            </button>
            <button
              style={{
                padding: "8px 16px", borderRadius: 8,
                border: `1px solid ${sub(0.1)}`, background: "transparent",
                color: sub(0.5), fontSize: 12, cursor: "pointer",
              }}
              onClick={skipPhase}
            >Skip</button>
            <button
              style={{
                padding: "8px 16px", borderRadius: 8,
                border: `1px solid ${sub(0.1)}`, background: "transparent",
                color: sub(0.5), fontSize: 12, cursor: "pointer",
              }}
              onClick={resetTimer}
            >Reset</button>
          </div>
          {pomodoroTime === 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#10B981", fontWeight: 700 }}>Phase complete!</div>
          )}
        </div>

        {/* Work duration input */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${sub(0.06)}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>Work duration</div>
              <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>Minutes per focus session</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                style={{
                  width: 28, height: 28, borderRadius: 8, border: `1px solid ${sub(0.1)}`,
                  background: "transparent", color: sub(0.6), fontSize: 16, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onClick={() => {
                  const next = Math.max(5, (state.pomodoroMinutes || 25) - 5);
                  save({ ...state, pomodoroMinutes: next });
                  if (!pomodoroActive) resetTimer();
                }}
              >−</button>
              <div style={{
                minWidth: 36, textAlign: "center",
                fontSize: 18, fontWeight: 800, color: colors.text,
              }}>
                {state.pomodoroMinutes || 25}
              </div>
              <button
                style={{
                  width: 28, height: 28, borderRadius: 8, border: `1px solid ${sub(0.1)}`,
                  background: "transparent", color: sub(0.6), fontSize: 16, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onClick={() => {
                  const next = Math.min(90, (state.pomodoroMinutes || 25) + 5);
                  save({ ...state, pomodoroMinutes: next });
                  if (!pomodoroActive) resetTimer();
                }}
              >+</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── VOICE ────────────────────────────────────────────────────────────── */}
      <div style={sectionLabel}>Voice</div>
      <div style={{ ...card, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
              Ambient voice
            </div>
            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 1.4 }}>
              Adaptive lines above your quests, post-completion observations, and pre-seal reflection prompts. Sparse by design.
            </div>
          </div>
          <button
            onClick={() => save({ ...state, voiceEnabled: state.voiceEnabled === false ? true : false })}
            style={{
              position: "relative",
              width: 44, height: 24, borderRadius: 12,
              background: state.voiceEnabled === false ? "rgba(255,255,255,0.1)" : "#7C5CFC",
              border: "none", cursor: "pointer", flexShrink: 0,
              transition: "background 0.2s ease",
            }}
            aria-label="Toggle voice"
          >
            <div style={{
              position: "absolute", top: 2,
              left: state.voiceEnabled === false ? 2 : 22,
              width: 20, height: 20, borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </button>
        </div>
      </div>

      {/* ── NOTIFICATIONS ────────────────────────────────────────────────────── */}
      <div style={sectionLabel}>Notifications</div>
      <div style={{ ...card, padding: "14px 16px" }}>
        {/* Permission status */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderRadius: 10,
          background: permStatus === "granted" ? "rgba(34,197,94,0.06)" : sub(0.03),
          border: `1px solid ${permStatus === "granted" ? "rgba(34,197,94,0.18)" : sub(0.06)}`,
          marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{permStatus === "granted" ? "🔔" : "🔕"}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
                {permStatus === "granted" ? "Notifications active" : permStatus === "denied" ? "Notifications blocked" : "Notifications off"}
              </div>
              <div style={{ fontSize: 10, color: colors.textSecondary, marginTop: 1 }}>
                {permStatus === "denied" ? "Enable in your browser's site settings" : permStatus === "granted" ? "You'll receive reminders when the app is open" : "Enable to get streak alerts & quest reminders"}
              </div>
            </div>
          </div>
          {permStatus !== "granted" && permStatus !== "denied" && (
            <button
              onClick={handleEnableNotif}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg,#7C5CFC,#6D28D9)",
                color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0,
              }}
            >
              Enable
            </button>
          )}
        </div>

        {/* Active toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: `1px solid ${sub(0.05)}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>Active</span>
          <button style={togTrack(notif.enabled)} role="switch" aria-checked={notif.enabled}
            onClick={() => updateNotif("enabled", !notif.enabled)}>
            <div style={togThumb(notif.enabled)} />
          </button>
        </div>

        <div style={{ opacity: notif.enabled ? 1 : 0.35, pointerEvents: notif.enabled ? "auto" : "none", marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: sub(0.35), marginBottom: 8 }}>
            Reminder Times
          </div>
          {[
            { label: "Cold Shower", icon: "🚿", key: "coldShowerTime" },
            { label: "No Screens", icon: "📵", key: "noScreensTime" },
            { label: "Streak Alert", icon: "🔥", key: "streakRiskTime" },
          ].map(({ label, icon, key }) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${sub(0.04)}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{icon}</span>
                <span style={{ fontSize: 13, color: colors.text }}>{label}</span>
              </div>
              <input
                type="time"
                value={notif[key]}
                onChange={(e) => updateNotif(key, e.target.value)}
                style={{
                  padding: "4px 8px", borderRadius: 8,
                  border: `1px solid ${inputBorder}`, background: inputBg,
                  color: colors.text, fontSize: 12, fontFamily: "inherit",
                  outline: "none", colorScheme: isDark ? "dark" : "light",
                }}
              />
            </div>
          ))}

          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: sub(0.35), marginBottom: 8 }}>Weekly Summary</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: colors.text }}>Send on</span>
              <select
                value={notif.weeklySummaryDay}
                onChange={(e) => updateNotif("weeklySummaryDay", Number(e.target.value))}
                style={{
                  padding: "4px 8px", borderRadius: 8,
                  border: `1px solid ${inputBorder}`, background: inputBg,
                  color: colors.text, fontSize: 12, fontFamily: "inherit",
                  outline: "none", colorScheme: isDark ? "dark" : "light", cursor: "pointer",
                }}
              >
                {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={saveNotif}
          style={{
            marginTop: 12, width: "100%", padding: "10px",
            borderRadius: 10, border: "none",
            background: notifSaved ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg,#7C5CFC,#6D28D9)",
            color: notifSaved ? "#22C55E" : "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            transition: "background 0.3s",
          }}
        >
          {notifSaved ? "✓ Saved" : "Save Notifications"}
        </button>
      </div>

      {/* ── AI COACH ─────────────────────────────────────────────────────────── */}
      <div style={sectionLabel}>AI Coach</div>
      <div style={{ ...card, padding: "16px" }}>
        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...rowIcon, background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)" }}>
              <Sparkles size={16} color="#7C5CFC" />
            </div>
            <div>
              <div style={rowTitle}>AI Coach</div>
              <div style={rowSub}>{aiConfigured ? "Connected — AI features active" : "No API key — using fallback mode"}</div>
            </div>
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: aiConfigured ? "#4ADE80" : sub(0.2),
            flexShrink: 0,
          }} />
        </div>

        {!aiConfigured && (
          <div style={{
            padding: "10px 12px", borderRadius: 10, marginBottom: 14,
            background: "rgba(124,92,252,0.06)", border: "1px solid rgba(124,92,252,0.15)",
            fontSize: 12, lineHeight: 1.5, color: sub(0.55),
          }}>
            Add an OpenAI-compatible API key to unlock AI-powered journal coaching, personalized quest starters, and smart workout suggestions.
          </div>
        )}

        {/* API Key */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: sub(0.5), marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>API Key</div>
          <input
            style={inputStyle}
            type={showKey ? "text" : "password"}
            value={showKey ? aiSettings.apiKey : maskKey(aiSettings.apiKey)}
            onChange={(e) => changeAI("apiKey", e.target.value)}
            onFocus={() => setShowKey(true)}
            onBlur={() => setShowKey(false)}
            placeholder="sk-..."
            autoComplete="off"
          />
          <div style={{ fontSize: 10, color: sub(0.3), marginTop: 3 }}>Stored locally only — never synced to cloud</div>
        </div>

        {/* API URL */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: sub(0.5), marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>API URL</div>
          <input
            style={inputStyle}
            type="text"
            value={aiSettings.apiUrl}
            onChange={(e) => changeAI("apiUrl", e.target.value)}
            placeholder="https://api.openai.com/v1"
          />
          <div style={{ fontSize: 10, color: sub(0.3), marginTop: 3 }}>OpenAI-compatible endpoint. Change for local models or proxies.</div>
        </div>

        {/* Model */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: sub(0.5), marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Model</div>
          <select
            style={{ ...inputStyle, colorScheme: isDark ? "dark" : "light", cursor: "pointer" }}
            value={DEFAULT_MODELS.includes(aiSettings.model) ? aiSettings.model : "__custom"}
            onChange={(e) => {
              if (e.target.value !== "__custom") changeAI("model", e.target.value);
            }}
          >
            {DEFAULT_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            <option value="__custom">Custom…</option>
          </select>
          {!DEFAULT_MODELS.includes(aiSettings.model) && (
            <input
              style={{ ...inputStyle, marginTop: 6 }}
              type="text"
              value={aiSettings.model}
              onChange={(e) => changeAI("model", e.target.value)}
              placeholder="Custom model name"
            />
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={saveAI}
            style={{
              padding: "9px 18px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg,#7C5CFC,#6D28D9)",
              color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            {aiSaved ? "✓ Saved" : "Save"}
          </button>
          <button
            onClick={testAI}
            disabled={aiTesting || !aiSettings.apiKey}
            style={{
              padding: "9px 18px", borderRadius: 8,
              border: "1px solid rgba(124,92,252,0.25)", background: "rgba(124,92,252,0.08)",
              color: "#7C5CFC", fontSize: 12, fontWeight: 600, cursor: "pointer",
              opacity: !aiSettings.apiKey ? 0.4 : 1,
            }}
          >
            {aiTesting ? "Testing…" : "Test"}
          </button>
          {aiConfigured && (
            <button
              onClick={clearAI}
              style={{
                padding: "9px 14px", borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.2)", background: "transparent",
                color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {aiTestResult && (
          <div style={{
            marginTop: 10, padding: "10px 12px", borderRadius: 8,
            border: `1px solid ${aiTestResult.success ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}`,
            background: aiTestResult.success ? "rgba(74,222,128,0.06)" : "rgba(239,68,68,0.06)",
          }}>
            {aiTestResult.success ? (
              <div style={{ color: "#4ADE80", fontSize: 12, fontWeight: 600 }}>
                ✓ Connected using {aiTestResult.model}
              </div>
            ) : (
              <div style={{ color: "#EF4444", fontSize: 12 }}>{aiTestResult.error || "Connection failed"}</div>
            )}
          </div>
        )}
      </div>

      {/* ── DATA ─────────────────────────────────────────────────────────────── */}
      <div style={sectionLabel}>Data & Privacy</div>
      <div style={card}>
        <button
          onClick={handleExport}
          style={{ ...row, width: "100%", border: "none", background: "transparent", cursor: "pointer", borderBottom: "none", textAlign: "left" }}
        >
          <div style={rowLeft}>
            <div style={{ ...rowIcon, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <Download size={16} color="#22C55E" />
            </div>
            <div>
              <div style={rowTitle}>Export All Data</div>
              <div style={rowSub}>Download a JSON backup of everything</div>
            </div>
          </div>
          <span style={{ fontSize: 20, color: sub(0.3) }}>›</span>
        </button>
      </div>

      {/* ── ACCOUNT ──────────────────────────────────────────────────────────── */}
      {user && (
        <>
          <div style={sectionLabel}>Account</div>
          <div style={card}>
            <div style={{ ...row, borderBottom: "none" }}>
              <div style={rowLeft}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg,#7C5CFC,#EC4899)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>
                  {(user.displayName || user.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div style={rowTitle}>{user.displayName || "Account"}</div>
                  <div style={rowSub}>{user.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                style={{
                  padding: "6px 14px", borderRadius: 8,
                  border: `1px solid ${sub(0.1)}`, background: "transparent",
                  color: sub(0.5), fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── DANGER ZONE ──────────────────────────────────────────────────────── */}
      <div style={sectionLabel}>Danger Zone</div>
      <div style={{
        margin: "0 16px 16px",
        padding: "14px 16px",
        borderRadius: 14,
        background: "rgba(239,68,68,0.03)",
        border: "1px solid rgba(239,68,68,0.12)",
      }}>
        <AnimatePresence mode="wait">
          {!confirmReset ? (
            <motion.button
              key="reset-btn"
              style={{
                width: "100%", padding: "12px",
                borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)",
                background: "transparent", color: "#EF4444",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
              onClick={() => setConfirmReset(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Reset All Progress
            </motion.button>
          ) : (
            <motion.div
              key="reset-confirm"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#EF4444", fontSize: 13, fontWeight: 600 }}>
                <AlertTriangle size={14} />
                This will permanently erase all your progress. Are you sure?
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    flex: 1, padding: "10px", borderRadius: 10,
                    border: "none", background: "#EF4444",
                    color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                  onClick={() => { onReset(); setConfirmReset(false); }}
                >
                  Yes, erase everything
                </button>
                <button
                  style={{
                    flex: 1, padding: "10px", borderRadius: 10,
                    border: `1px solid ${sub(0.1)}`, background: "transparent",
                    color: sub(0.5), fontSize: 12, cursor: "pointer",
                  }}
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Version note */}
      <div style={{ textAlign: "center", fontSize: 10, color: sub(0.2), paddingBottom: 24 }}>
        Life OS · All data stored locally
      </div>
    </div>
  );
}
