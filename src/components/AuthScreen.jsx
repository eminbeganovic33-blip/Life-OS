import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const S = {
  wrapper: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D14",
    padding: "24px 16px",
  },
  card: {
    width: "100%",
    maxWidth: 380,
  },
  logoRow: {
    textAlign: "center",
    marginBottom: 28,
  },
  logoIcon: {
    fontSize: 40,
    marginBottom: 6,
    display: "block",
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: "#E2E2EE",
    letterSpacing: "-0.02em",
  },
  tabRow: {
    display: "flex",
    background: "#181820",
    borderRadius: 14,
    padding: 3,
    marginBottom: 22,
  },
  tab: (active) => ({
    flex: 1,
    textAlign: "center",
    padding: "10px 0",
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 11,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
    background: active ? "#7C5CFC" : "transparent",
    color: active ? "#fff" : "#888",
    border: "none",
    outline: "none",
  }),
  input: {
    width: "100%",
    padding: 14,
    fontSize: 14,
    background: "#181820",
    border: "1px solid #2A2A35",
    borderRadius: 12,
    color: "#E2E2EE",
    outline: "none",
    marginBottom: 12,
    boxSizing: "border-box",
  },
  primaryBtn: (disabled) => ({
    width: "100%",
    padding: 14,
    fontSize: 14,
    fontWeight: 700,
    border: "none",
    borderRadius: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled
      ? "#3a3a4a"
      : "linear-gradient(135deg, #7C5CFC, #6A4FF0)",
    color: "#fff",
    opacity: disabled ? 0.6 : 1,
    transition: "opacity 0.2s",
    marginBottom: 12,
  }),
  forgotLink: {
    background: "none",
    border: "none",
    color: "#7C5CFC",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    marginBottom: 16,
    display: "block",
    textAlign: "right",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "16px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#2A2A35",
  },
  dividerText: {
    fontSize: 13,
    color: "#666",
  },
  googleBtn: {
    width: "100%",
    padding: 14,
    fontSize: 14,
    fontWeight: 700,
    border: "1px solid #2A2A35",
    borderRadius: 14,
    cursor: "pointer",
    background: "#fff",
    color: "#222",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  googleIcon: {
    fontWeight: 700,
    fontSize: 18,
    color: "#4285F4",
  },
  errorText: {
    color: "#FF5A5A",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    color: "#34D399",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
};

export default function AuthScreen({ onAuth }) {
  const { user, login, signup, loginWithGoogle, resetPassword, error } =
    useAuth();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localError, setLocalError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (user) onAuth?.();
  }, [user]);

  const clearState = () => {
    setLocalError(null);
    setResetSent(false);
  };

  const switchMode = (m) => {
    setMode(m);
    clearState();
  };

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return false;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return false;
    }
    if (mode === "signup") {
      if (!displayName.trim()) {
        setLocalError("Display name is required.");
        return false;
      }
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearState();
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === "signin") {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
    } catch {
      // error is surfaced via useAuth().error
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    clearState();
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch {
      // error is surfaced via useAuth().error
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    clearState();
    if (!email.trim()) {
      setLocalError("Enter your email first.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch {
      // error is surfaced via useAuth().error
    } finally {
      setBusy(false);
    }
  };

  const displayError = localError || error;

  return (
    <div style={S.wrapper}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logoRow}>
          <span style={S.logoIcon}>⚡</span>
          <span style={S.logoText}>Life OS</span>
        </div>

        {/* Tab toggle */}
        <div style={S.tabRow}>
          <button
            style={S.tab(mode === "signin")}
            onClick={() => switchMode("signin")}
          >
            Sign In
          </button>
          <button
            style={S.tab(mode === "signup")}
            onClick={() => switchMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Error / Success */}
        {displayError && <div style={S.errorText}>{displayError}</div>}
        {resetSent && (
          <div style={S.successText}>Check your email!</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              style={S.input}
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}
          <input
            style={S.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={S.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && (
            <input
              style={S.input}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          {mode === "signin" && (
            <button type="button" style={S.forgotLink} onClick={handleForgot}>
              Forgot password?
            </button>
          )}

          <button type="submit" style={S.primaryBtn(busy)} disabled={busy}>
            {busy
              ? "Please wait..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div style={S.dividerRow}>
          <div style={S.dividerLine} />
          <span style={S.dividerText}>or</span>
          <div style={S.dividerLine} />
        </div>

        {/* Google */}
        <button style={S.googleBtn} onClick={handleGoogle} disabled={busy}>
          <span style={S.googleIcon}>G</span>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
