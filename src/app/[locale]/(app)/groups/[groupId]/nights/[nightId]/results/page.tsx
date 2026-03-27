import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getNightLeaderboard } from "@/lib/db/queries/leaderboard";
import { getNightMvpVotes } from "@/lib/db/queries/mvp";
import { getNightById, getNightParticipants } from "@/lib/db/queries/nights";
import { auth } from "@/lib/auth/server";
import { getUserByAuthId } from "@/lib/db/queries/users";
import { MvpVote } from "@/components/nights/mvp-vote";
import { ShareResults } from "@/components/nights/share-results";
import { NightLeaderboard } from "@/components/nights/night-leaderboard";

export const metadata: Metadata = {
  title: "Night results",
};

export default async function NightResultsPage({
  params,
}: {
  params: Promise<{ locale: string; nightId: string }>;
}) {
  const { locale, nightId } = await params;
  const t = await getTranslations("leaderboard");
  const tCommon = await getTranslations("common");

  const { data: session } = await auth!.getSession();
  const currentUser = session?.user
    ? await getUserByAuthId(session.user.id)
    : null;

  const [night, rows, participants, mvpData] = await Promise.all([
    getNightById(nightId),
    getNightLeaderboard(nightId),
    getNightParticipants(nightId),
    getNightMvpVotes(nightId, currentUser?.id),
  ]);

  const moneyLocale = locale === "es" ? "es-ES" : "en-US";
  const isParticipant = currentUser
    ? participants.some((p) => p.userId === currentUser.id)
    : false;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">
            {t("nightRanking")}
          </h2>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState title={tCommon("noResults")} />
          ) : (
            <NightLeaderboard rows={rows} moneyLocale={moneyLocale} />
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && currentUser && isParticipant && (
        <Card>
          <CardContent className="py-5">
            <MvpVote
              nightId={nightId}
              currentUserId={currentUser.id}
              participants={participants.map((p) => ({
                userId: p.userId,
                displayName: p.displayName,
                avatarUrl: p.avatarUrl,
              }))}
              candidates={mvpData.candidates}
              currentVote={mvpData.currentVote}
              totalVotes={mvpData.totalVotes}
            />
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && night && (
        <ShareResults
          nightName={night.name ?? new Date(night.date).toLocaleDateString(moneyLocale)}
          date={new Date(night.date).toLocaleDateString(moneyLocale, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          results={rows.map((r) => ({
            rank: r.rank,
            displayName: r.displayName,
            profitLoss: r.profitLoss,
          }))}
          locale={moneyLocale}
          currency="ARS"
        />
      )}
    </div>
  );
}
