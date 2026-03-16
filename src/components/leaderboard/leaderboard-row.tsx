import { Avatar } from "@/components/ui/avatar";
import { ProfitBadge } from "./profit-badge";
import { RankIndicator } from "./rank-indicator";

interface LeaderboardRowProps {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  totalProfitLoss: number;
  nightsPlayed?: number;
  locale?: string;
  currency?: string;
}

export function LeaderboardRow({
  rank,
  displayName,
  avatarUrl,
  totalProfitLoss,
  nightsPlayed,
  locale = "es-ES",
  currency = "ARS",
}: LeaderboardRowProps) {
  const isTop3 = rank <= 3;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
        isTop3
          ? "bg-gold-500/5 border border-gold-500/10"
          : "border border-transparent hover:bg-velvet-800/30"
      }`}
    >
      <RankIndicator rank={rank} />
      <Avatar src={avatarUrl} name={displayName} size="sm" />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isTop3 ? "text-velvet-50" : "text-velvet-200"
          }`}
        >
          {displayName}
        </p>
        {nightsPlayed !== undefined && (
          <p className="text-xs text-velvet-400 tabular-nums">
            {nightsPlayed} noches
          </p>
        )}
      </div>
      <ProfitBadge
        amount={totalProfitLoss}
        locale={locale}
        currency={currency}
      />
    </div>
  );
}
