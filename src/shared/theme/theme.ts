import { getWebApp } from "../../telegram/webapp";

export type DaoThemePreference = "system" | "dark" | "light";
export type DaoResolvedTheme = "dark" | "light";

export const DAO_THEME_STORAGE_KEY = "dao_theme_preference";

export function normalizeThemePreference(value: unknown): DaoThemePreference {
  return value === "system" || value === "dark" || value === "light" ? value : "dark";
}

export function readStoredThemePreference(): DaoThemePreference {
  if (typeof window === "undefined") return "dark";
  return normalizeThemePreference(window.localStorage.getItem(DAO_THEME_STORAGE_KEY));
}

export function writeStoredThemePreference(preference: DaoThemePreference): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DAO_THEME_STORAGE_KEY, preference);
}

export function resolveDaoTheme(preference: DaoThemePreference): DaoResolvedTheme {
  if (preference === "dark" || preference === "light") return preference;

  const telegramScheme = getWebApp()?.colorScheme;
  if (telegramScheme === "dark" || telegramScheme === "light") return telegramScheme;

  if (typeof window !== "undefined" && "matchMedia" in window) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "dark";
}

export function applyDaoTheme(theme: DaoResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.daoTheme = theme;
}
