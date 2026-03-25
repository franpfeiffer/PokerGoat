"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { Link } from "@/i18n/navigation";
import { getUpcomingNightsAction } from "@/lib/actions/nights";

interface UpcomingNight {
  id: string;
  name: string | null;
  date: string;
  status: string;
  groupId: string;
  groupName: string;
}

export function UpcomingNightsBanner() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data: session, isPending } = authClient.useSession();
  const [nights, setNights] = useState<UpcomingNight[]>([]);

  useEffect(() => {
    if (isPending || !session?.user?.id) return;
    getUpcomingNightsAction(session.user.id).then((result) => {
      if (result) setNights(result);
    });
  }, [isPending, session]);

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
