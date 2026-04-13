import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { FREE_LIMITS, PREMIUM_FEATURES } from "../data/premium";

const PremiumContext = createContext(null);

/**
 * Premium Provider — wraps the app to provide premium status context.
 * Premium state is stored within the main app state (via save callback).
 * When Firebase is not configured, everything works via localStorage.
 */
export function PremiumProvider({ children, state, save }) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Derive premium status from app state
  const premiumData = state?.premium || {};
  const now = Date.now();

  // Check if user is currently premium (paid or trial)
  const premiumUntil = premiumData.premiumUntil || null;
  const trialStarted = premiumData.trialStartedAt || null;
  const isPremiumActive = premiumUntil ? now < premiumUntil : false;

  // Trial logic: 7-day free trial for new users
  const trialEnd = trialStarted ? trialStarted + FREE_LIMITS.trialDays * 24 * 60 * 60 * 1000 : null;
  const isTrialActive = trialEnd ? now < trialEnd : false;
  const trialDaysRemaining = trialEnd
    ? Math.max(0, Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000)))
    : trialStarted === null
      ? FREE_LIMITS.trialDays // Trial hasn't started — show full trial available
      : 0;

  const isPremium = isPremiumActive || isTrialActive;
  const plan = premiumData.plan || null; // "monthly" | "yearly" | null

  /**
   * Check if the user has access to a specific feature.
   * @param {string} featureId - key from PREMIUM_FEATURES
   * @returns {boolean}
   */
  const checkFeatureAccess = useCallback(
    (featureId) => {
      if (isPremium) return true;
      // Free users don't get premium features
      return !(featureId in PREMIUM_FEATURES);
    },
    [isPremium]
  );

  /**
   * Activate premium — for now, sets premium locally.
   * Real Stripe integration would replace this.
   * @param {"monthly"|"yearly"|"trial"} planId
   */
  const upgradeToPremium = useCallback(
    (planId) => {
      if (!save || !state) return;

      const now = Date.now();
      let updates = {};

      if (planId === "trial") {
        updates = {
          ...state,
          premium: {
            ...premiumData,
            trialStartedAt: now,
          },
        };
      } else {
        const duration =
          planId === "yearly" ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
        updates = {
          ...state,
          premium: {
            ...premiumData,
            plan: planId,
            premiumUntil: now + duration,
            subscribedAt: now,
          },
        };
      }

      save(updates);
    },
    [state, save, premiumData]
  );

  /**
   * Cancel premium — clears the active subscription/trial locally.
   * In a real app, this would call Stripe to cancel the subscription.
   */
  const cancelPremium = useCallback(() => {
    if (!save || !state) return;
    save({
      ...state,
      premium: {
        ...premiumData,
        plan: null,
        premiumUntil: null,
        // Keep trialStartedAt so the user can't start the trial again.
      },
    });
  }, [state, save, premiumData]);

  /**
   * Restore purchase — checks if premium is still valid.
   * In a real app, this would verify with the payment provider.
   */
  const restorePurchase = useCallback(() => {
    // For now, just re-check stored state (no-op since we read from state)
    // Real implementation would call Stripe/RevenueCat API
    return isPremium;
  }, [isPremium]);

  const value = useMemo(
    () => ({
      isPremium,
      isPremiumActive,
      isTrialActive,
      premiumUntil,
      trialDaysRemaining,
      plan,
      checkFeatureAccess,
      upgradeToPremium,
      cancelPremium,
      restorePurchase,
      showUpgrade,
      setShowUpgrade,
    }),
    [
      isPremium,
      isPremiumActive,
      isTrialActive,
      premiumUntil,
      trialDaysRemaining,
      plan,
      checkFeatureAccess,
      upgradeToPremium,
      cancelPremium,
      restorePurchase,
      showUpgrade,
    ]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

/**
 * Hook to access premium context.
 * Must be used within a PremiumProvider.
 */
export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    // Graceful fallback — return free-tier defaults if provider is missing
    return {
      isPremium: false,
      isPremiumActive: false,
      isTrialActive: false,
      premiumUntil: null,
      trialDaysRemaining: 7,
      plan: null,
      checkFeatureAccess: () => false,
      upgradeToPremium: () => {},
      cancelPremium: () => {},
      restorePurchase: () => false,
      showUpgrade: false,
      setShowUpgrade: () => {},
    };
  }
  return ctx;
}
