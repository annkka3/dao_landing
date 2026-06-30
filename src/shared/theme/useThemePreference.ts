import { useCallback, useEffect, useState } from "react";
import {
  applyDaoTheme,
  readStoredThemePreference,
  resolveDaoTheme,
  writeStoredThemePreference,
  type DaoResolvedTheme,
  type DaoThemePreference,
} from "./theme";

export function useThemePreference() {
  const [preference, setPreferenceState] = useState<DaoThemePreference>(() =>
    readStoredThemePreference()
  );
  const [resolvedTheme, setResolvedTheme] = useState<DaoResolvedTheme>(() =>
    resolveDaoTheme(readStoredThemePreference())
  );

  useEffect(() => {
    const apply = () => {
      const next = resolveDaoTheme(preference);
      setResolvedTheme(next);
      applyDaoTheme(next);
    };

    apply();

    if (preference !== "system" || typeof window === "undefined" || !("matchMedia" in window)) {
      return undefined;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);

  const setPreference = useCallback((next: DaoThemePreference) => {
    writeStoredThemePreference(next);
    setPreferenceState(next);
  }, []);

  return { preference, resolvedTheme, setPreference };
}
