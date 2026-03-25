import { useState } from "react";
import { PREMIUM_FEATURES, PREMIUM_PLANS, FREE_LIMITS } from "../data/premium";
import { usePremium } from "../hooks/usePremium";

export default function UpgradeScreen({ onClose }) {
  const { isPremium, isTrialActive, trialDaysRemaining, plan, upgradeToPremium, restorePurchase } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [activating, setActivating] = useState(false);

  const features = Object.values(PREMIUM_FEATURES);
  const yearlyPlan = PREMIUM_PLANS.yearly;
  const monthlyPlan = PREMIUM_PLANS.monthly;

  function handleUpgrade() {
    setActivating(true);
    setTimeout(() => {
      upgradeToPremium(selectedPlan);
      setActivating(false);
    }, 800);
  }

  function handleStartTrial() {
    setActivating(true);
    setTimeout(() => {
      upgradeToPremium("trial");
      setActivating(false);
    }, 600);
  }

  function handleRestore() {
    const restored = restorePurchase();
    if (restored) {
      // Already premium, just close
      if (onClose) onClose();
    }
  }

  // If already premium, show status
  if (isPremium) {
    return (
      <div style={overlay}>
        <div style={container}>
          <button style={closeBtn} onClick={onClose}>x</button>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={premiumCrown}>
              <span style={{ fontSize: 48 }}>👑</span>
            </div>
            <div style={premiumActiveTitle}>Premium Active</div>
            <div style={premiumActiveSubtitle}>
              {isTrialActive
                ? `Free trial · ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} remaining`
                : `${plan === "yearly" ? "Yearly" : "Monthly"} plan`}
            </div>
            <div style={featureListActive}>
              {features.map((f) => (
                <div key={f.id} style={featureActiveRow}>
                  <span style={{ fontSize: 14 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</span>
                  <span style={checkMark}>✓</span>
                </div>
              ))}
            </div>
            <button style={doneBtn} onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlay}>
      <div style={container}>
        <button style={closeBtn} onClick={onClose}>x</button>

        {/* Hero */}
        <div style={heroSection}>
          <div style={heroGlow} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={heroIcon}>
              <span style={{ fontSize: 40 }}>👑</span>
            </div>
            <div style={heroTitle}>Unlock Your Full Potential</div>
            <div style={heroSubtitle}>
              Go premium to access every feature and accelerate your journey
            </div>
          </div>
        </div>

        {/* Current Tier */}
        <div style={currentTier}>
          <div style={tierDot} />
          <span style={{ fontSize: 12, opacity: 0.5 }}>Current plan:</span>
          <span style={tierFreeLabel}>Free</span>
        </div>

        {/* Feature Comparison */}
        <div style={comparisonSection}>
          <div style={comparisonHeader}>
            <div style={{ flex: 1 }} />
            <div style={compColHeader}>Free</div>
            <div style={{ ...compColHeader, color: "#FFD700" }}>Premium</div>
          </div>
          {features.map((f) => (
            <div key={f.id} style={compRow}>
              <div style={compFeature}>
                <span style={{ fontSize: 14 }}>{f.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{f.label}</span>
              </div>
              <div style={compFreeVal}>{f.free}</div>
              <div style={compPremVal}>{f.premium}</div>
            </div>
          ))}
        </div>

        {/* Plan Toggle */}
        <div style={planSection}>
          <div style={planToggle}>
            <div
              style={{
                ...planOption,
                ...(selectedPlan === "monthly" ? planOptionActive : {}),
              }}
              onClick={() => setSelectedPlan("monthly")}
            >
              <div style={planName}>Monthly</div>
              <div style={planPrice}>{monthlyPlan.label}</div>
            </div>
            <div
              style={{
                ...planOption,
                ...(selectedPlan === "yearly" ? planOptionActive : {}),
                position: "relative",
              }}
              onClick={() => setSelectedPlan("yearly")}
            >
              {yearlyPlan.savings && (
                <div style={savingsBadge}>Save {yearlyPlan.savings}%</div>
              )}
              <div style={planName}>Yearly</div>
              <div style={planPrice}>{yearlyPlan.label}</div>
              <div style={planMonthly}>
                ${(yearlyPlan.price / 12).toFixed(2)}/mo
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={ctaSection}>
          {trialDaysRemaining > 0 && (
            <button
              style={{
                ...trialBtn,
                opacity: activating ? 0.6 : 1,
              }}
              onClick={handleStartTrial}
              disabled={activating}
            >
              {activating ? "Activating..." : `Start ${FREE_LIMITS.trialDays}-Day Free Trial`}
            </button>
          )}
          <button
            style={{
              ...upgradeBtn,
              opacity: activating ? 0.6 : 1,
            }}
            onClick={handleUpgrade}
            disabled={activating}
          >
            {activating
              ? "Processing..."
              : `Upgrade to Premium · ${selectedPlan === "yearly" ? yearlyPlan.label : monthlyPlan.label}`}
          </button>
          <div style={disclaimer}>
            Cancel anytime. No questions asked.
          </div>
        </div>

        {/* Social Proof */}
        <div style={socialSection}>
          <div style={socialTitle}>Trusted by warriors worldwide</div>
          <div style={testimonialGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={testimonialCard}>
                <div style={testimonialStars}>
                  {"★".repeat(5)}
                </div>
                <div style={testimonialText}>{t.text}</div>
                <div style={testimonialAuthor}>— {t.author}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Restore */}
        <div style={restoreSection}>
          <span style={restoreLink} onClick={handleRestore}>
            Restore Purchase
          </span>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  {
    text: "Premium analytics helped me see patterns I was blind to. My streak went from 5 to 40+ days.",
    author: "Alex, Day 52",
  },
  {
    text: "Custom quests changed the game. I can finally tailor my journey to my actual goals.",
    author: "Jordan, Day 38",
  },
  {
    text: "The unlimited forge trackers let me tackle all my bad habits at once. Worth every penny.",
    author: "Sam, Day 66",
  },
];

// ── Styles ──

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  backdropFilter: "blur(12px)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  zIndex: 600,
  overflowY: "auto",
  padding: "20px 0",
};

const container = {
  maxWidth: 400,
  width: "calc(100% - 24px)",
  borderRadius: 24,
  background: "linear-gradient(180deg, #0E0E1A 0%, #111128 50%, #0D0D18 100%)",
  border: "1px solid rgba(255,215,0,0.12)",
  position: "relative",
  overflow: "hidden",
  marginTop: 10,
  marginBottom: 40,
};

const closeBtn = {
  position: "absolute",
  top: 14,
  right: 14,
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.5)",
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
};

const heroSection = {
  padding: "40px 24px 28px",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
};

const heroGlow = {
  position: "absolute",
  top: "-60%",
  left: "10%",
  width: "80%",
  height: "200%",
  background: "radial-gradient(ellipse, rgba(255,215,0,0.08) 0%, transparent 65%)",
  pointerEvents: "none",
};

const heroIcon = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))",
  border: "2px solid rgba(255,215,0,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 16px",
  boxShadow: "0 0 40px rgba(255,215,0,0.1)",
};

const heroTitle = {
  fontSize: 22,
  fontWeight: 900,
  background: "linear-gradient(135deg, #FFD700, #FFA500, #FFD700)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  letterSpacing: -0.5,
  lineHeight: 1.2,
};

const heroSubtitle = {
  fontSize: 13,
  opacity: 0.5,
  marginTop: 8,
  lineHeight: 1.5,
  color: "#E2E2EE",
};

const currentTier = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 24px",
  background: "rgba(255,255,255,0.02)",
  borderTop: "1px solid rgba(255,255,255,0.04)",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const tierDot = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.2)",
};

const tierFreeLabel = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(255,255,255,0.4)",
};

// Comparison table
const comparisonSection = {
  padding: "16px 16px 8px",
};

const comparisonHeader = {
  display: "flex",
  alignItems: "center",
  padding: "0 0 8px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const compColHeader = {
  width: 72,
  textAlign: "center",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  opacity: 0.5,
  flexShrink: 0,
};

const compRow = {
  display: "flex",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.02)",
};

const compFeature = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const compFreeVal = {
  width: 72,
  textAlign: "center",
  fontSize: 9,
  opacity: 0.35,
  lineHeight: 1.3,
  flexShrink: 0,
};

const compPremVal = {
  width: 72,
  textAlign: "center",
  fontSize: 9,
  color: "#FFD700",
  fontWeight: 600,
  lineHeight: 1.3,
  flexShrink: 0,
};

// Plan toggle
const planSection = {
  padding: "16px 16px 8px",
};

const planToggle = {
  display: "flex",
  gap: 10,
};

const planOption = {
  flex: 1,
  padding: "16px 12px",
  borderRadius: 14,
  border: "2px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.02)",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s",
};

const planOptionActive = {
  border: "2px solid rgba(255,215,0,0.4)",
  background: "rgba(255,215,0,0.05)",
  boxShadow: "0 0 20px rgba(255,215,0,0.06)",
};

const planName = {
  fontSize: 13,
  fontWeight: 700,
  color: "#E2E2EE",
  marginBottom: 4,
};

const planPrice = {
  fontSize: 18,
  fontWeight: 900,
  color: "#FFD700",
};

const planMonthly = {
  fontSize: 10,
  opacity: 0.4,
  marginTop: 2,
  color: "#E2E2EE",
};

const savingsBadge = {
  position: "absolute",
  top: -8,
  right: -4,
  padding: "2px 8px",
  borderRadius: 8,
  background: "linear-gradient(135deg, #10B981, #059669)",
  color: "#fff",
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: 0.3,
};

// CTA
const ctaSection = {
  padding: "16px 16px 8px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const trialBtn = {
  width: "100%",
  padding: "14px 20px",
  borderRadius: 12,
  border: "2px solid rgba(255,215,0,0.3)",
  background: "transparent",
  color: "#FFD700",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: 0.3,
  transition: "all 0.2s",
};

const upgradeBtn = {
  width: "100%",
  padding: "15px 20px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #FFD700, #FFA500)",
  color: "#0D0D14",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 4px 24px rgba(255,215,0,0.2)",
  letterSpacing: 0.3,
  transition: "all 0.2s",
};

const disclaimer = {
  textAlign: "center",
  fontSize: 10,
  opacity: 0.3,
  color: "#E2E2EE",
};

// Social proof
const socialSection = {
  padding: "20px 16px 12px",
};

const socialTitle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  opacity: 0.3,
  textAlign: "center",
  marginBottom: 12,
  color: "#E2E2EE",
};

const testimonialGrid = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const testimonialCard = {
  padding: "14px 16px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.04)",
};

const testimonialStars = {
  fontSize: 10,
  color: "#FFD700",
  marginBottom: 6,
  letterSpacing: 2,
};

const testimonialText = {
  fontSize: 12,
  lineHeight: 1.6,
  opacity: 0.6,
  fontStyle: "italic",
  color: "#E2E2EE",
};

const testimonialAuthor = {
  fontSize: 10,
  opacity: 0.3,
  marginTop: 6,
  color: "#E2E2EE",
};

// Restore
const restoreSection = {
  padding: "12px 16px 24px",
  textAlign: "center",
};

const restoreLink = {
  fontSize: 11,
  opacity: 0.35,
  cursor: "pointer",
  textDecoration: "underline",
  color: "#E2E2EE",
};

// Premium active states
const premiumCrown = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))",
  border: "2px solid rgba(255,215,0,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 16px",
  boxShadow: "0 0 50px rgba(255,215,0,0.12)",
};

const premiumActiveTitle = {
  fontSize: 24,
  fontWeight: 900,
  background: "linear-gradient(135deg, #FFD700, #FFA500)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: 6,
};

const premiumActiveSubtitle = {
  fontSize: 13,
  opacity: 0.5,
  marginBottom: 24,
  color: "#E2E2EE",
};

const featureListActive = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "0 16px",
  marginBottom: 24,
  textAlign: "left",
};

const featureActiveRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  borderRadius: 10,
  background: "rgba(255,215,0,0.04)",
  border: "1px solid rgba(255,215,0,0.08)",
  color: "#E2E2EE",
};

const checkMark = {
  marginLeft: "auto",
  color: "#10B981",
  fontSize: 14,
  fontWeight: 700,
};

const doneBtn = {
  padding: "12px 40px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #FFD700, #FFA500)",
  color: "#0D0D14",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
