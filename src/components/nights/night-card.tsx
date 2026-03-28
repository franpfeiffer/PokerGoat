import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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

const statusConfig = {
  scheduled: {
    dot: "bg-gold-400",
    ping: false,
    label: "status.scheduled",
    border: "border-velvet-700/40",
    bg: "bg-velvet-800/40 hover:bg-velvet-800/70 hover:border-velvet-600/60",
    text: "text-gold-400",
  },
  in_progress: {
    dot: "bg-profit",
    ping: true,
    label: "status.inProgress",
    border: "border-profit/25",
    bg: "bg-profit/[0.04] hover:bg-profit/[0.07] hover:border-profit/40",
    text: "text-profit",
  },
  completed: {
    dot: "bg-velvet-500",
    ping: false,
    label: "status.completed",
    border: "border-velvet-700/40",
    bg: "bg-velvet-800/40 hover:bg-velvet-800/70 hover:border-velvet-600/60",
    text: "text-velvet-400",
  },
  cancelled: {
    dot: "bg-velvet-600",
    ping: false,
    label: "status.cancelled",
    border: "border-velvet-700/30",
    bg: "bg-velvet-900/40 hover:bg-velvet-800/40 hover:border-velvet-700/60",
    text: "text-velvet-500",
  },
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
  const cfg = statusConfig[status];
  const dayNum = new Date(date).getDate();
  const dayLabel = formatShortDate(date, locale).split(" ")[0];

  return (
    <Link
      href={`/groups/${groupId}/nights/${id}`}
      className="focus-ring block rounded-lg group"
    >
      <div
        className={`flex items-center gap-3 rounded-lg border px-3 py-3 transition-all duration-200 ${cfg.border} ${cfg.bg}`}
      >
        {/* Date block */}
        <div className="flex h-11 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-velvet-800/80 border border-velvet-700/40">
          <span className="text-[9px] font-semibold uppercase leading-tight text-velvet-500 tracking-wide">
            {dayLabel}
          </span>
          <span className="text-base font-bold leading-tight text-velvet-100 tabular-nums">
            {dayNum}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-velvet-100 truncate">
            {name ?? t("nightOfDate", { date: formatShortDate(date, locale) })}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {/* Status pill */}
            <span className="relative flex items-center gap-1.5">
              {cfg.ping && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.dot} opacity-60`} />
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                </span>
              )}
              {!cfg.ping && (
                <span className={`inline-flex h-1.5 w-1.5 rounded-full ${cfg.dot} opacity-70`} />
              )}
              <span className={`text-[11px] font-medium ${cfg.text}`}>
                {t(cfg.label)}
              </span>
            </span>
            {participantCount !== undefined && (
              <>
                <span className="text-velvet-700">·</span>
                <span className="text-[11px] text-velvet-500">
                  {t("participantsCount", { count: participantCount })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Arrow */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-velvet-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-velvet-400"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}
