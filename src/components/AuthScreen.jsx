import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { TOKENS, DARK_COLORS } from "../styles/theme";

const T = TOKENS;
const C = DARK_COLORS;

export default function AuthScreen({ onAuth, onSkip }) {
  const { user, login, signup, loginWithGoogle, loginWithFacebook, resetPassword, error } =
    useAuth();

  const [mode, setMode] = useState("signin");
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

  const clearState = () => { setLocalError(null); setResetSent(false); };
  const switchMode = (m) => { setMode(m); clearState(); };

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
      if (!displayName.trim()) { setLocalError("Display name is required."); return false; }
      if (password !== confirmPassword) { setLocalError("Passwords do not match."); return false; }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearState();
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === "signin") await login(email, password);
      else await signup(email, password, displayName);
    } catch {} finally { setBusy(false); }
  };

  const handleSocial = async (provider) => {
    clearState();
    setBusy(true);
    try {
      if (provider === "google") await loginWithGoogle();
      else if (provider === "facebook") await loginWithFacebook();
    } catch {} finally { setBusy(false); }
  };

  const handleForgot = async () => {
    clearState();
    if (!email.trim()) { setLocalError("Enter your email first."); return; }
    setBusy(true);
    try { await resetPassword(email); setResetSent(true); }
    catch {} finally { setBusy(false); }
  };

  const displayError = localError || error;

  return (
    <div style={styles.wrapper}>
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Brand */}
        <div style={styles.brandSection}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={styles.logoIcon}
          >
            <span style={{ fontSize: 36 }}>&#9889;</span>
          </motion.div>
          <h1 style={styles.logoText}>Life OS</h1>
          <p style={styles.tagline}>Your operating system for a better life</p>
        </div>

        {/* Social Login Buttons — primary CTAs */}
        <div style={styles.socialSection}>
          <button
            style={styles.googleBtn}
            onClick={() => handleSocial("google")}
            disabled={busy}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            style={styles.facebookBtn}
            onClick={() => handleSocial("facebook")}
            disabled={busy}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#fff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div style={styles.dividerRow}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or continue with email</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Tab toggle */}
        <div style={styles.tabRow}>
          <button style={styles.tab(mode === "signin")} onClick={() => switchMode("signin")}>
            Sign In
          </button>
          <button style={styles.tab(mode === "signup")} onClick={() => switchMode("signup")}>
            Create Account
          </button>
        </div>

        {/* Error / Success */}
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.errorText}
          >
            {displayError}
          </motion.div>
        )}
        {resetSent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.successText}
          >
            Password reset email sent! Check your inbox.
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              style={styles.input}
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
          {mode === "signup" && (
            <input
              style={styles.input}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          )}

          {mode === "signin" && (
            <button type="button" style={styles.forgotLink} onClick={handleForgot}>
              Forgot password?
            </button>
          )}

          <button type="submit" style={styles.submitBtn(busy)} disabled={busy}>
            {busy ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Skip */}
        <button style={styles.skipBtn} onClick={() => onSkip?.()}>
          Continue without account
          <span style={{ opacity: 0.4, marginLeft: 4 }}>&#8594;</span>
        </button>

        {/* Footer */}
        <p style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(180deg, ${C.bgGrad1} 0%, ${C.bgGrad2} 100%)`,
    padding: `${T.space.xxl}px ${T.space.lg}px`,
    fontFamily: "'SF Pro Display','Inter','Segoe UI',system-ui,sans-serif",
    color: C.text,
  },
  card: {
    width: "100%",
    maxWidth: 400,
  },

  // Brand
  brandSection: {
    textAlign: "center",
    marginBottom: T.space.xxxl,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: T.radii.lg,
    background: "linear-gradient(135deg, rgba(124,92,252,0.15), rgba(236,72,153,0.1))",
    border: "1px solid rgba(124,92,252,0.2)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: T.space.md,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 900,
    background: "linear-gradient(135deg, #E2E8F0, #CBD5E1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: T.font.sm,
    color: C.textSecondary,
    margin: `${T.space.xs}px 0 0`,
  },

  // Social buttons
  socialSection: {
    display: "flex",
    flexDirection: "column",
    gap: T.space.md,
    marginBottom: T.space.xl,
  },
  googleBtn: {
    width: "100%",
    padding: "14px 16px",
    fontSize: T.font.sm,
    fontWeight: T.weight.bold,
    border: `1px solid ${C.surfaceBorder}`,
    borderRadius: T.radii.md,
    cursor: "pointer",
    background: "#FFFFFF",
    color: "#1F1F1F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: T.space.md,
    transition: `all ${T.transition.fast}`,
    fontFamily: "inherit",
  },
  facebookBtn: {
    width: "100%",
    padding: "14px 16px",
    fontSize: T.font.sm,
    fontWeight: T.weight.bold,
    border: "none",
    borderRadius: T.radii.md,
    cursor: "pointer",
    background: "#1877F2",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: T.space.md,
    transition: `all ${T.transition.fast}`,
    fontFamily: "inherit",
  },

  // Divider
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: T.space.md,
    margin: `${T.space.xl}px 0`,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: C.surfaceBorder,
  },
  dividerText: {
    fontSize: T.font.xs,
    color: C.textSecondary,
    whiteSpace: "nowrap",
  },

  // Tabs
  tabRow: {
    display: "flex",
    background: C.surface,
    borderRadius: T.radii.md,
    padding: 3,
    marginBottom: T.space.xl,
    border: `1px solid ${C.surfaceBorder}`,
  },
  tab: (active) => ({
    flex: 1,
    textAlign: "center",
    padding: "10px 0",
    fontSize: T.font.sm,
    fontWeight: T.weight.medium,
    borderRadius: 10,
    cursor: "pointer",
    transition: `all ${T.transition.fast}`,
    background: active ? C.accent : "transparent",
    color: active ? "#fff" : C.textSecondary,
    border: "none",
    outline: "none",
    fontFamily: "inherit",
  }),

  // Input
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: T.font.sm,
    background: C.inputBg,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: T.radii.md,
    color: C.text,
    outline: "none",
    marginBottom: T.space.md,
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: `border-color ${T.transition.fast}`,
  },

  // Submit
  submitBtn: (disabled) => ({
    width: "100%",
    padding: "14px 20px",
    fontSize: T.font.sm,
    fontWeight: T.weight.bold,
    border: "none",
    borderRadius: T.radii.md,
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled
      ? C.surface
      : "linear-gradient(135deg, #7C5CFC, #6D28D9)",
    color: "#fff",
    opacity: disabled ? 0.5 : 1,
    transition: `all ${T.transition.normal}`,
    marginBottom: T.space.sm,
    fontFamily: "inherit",
    boxShadow: disabled ? "none" : "0 4px 16px rgba(124,92,252,0.25)",
  }),

  forgotLink: {
    background: "none",
    border: "none",
    color: C.accent,
    fontSize: T.font.xs,
    cursor: "pointer",
    padding: 0,
    marginBottom: T.space.lg,
    display: "block",
    textAlign: "right",
    fontFamily: "inherit",
  },

  // Messages
  errorText: {
    color: "#FF5A5A",
    fontSize: T.font.xs,
    marginBottom: T.space.md,
    textAlign: "center",
    padding: `${T.space.sm}px ${T.space.md}px`,
    background: "rgba(255,90,90,0.08)",
    borderRadius: T.radii.sm,
    border: "1px solid rgba(255,90,90,0.15)",
  },
  successText: {
    color: "#34D399",
    fontSize: T.font.xs,
    marginBottom: T.space.md,
    textAlign: "center",
    padding: `${T.space.sm}px ${T.space.md}px`,
    background: "rgba(52,211,153,0.08)",
    borderRadius: T.radii.sm,
    border: "1px solid rgba(52,211,153,0.15)",
  },

  // Skip
  skipBtn: {
    width: "100%",
    padding: "12px 14px",
    fontSize: T.font.xs,
    fontWeight: T.weight.medium,
    border: `1px solid ${C.surfaceBorder}`,
    borderRadius: T.radii.md,
    cursor: "pointer",
    background: "transparent",
    color: C.textSecondary,
    marginTop: T.space.md,
    transition: `all ${T.transition.fast}`,
    fontFamily: "inherit",
  },

  // Footer
  footer: {
    fontSize: T.font.xs,
    color: C.textSecondary,
    textAlign: "center",
    marginTop: T.space.xl,
    opacity: 0.5,
    lineHeight: 1.4,
  },
};
