import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NightStatusAction } from "@/components/nights/night-status-action";
import { NightParticipantsPanel } from "@/components/nights/night-participants-panel";
import { formatCurrency } from "@/lib/utils/currency";
import { formatShortDate } from "@/lib/utils/dates";
import { getNightById, getNightParticipants } from "@/lib/db/queries/nights";
import { getGroupMembers } from "@/lib/db/queries/groups";
import { parseNightMetadata } from "@/lib/utils/chips";

const statusVariants: Record<string, "default" | "gold" | "profit" | "muted"> = {
  scheduled: "default",
  in_progress: "gold",
  completed: "profit",
  cancelled: "muted",
};

export default async function NightDetailPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string; nightId: string }>;
}) {
  const { locale, groupId, nightId } = await params;
  const t = await getTranslations("nights");
  const tCommon = await getTranslations("common");

  const [night, participants, groupMembersResult] = await Promise.all([
    getNightById(nightId),
    getNightParticipants(nightId),
    getGroupMembers(groupId),
  ]);
  if (!night || night.groupId !== groupId) {
    notFound();
  }
  const moneyLocale = locale === "es" ? "es-ES" : "en-US";
  const metadata = parseNightMetadata(night.notes, Number(night.chipValue));
  const statusLabelKey = {
    scheduled: "status.scheduled",
    in_progress: "status.inProgress",
    completed: "status.completed",
    cancelled: "status.cancelled",
  }[night.status];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-display text-2xl font-bold">
          {night.name ?? t("nightOfDate", { date: formatShortDate(night.date, locale) })}
        </h1>
        <div className="w-full space-y-2 sm:w-auto sm:space-y-2 sm:text-right">
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            {night.status !== "completed" && (
              <Link href={`/groups/${groupId}/nights/${night.id}/edit`} className="block">
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-h-11 w-full justify-center sm:min-h-10 sm:w-auto"
                >
                  {tCommon("edit")}
                </Button>
              </Link>
            )}
            {night.status === "completed" && (
              <Link
                href={`/groups/${groupId}/nights/${night.id}/results`}
                className="block"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-h-11 w-full justify-center sm:min-h-10 sm:w-auto"
                >
                  {t("viewResults")}
                </Button>
              </Link>
            )}
          </div>
          <Badge
            variant={statusVariants[night.status]}
            className="min-h-9 w-full justify-center px-3 py-1 sm:w-auto"
          >
            {t(statusLabelKey)}
          </Badge>
          <NightStatusAction
            groupId={groupId}
            nightId={night.id}
            status={night.status}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-xs text-velvet-400 uppercase tracking-wider">
              {t("buyIn")}
            </p>
            <p className="text-xl font-bold tabular-nums text-velvet-100">
              {formatCurrency(Number(night.buyInAmount), moneyLocale, "ARS")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-xs text-velvet-400 uppercase tracking-wider">
              {t("participants")}
            </p>
            <p className="text-xl font-bold tabular-nums text-velvet-100">
              {participants.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">{t("chipValues")}</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
            {(
              [
                ["black", t("chipBlack")],
                ["white", t("chipWhite")],
                ["red", t("chipRed")],
                ["green", t("chipGreen")],
                ["blue", t("chipBlue")],
              ] as const
            ).map(([color, label]) => (
              <div
                key={color}
                className="rounded-lg border border-velvet-700/70 bg-velvet-900/40 px-3 py-2 text-center"
              >
                <p className="text-xs text-velvet-400">{label}</p>
                <p className="text-sm font-semibold tabular-nums text-velvet-100">
                  {formatCurrency(metadata.chipValues[color], moneyLocale, "ARS")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">
            {t("participants")}
          </h2>
        </CardHeader>
        <CardContent>
          <NightParticipantsPanel
            nightId={night.id}
            nightStatus={night.status}
            buyInAmount={Number(night.buyInAmount)}
            chipValue={Number(night.chipValue)}
            chipValues={metadata.chipValues}
            locale={moneyLocale}
            members={groupMembersResult.map((member) => ({
              userId: member.userId,
              displayName: member.displayName,
              avatarUrl: member.avatarUrl,
            }))}
            participants={participants.map((participant) => ({
              id: participant.id,
              userId: participant.userId,
              displayName: participant.displayName,
              avatarUrl: participant.avatarUrl,
              buyInCount: participant.buyInCount,
              totalChipsEnd: participant.totalChipsEnd,
              chipsBlackEnd: participant.chipsBlackEnd,
              chipsWhiteEnd: participant.chipsWhiteEnd,
              chipsRedEnd: participant.chipsRedEnd,
              chipsGreenEnd: participant.chipsGreenEnd,
              chipsBlueEnd: participant.chipsBlueEnd,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
