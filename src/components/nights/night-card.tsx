import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils/dates";

interface NightCardProps {
  id: string;
  groupId: string;
  name: string | null;
  date: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  participantCount?: number;
  locale?: string;
}

const statusVariants: Record<string, "default" | "gold" | "profit" | "loss" | "muted"> = {
  scheduled: "default",
  in_progress: "gold",
  completed: "profit",
  cancelled: "muted",
};

export function NightCard({
  id,
  groupId,
  name,
  date,
  status,
  participantCount,
  locale = "es",
}: NightCardProps) {
  const t = useTranslations("nights");

  const statusLabelKey = {
    scheduled: "status.scheduled",
    in_progress: "status.inProgress",
    completed: "status.completed",
    cancelled: "status.cancelled",
  }[status];

  return (
    <Link
      href={`/groups/${groupId}/nights/${id}`}
      className="focus-ring block rounded-xl"
    >
      <Card className="transition-colors hover:border-velvet-600 hover:bg-surface-elevated/50">
        <CardContent className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-velvet-800 text-center sm:h-12 sm:w-12">
            <span className="text-xs text-velvet-400">
              {formatShortDate(date, locale).split(" ")[0]}
            </span>
            <span className="text-sm font-bold text-velvet-200 tabular-nums">
              {new Date(date).getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-velvet-100 truncate">
              {name ?? t("nightOfDate", { date: formatShortDate(date, locale) })}
            </p>
            {participantCount !== undefined && (
              <p className="text-xs text-velvet-400">
                {t("participantsCount", { count: participantCount })}
              </p>
            )}
          </div>
          <Badge variant={statusVariants[status]}>
            {t(statusLabelKey)}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
