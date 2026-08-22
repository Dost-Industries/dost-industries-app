"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DostTheme =
  | "dark"
  | "light";

type ThemeContextValue = {
  theme: DostTheme;
  setTheme: (
    theme: DostTheme
  ) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY =
  "dost-theme";

const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);

function applyTheme(
  theme: DostTheme
) {
  document.documentElement.dataset.theme =
    theme;

  document.documentElement.style.colorScheme =
    theme;
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<DostTheme>("dark");

  useEffect(() => {
    const storedTheme =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    const initialTheme:
      DostTheme =
      storedTheme === "light"
        ? "light"
        : "dark";

    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  function setTheme(
    nextTheme: DostTheme
  ) {
    setThemeState(nextTheme);

    window.localStorage.setItem(
      STORAGE_KEY,
      nextTheme
    );

    applyTheme(nextTheme);
  }

  function toggleTheme() {
    setTheme(
      theme === "dark"
        ? "light"
        : "dark"
    );
  }

  const value =
    useMemo(
      () => ({
        theme,
        setTheme,
        toggleTheme,
      }),
      [theme]
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme():
  ThemeContextValue {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
