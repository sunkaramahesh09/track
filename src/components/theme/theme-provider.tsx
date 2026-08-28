"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "track-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/* -------------------------------------------------------------------------- *
 * The theme lives in two external stores — localStorage and a media query —
 * so it is read with useSyncExternalStore rather than mirrored into state by
 * an effect. That keeps the server snapshot ("system") separate from the
 * client's, which is what makes hydration correct without a flash.
 * -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();

/** Cached so getSnapshot is referentially stable between renders. */
let cachedTheme: Theme | null = null;

function readStoredTheme(): Theme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    // Private browsing can reject reads.
  }
  return "system";
}

function getThemeSnapshot(): Theme {
  cachedTheme ??= readStoredTheme();
  return cachedTheme;
}

function getServerThemeSnapshot(): Theme {
  return "system";
}

function subscribeTheme(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/**
 * "system" removes the attribute rather than stamping the resolved value, so
 * the CSS media query stays in charge and the page keeps following the OS if
 * that changes while the tab is open.
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

function writeTheme(next: Theme) {
  cachedTheme = next;
  applyTheme(next);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Not persisted, but still applied for the life of the tab.
  }
  for (const listener of listeners) listener();
}

function subscribeSystem(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSystemSnapshot() {
  return window.matchMedia(DARK_QUERY).matches;
}

function getServerSystemSnapshot() {
  return false;
}

/* -------------------------------------------------------------------------- */

interface ThemeContextValue {
  /** What the user chose, including "system". */
  theme: Theme;
  /** What is actually painted right now. */
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
  /** Cycles light → dark → system. */
  cycle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const systemDark = React.useSyncExternalStore(
    subscribeSystem,
    getSystemSnapshot,
    getServerSystemSnapshot,
  );

  const resolved: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolved,
      setTheme: writeTheme,
      cycle: () =>
        writeTheme(
          theme === "light" ? "dark" : theme === "dark" ? "system" : "light",
        ),
    }),
    [theme, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Runs before first paint, so a stored light choice never flashes the dark
 * canvas (or vice versa). Kept tiny and dependency-free on purpose.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;
