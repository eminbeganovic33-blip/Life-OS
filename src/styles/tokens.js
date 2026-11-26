// Life OS design system — "calm base + game layer".
//
// Philosophy: the everyday surface is calm and neutral so the eye can rest.
// A small, reserved "game layer" (brand gradient, XP gold, glow) is used ONLY
// for moments that should feel earned — XP, levels, streaks, day-complete,
// celebrations. Restraint everywhere else is what makes those moments pop.
//
// Backward compatible: every key the app referenced before still exists.

export const TOKENS = {
  // Colours are CSS variables (defined in styles/global.js) so light and dark
  // mode share one palette. Light values are listed in the comments.
  color: {
    // ── Calm base ──────────────────────────────────────────────────────────
    bg: "var(--c-bg)",                         // #FFFFFF
    surface: "var(--c-surface)",               // #F4F3FA neutral resting card
    surfaceElevated: "var(--c-surface-elevated)", // #FFFFFF
    surfaceAlt: "var(--c-surface-alt)",        // #ECEAF5 sunken / chips
    surfaceSunken: "var(--c-surface-alt)",
    border: "var(--c-border)",
    borderSubtle: "var(--c-border-subtle)",
    borderStrong: "var(--c-border-strong)",
    text: "var(--c-text)",                     // #16152B
    textSecondary: "var(--c-text-2)",
    textTertiary: "var(--c-text-3)",
    accent: "var(--c-text)",
    accentSoft: "var(--c-accent-soft)",
    // Filled primary buttons (white text on it in both modes).
    primary: "var(--c-primary)",               // #6C47FF
    primaryShadow: "var(--c-primary-shadow)",  // #4A2BD6, the "pressable" lip

    // ── Semantic ───────────────────────────────────────────────────────────
    success: "#22C55E",
    successSoft: "rgba(34, 197, 94, 0.14)",
    warning: "#F59E0B",
    warningSoft: "rgba(245, 158, 11, 0.14)",
    danger: "#EF4444",
    dangerSoft: "rgba(239, 68, 68, 0.12)",

    // ── Brand / game layer ─────────────────────────────────────────────────
    brand: "#7C5CFC",
    brandSoft: "rgba(124, 92, 252, 0.14)",
    brandBorder: "rgba(124, 92, 252, 0.28)",
    xp: "#FBBF24",               // the one true "reward" gold
    xpSoft: "rgba(251, 191, 36, 0.16)",
    xpDeep: "var(--c-xp-deep)",  // gold text: #B45309 light, #FBBF24 dark
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

  // Generous, friendly curves. Buttons use lg/xl; cards lg.
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    full: 9999,
  },

  font: {
    // Nunito (SIL OFL), self-hosted via @fontsource. Rounded and thick at
    // 800/900 for headings and numbers; 600 keeps body text readable.
    sans: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 30,
      hero: 38,
    },
    // One step heavier than a typical UI: Nunito is light for its weight.
    weight: {
      regular: 500,
      medium: 600,
      semibold: 700,
      bold: 800,
      heavy: 900,
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
    sm: "var(--sh-sm)",
    md: "var(--sh-md)",
    lg: "var(--sh-lg)",
    xl: "var(--sh-xl)",
    // "Pressable" lip under filled buttons.
    press: "0 4px 0 var(--c-primary-shadow)",
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
