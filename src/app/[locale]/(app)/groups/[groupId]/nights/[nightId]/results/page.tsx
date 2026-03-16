import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Resultados",
};

export default function NightResultsPage() {
  const t = useTranslations("leaderboard");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold mb-6">{t("title")}</h1>
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">
            Clasificaci\u00f3n de la noche
          </h2>
        </CardHeader>
        <CardContent>
          <EmptyState title="Sin resultados a\u00fan" />
        </CardContent>
      </Card>
    </div>
  );
}
