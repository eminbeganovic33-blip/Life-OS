import { useState } from "react";
import { S } from "../styles/theme";
import { CATEGORIES, SOBRIETY_DEFAULTS } from "../data";

const FEATURES = [
  { i: "⚔️", t: "Daily Quests", d: "Build habits through 66 days of guided challenges" },
  { i: "📚", t: "The Academy", d: "Learn the science behind habit formation" },
  { i: "🔥", t: "The Forge", d: "Break free from bad habits with daily guidance" },
  { i: "🧠", t: "Smart Guides", d: "Every quest comes with expert tips and techniques" },
  { i: "🏆", t: "Trophy Room", d: "Earn XP, level up, and unlock achievements" },
  { i: "📊", t: "Analytics", d: "Track your mood, streaks, and progress patterns" },
];

const STEPS = ["welcome", "name", "focus", "forge", "tour", "ready"];

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTrackers, setSelectedTrackers] = useState([]);
  const [tourSlide, setTourSlide] = useState(0);

  const currentStep = STEPS[step];
  const canGoNext = step < STEPS.length - 1;
  const canGoBack = step > 0;

  function next() {
    if (canGoNext) setStep(step + 1);
  }

  function back() {
    if (canGoBack) setStep(step - 1);
  }

  function toggleCategory(id) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function toggleTracker(id) {
    setSelectedTrackers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function finish() {
    onFinish({
      userName: userName.trim() || null,
      focusCategories: selectedCategories.length > 0 ? selectedCategories : null,
      forgeTrackers: selectedTrackers.length > 0 ? selectedTrackers : null,
    });
  }

  // Progress indicator
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={S.app}>
      <div style={ob.container}>
        {/* Progress bar */}
        <div style={ob.progressBar}>
          <div style={{ ...ob.progressFill, width: `${progress}%` }} />
        </div>

        {/* Step: Welcome */}
        {currentStep === "welcome" && (
          <div style={ob.slide}>
            <div style={ob.heroIcon}>⚡</div>
            <h1 style={S.obTitle}>Life OS</h1>
            <p style={ob.heroSub}>Your Operating System for Self-Mastery</p>
            <p style={ob.description}>
              66 days of guided quests to build unbreakable habits,
              break free from what holds you back, and become the
              strongest version of yourself.
            </p>
            <div style={ob.statRow}>
              <div style={ob.stat}>
                <div style={ob.statNum}>66</div>
                <div style={ob.statLabel}>Day Journey</div>
              </div>
              <div style={ob.stat}>
                <div style={ob.statNum}>6</div>
                <div style={ob.statLabel}>Life Areas</div>
              </div>
              <div style={ob.stat}>
                <div style={ob.statNum}>8</div>
                <div style={ob.statLabel}>Levels</div>
              </div>
            </div>
            <button style={S.primaryBtn} onClick={next}>
              Begin Setup →
            </button>
          </div>
        )}

        {/* Step: Name */}
        {currentStep === "name" && (
          <div style={ob.slide}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>👋</div>
            <h2 style={ob.stepTitle}>What should we call you?</h2>
            <p style={ob.stepDesc}>This is your journey. Make it personal.</p>
            <input
              style={ob.input}
              type="text"
              placeholder="Your name (optional)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <div style={ob.btnRow}>
              <button style={ob.backBtn} onClick={back}>Back</button>
              <button style={S.primaryBtn} onClick={next}>
                {userName.trim() ? `Continue as ${userName.trim()}` : "Skip →"}
              </button>
            </div>
          </div>
        )}

        {/* Step: Focus Categories */}
        {currentStep === "focus" && (
          <div style={ob.slide}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
            <h2 style={ob.stepTitle}>Choose Your Focus</h2>
            <p style={ob.stepDesc}>
              Which areas matter most to you right now?
              You'll get quests in all areas, but we'll tailor suggestions
              to your priorities.
            </p>
            <div style={ob.categoryGrid}>
              {CATEGORIES.map((c) => {
                const selected = selectedCategories.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    style={{
                      ...ob.categoryCard,
                      borderColor: selected ? c.color : "rgba(255,255,255,0.08)",
                      background: selected ? `${c.color}15` : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div style={{ fontSize: 28 }}>{c.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: selected ? c.color : "#E2E2EE" }}>
                      {c.label}
                    </div>
                    {selected && <div style={{ ...ob.checkMark, background: c.color }}>✓</div>}
                  </div>
                );
              })}
            </div>
            <div style={ob.btnRow}>
              <button style={ob.backBtn} onClick={back}>Back</button>
              <button style={S.primaryBtn} onClick={next}>
                {selectedCategories.length > 0
                  ? `Continue with ${selectedCategories.length} focus area${selectedCategories.length !== 1 ? "s" : ""}`
                  : "Skip — I'll do everything →"}
              </button>
            </div>
          </div>
        )}

        {/* Step: Forge Trackers */}
        {currentStep === "forge" && (
          <div style={ob.slide}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
            <h2 style={ob.stepTitle}>Break Free</h2>
            <p style={ob.stepDesc}>
              Anything you want to quit? Select what applies and we'll start
              tracking from Day 1 with daily guidance.
            </p>
            <div style={ob.trackerList}>
              {SOBRIETY_DEFAULTS.map((t) => {
                const selected = selectedTrackers.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTracker(t.id)}
                    style={{
                      ...ob.trackerCard,
                      borderColor: selected ? t.color : "rgba(255,255,255,0.08)",
                      background: selected ? `${t.color}12` : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 28 }}>{t.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: selected ? t.color : "#E2E2EE" }}>
                          {t.label}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.4 }}>
                          {t.id === "smoking" && "30-day science-backed quit program"}
                          {t.id === "alcohol" && "Daily guidance through withdrawal and beyond"}
                          {t.id === "junkfood" && "Rewire your relationship with food"}
                          {t.id === "social_media" && "Reclaim your attention and focus"}
                        </div>
                      </div>
                    </div>
                    {selected && <div style={{ ...ob.checkMark, background: t.color }}>✓</div>}
                  </div>
                );
              })}
            </div>
            <div style={ob.btnRow}>
              <button style={ob.backBtn} onClick={back}>Back</button>
              <button style={S.primaryBtn} onClick={next}>
                {selectedTrackers.length > 0
                  ? `Start tracking ${selectedTrackers.length} →`
                  : "Skip — none for now →"}
              </button>
            </div>
          </div>
        )}

        {/* Step: Feature Tour */}
        {currentStep === "tour" && (
          <div style={ob.slide}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {FEATURES[tourSlide].i}
            </div>
            <h2 style={ob.stepTitle}>{FEATURES[tourSlide].t}</h2>
            <p style={ob.stepDesc}>{FEATURES[tourSlide].d}</p>
            <div style={ob.tourDots}>
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setTourSlide(i)}
                  style={{
                    ...ob.dot,
                    background: i === tourSlide ? "#7C5CFC" : "rgba(255,255,255,0.15)",
                    width: i === tourSlide ? 24 : 8,
                  }}
                />
              ))}
            </div>
            <div style={ob.tourNav}>
              {tourSlide > 0 ? (
                <button style={ob.tourBtn} onClick={() => setTourSlide(tourSlide - 1)}>
                  ← Prev
                </button>
              ) : <div />}
              {tourSlide < FEATURES.length - 1 ? (
                <button style={ob.tourBtn} onClick={() => setTourSlide(tourSlide + 1)}>
                  Next →
                </button>
              ) : (
                <button style={{ ...ob.tourBtn, color: "#7C5CFC", borderColor: "#7C5CFC" }} onClick={next}>
                  Done →
                </button>
              )}
            </div>
            <div style={ob.btnRow}>
              <button style={ob.backBtn} onClick={back}>Back</button>
              <button style={{ ...ob.skipBtn }} onClick={next}>
                Skip tour →
              </button>
            </div>
          </div>
        )}

        {/* Step: Ready */}
        {currentStep === "ready" && (
          <div style={ob.slide}>
            <div style={ob.heroIcon}>⚡</div>
            <h2 style={ob.stepTitle}>
              {userName.trim() ? `Ready, ${userName.trim()}?` : "You're All Set"}
            </h2>
            <p style={ob.stepDesc}>Your 66-day transformation starts now.</p>

            {/* Summary */}
            <div style={ob.summary}>
              {selectedCategories.length > 0 && (
                <div style={ob.summaryRow}>
                  <span style={{ opacity: 0.5 }}>Focus:</span>
                  <span>
                    {selectedCategories
                      .map((id) => CATEGORIES.find((c) => c.id === id)?.label)
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              {selectedTrackers.length > 0 && (
                <div style={ob.summaryRow}>
                  <span style={{ opacity: 0.5 }}>Quitting:</span>
                  <span>
                    {selectedTrackers
                      .map((id) => SOBRIETY_DEFAULTS.find((t) => t.id === id)?.label)
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              <div style={ob.summaryRow}>
                <span style={{ opacity: 0.5 }}>Journey:</span>
                <span>66 days to mastery</span>
              </div>
            </div>

            <div style={ob.readyQuote}>
              "The journey of a thousand miles begins with a single step."
              <div style={{ opacity: 0.4, marginTop: 4 }}>— Lao Tzu</div>
            </div>

            <div style={ob.btnRow}>
              <button style={ob.backBtn} onClick={back}>Back</button>
              <button style={S.primaryBtn} onClick={finish}>
                Launch Life OS →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ──

const ob = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px 24px",
    textAlign: "center",
    position: "relative",
  },
  progressBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: "rgba(255,255,255,0.05)",
    zIndex: 100,
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #7C5CFC, #EC4899)",
    transition: "width 0.4s ease",
    borderRadius: "0 2px 2px 0",
  },
  slide: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 380,
    width: "100%",
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 6,
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    lineHeight: 1.6,
    opacity: 0.6,
    marginBottom: 24,
    maxWidth: 320,
  },
  statRow: {
    display: "flex",
    gap: 24,
    marginBottom: 28,
  },
  stat: {
    textAlign: "center",
  },
  statNum: {
    fontSize: 28,
    fontWeight: 900,
    background: "linear-gradient(135deg, #7C5CFC, #EC4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.4,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 800,
    margin: "0 0 8px",
    color: "#E2E2EE",
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 1.5,
    opacity: 0.5,
    marginBottom: 20,
    maxWidth: 320,
  },
  input: {
    width: "100%",
    maxWidth: 280,
    padding: "14px 18px",
    borderRadius: 12,
    border: "1px solid rgba(124,92,252,0.3)",
    background: "rgba(255,255,255,0.03)",
    color: "#E2E2EE",
    fontSize: 16,
    fontWeight: 600,
    textAlign: "center",
    outline: "none",
    marginBottom: 20,
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 20,
    width: "100%",
  },
  categoryCard: {
    padding: "16px 8px",
    borderRadius: 14,
    border: "1.5px solid",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
  },
  trackerList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
    width: "100%",
  },
  trackerCard: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "1.5px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    textAlign: "left",
    position: "relative",
  },
  checkMark: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  tourDots: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  tourNav: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  tourBtn: {
    padding: "8px 18px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#E2E2EE",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnRow: {
    display: "flex",
    gap: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  backBtn: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  skipBtn: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  summary: {
    width: "100%",
    padding: "16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    fontWeight: 600,
  },
  readyQuote: {
    fontSize: 13,
    fontStyle: "italic",
    opacity: 0.4,
    lineHeight: 1.5,
    marginBottom: 24,
    maxWidth: 300,
  },
};
