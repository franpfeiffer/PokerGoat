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

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 mb-6">
      <StatCard
        label={t("totalProfit")}
        value={
          <ProfitBadge
            amount={stats.allTime.totalProfit}
            locale="es-ES"
            currency="ARS"
            size="lg"
          />
        }
        accent
      />
      <StatCard
        label={t("nightsPlayed")}
        value={
          <span className="text-2xl font-bold tabular-nums text-velvet-50">
            {stats.allTime.nightsPlayed}
          </span>
        }
      />
      <StatCard
        label={t("winRate")}
        value={
          <span className="text-2xl font-bold tabular-nums text-velvet-50">
            {Math.round(stats.allTime.winRate * 100)}%
          </span>
        }
      />
      <StatCard
        label={t("last30Days")}
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
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3.5 flex flex-col items-center justify-center gap-1.5 ${
        accent
          ? "border-gold-500/15 bg-gold-500/[0.03]"
          : "border-velvet-700/60 bg-velvet-900"
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-velvet-500">
        {label}
      </span>
      {value}
    </div>
  );
}
