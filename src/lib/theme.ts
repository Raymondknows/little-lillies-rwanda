export type ThemeMode = "light" | "dark" | "system";
export const THEME_KEY = "schoolbase-admin-theme";

export function resolveStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
}

export function detectSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveActualTheme(theme: ThemeMode): "light" | "dark" {
  return theme === "system" ? detectSystemTheme() : theme;
}

export function applyTheme(theme: ThemeMode) {
  const actual = resolveActualTheme(theme);
  document.documentElement.dataset.theme = actual;
  window.localStorage.setItem(THEME_KEY, theme);
}

export function getActualTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
