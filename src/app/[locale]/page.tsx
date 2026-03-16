import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SessionRedirect } from "@/components/auth/session-redirect";

export default function LandingPage() {
  return (
    <>
      <SessionRedirect to="/dashboard" />
      <Landing />
    </>
  );
}

function Landing() {
  const t = useTranslations("landing");
  const tAuth = useTranslations("auth");

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-card-pattern px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,71,0.06)_0%,transparent_70%)]" />

      <main className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        <div className="animate-fade-in flex flex-col items-center gap-2">
          <span className="text-gold-500 font-display text-lg font-semibold tracking-widest uppercase">
            PokerGoat
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-velvet-50 sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
        </div>

        <p
          className="animate-fade-in text-lg text-velvet-300 sm:text-xl"
          style={{ animationDelay: "100ms" }}
        >
          {t("subtitle")}
        </p>

        <div
          className="animate-fade-in flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "200ms" }}
        >
          <Link
            href="/sign-up"
            className="focus-ring bg-gold-500 hover:bg-gold-400 active:bg-gold-600 inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-semibold text-velvet-950 transition-colors"
          >
            {t("cta")}
          </Link>
          <Link
            href="/sign-in"
            className="focus-ring inline-flex items-center justify-center rounded-lg border border-velvet-600 bg-velvet-900/50 px-8 py-3 text-base font-semibold text-velvet-200 transition-colors hover:border-velvet-500 hover:bg-velvet-800/50"
          >
            {tAuth("signIn")}
          </Link>
        </div>
      </main>
    </div>
  );
}
