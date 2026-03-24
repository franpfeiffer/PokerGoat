"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const THEMES = [
  { id: "velvet", label: "Dark Velvet", color: "#d4a847" },
  { id: "midnight", label: "Midnight Blue", color: "#38a8c4" },
  { id: "emerald", label: "Emerald", color: "#9ac438" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "velvet";
  return (localStorage.getItem("theme") as ThemeId) || "velvet";
}

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  if (theme === "velvet") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
  localStorage.setItem("theme", theme);
}

export function ThemeSwitcher() {
  const t = useTranslations("settings");
  const [current, setCurrent] = useState<ThemeId>("velvet");

  useEffect(() => {
    const stored = getStoredTheme();
    setCurrent(stored);
    applyTheme(stored);
  }, []);

  const handleChange = (theme: ThemeId) => {
    setCurrent(theme);
    applyTheme(theme);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-velvet-400">
        {t("theme")}
      </label>
      <div className="flex gap-2">
        {THEMES.map((theme) => {
          const active = current === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleChange(theme.id)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "border-gold-500/30 bg-gold-500/[0.06] text-velvet-50 shadow-sm shadow-gold-500/5"
                  : "border-velvet-700/60 bg-velvet-800/50 text-velvet-400 hover:text-velvet-200"
              }`}
              aria-label={theme.label}
              aria-pressed={active}
            >
              <span
                className={`h-3 w-3 rounded-full ring-1 ring-inset ring-white/10 ${active ? "ring-2 ring-white/20" : ""}`}
                style={{ backgroundColor: theme.color }}
              />
              <span className="hidden sm:inline">{theme.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ThemeInitializer() {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);
  return null;
}
