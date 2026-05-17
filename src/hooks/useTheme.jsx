// Theme hook — placeholder for future dark mode support
// The Brief redesign uses TOKENS directly from styles/tokens.js

export function useTheme() {
  return { theme: "light" };
}

export function ThemeProvider({ children }) {
  return children;
}
