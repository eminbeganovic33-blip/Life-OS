import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ChevronRight, AlertCircle } from "lucide-react";
import { TOKENS } from "../../styles/tokens";
import { useAuth } from "../../hooks/useAuth";

export default function AuthScreen({ onSkip }) {
  const { login, signup, loginWithGoogle, error: authError } = useAuth();
  const [mode, setMode] = useState("intro"); // intro | signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const error = localError || authError;

  async function handleGoogle() {
    setLoading(true);
    setLocalError(null);
    try { await loginWithGoogle(); } catch (e) { setLocalError(e.message); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true);
    setLocalError(null);
    try {
      if (mode === "signup") {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Intro: pick auth method
  if (mode === "intro") {
    return (
      <div style={styles.container}>
        <motion.div
          style={styles.heroContent}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={styles.heroGradient}>
            <div style={styles.heroEmoji}>⚡</div>
          </div>
          <div style={styles.logo}>Life OS</div>
          <div style={styles.tagline}>Your daily intelligence briefing</div>
          <div style={styles.subtagline}>
            Build the habits that build the life. Track quests, forge sobriety, train your body, learn from the best.
          </div>
        </motion.div>

        <motion.div
          style={styles.footer}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <button onClick={handleGoogle} disabled={loading} style={styles.googleBtn}>
            <span style={styles.googleG}>G</span>
            Continue with Google
          </button>

          <button onClick={() => setMode("signup")} style={styles.primaryBtn}>
            <Mail size={16} />
            Sign up with email
          </button>

          <div style={styles.signInRow}>
            Already have an account?{" "}
            <button onClick={() => setMode("signin")} style={styles.linkBtn}>Sign in</button>
          </div>

          <button onClick={onSkip} disabled={loading} style={styles.skipBtn}>
            Continue without account →
          </button>
        </motion.div>
      </div>
    );
  }

  // Sign in / Sign up form
  return (
    <div style={styles.container}>
      <button onClick={() => { setMode("intro"); setLocalError(null); }} style={styles.backLink}>
        ← Back
      </button>

      <motion.form
        onSubmit={handleSubmit}
        style={styles.form}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={styles.formTitle}>
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </div>
        <div style={styles.formSub}>
          {mode === "signup" ? "Start your journey" : "Sign in to continue"}
        </div>

        {mode === "signup" && (
          <div style={styles.inputGroup}>
            <User size={16} color={TOKENS.color.textTertiary} style={styles.inputIcon} />
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>
        )}

        <div style={styles.inputGroup}>
          <Mail size={16} color={TOKENS.color.textTertiary} style={styles.inputIcon} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
            autoComplete="email"
          />
        </div>

        <div style={styles.inputGroup}>
          <Lock size={16} color={TOKENS.color.textTertiary} style={styles.inputIcon} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              style={styles.errorBox}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle size={14} color={TOKENS.color.danger} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? "Loading..." : mode === "signup" ? "Create account" : "Sign in"}
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setLocalError(null); }}
          style={styles.switchBtn}
        >
          {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </motion.form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    padding: `${TOKENS.space[8]}px ${TOKENS.space[6]}px ${TOKENS.space[8]}px`,
    background: `linear-gradient(180deg, ${TOKENS.color.bg} 0%, #FAFAFA 100%)`,
  },
  heroContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  heroGradient: {
    width: 88, height: 88, borderRadius: 24,
    background: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: TOKENS.space[5],
    boxShadow: "0 12px 32px rgba(124,92,252,0.25)",
  },
  heroEmoji: { fontSize: 44 },
  logo: {
    fontSize: 44, fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text, letterSpacing: -1.5,
  },
  tagline: {
    fontSize: TOKENS.font.size.md, color: TOKENS.color.textSecondary,
    marginTop: TOKENS.space[2], fontWeight: TOKENS.font.weight.semibold,
  },
  subtagline: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textTertiary,
    marginTop: TOKENS.space[5], maxWidth: 320, lineHeight: 1.6,
  },
  footer: { display: "flex", flexDirection: "column", gap: TOKENS.space[3] },
  googleBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    width: "100%", padding: "14px",
    borderRadius: TOKENS.radius.lg, border: `1px solid ${TOKENS.color.border}`,
    background: "#fff", color: TOKENS.color.text,
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.semibold,
    cursor: "pointer", transition: TOKENS.transition.fast,
  },
  googleG: {
    width: 20, height: 20, borderRadius: "50%",
    background: "linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)",
    color: "#fff", fontSize: 12, fontWeight: 900,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  primaryBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%", padding: "14px",
    borderRadius: TOKENS.radius.lg, border: "none",
    background: TOKENS.color.text, color: "#fff",
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
  },
  signInRow: {
    textAlign: "center", fontSize: TOKENS.font.size.sm,
    color: TOKENS.color.textTertiary, padding: `${TOKENS.space[2]}px 0`,
  },
  linkBtn: {
    background: "none", border: "none", padding: 0, cursor: "pointer",
    color: TOKENS.color.brand, fontWeight: TOKENS.font.weight.bold,
    fontSize: TOKENS.font.size.sm,
  },
  skipBtn: {
    width: "100%", padding: "10px",
    border: "none", background: "none",
    color: TOKENS.color.textTertiary, fontSize: TOKENS.font.size.xs,
    fontWeight: TOKENS.font.weight.medium, cursor: "pointer",
  },
  backLink: {
    background: "none", border: "none", cursor: "pointer",
    color: TOKENS.color.textSecondary, fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.semibold, padding: 0, textAlign: "left",
    alignSelf: "flex-start", marginBottom: TOKENS.space[6],
  },
  form: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" },
  formTitle: {
    fontSize: 28, fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text, letterSpacing: -0.5,
  },
  formSub: {
    fontSize: TOKENS.font.size.sm, color: TOKENS.color.textSecondary,
    marginTop: 4, marginBottom: TOKENS.space[6],
  },
  inputGroup: {
    position: "relative", marginBottom: TOKENS.space[3],
  },
  inputIcon: {
    position: "absolute", left: 14, top: "50%",
    transform: "translateY(-50%)", pointerEvents: "none",
  },
  input: {
    width: "100%", padding: "14px 14px 14px 40px",
    borderRadius: TOKENS.radius.lg,
    border: `1px solid ${TOKENS.color.border}`,
    background: TOKENS.color.surface, fontSize: TOKENS.font.size.md,
    color: TOKENS.color.text, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px", borderRadius: TOKENS.radius.md,
    background: "rgba(239,68,68,0.08)", color: TOKENS.color.danger,
    fontSize: TOKENS.font.size.xs, fontWeight: TOKENS.font.weight.medium,
    marginBottom: TOKENS.space[3],
  },
  submitBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%", padding: "14px",
    borderRadius: TOKENS.radius.lg, border: "none",
    background: TOKENS.color.text, color: "#fff",
    fontSize: TOKENS.font.size.md, fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer", marginTop: TOKENS.space[2],
  },
  switchBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: TOKENS.color.textTertiary, fontSize: TOKENS.font.size.xs,
    marginTop: TOKENS.space[4], padding: TOKENS.space[2],
  },
};
