export function injectGlobalStyles() {
  if (typeof document === "undefined") return;

  // Load Inter font
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
  }

  const s = document.createElement("style");
  s.textContent = `
    @keyframes pulse { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.12);opacity:0.7} }
    @keyframes fadeUp { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-120%) scale(1.3)} }
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    ::-webkit-scrollbar{width:0}
    body{margin:0;background:#0C0F1A;transition:background 0.3s ease;font-feature-settings:'cv02','cv03','cv04','cv11'}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
    input[type=number]{-moz-appearance:textfield}
    @keyframes swipeHintSlide { 0%{opacity:0;transform:translateX(20px)}100%{opacity:1;transform:translateX(0)} }
    @keyframes swipeArrowBounce { 0%,100%{transform:translateX(0)}50%{transform:translateX(-6px)} }
    @keyframes spin { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
    @keyframes dotPulse { 0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)} }

    /* Focus-visible accessibility ring (keyboard nav) */
    button:focus-visible, [role="tab"]:focus-visible, [role="menuitem"]:focus-visible {
      outline: 2px solid #7C5CFC;
      outline-offset: 2px;
      border-radius: 6px;
    }

    /* Responsive breakpoints — widen the mobile column on tablet/desktop for readability */
    @media (min-width: 768px) {
      [data-app-shell] { max-width: 560px !important; box-shadow: 0 0 80px rgba(0,0,0,0.35); }
      [data-bottom-nav] { max-width: 560px !important; border-left: 1px solid rgba(255,255,255,0.04); border-right: 1px solid rgba(255,255,255,0.04); }
      body { background: radial-gradient(ellipse at top, #1a1530 0%, #0A0B1A 60%) !important; }
    }
    @media (min-width: 1024px) {
      [data-app-shell] { max-width: 640px !important; }
      [data-bottom-nav] { max-width: 640px !important; }
    }
  `;
  document.head.appendChild(s);
}
