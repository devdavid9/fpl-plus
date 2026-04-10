"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "modern" | "classic";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "modern",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("modern");

  // On mount: restore saved preference
  useEffect(() => {
    const saved = localStorage.getItem("fpl-theme") as Theme | null;
    if (saved === "classic") setTheme("classic");
  }, []);

  // Whenever theme changes: apply the data-theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("fpl-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "modern" ? "classic" : "modern"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
