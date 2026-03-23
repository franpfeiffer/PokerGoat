import { useTranslations } from "next-intl";
import { LeaderboardRow } from "./leaderboard-row";
import { EmptyState } from "@/components/ui/empty-state";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  locale?: string;
  currency?: string;
}

export function LeaderboardTable({
  entries,
  locale = "es-ES",
  currency = "ARS",
}: LeaderboardTableProps) {
  const t = useTranslations("leaderboard");
  const tCommon = useTranslations("common");

  if (entries.length === 0) {
    return <EmptyState title={tCommon("noResults")} />;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="hidden items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-velvet-400 sm:flex">
        <span className="w-8 text-center">{t("rank")}</span>
        <span className="w-7" />
        <span className="flex-1">{t("player")}</span>
        <span>{t("totalProfit")}</span>
      </div>
      {entries.map((entry) => (
        <LeaderboardRow
          key={entry.userId}
          rank={entry.rank}
          userId={entry.userId}
          displayName={entry.displayName}
          avatarUrl={entry.avatarUrl}
          totalProfitLoss={entry.totalProfitLoss}
          nightsPlayed={entry.nightsPlayed}
          winRate={entry.winRate}
          roi={entry.roi}
          avgProfitLoss={entry.avgProfitLoss}
          locale={locale}
          currency={currency}
        />
      ))}
    </div>
  );
}
