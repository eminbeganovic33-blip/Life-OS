export function injectGlobalStyles() {
  if (typeof document === "undefined") return;

  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }

  const s = document.createElement("style");
  s.textContent = `
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    ::-webkit-scrollbar { width: 0; }
    html, body { margin: 0; padding: 0; background: #FBFBFD; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      color: #15151E;
    }
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
      outline: 2px solid #7C5CFC;
      outline-offset: 2px;
      border-radius: 8px;
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
