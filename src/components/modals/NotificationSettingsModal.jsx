import { useState } from "react";
import { S } from "../../styles/theme";
import { requestNotificationPermission, getDefaultNotificationSettings } from "../../utils/notifications";

export default function NotificationSettingsModal({ settings, onSave, onClose }) {
  const [local, setLocal] = useState(settings || getDefaultNotificationSettings());
  const [permStatus, setPermStatus] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unavailable"
  );

  function update(key, val) {
    setLocal((s) => ({ ...s, [key]: val }));
  }

  async function handleEnable() {
    const result = await requestNotificationPermission();
    setPermStatus(result);
    if (result === "granted") {
      update("enabled", true);
    }
  }

  function handleSave() {
    onSave(local);
    onClose();
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Notifications</div>
          <span style={S.modalClose} onClick={onClose}>✕</span>
        </div>

        {/* Permission Status */}
        <div style={statusBox}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{permStatus === "granted" ? "🔔" : "🔕"}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {permStatus === "granted" ? "Notifications Active" : "Notifications Off"}
              </div>
              <div style={{ fontSize: 10, opacity: 0.4, marginTop: 1 }}>
                {permStatus === "granted"
                  ? "You'll receive reminders when the app is open."
                  : permStatus === "denied"
                    ? "Blocked by browser. Enable in site settings."
                    : "Enable to get quest reminders & streak alerts."}
              </div>
            </div>
          </div>
          {permStatus !== "granted" && permStatus !== "denied" && (
            <button style={enableBtn} onClick={handleEnable}>Enable</button>
          )}
        </div>

        {/* Toggle */}
        <div style={settingRow}>
          <span style={{ fontSize: 13 }}>Active</span>
          <div
            style={{
              ...toggleTrack,
              background: local.enabled ? "rgba(124,92,252,0.4)" : "rgba(255,255,255,0.08)",
            }}
            onClick={() => update("enabled", !local.enabled)}
          >
            <div
              style={{
                ...toggleThumb,
                transform: local.enabled ? "translateX(18px)" : "translateX(0)",
                background: local.enabled ? "#7C5CFC" : "rgba(255,255,255,0.3)",
              }}
            />
          </div>
        </div>

        <div style={{ opacity: local.enabled ? 1 : 0.35, pointerEvents: local.enabled ? "auto" : "none" }}>
          {/* Reminder Times */}
          <div style={sectionTitle}>Reminder Times</div>

          <TimeRow
            label="Cold Shower Reminder"
            icon="🚿"
            value={local.coldShowerTime}
            onChange={(v) => update("coldShowerTime", v)}
          />
          <TimeRow
            label="No Screens Reminder"
            icon="📵"
            value={local.noScreensTime}
            onChange={(v) => update("noScreensTime", v)}
          />
          <TimeRow
            label="Streak at Risk Alert"
            icon="🔥"
            value={local.streakRiskTime}
            onChange={(v) => update("streakRiskTime", v)}
          />

          <div style={sectionTitle}>Weekly Summary</div>
          <div style={settingRow}>
            <span style={{ fontSize: 12 }}>Send on</span>
            <select
              style={selectInput}
              value={local.weeklySummaryDay}
              onChange={(e) => update("weeklySummaryDay", Number(e.target.value))}
            >
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <button style={{ ...S.primaryBtn, width: "100%", marginTop: 16, marginLeft: 0 }} onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

function TimeRow({ label, icon, value, onChange }) {
  return (
    <div style={settingRow}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>{icon}</span>
        <span style={{ fontSize: 12 }}>{label}</span>
      </div>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={timeInput}
      />
    </div>
  );
}

const statusBox = {
  padding: 14,
  borderRadius: 12,
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.04)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};
const enableBtn = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "none",
  background: "linear-gradient(135deg,#7C5CFC,#6D28D9)",
  color: "#fff",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
  flexShrink: 0,
};
const settingRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};
const sectionTitle = {
  fontSize: 11,
  fontWeight: 700,
  opacity: 0.4,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginTop: 16,
  marginBottom: 4,
};
const toggleTrack = {
  width: 40,
  height: 22,
  borderRadius: 11,
  cursor: "pointer",
  position: "relative",
  transition: "background 0.2s",
};
const toggleThumb = {
  width: 18,
  height: 18,
  borderRadius: 9,
  position: "absolute",
  top: 2,
  left: 2,
  transition: "transform 0.2s, background 0.2s",
};
const timeInput = {
  padding: "4px 8px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#E2E2EE",
  fontSize: 12,
  fontFamily: "inherit",
  outline: "none",
  colorScheme: "dark",
};
const selectInput = {
  padding: "4px 8px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#E2E2EE",
  fontSize: 12,
  fontFamily: "inherit",
  outline: "none",
  colorScheme: "dark",
};
