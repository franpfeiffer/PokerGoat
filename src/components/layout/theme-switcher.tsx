"use client";

import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    // Single theme: Dark Velvet. Remove any stale data-theme attribute.
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("theme");
  }, []);
  return null;
}
