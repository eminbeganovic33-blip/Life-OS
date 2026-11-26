export function injectGlobalStyles() {
  if (typeof document === "undefined") return;

  const s = document.createElement("style");
  s.textContent = `
    /* ── Palette: one set of names, light + dark values ───────────────── */
    :root {
      color-scheme: light dark;
      --c-bg: #FFFFFF;
      --c-page: #F8F6FF;
      --c-surface: #F2EFFF;
      --c-surface-elevated: #FFFFFF;
      --c-surface-alt: #E7E1FF;
      --c-border: rgba(76, 56, 190, 0.13);
      --c-border-subtle: rgba(76, 56, 190, 0.07);
      --c-border-strong: rgba(76, 56, 190, 0.24);
      --c-text: #16152B;
      --c-text-2: rgba(22, 21, 43, 0.64);
      --c-text-3: rgba(22, 21, 43, 0.44);
      --c-accent-soft: rgba(22, 21, 43, 0.06);
      --c-primary: #6C47FF;
      --c-primary-shadow: #4A2BD6;
      --c-xp-deep: #B45309;
      --c-tabbar: rgba(255, 255, 255, 0.88);
      --sh-sm: 0 2px 0 rgba(76,56,190,0.08);
      --sh-md: 0 3px 0 rgba(76,56,190,0.08), 0 8px 20px rgba(76,56,190,0.08);
      --sh-lg: 0 10px 30px rgba(22,21,43,0.09);
      --sh-xl: 0 20px 50px rgba(22,21,43,0.14);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --c-bg: #13112A;
        --c-page: #0E0C1F;
        --c-surface: #1F1C3D;
        --c-surface-elevated: #27234A;
        --c-surface-alt: #2F2A58;
        --c-border: rgba(196, 184, 255, 0.14);
        --c-border-subtle: rgba(240, 238, 255, 0.06);
        --c-border-strong: rgba(196, 184, 255, 0.24);
        --c-text: #F2F1FF;
        --c-text-2: rgba(242, 241, 255, 0.70);
        --c-text-3: rgba(242, 241, 255, 0.48);
        --c-accent-soft: rgba(242, 241, 255, 0.08);
        --c-primary: #7A5CFF;
        --c-primary-shadow: #4A2BD6;
        --c-xp-deep: #FBBF24;
        --c-tabbar: rgba(18, 18, 38, 0.88);
        --sh-sm: 0 1px 2px rgba(0,0,0,0.30);
        --sh-md: 0 4px 16px rgba(0,0,0,0.35);
        --sh-lg: 0 10px 30px rgba(0,0,0,0.40);
        --sh-xl: 0 20px 50px rgba(0,0,0,0.50);
      }
    }

    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    ::-webkit-scrollbar { width: 0; }
    html, body { margin: 0; padding: 0; background: var(--c-page); }
    body {
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: 600;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      color: var(--c-text);
    }
    h1, h2, h3, h4 { font-weight: 900; letter-spacing: -0.01em; }

    /* ── Buttons: big, round, easy to hit ───────────────────────────────── */
    button {
      font-family: inherit;
      font-weight: 800;
      min-height: 48px;
      transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
    }
    button:active:not(:disabled) { transform: translateY(2px) scale(0.99); }
    /* Opt-out for things that are buttons only for semantics (toggles, rows
       inside dense lists, inline links). */
    button[data-compact] { min-height: 0; }
    input, textarea, select { font-family: inherit; font-weight: 600; }
    input:not([type=checkbox]):not([type=radio]):not([type=range]), select { min-height: 48px; }

    /* Emoji images (Fluent Emoji, MIT) sit on the text baseline. */
    img.emoji-img { display: inline-block; vertical-align: -0.18em; object-fit: contain; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    /* Game-layer: a slow sheen that sweeps across spotlight surfaces */
    @keyframes sheen { 0% { background-position: -150% 0; } 100% { background-position: 250% 0; } }
    /* Game-layer: a soft breathing glow for reward/celebration elements */
    @keyframes glowPulse {
      0%,100% { box-shadow: 0 8px 22px rgba(124,92,252,0.22); }
      50%     { box-shadow: 0 12px 32px rgba(124,92,252,0.40); }
    }

    button:focus-visible, [role="button"]:focus-visible {
      outline: 3px solid #7C5CFC;
      outline-offset: 2px;
      border-radius: 16px;
    }

    @media (min-width: 768px) {
      [data-app-shell] { max-width: 480px !important; margin: 0 auto; }
    }

    /* Embedded panel host: lets sliding panel components render inline as tab screens */
    [data-embedded-panel-host] > * {
      position: relative !important;
      inset: auto !important;
      width: 100% !important;
      max-width: 100% !important;
      box-shadow: none !important;
      z-index: 1 !important;
      transform: none !important;
    }
    [data-embedded-panel-host] [data-panel-back] {
      display: none !important;
    }
  `;
  document.head.appendChild(s);
}
