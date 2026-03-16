"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { Link } from "@/i18n/navigation";

export function SignInForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGoogleSignIn() {
    setError(null);
    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: `/${locale}/dashboard`,
        });
      } catch {
        setError("Error al iniciar sesi\u00f3n con Google");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-velvet-700 bg-surface p-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-loss-muted/20 border border-loss/30 px-4 py-2 text-sm text-loss"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="focus-ring flex items-center justify-center gap-3 rounded-lg border border-velvet-600 bg-velvet-800/50 px-4 py-3 text-sm font-medium text-velvet-200 transition-colors hover:border-velvet-500 hover:bg-velvet-700/50 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {isPending ? "Conectando\u2026" : t("signIn")} con Google
      </button>

      <p className="text-center text-sm text-velvet-400">
        {t("noAccount")}{" "}
        <Link
          href="/sign-up"
          className="focus-ring rounded text-gold-400 underline-offset-4 hover:underline"
        >
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
