import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Registrarse",
};

export default function SignUpPage() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-gold-500">
            PokerGoat
          </h1>
          <p className="mt-2 text-sm text-velvet-400">{t("signUp")}</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
