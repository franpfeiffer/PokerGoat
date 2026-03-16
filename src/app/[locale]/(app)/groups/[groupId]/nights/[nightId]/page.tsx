import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { NightStatusAction } from "@/components/nights/night-status-action";
import { formatCurrency } from "@/lib/utils/currency";
import { formatShortDate } from "@/lib/utils/dates";
import { getNightById, getNightParticipants } from "@/lib/db/queries/nights";
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

  const night = await getNightById(nightId);
  if (!night || night.groupId !== groupId) {
    notFound();
  }

  const participants = await getNightParticipants(night.id);
  const moneyLocale = locale === "es" ? "es-ES" : "en-US";
  const metadata = parseNightMetadata(night.notes, Number(night.chipValue));
  const statusLabelKey = {
    scheduled: "status.scheduled",
    in_progress: "status.inProgress",
    completed: "status.completed",
    cancelled: "status.cancelled",
  }[night.status];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">
          {night.name ?? t("nightOfDate", { date: formatShortDate(night.date, locale) })}
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariants[night.status]}>
            {t(statusLabelKey)}
          </Badge>
          <NightStatusAction
            nightId={night.id}
            status={night.status}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="grid gap-3 sm:grid-cols-5">
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
          {participants.length === 0 ? (
            <EmptyState
              title={t("noParticipants")}
              description={t("addParticipantsToStart")}
            />
          ) : (
            <ul className="space-y-3">
              {participants.map((participant) => (
                <li
                  key={participant.id}
                  className="flex items-center gap-3 border-b border-velvet-700/50 pb-3 last:border-0 last:pb-0"
                >
                  <Avatar
                    src={participant.avatarUrl}
                    name={participant.displayName}
                    size="sm"
                  />
                  <span className="text-sm text-velvet-100">
                    {participant.displayName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
