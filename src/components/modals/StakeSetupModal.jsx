import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { TOKENS } from "../../styles/theme";
import { ArrowRight, ArrowLeft, X } from "lucide-react";

const T = TOKENS;

// Three screens. One question each. Slow on purpose.
const STEPS = [
  {
    key: "why",
    eyebrow: "01 / 03",
    title: "Why are you here?",
    sub: "No one else will read this. Not marketing, not therapy-speak. The real reason. One sentence.",
    placeholder: "I'm here because…",
    minLen: 10,
    maxLen: 240,
  },
  {
    key: "cost",
    eyebrow: "02 / 03",
    title: "What happens if you don't?",
    sub: "Be honest. Name the cost of the path you're on. This is the sentence you'll read on a missed day.",
    placeholder: "If I don't do this…",
    minLen: 10,
    maxLen: 240,
  },
  {
    key: "proof",
    eyebrow: "03 / 03",
    title: "How will you know it worked?",
    sub: "In 66 days. Something measurable, or something you'll feel. Future-you, writing back.",
    placeholder: "In 66 days, I'll know because…",
    minLen: 10,
    maxLen: 240,
  },
];

export default function StakeSetupModal({ show, existing, onSave, onDefer, onClose, arcColor }) {
  const { colors } = useTheme();
  const accent = arcColor || "#7C5CFC";
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({
    why: existing?.why || "",
    cost: existing?.cost || "",
    proof: existing?.proof || "",
  });
  const taRef = useRef(null);

  useEffect(() => {
    if (show) {
      setStep(0);
      setValues({
        why: existing?.why || "",
        cost: existing?.cost || "",
        proof: existing?.proof || "",
      });
    }
  }, [show, existing]);

  useEffect(() => {
    if (show && taRef.current) {
      const t = setTimeout(() => taRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [show, step]);

  if (!show) return null;

  const current = STEPS[step];
  const val = values[current.key];
  const canContinue = val.trim().length >= current.minLen;
  const isLast = step === STEPS.length - 1;
  const isEditing = !!existing;

  const handleContinue = () => {
    if (!canContinue) return;
    if (isLast) {
      onSave({
        why: values.why.trim(),
        cost: values.cost.trim(),
        proof: values.proof.trim(),
      });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.overlay}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          style={{ ...styles.card, background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close / defer */}
          {!isEditing && (
            <button
              onClick={onDefer}
              style={{ ...styles.closeBtn, color: colors.textSecondary }}
              aria-label="Skip for now"
            >
              <X size={18} />
            </button>
          )}
          {isEditing && (
            <button
              onClick={onClose}
              style={{ ...styles.closeBtn, color: colors.textSecondary }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}

          {/* Progress bar */}
          <div style={styles.progressTrack}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.progressSeg,
                  background: i <= step ? accent : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ ...styles.eyebrow, color: accent }}>
                {current.eyebrow} · The Stake
              </div>
              <h2 style={{ ...styles.title, color: colors.text }}>{current.title}</h2>
              <p style={{ ...styles.sub, color: colors.textSecondary }}>{current.sub}</p>

              <textarea
                ref={taRef}
                value={val}
                onChange={(e) =>
                  setValues({ ...values, [current.key]: e.target.value.slice(0, current.maxLen) })
                }
                placeholder={current.placeholder}
                rows={4}
                style={{
                  ...styles.textarea,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.text,
                }}
              />

              <div style={{ ...styles.counter, color: colors.textSecondary }}>
                {val.length} / {current.maxLen}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div style={styles.navRow}>
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                style={{ ...styles.backBtn, color: colors.textSecondary }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              style={{
                ...styles.primaryBtn,
                opacity: canContinue ? 1 : 0.35,
                cursor: canContinue ? "pointer" : "default",
              }}
            >
              {isLast ? "Seal the stake" : "Continue"}
              <ArrowRight size={14} />
            </button>
          </div>

          {!isEditing && step === 0 && (
            <button onClick={onDefer} style={{ ...styles.deferLink, color: colors.textSecondary }}>
              Not now — remind me later
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.78)",
    backdropFilter: "blur(10px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: T.space.lg,
  },
  card: {
    position: "relative",
    width: "100%", maxWidth: 420,
    padding: "28px 24px 20px",
    borderRadius: T.radii.xl,
  },
  closeBtn: {
    position: "absolute", top: 12, right: 12,
    background: "transparent", border: "none",
    cursor: "pointer", opacity: 0.5,
    padding: 6,
  },
  progressTrack: {
    display: "flex", gap: 4,
    marginBottom: 24,
  },
  progressSeg: {
    flex: 1, height: 3, borderRadius: 2,
    transition: "background 0.3s ease",
  },
  eyebrow: {
    fontSize: 10, fontWeight: 700,
    letterSpacing: 1.5, textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    fontSize: 24, fontWeight: 800,
    lineHeight: 1.2,
    margin: "0 0 8px",
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 13, lineHeight: 1.55,
    margin: "0 0 16px",
    opacity: 0.75,
  },
  textarea: {
    width: "100%", boxSizing: "border-box",
    borderRadius: 10, padding: "12px 14px",
    fontSize: 14, lineHeight: 1.5,
    resize: "none", outline: "none",
    fontFamily: "inherit",
  },
  counter: {
    fontSize: 10, textAlign: "right",
    marginTop: 4, opacity: 0.4,
  },
  navRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginTop: 20,
  },
  backBtn: {
    display: "flex", alignItems: "center", gap: 4,
    background: "transparent", border: "none",
    fontSize: 12, fontWeight: 600,
    cursor: "pointer", padding: "6px 8px",
    opacity: 0.7,
  },
  primaryBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "10px 18px", borderRadius: 10,
    background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
    color: "#fff", border: "none",
    fontSize: 13, fontWeight: 700,
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(124,92,252,0.3)",
  },
  deferLink: {
    display: "block", width: "100%",
    marginTop: 14, padding: 4,
    background: "transparent", border: "none",
    fontSize: 11, textAlign: "center",
    cursor: "pointer", opacity: 0.45,
  },
};
