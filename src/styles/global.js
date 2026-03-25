export function injectGlobalStyles() {
  if (typeof document === "undefined") return;
  const s = document.createElement("style");
  s.textContent = `
    @keyframes pulse { 0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.12);opacity:0.7} }
    @keyframes fadeUp { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-120%) scale(1.3)} }
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    ::-webkit-scrollbar{width:0}
    body{margin:0;background:#08080F}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
    input[type=number]{-moz-appearance:textfield}
    @keyframes swipeHintSlide { 0%{opacity:0;transform:translateX(20px)}100%{opacity:1;transform:translateX(0)} }
    @keyframes swipeArrowBounce { 0%,100%{transform:translateX(0)}50%{transform:translateX(-6px)} }
    @keyframes spin { 0%{transform:rotate(0deg)}100%{transform:rotate(360deg)} }
  `;
  document.head.appendChild(s);
}
