"use client";

import { useTheme } from "@/contexts/theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "modern" ? "Switch to Classic theme" : "Switch to Modern theme"}
      title={theme === "modern" ? "Switch to Classic Barclays era" : "Switch to Modern FPL"}
    >
      {/* Show the logo of the OTHER theme (what you switch TO) */}
      <img
        src={theme === "modern" ? "/logos/bpl-classic.png" : "/logos/pl-modern.png"}
        alt=""
        width={24}
        height={24}
        style={{
          objectFit: "contain",
        }}
      />
    </button>
  );
}
