"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { formatProfitLoss, formatCurrency } from "@/lib/utils/currency";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { Link } from "@/i18n/navigation";

interface PersonalRecordsProps {
  groupId?: string;
  biggestWin: number;
  worstNight: number;
  biggestWinNightId: string | null;
  worstNightId: string | null;
  biggestWinDate: string | null;
  worstNightDate: string | null;
  longestWinStreak: number;
}

export function PersonalRecordsCard({
  groupId,
  biggestWin,
  worstNight,
  biggestWinNightId,
  worstNightId,
  biggestWinDate,
  worstNightDate,
  longestWinStreak,
}: PersonalRecordsProps) {
  const t = useTranslations("personalRecords");
  const locale = useLocale();
  const moneyLocale = locale === "es" ? "es-AR" : "en-US";

  if (biggestWin === 0 && worstNight === 0 && longestWinStreak === 0) return null;

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(moneyLocale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const records = [
    {
      label: t("biggestWin"),
      value: formatProfitLoss(biggestWin, moneyLocale, DEFAULT_CURRENCY),
      date: formatDate(biggestWinDate),
      nightId: biggestWinNightId,
      color: biggestWin > 0 ? "text-profit" : "text-velvet-500",
      icon: "🏆",
    },
    {
      label: t("worstNight"),
      value: formatProfitLoss(worstNight, moneyLocale, DEFAULT_CURRENCY),
      date: formatDate(worstNightDate),
      nightId: worstNightId,
      color: worstNight < 0 ? "text-loss" : "text-velvet-500",
      icon: "💀",
    },
    {
      label: t("longestStreak"),
      value: `${longestWinStreak}`,
      suffix: longestWinStreak === 1 ? t("night") : t("nights"),
      date: null,
      nightId: null,
      color: longestWinStreak >= 3 ? "text-profit" : "text-velvet-100",
      icon: "🔥",
    },
  ];

  return (
    <Card>
      <CardContent className="py-5 px-4 sm:py-6">
        <h3 className="text-xs font-medium text-velvet-400 mb-4">
          {t("title")}
        </h3>
        <div className="space-y-3">
          {records.map((record) => {
            const inner = (
              <div
                key={record.label}
                className="flex items-center gap-3 rounded-lg border border-velvet-700/40 bg-velvet-900/30 px-3.5 py-3 transition-colors hover:bg-velvet-800/40"
              >
                <span className="text-xl leading-none shrink-0">{record.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-velvet-500">{record.label}</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className={`font-bold tabular-nums text-lg leading-tight ${record.color}`}>
                      {record.value}
                    </span>
                    {"suffix" in record && record.suffix && (
                      <span className="text-xs text-velvet-400">{record.suffix}</span>
                    )}
                  </div>
                  {record.date && (
                    <p className="text-[11px] text-velvet-600 mt-0.5">{record.date}</p>
                  )}
                </div>
                {record.nightId && groupId && (
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
                    className="shrink-0 text-velvet-600"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                )}
              </div>
            );

            if (record.nightId && groupId) {
              return (
                <Link
                  key={record.label}
                  href={`/groups/${groupId}/nights/${record.nightId}/results`}
                  className="focus-ring block rounded-lg"
                >
                  {inner}
                </Link>
              );
            }

            return <div key={record.label}>{inner}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
