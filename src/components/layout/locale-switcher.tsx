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
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a Espa\u00f1ol"}
      className="focus-ring flex h-8 min-w-10 items-center justify-center rounded-lg border border-velvet-700 bg-velvet-800/50 px-2 text-base transition-colors hover:border-velvet-600 hover:text-velvet-200"
    >
      <span aria-hidden="true">{locale === "es" ? "\ud83c\udde6\ud83c\uddf7" : "\ud83c\uddfa\ud83c\uddf8"}</span>
    </button>
  );
}
