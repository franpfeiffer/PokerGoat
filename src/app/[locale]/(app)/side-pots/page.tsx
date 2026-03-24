import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SidePotCalculator } from "@/components/tools/side-pot-calculator";

export const metadata: Metadata = {
  title: "Side Pots",
};

export default async function SidePotsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("sidePots");
  const moneyLocale = locale === "es" ? "es-ES" : "en-US";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div>
        <h1 className="font-display text-xl font-bold sm:text-2xl">{t("title")}</h1>
        <p className="mt-0.5 text-xs text-velvet-400 sm:text-sm">{t("subtitle")}</p>
      </div>
      <SidePotCalculator locale={moneyLocale} currency="ARS" />
    </div>
  );
}
