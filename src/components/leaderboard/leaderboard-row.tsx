import { Avatar } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { ProfitBadge } from "./profit-badge";
import { RankIndicator } from "./rank-indicator";
import Link from "next/link";

interface LeaderboardRowProps {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalProfitLoss: number;
  nightsPlayed?: number;
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
  locale = "es-ES",
  currency = "ARS",
}: LeaderboardRowProps) {
  const t = useTranslations("leaderboard");
  const isTop3 = rank <= 3;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-2 py-2.5 transition-colors sm:gap-3 sm:px-3 ${
        isTop3
          ? "bg-gold-500/4 border border-gold-500/10"
          : "border border-transparent hover:bg-velvet-800/40"
      }`}
    >
      <RankIndicator rank={rank} />
      <Link href={`/users/${userId}`} className="focus-ring rounded-full">
        <Avatar src={avatarUrl} name={displayName} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/users/${userId}`}
          className={`text-sm font-medium truncate block ${
            isTop3 ? "text-velvet-50" : "text-velvet-200 hover:text-gold-400"
          }`}
        >
          {displayName}
        </Link>
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
  );
}
