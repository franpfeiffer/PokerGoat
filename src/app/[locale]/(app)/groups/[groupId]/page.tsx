import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NightCard } from "@/components/nights/night-card";
import { getGroupNights } from "@/lib/db/queries/nights";
import { getGroupLeaderboard, getGroupProfitHistory, getGroupStreaks } from "@/lib/db/queries/leaderboard";
import { getGroupActivity } from "@/lib/db/queries/activity";
import { getGroupMvpLeaderboard } from "@/lib/db/queries/mvp";
import { Avatar } from "@/components/ui/avatar";
import { ActivityFeed } from "@/components/groups/activity-feed";
import { getGroupById } from "@/lib/db/queries/groups";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { GroupProfitChart } from "@/components/stats/group-profit-chart";

export default async function GroupOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string }>;
}) {
  const { locale, groupId } = await params;
  const t = await getTranslations("groups");
  const tNights = await getTranslations("nights");
  const tLeaderboard = await getTranslations("leaderboard");
  const tH2H = await getTranslations("headToHead");
  const tActivity = await getTranslations("activity");
  const tMvp = await getTranslations("mvp");
  const [group, nights, leaderboard, profitHistory, streaks, activity, mvpLeaderboard] = await Promise.all([
    getGroupById(groupId),
    getGroupNights(groupId),
    getGroupLeaderboard(groupId),
    getGroupProfitHistory(groupId),
    getGroupStreaks(groupId),
    getGroupActivity(groupId),
    getGroupMvpLeaderboard(groupId),
  ]);

  const leaderboardWithStreaks = leaderboard.map((entry) => ({
    ...entry,
    streak: streaks[entry.userId] ?? { type: "none" as const, count: 0 },
  }));

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold truncate">{group?.name ?? t("group")}</h1>
        <div className="flex gap-2">
          <Link href={`/groups/${groupId}/head-to-head`} className="flex-1 sm:flex-none">
            <Button variant="secondary" size="sm" className="min-h-11 w-full sm:min-h-10 sm:w-auto">
              H2H
            </Button>
          </Link>
          <Link href={`/groups/${groupId}/members`} className="flex-1 sm:flex-none">
            <Button variant="secondary" size="sm" className="min-h-11 w-full sm:min-h-10 sm:w-auto">
              {t("members")}
            </Button>
          </Link>
          <Link href={`/groups/${groupId}/settings`} className="flex-1 sm:flex-none">
            <Button variant="secondary" size="sm" className="min-h-11 w-full sm:min-h-10 sm:w-auto">
              {t("settings")}
            </Button>
          </Link>
          <Link href={`/groups/${groupId}/nights/new`} className="flex-1 sm:flex-none">
            <Button size="sm" className="min-h-11 w-full sm:min-h-10 sm:w-auto">
              {tNights("create")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="order-2 lg:order-1">
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
              <div className="space-y-2">
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

        <Card className="order-1 lg:order-2">
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
                entries={leaderboardWithStreaks}
                locale={locale === "es" ? "es-ES" : "en-US"}
                currency="ARS"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {profitHistory.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">
              {tLeaderboard("profitEvolution")}
            </h2>
          </CardHeader>
          <CardContent>
            <GroupProfitChart
              data={profitHistory}
              locale={locale === "es" ? "es-ES" : "en-US"}
              currency={group?.currency ?? "ARS"}
            />
          </CardContent>
        </Card>
      )}

      {mvpLeaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">
              {tMvp("leaderboard")}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mvpLeaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    index === 0
                      ? "border border-gold-500/20 bg-gold-500/[0.04]"
                      : "border border-velvet-700/30 bg-velvet-800/20"
                  }`}
                >
                  <span
                    className={`w-5 text-center text-sm font-bold tabular-nums ${
                      index === 0 ? "text-gold-400" : "text-velvet-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <Avatar src={entry.avatarUrl} name={entry.displayName} size="sm" />
                  <span
                    className={`flex-1 text-sm font-medium truncate ${
                      index === 0 ? "text-gold-200" : "text-velvet-200"
                    }`}
                  >
                    {entry.displayName}
                  </span>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      index === 0 ? "text-gold-400" : "text-velvet-400"
                    }`}
                  >
                    {entry.mvpCount} {tMvp("mvps")}
                  </span>
                  {index === 0 && (
                    <span className="text-base" aria-hidden="true">⭐</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activity.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">
              {tActivity("title")}
            </h2>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              items={activity}
              locale={locale}
              currency={group?.currency ?? "ARS"}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
