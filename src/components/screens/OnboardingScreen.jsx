import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOKENS } from "../../styles/tokens";
import { CATEGORIES } from "../../data/categories";
import { getTodayStr } from "../../utils";

const STEPS = [
  {
    title: "Welcome to Life OS",
    sub: "Your daily intelligence briefing for personal growth.",
  },
  {
    title: "Choose your domains",
    sub: "Pick 3–6 areas to focus on. You can change these anytime.",
    type: "domains",
  },
  {
    title: "You're ready",
    sub: "Your first brief is waiting. Show up every day — that's the protocol.",
  },
];

export default function OnboardingScreen({ state, save }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);

  const current = STEPS[step];

  function toggleDomain(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, 6 > prev.length ? id : prev[0]]
    );
  }

  function finish() {
    const activeQuests = selected.map((catId, i) => ({
      id: `aq-${i}`,
      category: catId,
      questIndex: 0,
    }));
    save({
      ...state,
      onboarded: true,
      startDate: getTodayStr(),
      activeQuests,
    });
  }

  function next() {
    if (step === STEPS.length - 1) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  }

  const canProceed = current.type === "domains" ? selected.length >= 3 : true;

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          style={styles.content}
        >
          <div style={styles.stepIndicator}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ ...styles.dot, background: i <= step ? TOKENS.color.text : TOKENS.color.border }} />
            ))}
          </div>

          <h1 style={styles.title}>{current.title}</h1>
          <p style={styles.sub}>{current.sub}</p>

          {current.type === "domains" && (
            <div style={styles.domainGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selected.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleDomain(cat.id)}
                    style={{
                      ...styles.domainChip,
                      background: isSelected ? `${cat.color}14` : TOKENS.color.surface,
                      borderColor: isSelected ? cat.color : TOKENS.color.border,
                      color: isSelected ? cat.color : TOKENS.color.textSecondary,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <span style={{ fontWeight: TOKENS.font.weight.semibold, fontSize: TOKENS.font.size.sm }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div style={styles.footer}>
        <button
          onClick={next}
          disabled={!canProceed}
          style={{
            ...styles.btn,
            opacity: canProceed ? 1 : 0.4,
          }}
        >
          {step === STEPS.length - 1 ? "Start my first day" : "Continue"}
        </button>
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} style={styles.backBtn}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: `${TOKENS.space[9]}px ${TOKENS.space[6]}px ${TOKENS.space[7]}px`,
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  stepIndicator: {
    display: "flex",
    gap: 6,
    marginBottom: TOKENS.space[7],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    transition: TOKENS.transition.normal,
  },
  title: {
    fontSize: TOKENS.font.size.xxl,
    fontWeight: TOKENS.font.weight.heavy,
    color: TOKENS.color.text,
    margin: 0,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: TOKENS.font.size.md,
    color: TOKENS.color.textSecondary,
    marginTop: TOKENS.space[3],
    lineHeight: 1.5,
  },
  domainGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: TOKENS.space[3],
    marginTop: TOKENS.space[6],
  },
  domainChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: TOKENS.radius.full,
    borderWidth: 1.5,
    borderStyle: "solid",
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: TOKENS.space[3],
    paddingTop: TOKENS.space[6],
  },
  btn: {
    width: "100%",
    padding: "16px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    background: TOKENS.color.text,
    color: "#fff",
    fontSize: TOKENS.font.size.md,
    fontWeight: TOKENS.font.weight.bold,
    cursor: "pointer",
    transition: TOKENS.transition.fast,
  },
  backBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: TOKENS.radius.lg,
    border: "none",
    background: "transparent",
    color: TOKENS.color.textSecondary,
    fontSize: TOKENS.font.size.sm,
    fontWeight: TOKENS.font.weight.medium,
    cursor: "pointer",
  },
};
