import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks";

const TOUR_KEY = "lifeOsTourDone_v1";

const SLIDES = [
  {
    emoji: "👋",
    title: "Welcome to Life OS",
    subtitle: "Your personal self-improvement RPG",
    description:
      "Life OS turns the boring work of self-improvement into an actual game. Complete daily habits, earn XP, level up, and unlock new content — all tied to your real life.",
    accentColor: "#7C5CFC",
  },
  {
    emoji: "🏠",
    title: "Home & Habits",
    subtitle: "Your daily command centre",
    description:
      "Check off daily quests, build streaks, and log your mood. Every action earns XP and feeds your stats. Miss a day? Take a rest day — Life OS never punishes you for being human.",
    accentColor: "#10B981",
  },
  {
    emoji: "🥋",
    title: "The Dojo",
    subtitle: "Train hard. Log everything.",
    description:
      "Log workouts with AI-generated plans or build your own. Browse a full exercise library with step-by-step instructions and tutorials. Track your total volume and lifting streak.",
    accentColor: "#F97316",
  },
  {
    emoji: "📚",
    title: "The Academy",
    subtitle: "Learn from the best minds in minutes",
    description:
      "Absorb key insights from 30+ of the world's best books in 10–15 minutes each. Take structured courses on mindset, productivity, finance, and more. Focus on 2-3 at a time.",
    accentColor: "#3B82F6",
  },
  {
    emoji: "⚒️",
    title: "The Forge & Journal",
    subtitle: "Build skills. Reflect. Grow.",
    description:
      "The Forge tracks your long-term skill projects — coding, a new language, music, business. The Journal is your private space to reflect, capture wins, and track your mindset over time.",
    accentColor: "#EC4899",
  },
];

export default function OnboardingTour() {
  const { colors: C, theme } = useTheme();
  const isDark = theme === "dark";
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setVisible(true);
  }, []);

  function complete() {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
  }

  function goNext() {
    if (slide < SLIDES.length - 1) {
      setDirection(1);
      setSlide((s) => s + 1);
    } else {
      complete();
    }
  }

  function goPrev() {
    if (slide > 0) {
      setDirection(-1);
      setSlide((s) => s - 1);
    }
  }

  const current = SLIDES[slide];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="tour-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: isDark ? "rgba(0,0,0,0.88)" : "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            key="tour-card"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 24,
              background: C.surfaceElevated,
              border: `1px solid ${C.cardBorder}`,
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            }}
          >
            {/* Progress bar */}
            <div style={{ height: 3, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
              <motion.div
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${current.accentColor}, ${current.accentColor}CC)`,
                }}
                animate={{ width: `${((slide + 1) / SLIDES.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Slide content */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide}
                custom={direction}
                variants={{
                  enter: (d) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22 }}
                style={{ padding: "32px 28px 24px" }}
              >
                {/* Emoji icon */}
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: `${current.accentColor}18`,
                  border: `1px solid ${current.accentColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  marginBottom: 20,
                }}>
                  {current.emoji}
                </div>

                {/* Text */}
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  color: current.accentColor,
                  marginBottom: 6,
                }}>
                  {current.subtitle}
                </div>
                <div style={{
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: -0.5,
                  color: C.text,
                  marginBottom: 12,
                  lineHeight: 1.2,
                }}>
                  {current.title}
                </div>
                <div style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: C.textSecondary,
                }}>
                  {current.description}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div style={{
              padding: "0 28px 28px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              {/* Dot indicators */}
              <div style={{ display: "flex", gap: 5, flex: 1 }}>
                {SLIDES.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === slide ? 18 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: i === slide ? current.accentColor : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>

              {/* Back button */}
              {slide > 0 && (
                <button
                  onClick={goPrev}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 12,
                    border: `1px solid ${C.cardBorder}`,
                    background: "transparent",
                    color: C.textSecondary,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              )}

              {/* Next / Let's Go button */}
              <button
                onClick={goNext}
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: `linear-gradient(135deg, ${current.accentColor}, ${current.accentColor}CC)`,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: `0 4px 18px ${current.accentColor}40`,
                  letterSpacing: 0.2,
                }}
              >
                {slide === SLIDES.length - 1 ? "Let's Go 🚀" : "Next →"}
              </button>
            </div>

            {/* Skip link — shown on all but last slide */}
            {slide < SLIDES.length - 1 && (
              <div style={{ textAlign: "center", paddingBottom: 20 }}>
                <button
                  onClick={complete}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: C.textSecondary,
                    opacity: 0.5,
                    textDecoration: "underline",
                  }}
                >
                  Skip tour
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
