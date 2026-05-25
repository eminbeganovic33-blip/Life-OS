/**
 * Renders a sliding-panel component inline as a tab screen.
 * Global CSS in styles/global.js targets [data-embedded-panel-host] children
 * to neutralize position:fixed, max-width, slide animations, and hide back buttons
 * (which are marked with data-panel-back).
 */
export default function EmbeddedPanelHost({ children }) {
  return (
    <div data-embedded-panel-host style={{ position: "relative", width: "100%" }}>
      {children}
    </div>
  );
}
