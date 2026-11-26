// Life OS design system — "calm base + game layer".
//
// Philosophy: the everyday surface is calm and neutral so the eye can rest.
// A small, reserved "game layer" (brand gradient, XP gold, glow) is used ONLY
// for moments that should feel earned — XP, levels, streaks, day-complete,
// celebrations. Restraint everywhere else is what makes those moments pop.
//
// Backward compatible: every key the app referenced before still exists.

export const TOKENS = {
  color: {
    // ── Calm base ──────────────────────────────────────────────────────────
    bg: "#FFFFFF",
    surface: "#F6F6F9",          // neutral resting card (was pastel-gradient territory)
    surfaceElevated: "#FFFFFF",
    surfaceAlt: "#EFEFF4",       // sunken / secondary chips (previously undefined → bug)
    surfaceSunken: "#EFEFF4",
    border: "rgba(17, 17, 26, 0.08)",
    borderSubtle: "rgba(17, 17, 26, 0.04)",
    borderStrong: "rgba(17, 17, 26, 0.14)",
    text: "#15151E",
    textSecondary: "rgba(21, 21, 30, 0.60)",
    textTertiary: "rgba(21, 21, 30, 0.40)",
    accent: "#15151E",
    accentSoft: "rgba(21, 21, 30, 0.06)",

    // ── Semantic ───────────────────────────────────────────────────────────
    success: "#22C55E",
    successSoft: "rgba(34, 197, 94, 0.10)",
    warning: "#F59E0B",
    warningSoft: "rgba(245, 158, 11, 0.10)",
    danger: "#EF4444",
    dangerSoft: "rgba(239, 68, 68, 0.08)",

    // ── Brand / game layer ─────────────────────────────────────────────────
    brand: "#7C5CFC",
    brandSoft: "rgba(124, 92, 252, 0.10)",
    brandBorder: "rgba(124, 92, 252, 0.22)",
    xp: "#FBBF24",               // the one true "reward" gold
    xpSoft: "rgba(251, 191, 36, 0.14)",
    xpDeep: "#B45309",           // gold text on light bg
  },

  // ── Game layer: gradients, glow, dark "spotlight" surface ────────────────
  // Use these sparingly. If everything glows, nothing does.
  game: {
    gradient: "linear-gradient(135deg, #7C5CFC 0%, #EC4899 100%)", // signature
    gradientSoft: "linear-gradient(135deg, rgba(124,92,252,0.10) 0%, rgba(236,72,153,0.06) 100%)",
    gold: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
    success: "linear-gradient(135deg, #22C55E 0%, #10B981 100%)",
    spotlight: "linear-gradient(160deg, #1A1530 0%, #0E0B1E 100%)", // dark hero panels
    spotlightText: "#FFFFFF",
    spotlightTextSoft: "rgba(255,255,255,0.64)",
  },

  space: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80],

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    full: 9999,
  },

  font: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 30,
      hero: 38,
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      heavy: 800,
    },
  },

  // Letter-spacing scale. Tight headlines, airy all-caps kickers.
  track: {
    tight: "-0.02em",
    tighter: "-0.03em",
    normal: "0",
    wide: "0.04em",
    caps: "0.08em",
  },

  shadow: {
    sm: "0 1px 2px rgba(17,17,26,0.04)",
    md: "0 4px 16px rgba(17,17,26,0.06)",
    lg: "0 10px 30px rgba(17,17,26,0.08)",
    xl: "0 20px 50px rgba(17,17,26,0.12)",
    // Game-layer glows — colored, for spotlight elements only.
    glowBrand: "0 10px 30px rgba(124,92,252,0.32)",
    glowGold: "0 8px 22px rgba(245,158,11,0.30)",
    glowSuccess: "0 8px 22px rgba(34,197,94,0.28)",
  },

  transition: {
    fast: "150ms ease",
    normal: "250ms ease",
    slow: "400ms ease",
    spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
};

export const DOMAIN_COLORS = {
  sleep: "#7C5CFC",
  water: "#38BDF8",
  exercise: "#F97316",
  mind: "#EC4899",
  screen: "#22D3EE",
  shower: "#10B981",
  nutrition: "#84CC16",
  reading: "#A78BFA",
  work: "#F59E0B",
  social: "#06B6D4",
  finance: "#34D399",
  creative: "#F472B6",
};
