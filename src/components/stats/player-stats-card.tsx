import { Card, CardContent } from "@/components/ui/card";
import { ProfitBadge } from "@/components/leaderboard/profit-badge";
import { formatCurrency } from "@/lib/utils/currency";
import { StatTooltip } from "@/components/ui/tooltip";

interface PlayerStatsCardProps {
  nightsPlayed: number;
  totalProfitLoss: number;
  biggestWin: number;
  worstNight: number;
  avgProfitLoss: number;
  winRate: number;
  roi?: number;
  locale?: string;
  currency?: string;
  tooltips?: {
    winRate?: string;
    roi?: string;
    avgProfit?: string;
  };
}

export function PlayerStatsCard({
  nightsPlayed,
  totalProfitLoss,
  biggestWin,
  worstNight,
  avgProfitLoss,
  winRate,
  roi,
  locale = "es-ES",
  currency = "ARS",
  tooltips,
}: PlayerStatsCardProps) {
  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-3 sm:gap-4">
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
          tooltip={tooltips?.avgProfit}
          value={formatCurrency(avgProfitLoss, locale, currency)}
        />
        <StatItem
          label="Ratio victorias"
          tooltip={tooltips?.winRate}
          value={`${Math.round(winRate * 100)}%`}
        />
        {roi !== undefined && (
          <StatItem
            label="ROI"
            tooltip={tooltips?.roi}
            value={`${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`}
          />
        )}
      </CardContent>
    </Card>
  );
}

function StatItem({
  label,
  value,
  className = "",
  tooltip,
  children,
}: {
  label: string;
  value?: string;
  className?: string;
  tooltip?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center text-xs text-velvet-400 uppercase tracking-wider">
        {label}
        {tooltip && <StatTooltip content={tooltip} />}
      </span>
      {children ? (
        children
      ) : (
        <span
          className={`text-base font-bold tabular-nums sm:text-lg ${className || "text-velvet-100"}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
