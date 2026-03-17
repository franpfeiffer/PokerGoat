"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const nextLocale = locale === "es" ? "en" : "es";
    router.replace(pathname, { locale: nextLocale });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a Español"}
      className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-velvet-700/60 bg-velvet-800/80 text-sm transition-colors hover:border-velvet-600 hover:bg-velvet-700/80"
    >
      <span aria-hidden="true">{locale === "es" ? "\ud83c\udde6\ud83c\uddf7" : "\ud83c\uddfa\ud83c\uddf8"}</span>
    </button>
  );
}
