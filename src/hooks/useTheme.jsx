import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { S, DARK_COLORS, LIGHT_COLORS, getThemeOverrides } from "../styles/theme";

const ThemeContext = createContext(null);

const LS_KEY = "lifeos_theme";

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (_) {}
  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);

  const colors = theme === "light" ? LIGHT_COLORS : DARK_COLORS;
  const overrides = useMemo(() => getThemeOverrides(theme), [theme]);

  // Apply body background when theme changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, theme);
    } catch (_) {}
    document.documentElement.style.setProperty("--los-bg", colors.bg);
    document.body.style.background = colors.bg;
  }, [theme, colors.bg]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Helper: get a themed style by merging S[key] with theme overrides
  const themed = useCallback((key) => {
    const base = S[key];
    const override = overrides[key];
    if (!override) return base;
    return { ...base, ...override };
  }, [overrides]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, themed }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for components rendered outside ThemeProvider (loading screens)
    return {
      theme: "dark",
      toggleTheme: () => {},
      colors: DARK_COLORS,
      themed: (key) => S[key],
    };
  }
  return ctx;
}
