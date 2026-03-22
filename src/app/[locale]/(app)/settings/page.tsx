import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { SubscriptionCard } from "@/components/subscription/subscription-card";
import { getMySubscription } from "@/lib/actions/subscriptions";

export const metadata: Metadata = {
  title: "Ajustes",
};

export default async function SettingsPage() {
  const subscription = await getMySubscription();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{<SettingsTitle />}</h1>

      <SubscriptionCard subscription={subscription} />

      <LanguageCard />
    </div>
  );
}

function SettingsTitle() {
  const t = useTranslations("settings");
  return t("title");
}

function LanguageCard() {
  const t = useTranslations("settings");
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg font-semibold">
          {t("language")}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-velvet-300">
            Selecciona tu idioma preferido
          </p>
          <LocaleSwitcher />
        </div>
      </CardContent>
    </Card>
  );
}
