import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function GroupOverviewPage() {
  const t = useTranslations("groups");
  const tNights = useTranslations("nights");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Grupo</h1>
        <div className="flex gap-2">
          <Link href="nights/new">
            <Button size="sm">{tNights("create")}</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">
              {tNights("title")}
            </h2>
          </CardHeader>
          <CardContent>
            <EmptyState
              title={tNights("noNights")}
              description={tNights("noNightsAction")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">
              {t("leaderboard")}
            </h2>
          </CardHeader>
          <CardContent>
            <EmptyState title="Sin datos a\u00fan" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
