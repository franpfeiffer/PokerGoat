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
  currency = "USD",
}: LeaderboardTableProps) {
  const t = useTranslations("leaderboard");

  if (entries.length === 0) {
    return <EmptyState title="Sin datos a\u00fan" />;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-velvet-400">
        <span className="w-8 text-center">{t("rank")}</span>
        <span className="w-7" />
        <span className="flex-1">{t("player")}</span>
        <span>{t("totalProfit")}</span>
      </div>
      {entries.map((entry) => (
        <LeaderboardRow
          key={entry.userId}
          rank={entry.rank}
          displayName={entry.displayName}
          avatarUrl={entry.avatarUrl}
          totalProfitLoss={entry.totalProfitLoss}
          nightsPlayed={entry.nightsPlayed}
          locale={locale}
          currency={currency}
        />
      ))}
    </div>
  );
}
