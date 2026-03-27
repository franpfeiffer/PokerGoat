import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface UpcomingNight {
  id: string;
  name: string | null;
  date: string;
  status: string;
  groupId: string;
  groupName: string;
}

interface UpcomingNightsBannerProps {
  nights: UpcomingNight[];
  locale: string;
}

export async function UpcomingNightsBanner({ nights, locale }: UpcomingNightsBannerProps) {
  const t = await getTranslations("dashboard");

  if (nights.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="mb-6 flex flex-col gap-2">
      {nights.map((night) => {
        const isInProgress = night.status === "in_progress";
        return (
          <Link
            key={night.id}
            href={`/groups/${night.groupId}/nights/${night.id}`}
            className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
              isInProgress
                ? "border-profit/30 bg-profit/5 hover:bg-profit/10"
                : "border-gold-500/25 bg-gold-500/5 hover:bg-gold-500/10"
            }`}
          >
            {/* Status dot */}
            <span
              className={`relative flex h-2.5 w-2.5 shrink-0 ${
                isInProgress ? "text-profit" : "text-gold-400"
              }`}
            >
              {isInProgress && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-profit opacity-50" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  isInProgress ? "bg-profit" : "bg-gold-400"
                }`}
              />
            </span>

            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${isInProgress ? "text-profit" : "text-gold-300"}`}>
                {isInProgress ? t("nightInProgress") : t("nightScheduled")}
                {" · "}
                <span className="text-velvet-200">{night.name ?? night.groupName}</span>
              </p>
              <p className="text-xs text-velvet-400">
                {night.groupName} · {formatDate(night.date)}
              </p>
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-velvet-500 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        );
      })}
    </div>
  );
}
