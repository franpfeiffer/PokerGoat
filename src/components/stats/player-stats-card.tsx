import { Card, CardContent } from "@/components/ui/card";
import { ProfitBadge } from "@/components/leaderboard/profit-badge";
import { formatCurrency } from "@/lib/utils/currency";

interface PlayerStatsCardProps {
  nightsPlayed: number;
  totalProfitLoss: number;
  biggestWin: number;
  worstNight: number;
  avgProfitLoss: number;
  winRate: number;
  locale?: string;
  currency?: string;
}

export function PlayerStatsCard({
  nightsPlayed,
  totalProfitLoss,
  biggestWin,
  worstNight,
  avgProfitLoss,
  winRate,
  locale = "es-ES",
  currency = "USD",
}: PlayerStatsCardProps) {
  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 py-5">
        <StatItem label="Noches" value={String(nightsPlayed)} />
        <StatItem label="Beneficio total">
          <ProfitBadge
            amount={totalProfitLoss}
            locale={locale}
            currency={currency}
            size="sm"
          />
        </StatItem>
        <StatItem
          label="Mayor ganancia"
          value={formatCurrency(biggestWin, locale, currency)}
          className="text-profit"
        />
        <StatItem
          label="Peor noche"
          value={formatCurrency(worstNight, locale, currency)}
          className="text-loss"
        />
        <StatItem
          label="Promedio"
          value={formatCurrency(avgProfitLoss, locale, currency)}
        />
        <StatItem
          label="Ratio victorias"
          value={`${Math.round(winRate * 100)}%`}
        />
      </CardContent>
    </Card>
  );
}

function StatItem({
  label,
  value,
  className = "",
  children,
}: {
  label: string;
  value?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-velvet-400 uppercase tracking-wider">
        {label}
      </span>
      {children ? (
        children
      ) : (
        <span
          className={`text-lg font-bold tabular-nums ${className || "text-velvet-100"}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
