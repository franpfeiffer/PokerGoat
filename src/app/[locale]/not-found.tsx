import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-6xl font-bold text-gold-500">404</h1>
      <p className="text-lg text-velvet-300">
        La p\u00e1gina que buscas no existe.
      </p>
      <Link
        href="/"
        className="focus-ring bg-gold-500 hover:bg-gold-400 inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-velvet-950 transition-colors"
      >
        {t("back")}
      </Link>
    </div>
  );
}
