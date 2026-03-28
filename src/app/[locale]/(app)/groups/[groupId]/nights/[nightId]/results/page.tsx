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
import { formatCurrency } from "@/lib/utils/currency";

export const metadata: Metadata = {
  title: "Night results",
};

export default async function NightResultsPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string; nightId: string }>;
}) {
  const { locale, groupId, nightId } = await params;
  const t = await getTranslations("leaderboard");
  const tNights = await getTranslations("nights");
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

  // Summary stats
  const totalPot = rows.reduce((sum, r) => sum + r.totalInvested, 0);
  const rebuyers = participants.filter((p) => p.buyInCount > 1);
  const totalRebuys = participants.reduce((sum, p) => sum + Math.max(0, p.buyInCount - 1), 0);

  // Duration: from night.updatedAt (when completed) vs night.date
  const nightDate = night ? new Date(night.date) : null;
  const completedAt = night?.updatedAt ? new Date(night.updatedAt) : null;
  let durationLabel: string | null = null;
  if (nightDate && completedAt && completedAt > nightDate) {
    const diffMs = completedAt.getTime() - nightDate.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor((diffMs % 3600000) / 60000);
    if (diffH > 0) {
      durationLabel = `${diffH}h ${diffM}m`;
    } else if (diffM > 0) {
      durationLabel = `${diffM}m`;
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>

      {/* Summary stats row */}
      {night && rows.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-velvet-700/50 bg-velvet-900/40 px-3 py-3 text-center">
            <p className="text-xs text-velvet-500">{tNights("participants")}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-velvet-100">{rows.length}</p>
          </div>
          <div className="rounded-xl border border-velvet-700/50 bg-velvet-900/40 px-3 py-3 text-center">
            <p className="text-xs text-velvet-500">{t("totalPot")}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-velvet-100">
              {formatCurrency(totalPot, moneyLocale, "ARS")}
            </p>
          </div>
          <div className="rounded-xl border border-velvet-700/50 bg-velvet-900/40 px-3 py-3 text-center">
            <p className="text-xs text-velvet-500">{t("rebuys")}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-velvet-100">{totalRebuys}</p>
          </div>
          <div className="rounded-xl border border-velvet-700/50 bg-velvet-900/40 px-3 py-3 text-center">
            <p className="text-xs text-velvet-500">{t("duration")}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-velvet-100">
              {durationLabel ?? "—"}
            </p>
          </div>
        </div>
      )}

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

      {/* Rebuyers detail */}
      {rebuyers.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold">{t("rebuyDetails")}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rebuyers.map((p) => (
                <div key={p.userId} className="flex items-center justify-between rounded-lg border border-velvet-700/40 px-3 py-2.5">
                  <span className="text-sm text-velvet-200">{p.displayName}</span>
                  <span className="text-xs font-semibold text-loss">
                    ×{p.buyInCount - 1} {t("rebuyCount")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
          groupId={groupId}
        />
      )}
    </div>
  );
}
