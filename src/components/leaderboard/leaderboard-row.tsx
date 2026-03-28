import { Avatar } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { ProfitBadge } from "./profit-badge";
import { RankIndicator } from "./rank-indicator";
import { RankBadge } from "@/components/profile/rank-badge";
import { Link } from "@/i18n/navigation";
import { StatTooltip } from "@/components/ui/tooltip";

interface LeaderboardRowProps {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalProfitLoss: number;
  nightsPlayed?: number;
  winRate?: number;
  roi?: number;
  avgProfitLoss?: number;
  streak?: { type: "winning" | "losing" | "none"; count: number };
  locale?: string;
  currency?: string;
}

export function LeaderboardRow({
  rank,
  userId,
  displayName,
  avatarUrl,
  totalProfitLoss,
  nightsPlayed,
  winRate,
  roi,
  avgProfitLoss,
  streak,
  locale = "es-ES",
  currency = "ARS",
}: LeaderboardRowProps) {
  const t = useTranslations("leaderboard");
  const isTop3 = rank <= 3;

  return (
    <div
      className={`rounded-lg px-2 py-2.5 transition-colors sm:px-3 ${
        isTop3
          ? "bg-gold-500/4 border border-gold-500/10"
          : "border border-transparent hover:bg-velvet-800/40"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <RankIndicator rank={rank} />
        <Link href={`/users/${userId}`} className="focus-ring rounded-full">
          <Avatar src={avatarUrl} name={displayName} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href={`/users/${userId}`}
              className={`text-sm font-medium truncate ${
                isTop3 ? "text-velvet-50" : "text-velvet-200 hover:text-gold-400"
              }`}
            >
              {displayName}
            </Link>
            <RankBadge totalProfit={totalProfitLoss} locale={locale} size="sm" />
            {streak && streak.type !== "none" && streak.count >= 2 && (
              <span
                title={`${streak.count} ${streak.type === "winning" ? t("streakWinning") : t("streakLosing")}`}
                className={`shrink-0 inline-flex items-center rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums leading-none ${
                  streak.type === "winning"
                    ? "bg-profit/10 text-profit"
                    : "bg-loss/10 text-loss"
                }`}
              >
                {streak.count}
              </span>
            )}
          </div>
          {nightsPlayed !== undefined && (
            <p className="text-xs text-velvet-500 tabular-nums">
              {nightsPlayed} {t("nightsPlayed")}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <ProfitBadge amount={totalProfitLoss} locale={locale} currency={currency} size="sm" />
        </div>
      </div>
      {(winRate !== undefined || roi !== undefined) && (
        <div className="mt-1.5 ml-[3.25rem] flex gap-3 text-xs tabular-nums text-velvet-400">
          {winRate !== undefined && (
            <span className="inline-flex items-center gap-0.5">
              {t("winRate")} {Math.round(winRate * 100)}%
              <StatTooltip content={t("winRateTooltip")} />
            </span>
          )}
          {roi !== undefined && (
            <span className="inline-flex items-center gap-0.5">
              ROI {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
              <StatTooltip content={t("roiTooltip")} />
            </span>
          )}
          {avgProfitLoss !== undefined && (
            <span className="hidden sm:inline">
              {t("avgProfit")} {new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(avgProfitLoss)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
