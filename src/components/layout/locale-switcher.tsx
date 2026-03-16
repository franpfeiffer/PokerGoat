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
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a Espa\u00f1ol"}
      className="focus-ring flex h-8 items-center gap-1.5 rounded-lg border border-velvet-700 bg-velvet-800/50 px-2.5 text-xs font-medium text-velvet-300 transition-colors hover:border-velvet-600 hover:text-velvet-200"
    >
      <span aria-hidden="true">{locale === "es" ? "\ud83c\uddea\ud83c\uddf8" : "\ud83c\uddec\ud83c\udde7"}</span>
      <span className="uppercase">{locale}</span>
    </button>
  );
}
