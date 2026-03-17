import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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
      className="focus-ring block rounded-lg"
    >
      <div className="flex items-center gap-3 rounded-lg border border-velvet-700/40 bg-velvet-800/40 px-3 py-3 transition-all hover:border-velvet-600/60 hover:bg-velvet-800/70">
          <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-velvet-800 text-center">
            <span className="text-[10px] leading-tight text-velvet-500">
              {formatShortDate(date, locale).split(" ")[0]}
            </span>
            <span className="text-sm font-bold leading-tight text-velvet-200 tabular-nums">
              {new Date(date).getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-velvet-100 truncate">
              {name ?? t("nightOfDate", { date: formatShortDate(date, locale) })}
            </p>
            {participantCount !== undefined && (
              <p className="text-xs text-velvet-500">
                {t("participantsCount", { count: participantCount })}
              </p>
            )}
          </div>
          <Badge variant={statusVariants[status]} className="shrink-0 text-[10px]">
            {t(statusLabelKey)}
          </Badge>
      </div>
    </Link>
  );
}
