import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function SignInPage() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-gold-500">
            PokerGoat
          </h1>
          <p className="mt-2 text-sm text-velvet-400">{t("signIn")}</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
