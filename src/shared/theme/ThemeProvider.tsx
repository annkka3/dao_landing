import { createContext, useContext, type ReactNode } from "react";
import { useThemePreference } from "./useThemePreference";
import type { DaoResolvedTheme, DaoThemePreference } from "./theme";

interface ThemeContextValue {
  preference: DaoThemePreference;
  resolvedTheme: DaoResolvedTheme;
  setPreference: (preference: DaoThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useThemePreference();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useDaoTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useDaoTheme must be used inside ThemeProvider");
  return ctx;
}
