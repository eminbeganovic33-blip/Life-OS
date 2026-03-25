import { useState, useEffect } from "react";
import { loadAISettings, saveAISettings, isAIConfigured, testAIConnection } from "../utils/ai";

const DEFAULT_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4-turbo",
  "gpt-3.5-turbo",
  "claude-3-haiku-20240307",
  "claude-3-5-sonnet-20241022",
];

export default function AISettings() {
  const [settings, setSettings] = useState(loadAISettings);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const configured = isAIConfigured();

  function handleChange(field, value) {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setTestResult(null);
  }

  function handleSave() {
    saveAISettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest() {
    // Save first so the test uses current settings
    saveAISettings(settings);
    setTesting(true);
    setTestResult(null);
    const result = await testAIConnection();
    setTestResult(result);
    setTesting(false);
  }

  function handleClear() {
    const cleared = { apiKey: "", apiUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" };
    setSettings(cleared);
    saveAISettings(cleared);
    setTestResult(null);
    setSaved(false);
  }

  function maskKey(key) {
    if (!key || key.length < 8) return key;
    return key.substring(0, 4) + "\u2022".repeat(Math.min(key.length - 8, 20)) + key.substring(key.length - 4);
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.icon}>&#10024;</span>
          <span style={s.title}>AI Coach Settings</span>
        </div>
        <span
          style={{
            ...s.statusDot,
            background: configured ? "#4ADE80" : "rgba(226,226,238,0.2)",
          }}
        />
      </div>

      <div style={s.statusText}>
        {configured
          ? "AI features are active"
          : "Configure an API key to enable AI coaching, journal analysis, and personalized insights"
        }
      </div>

      {/* API Key */}
      <div style={s.field}>
        <label style={s.label}>API Key</label>
        <div style={s.inputRow}>
          <input
            style={s.input}
            type={showKey ? "text" : "password"}
            value={showKey ? settings.apiKey : maskKey(settings.apiKey)}
            onChange={(e) => handleChange("apiKey", e.target.value)}
            onFocus={() => setShowKey(true)}
            onBlur={() => setShowKey(false)}
            placeholder="sk-..."
            autoComplete="off"
          />
        </div>
        <div style={s.hint}>Your key is stored locally only — never synced to cloud</div>
      </div>

      {/* API URL */}
      <div style={s.field}>
        <label style={s.label}>API URL</label>
        <input
          style={s.input}
          type="text"
          value={settings.apiUrl}
          onChange={(e) => handleChange("apiUrl", e.target.value)}
          placeholder="https://api.openai.com/v1"
        />
        <div style={s.hint}>OpenAI-compatible endpoint. Change for local models or proxies.</div>
      </div>

      {/* Model */}
      <div style={s.field}>
        <label style={s.label}>Model</label>
        <div style={s.selectRow}>
          <select
            style={s.select}
            value={DEFAULT_MODELS.includes(settings.model) ? settings.model : "__custom"}
            onChange={(e) => {
              if (e.target.value !== "__custom") {
                handleChange("model", e.target.value);
              }
            }}
          >
            {DEFAULT_MODELS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
            {!DEFAULT_MODELS.includes(settings.model) && (
              <option value="__custom">{settings.model} (custom)</option>
            )}
          </select>
          <input
            style={{ ...s.input, flex: 1 }}
            type="text"
            value={settings.model}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="Model name"
          />
        </div>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button
          style={s.primaryBtn}
          onClick={handleSave}
        >
          {saved ? "\u2713 Saved" : "Save Settings"}
        </button>
        <button
          style={s.testBtn}
          onClick={handleTest}
          disabled={testing || !settings.apiKey}
        >
          {testing ? (
            <span style={s.loadingRow}>
              <span style={s.spinner} />
              Testing...
            </span>
          ) : (
            "Test Connection"
          )}
        </button>
        {configured && (
          <button style={s.clearBtn} onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          style={{
            ...s.testResult,
            borderColor: testResult.success
              ? "rgba(74,222,128,0.2)"
              : "rgba(239,68,68,0.2)",
            background: testResult.success
              ? "rgba(74,222,128,0.06)"
              : "rgba(239,68,68,0.06)",
          }}
        >
          {testResult.success ? (
            <div style={{ color: "#4ADE80", fontSize: 12, fontWeight: 600 }}>
              Connected successfully using {testResult.model}
            </div>
          ) : (
            <div style={{ color: "#EF4444", fontSize: 12 }}>
              {testResult.error || "Connection failed"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  container: {
    margin: "0 14px 12px",
    padding: "16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 16,
    lineHeight: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: "#E2E2EE",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  statusText: {
    fontSize: 11,
    color: "rgba(226,226,238,0.45)",
    marginBottom: 14,
    lineHeight: 1.5,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(226,226,238,0.6)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#E2E2EE",
    fontSize: 12,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  hint: {
    fontSize: 10,
    color: "rgba(226,226,238,0.3)",
    marginTop: 3,
  },
  selectRow: {
    display: "flex",
    gap: 8,
  },
  select: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(13,13,20,0.9)",
    color: "#E2E2EE",
    fontSize: 12,
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "9px 18px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(124,92,252,0.2)",
  },
  testBtn: {
    padding: "9px 18px",
    borderRadius: 8,
    border: "1px solid rgba(124,92,252,0.2)",
    background: "rgba(124,92,252,0.08)",
    color: "#7C5CFC",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  clearBtn: {
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid rgba(239,68,68,0.15)",
    background: "transparent",
    color: "#EF4444",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  spinner: {
    display: "inline-block",
    width: 12,
    height: 12,
    border: "2px solid rgba(124,92,252,0.2)",
    borderTopColor: "#7C5CFC",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
  },
  testResult: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid",
  },
};
