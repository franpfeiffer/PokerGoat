"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import type { GroupComparisonStats } from "@/lib/db/queries/users";

interface GroupComparisonCardProps {
  data: GroupComparisonStats;
  locale: string;
  currency: string;
}

function CompareRow({
  label,
  userValue,
  avgValue,
  better,
}: {
  label: string;
  userValue: string;
  avgValue: string;
  /** true = user is above average, false = below, null = equal */
  better: boolean | null;
}) {
  const userColor =
    better === true
      ? "text-profit"
      : better === false
        ? "text-loss"
        : "text-velvet-100";

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-velvet-800/60 last:border-0">
      <span className="text-xs text-velvet-400 uppercase tracking-wider flex-1">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${userColor} w-20 text-right`}>{userValue}</span>
      <span className="text-xs tabular-nums text-velvet-500 w-20 text-right">{avgValue}</span>
    </div>
  );
}

export function GroupComparisonCard({ data, locale, currency }: GroupComparisonCardProps) {
  const t = useTranslations("profile");

  const rankColor =
    data.userRank === 1 ? "text-gold-400" : data.userRank <= Math.ceil(data.totalPlayers / 2) ? "text-profit" : "text-loss";

  return (
    <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <CardContent className="py-5 px-4 sm:py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-velvet-200 uppercase tracking-wider">
            {t("vsGroup", { name: data.groupName })}
          </h3>
          <span className={`text-sm font-bold tabular-nums ${rankColor}`}>
            #{data.userRank} / {data.totalPlayers}
          </span>
        </div>

        {/* Column headers */}
        <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-velvet-700/60">
          <span className="flex-1" />
          <span className="text-[10px] font-medium text-velvet-500 uppercase tracking-wider w-20 text-right">{t("you")}</span>
          <span className="text-[10px] font-medium text-velvet-500 uppercase tracking-wider w-20 text-right">{t("groupAvg")}</span>
        </div>

        <CompareRow
          label={t("winRate")}
          userValue={`${Math.round(data.userWinRate * 100)}%`}
          avgValue={`${Math.round(data.avgWinRate * 100)}%`}
          better={data.userWinRate > data.avgWinRate ? true : data.userWinRate < data.avgWinRate ? false : null}
        />
        <CompareRow
          label="ROI"
          userValue={`${data.userRoi >= 0 ? "+" : ""}${data.userRoi.toFixed(1)}%`}
          avgValue={`${data.avgRoi >= 0 ? "+" : ""}${data.avgRoi.toFixed(1)}%`}
          better={data.userRoi > data.avgRoi ? true : data.userRoi < data.avgRoi ? false : null}
        />
        <CompareRow
          label={t("avgProfit")}
          userValue={formatCurrency(data.userAvgProfit, locale, currency)}
          avgValue={formatCurrency(data.avgGroupProfit, locale, currency)}
          better={data.userAvgProfit > data.avgGroupProfit ? true : data.userAvgProfit < data.avgGroupProfit ? false : null}
        />

        <p className={`mt-3 text-center text-xs font-medium ${rankColor}`}>
          {data.userRank === 1
            ? t("rankFirst")
            : data.userRank <= Math.ceil(data.totalPlayers / 2)
              ? t("rankAboveAvg", { rank: data.userRank, total: data.totalPlayers })
              : t("rankBelowAvg", { rank: data.userRank, total: data.totalPlayers })}
        </p>
      </CardContent>
    </Card>
  );
}
