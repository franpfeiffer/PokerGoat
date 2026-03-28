import { getTranslations } from "next-intl/server";
import { ProfitBadge } from "@/components/leaderboard/profit-badge";

interface DashboardStats {
  allTime: {
    nightsPlayed: number;
    totalProfit: number;
    winRate: number;
  };
  last30Days: {
    nightsPlayed: number;
    totalProfit: number;
    winRate: number;
  };
}

interface StatsWidgetProps {
  stats: DashboardStats | null;
}

export async function StatsWidget({ stats }: StatsWidgetProps) {
  const t = await getTranslations("dashboardWidget");

  if (!stats || stats.allTime.nightsPlayed === 0) return null;

  const winRate = Math.round(stats.allTime.winRate * 100);

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 mb-6">
      {/* Total Profit — accent card */}
      <div className="relative overflow-hidden rounded-xl border border-gold-500/20 bg-gradient-to-br from-gold-500/[0.06] to-gold-500/[0.02] px-3 py-3.5 flex flex-col items-center justify-center gap-1.5 glow-pulse">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold-500/50" aria-hidden="true">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          <span className="text-[10px] font-semibold text-velvet-500">
            {t("totalProfit")}
          </span>
        </div>
        <ProfitBadge
          amount={stats.allTime.totalProfit}
          locale="es-ES"
          currency="ARS"
          size="lg"
        />
      </div>

      {/* Nights Played */}
      <StatCard
        label={t("nightsPlayed")}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        }
        value={
          <span className="text-2xl font-bold tabular-nums text-velvet-50 animate-count-up">
            {stats.allTime.nightsPlayed}
          </span>
        }
      />

      {/* Win Rate */}
      <StatCard
        label={t("winRate")}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        }
        value={
          <span
            className={`text-2xl font-bold tabular-nums animate-count-up ${
              winRate >= 60
                ? "text-profit"
                : winRate >= 40
                ? "text-velvet-50"
                : "text-loss"
            }`}
          >
            {winRate}%
          </span>
        }
      />

      {/* Last 30 days */}
      <StatCard
        label={t("last30Days")}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 6v6l3 3" />
          </svg>
        }
        value={
          stats.last30Days.nightsPlayed > 0 ? (
            <div className="flex flex-col items-center gap-0.5">
              <ProfitBadge
                amount={stats.last30Days.totalProfit}
                locale="es-ES"
                currency="ARS"
                size="sm"
              />
              <span className="text-[11px] text-velvet-500">
                {stats.last30Days.nightsPlayed} {t("nights")}
              </span>
            </div>
          ) : (
            <span className="text-xs text-velvet-500">{t("noRecent")}</span>
          )
        }
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-velvet-700/50 bg-velvet-900 px-3 py-3.5 flex flex-col items-center justify-center gap-1.5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-velvet-700/60 to-transparent" />
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-velvet-500">{icon}</span>}
        <span className="text-[10px] font-semibold text-velvet-500">
          {label}
        </span>
      </div>
      {value}
    </div>
  );
}
