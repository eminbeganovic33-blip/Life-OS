import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Home, Dumbbell, BookOpen, Hammer, ArrowRight, ArrowLeft, X } from "lucide-react";
import { useTheme } from "../hooks";

const TOUR_KEY = "lifeOsTourDone_v1";

const SLIDES = [
  {
    Icon: Sparkles,
    title: "Welcome to Life OS",
    subtitle: "Your self-improvement OS",
    description:
      "Life OS turns the grind of self-improvement into a real-life RPG. Build habits, train hard, read great books, and level up — every single day.",
    accentColor: "#7C5CFC",
  },
  {
    Icon: Home,
    title: "Home & Habits",
    subtitle: "Your daily command centre",
    description:
      "Check off daily quests, build streaks, and log your mood. Every action earns XP. Miss a day? Take a rest day — Life OS never punishes you for being human.",
    accentColor: "#10B981",
  },
  {
    Icon: Dumbbell,
    title: "The Dojo",
    subtitle: "Train hard. Log everything.",
    description:
      "Log workouts with AI-generated plans or build your own. Browse a full exercise library with step-by-step instructions. Track volume, streaks, and progress over time.",
    accentColor: "#F97316",
  },
  {
    Icon: BookOpen,
    title: "The Academy",
    subtitle: "Learn from the best minds",
    description:
      "Absorb key insights from 30+ of the world's best books in 10–15 minutes each. Take structured courses on mindset, productivity, finance, and more.",
    accentColor: "#3B82F6",
  },
  {
    Icon: Hammer,
    title: "Forge & Journal",
    subtitle: "Build skills. Reflect. Grow.",
    description:
      "The Forge tracks long-term skill projects — coding, a language, music. The Journal is your private space to reflect, log wins, and track your mindset over time.",
    accentColor: "#EC4899",
  },
];

export default function OnboardingTour() {
  const { theme } = useTheme();
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
  const { Icon } = current;

  // Fully opaque solid surfaces — no transparency leak
  const cardBg = isDark ? "#16161E" : "#FFFFFF";
  const textPrimary = isDark ? "#F0F0F8" : "#0F0F14";
  const textSecondary = isDark ? "rgba(240,240,248,0.55)" : "rgba(15,15,20,0.55)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const trackColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

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
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <motion.div
            key="tour-card"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            style={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 22,
              background: cardBg,
              border: `1px solid ${borderColor}`,
              overflow: "hidden",
              boxShadow: isDark
                ? "0 28px 80px rgba(0,0,0,0.7)"
                : "0 28px 80px rgba(0,0,0,0.18)",
            }}
          >
            {/* Top progress track */}
            <div style={{ height: 3, background: trackColor }}>
              <motion.div
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${current.accentColor}, ${current.accentColor}BB)`,
                  borderRadius: 2,
                }}
                animate={{ width: `${((slide + 1) / SLIDES.length) * 100}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>

            {/* Slide content */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide}
                custom={direction}
                variants={{
                  enter: (d) => ({ opacity: 0, x: d > 0 ? 36 : -36 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d) => ({ opacity: 0, x: d > 0 ? -36 : 36 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ padding: "30px 28px 22px" }}
              >
                {/* Icon badge */}
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: `${current.accentColor}14`,
                  border: `1.5px solid ${current.accentColor}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 22,
                }}>
                  <Icon size={28} color={current.accentColor} strokeWidth={1.75} />
                </div>

                {/* Eyebrow label */}
                <div style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  color: current.accentColor,
                  marginBottom: 7,
                }}>
                  {current.subtitle}
                </div>

                {/* Title */}
                <div style={{
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: -0.6,
                  color: textPrimary,
                  marginBottom: 12,
                  lineHeight: 1.15,
                }}>
                  {current.title}
                </div>

                {/* Body */}
                <div style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: textSecondary,
                }}>
                  {current.description}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Divider */}
            <div style={{ height: 1, background: borderColor, margin: "0 28px" }} />

            {/* Footer */}
            <div style={{
              padding: "16px 28px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              {/* Dot indicators */}
              <div style={{ display: "flex", gap: 5, flex: 1, alignItems: "center" }}>
                {SLIDES.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === slide ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: i === slide ? current.accentColor : trackColor,
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>

              {/* Back */}
              {slide > 0 && (
                <button
                  onClick={goPrev}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: `1px solid ${borderColor}`,
                    background: "transparent",
                    color: textSecondary,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                </button>
              )}

              {/* Next / Finish */}
              <button
                onClick={goNext}
                style={{
                  padding: "11px 22px",
                  borderRadius: 12,
                  border: "none",
                  background: `linear-gradient(135deg, ${current.accentColor}, ${current.accentColor}CC)`,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: `0 4px 16px ${current.accentColor}35`,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                {slide === SLIDES.length - 1 ? "Get started" : "Next"}
                {slide < SLIDES.length - 1 && <ArrowRight size={14} />}
              </button>
            </div>

            {/* Skip — subtle, below footer */}
            {slide < SLIDES.length - 1 && (
              <div style={{ textAlign: "center", paddingBottom: 18 }}>
                <button
                  onClick={complete}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: textSecondary,
                    opacity: 0.6,
                    letterSpacing: 0.2,
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
