import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { CATEGORIES, SOBRIETY_DEFAULTS } from "../data";

function HeroIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ marginBottom: 8 }}>
      <circle cx="60" cy="60" r="50" fill="url(#heroGlow)" opacity="0.15" />
      <path d="M60 18L88 30V54C88 74 76 88 60 96C44 88 32 74 32 54V30L60 18Z"
        fill="url(#heroShield)" opacity="0.9" />
      <path d="M60 26L80 35V54C80 70 71 81 60 87C49 81 40 70 40 54V35L60 26Z"
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M56 38L44 62H56L52 82L76 52H64L68 38H56Z" fill="#fff" opacity="0.95" />
      <circle cx="28" cy="38" r="2" fill="#FACC15" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="92" cy="42" r="1.5" fill="#EC4899" opacity="0.5">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="24" cy="72" r="1.5" fill="#7C5CFC" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="96" cy="76" r="2" fill="#10B981" opacity="0.5">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <defs>
        <radialGradient id="heroGlow" cx="60" cy="60" r="50">
          <stop offset="0%" stopColor="#7C5CFC" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="heroShield" x1="32" y1="18" x2="88" y2="96">
          <stop offset="0%" stopColor="#7C5CFC" />
          <stop offset="50%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const FEATURES = [
  { i: "⚔️", t: "Daily Quests", d: "Build habits through personalized daily challenges" },
  { i: "📚", t: "The Academy", d: "Learn the science behind every habit you build" },
  { i: "🔥", t: "The Forge", d: "Break free from bad habits with structured programs" },
  { i: "🧠", t: "Smart Guides", d: "Every quest comes with expert tips and techniques" },
  { i: "🏆", t: "Trophy Room", d: "Earn XP, level up, and unlock achievements" },
  { i: "📊", t: "Analytics", d: "Track your mood, streaks, and progress patterns" },
];

const STEPS = ["welcome", "name", "focus", "forge", "tour", "trial", "ready"];

const TRIAL_BENEFITS = [
  { i: "🤖", t: "AI Coach", d: "Personalized insights from your data" },
  { i: "🎯", t: "Custom Quests", d: "Create unlimited quests of your own" },
  { i: "📊", t: "Advanced Analytics", d: "Trends, correlations & weekly reports" },
];

export default function Onboarding({ onFinish }) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const sub = (o) => isDark ? `rgba(255,255,255,${o})` : `rgba(0,0,0,${o})`;

  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTrackers, setSelectedTrackers] = useState([]);
  const [tourSlide, setTourSlide] = useState(0);
  const [acceptedTrial, setAcceptedTrial] = useState(false);

  const ob = getStyles(isDark, colors, sub);

  const currentStep = STEPS[step];
  const canGoNext = step < STEPS.length - 1;
  const canGoBack = step > 0;

  function next() { if (canGoNext) setStep(step + 1); }
  function back() { if (canGoBack) setStep(step - 1); }

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
      acceptedTrial,
    });
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={ob.root}>
      <div style={ob.container}>
        {/* Progress bar */}
        <div style={ob.progressBar}>
          <div style={{ ...ob.progressFill, width: `${progress}%` }} />
        </div>

        {/* Step: Welcome */}
        {currentStep === "welcome" && (
          <div style={ob.slide}>
            <HeroIllustration />
            <h1 style={ob.obTitle}>Life OS</h1>
            <p style={ob.heroSub}>Your Operating System for Self-Mastery</p>
            <p style={ob.description}>
              Daily quests to build unbreakable habits,
              break free from what holds you back, and become the
              strongest version of yourself. No end date — just consistent growth.
            </p>
            <div style={ob.statRow}>
              <div style={ob.stat}>
                <div style={ob.statNum}>6</div>
                <div style={ob.statLabel}>Life Areas</div>
              </div>
              <div style={ob.stat}>
                <div style={ob.statNum}>8</div>
                <div style={ob.statLabel}>Levels</div>
              </div>
              <div style={ob.stat}>
                <div style={ob.statNum}>∞</div>
                <div style={ob.statLabel}>Your Journey</div>
              </div>
            </div>
            <button style={ob.primaryBtn} onClick={next}>Begin Setup →</button>
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
              <button style={ob.primaryBtn} onClick={next}>
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
              We'll prioritize quest suggestions to match.
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
                      borderColor: selected ? c.color : sub(0.08),
                      background: selected ? `${c.color}15` : sub(0.02),
                    }}
                  >
                    <div style={{ fontSize: 28 }}>{c.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: selected ? c.color : colors.text }}>
                      {c.label}
                    </div>
                    {selected && <div style={{ ...ob.checkMark, background: c.color }}>✓</div>}
                  </div>
                );
              })}
            </div>
            <div style={ob.btnRow}>
              <button style={ob.backBtn} onClick={back}>Back</button>
              <button style={ob.primaryBtn} onClick={next}>
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
                      borderColor: selected ? t.color : sub(0.08),
                      background: selected ? `${t.color}12` : sub(0.02),
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${t.color}18`,
                        border: `1.5px solid ${t.color}50`,
                        fontSize: 13, fontWeight: 800, color: t.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {t.label.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: selected ? t.color : colors.text }}>
                          {t.label}
                        </div>
                        <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
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

            {/* Push permission — tied to Forge context (highest intent moment) */}
            {"Notification" in window && Notification.permission === "default" && selectedTrackers.length > 0 && (
              <div style={ob.notifHint}>
                <span style={{ fontSize: 16 }}>🔔</span>
                <span style={{ fontSize: 12, color: colors.textSecondary, flex: 1, lineHeight: 1.4 }}>
                  We'll send reminders before your highest-risk windows to keep you on track.
                </span>
                <button style={ob.notifMiniBtn} onClick={() => Notification.requestPermission()}>
                  Allow
                </button>
              </div>
            )}

            <div style={ob.btnRow}>
              <button style={ob.backBtn} onClick={back}>Back</button>
              <button style={ob.primaryBtn} onClick={next}>
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
            <div style={{ fontSize: 48, marginBottom: 8 }}>{FEATURES[tourSlide].i}</div>
            <h2 style={ob.stepTitle}>{FEATURES[tourSlide].t}</h2>
            <p style={ob.stepDesc}>{FEATURES[tourSlide].d}</p>
            <div style={ob.tourDots}>
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setTourSlide(i)}
                  style={{
                    ...ob.dot,
                    background: i === tourSlide ? "#7C5CFC" : sub(0.15),
                    width: i === tourSlide ? 24 : 8,
                  }}
                />
              ))}
            </div>
            <div style={ob.tourNav}>
              {tourSlide > 0 ? (
                <button style={ob.tourBtn} onClick={() => setTourSlide(tourSlide - 1)}>← Prev</button>
              ) : <div />}
              {tourSlide < FEATURES.length - 1 ? (
                <button style={ob.tourBtn} onClick={() => setTourSlide(tourSlide + 1)}>Next →</button>
              ) : (
                <button style={{ ...ob.tourBtn, color: "#7C5CFC", borderColor: "#7C5CFC" }} onClick={next}>Done →</button>
              )}
            </div>
            <div style={ob.btnRow}>
              <button style={ob.backBtn} onClick={back}>Back</button>
              <button style={ob.skipBtn} onClick={next}>Skip tour →</button>
            </div>
          </div>
        )}

        {/* Step: Trial Offer */}
        {currentStep === "trial" && (
          <div style={ob.slide}>
            <div style={ob.trialCrown}><span style={{ fontSize: 36 }}>👑</span></div>
            <h2 style={ob.stepTitle}>Try Premium Free</h2>
            <p style={ob.stepDesc}>
              Get the full Life OS experience for 7 days. No card required —
              cancel anytime from your profile.
            </p>
            <div style={ob.trialBenefits}>
              {TRIAL_BENEFITS.map((b) => (
                <div key={b.t} style={ob.trialBenefitRow}>
                  <span style={{ fontSize: 22 }}>{b.i}</span>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#FFD700" }}>{b.t}</div>
                    <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>{b.d}</div>
                  </div>
                  <span style={{ color: "#10B981", fontSize: 14, fontWeight: 700 }}>✓</span>
                </div>
              ))}
            </div>
            <div style={ob.trialNote}>
              After 7 days you'll automatically return to free — no surprise charges.
            </div>
            <div style={{ ...ob.btnRow, flexDirection: "column", gap: 8 }}>
              <button style={ob.trialAcceptBtn} onClick={() => { setAcceptedTrial(true); next(); }}>
                Start 7-Day Free Trial
              </button>
              <button style={ob.trialSkipBtn} onClick={() => { setAcceptedTrial(false); next(); }}>
                Maybe later — continue free
              </button>
            </div>
            <button style={{ ...ob.backBtn, marginTop: 8 }} onClick={back}>Back</button>
          </div>
        )}

        {/* Step: Ready */}
        {currentStep === "ready" && (
          <div style={ob.slide}>
            <HeroIllustration />
            <h2 style={ob.stepTitle}>
              {userName.trim() ? `Ready, ${userName.trim()}?` : "You're All Set"}
            </h2>
            <p style={ob.stepDesc}>Your transformation starts now.</p>

            <div style={ob.summary}>
              {selectedCategories.length > 0 && (
                <div style={ob.summaryRow}>
                  <span style={{ color: colors.textSecondary }}>Focus:</span>
                  <span style={{ color: colors.text }}>
                    {selectedCategories
                      .map((id) => CATEGORIES.find((c) => c.id === id)?.label)
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              {selectedTrackers.length > 0 && (
                <div style={ob.summaryRow}>
                  <span style={{ color: colors.textSecondary }}>Quitting:</span>
                  <span style={{ color: colors.text }}>
                    {selectedTrackers
                      .map((id) => SOBRIETY_DEFAULTS.find((t) => t.id === id)?.label)
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              <div style={ob.summaryRow}>
                <span style={{ color: colors.textSecondary }}>Journey:</span>
                <span style={{ color: colors.text }}>Ongoing self-mastery</span>
              </div>
              {acceptedTrial && (
                <div style={ob.summaryRow}>
                  <span style={{ color: colors.textSecondary }}>Trial:</span>
                  <span style={{ color: "#FFD700" }}>7-day Premium ✓</span>
                </div>
              )}
            </div>

            <div style={ob.readyQuote}>
              "The journey of a thousand miles begins with a single step."
              <div style={{ color: colors.textSecondary, marginTop: 4 }}>— Lao Tzu</div>
            </div>

            <div style={ob.btnRow}>
              <button style={ob.backBtn} onClick={back}>Back</button>
              <button style={ob.primaryBtn} onClick={finish}>Launch Life OS →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStyles(isDark, colors, sub) {
  return {
    root: {
      minHeight: "100vh",
      background: isDark ? "#0D0D14" : "#F5F5F7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "20px 24px",
      textAlign: "center",
      position: "relative",
      width: "100%",
    },
    progressBar: {
      position: "fixed",
      top: 0, left: 0, right: 0,
      height: 3,
      background: sub(0.05),
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
    obTitle: {
      fontSize: 32,
      fontWeight: 900,
      color: colors.text,
      margin: "0 0 4px",
      letterSpacing: -0.5,
    },
    heroSub: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 6,
      marginBottom: 16,
    },
    description: {
      fontSize: 13,
      lineHeight: 1.6,
      color: colors.textSecondary,
      marginBottom: 24,
      maxWidth: 320,
    },
    statRow: { display: "flex", gap: 24, marginBottom: 28 },
    stat: { textAlign: "center" },
    statNum: {
      fontSize: 28,
      fontWeight: 900,
      background: "linear-gradient(135deg, #7C5CFC, #EC4899)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 800,
      margin: "0 0 8px",
      color: colors.text,
    },
    stepDesc: {
      fontSize: 13,
      lineHeight: 1.5,
      color: colors.textSecondary,
      marginBottom: 20,
      maxWidth: 320,
    },
    input: {
      width: "100%",
      maxWidth: 280,
      padding: "14px 18px",
      borderRadius: 12,
      border: `1px solid rgba(124,92,252,0.3)`,
      background: sub(0.03),
      color: colors.text,
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
    trackerList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, width: "100%" },
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
    notifHint: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 14px",
      borderRadius: 12,
      background: "rgba(124,92,252,0.06)",
      border: "1px solid rgba(124,92,252,0.12)",
      width: "100%",
      marginBottom: 12,
      boxSizing: "border-box",
    },
    notifMiniBtn: {
      padding: "6px 14px",
      borderRadius: 8,
      border: "none",
      background: "#7C5CFC",
      color: "#fff",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      flexShrink: 0,
    },
    checkMark: {
      width: 22, height: 22, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
    },
    tourDots: {
      display: "flex", gap: 6, alignItems: "center",
      justifyContent: "center", marginBottom: 20,
    },
    dot: { height: 8, borderRadius: 4, transition: "all 0.3s ease", cursor: "pointer" },
    tourNav: { display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 16 },
    tourBtn: {
      padding: "8px 18px", borderRadius: 10,
      border: `1px solid ${sub(0.15)}`,
      background: "transparent", color: colors.text,
      fontSize: 13, fontWeight: 600, cursor: "pointer",
    },
    btnRow: {
      display: "flex", gap: 10, width: "100%",
      justifyContent: "center", alignItems: "center", marginTop: 4,
    },
    backBtn: {
      padding: "12px 20px", borderRadius: 12,
      border: `1px solid ${sub(0.1)}`,
      background: "transparent", color: colors.textSecondary,
      fontSize: 14, fontWeight: 600, cursor: "pointer",
    },
    skipBtn: {
      padding: "12px 20px", borderRadius: 12,
      border: "none", background: "transparent",
      color: colors.textSecondary,
      fontSize: 13, fontWeight: 600, cursor: "pointer",
    },
    primaryBtn: {
      padding: "13px 24px", borderRadius: 12, border: "none",
      background: "linear-gradient(135deg, #7C5CFC, #6D28D9)",
      color: "#fff", fontSize: 14, fontWeight: 700,
      cursor: "pointer", letterSpacing: 0.2,
      boxShadow: "0 4px 16px rgba(124,92,252,0.3)",
    },
    summary: {
      width: "100%", padding: "16px",
      borderRadius: 14,
      background: sub(0.03),
      border: `1px solid ${sub(0.06)}`,
      marginBottom: 20,
      display: "flex", flexDirection: "column", gap: 10,
    },
    summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 },
    readyQuote: {
      fontSize: 13, fontStyle: "italic",
      color: colors.textSecondary,
      lineHeight: 1.5, marginBottom: 24, maxWidth: 300,
    },
    trialCrown: {
      width: 72, height: 72, borderRadius: "50%",
      background: "linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,215,0,0.05))",
      border: "2px solid rgba(255,215,0,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 12px",
      boxShadow: "0 0 40px rgba(255,215,0,0.12)",
    },
    trialBenefits: { width: "100%", display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
    trialBenefitRow: {
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px", borderRadius: 12,
      background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.1)",
    },
    trialNote: { fontSize: 11, color: colors.textSecondary, marginBottom: 16, maxWidth: 280, lineHeight: 1.5 },
    trialAcceptBtn: {
      width: "100%", padding: "14px 20px", borderRadius: 12, border: "none",
      background: "linear-gradient(135deg, #FFD700, #FFA500)",
      color: "#0D0D14", fontSize: 14, fontWeight: 800, cursor: "pointer",
      boxShadow: "0 4px 24px rgba(255,215,0,0.18)", letterSpacing: 0.3,
    },
    trialSkipBtn: {
      width: "100%", padding: "12px 20px", borderRadius: 12,
      border: `1px solid ${sub(0.08)}`,
      background: "transparent", color: colors.textSecondary,
      fontSize: 13, fontWeight: 600, cursor: "pointer",
    },
  };
}
