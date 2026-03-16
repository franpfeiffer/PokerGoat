import { Link } from "@/i18n/navigation";
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

const statusLabels: Record<string, string> = {
  scheduled: "Programada",
  in_progress: "En curso",
  completed: "Finalizada",
  cancelled: "Cancelada",
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
  return (
    <Link
      href={`/groups/${groupId}/nights/${id}`}
      className="focus-ring block rounded-xl"
    >
      <Card className="transition-colors hover:border-velvet-600 hover:bg-surface-elevated/50">
        <CardContent className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-velvet-800 text-center">
            <span className="text-xs text-velvet-400">
              {formatShortDate(date, locale).split(" ")[0]}
            </span>
            <span className="text-sm font-bold text-velvet-200 tabular-nums">
              {new Date(date).getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-velvet-100 truncate">
              {name ?? `Noche del ${formatShortDate(date, locale)}`}
            </p>
            {participantCount !== undefined && (
              <p className="text-xs text-velvet-400">
                {participantCount} participantes
              </p>
            )}
          </div>
          <Badge variant={statusVariants[status]}>
            {statusLabels[status]}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
