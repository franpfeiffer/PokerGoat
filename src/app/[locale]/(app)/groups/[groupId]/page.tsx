import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NightCard } from "@/components/nights/night-card";
import { getGroupNights } from "@/lib/db/queries/nights";
import { getGroupLeaderboard } from "@/lib/db/queries/leaderboard";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";

export default async function GroupOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string }>;
}) {
  const { locale, groupId } = await params;
  const t = await getTranslations("groups");
  const tNights = await getTranslations("nights");
  const nights = await getGroupNights(groupId);
  const leaderboard = await getGroupLeaderboard(groupId);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold">{t("group")}</h1>
        <div className="flex gap-2">
          <Link href={`/groups/${groupId}/nights/new`}>
            <Button size="sm" className="min-h-11 sm:min-h-10">
              {tNights("create")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">
              {tNights("title")}
            </h2>
          </CardHeader>
          <CardContent>
            {nights.length === 0 ? (
              <EmptyState
                title={tNights("noNights")}
                description={tNights("noNightsAction")}
              />
            ) : (
              <div className="space-y-3">
                {nights.map((night) => (
                  <NightCard
                    key={night.id}
                    id={night.id}
                    groupId={groupId}
                    name={night.name}
                    date={night.date}
                    status={night.status}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">
              {t("leaderboard")}
            </h2>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <EmptyState title={t("leaderboard")} description={tNights("noNightsAction")} />
            ) : (
              <LeaderboardTable
                entries={leaderboard}
                locale={locale === "es" ? "es-ES" : "en-US"}
                currency="ARS"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
