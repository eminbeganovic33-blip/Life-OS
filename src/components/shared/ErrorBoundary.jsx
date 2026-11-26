import { Component } from "react";
import { TOKENS } from "../../styles/tokens";
import { downloadJson, readRawState, stash, STATE_KEY } from "../../utils/backup";
import { Emoji } from "./Emoji";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Log so the user can include details in a bug report.
    console.error("[Life OS]", error, info?.componentStack);
    try {
      window.__lifeosSentry?.captureException(error, { extra: { componentStack: info?.componentStack } });
    } catch { /* reporting must never throw */ }
  }

  // The whole shell is replaced by this screen, so "Me → Export" is
  // unreachable here — offer the export directly.
  handleExport = () => {
    const raw = readRawState();
    if (!raw) { window.alert("No saved data found on this device."); return; }
    const day = new Date().toISOString().slice(0, 10);
    downloadJson(raw, `life-os-backup-${day}.json`);
  };

  handleReset = () => {
    if (window.confirm("Reset all app data? Export a backup first — this cannot be undone.")) {
      try {
        stash(readRawState()); // last-resort copy, recoverable from Me
        localStorage.removeItem(STATE_KEY);
      } catch { /* blocked storage */ }
      window.location.reload();
    }
  };

  render() {
    if (this.state.error) {
      return (
        <div style={styles.container}>
          <div style={styles.iconBadge}><Emoji e="⚠️" size="1.1em" /></div>
          <div style={styles.title}>Something broke</div>
          <div style={styles.sub}>
            Your data is safe on this device. Reload to try again. If it keeps happening,
            export a backup first, then reset.
          </div>
          <pre style={styles.errBox}>{this.state.error.message}</pre>
          <div style={styles.btnRow}>
            <button onClick={() => window.location.reload()} style={styles.btnPrimary}>
              Reload
            </button>
            <button onClick={this.handleExport} style={styles.btnSecondary}>
              Export backup
            </button>
            <button onClick={this.handleReset} style={styles.btnSecondary}>
              Reset data
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  container: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    height: "100dvh", padding: 32, textAlign: "center",
    background: TOKENS.color.bg,
  },
  iconBadge: {
    fontSize: 72, marginBottom: 16,
  },
  title: {
    fontSize: TOKENS.font.size.xxl,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textSecondary,
    marginTop: 12,
    maxWidth: 360,
    lineHeight: 1.6,
  },
  errBox: {
    marginTop: 20,
    padding: "10px 14px",
    background: "rgba(239,68,68,0.06)",
    border: "1px solid rgba(239,68,68,0.20)",
    borderRadius: TOKENS.radius.md,
    fontSize: 12,
    color: TOKENS.color.textSecondary,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
    maxWidth: 380, width: "100%",
    whiteSpace: "pre-wrap", wordBreak: "break-word",
    textAlign: "left",
  },
  btnRow: {
    display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap", justifyContent: "center",
  },
  btnPrimary: {
    padding: "12px 24px",
    borderRadius: TOKENS.radius.lg, border: "none",
    background: TOKENS.color.primary, boxShadow: TOKENS.shadow.press, color: "#fff",
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "12px 24px",
    borderRadius: TOKENS.radius.lg,
    border: `1px solid ${TOKENS.color.border}`,
    background: "transparent",
    color: TOKENS.color.textSecondary,
    fontSize: TOKENS.font.size.sm, fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
};
