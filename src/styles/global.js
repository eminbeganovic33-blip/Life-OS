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
    html, body { margin: 0; padding: 0; background: #FFFFFF; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    button:focus-visible, [role="button"]:focus-visible {
      outline: 2px solid #7C5CFC;
      outline-offset: 2px;
      border-radius: 8px;
    }

    @media (min-width: 768px) {
      [data-app-shell] { max-width: 480px !important; margin: 0 auto; }
    }
  `;
  document.head.appendChild(s);
}
