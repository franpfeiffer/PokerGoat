"use client";

import { useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatProfitLoss } from "@/lib/utils/currency";
import { DEFAULT_CURRENCY } from "@/lib/constants";

interface PublicProfileContentProps {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  stats: {
    nightsPlayed: number;
    totalProfit: number;
    winRate: number;
  };
}

export function PublicProfileContent({
  userId,
  displayName,
  avatarUrl,
  stats,
}: PublicProfileContentProps) {
  const locale = useLocale();

  const profitColor =
    stats.totalProfit > 0
      ? "text-profit"
      : stats.totalProfit < 0
        ? "text-loss"
        : "text-even";

  const profitBg =
    stats.totalProfit > 0
      ? "bg-profit/5"
      : stats.totalProfit < 0
        ? "bg-loss/5"
        : "bg-velvet-800/50";

  const winRateColor =
    stats.winRate > 0.5
      ? "text-profit"
      : stats.winRate > 0
        ? "text-gold-400"
        : "text-even";

  return (
    <div className="space-y-3">
      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col items-center py-8 px-4 sm:py-10 sm:px-6">
          <div className="animate-fade-in">
            <Avatar src={avatarUrl} name={displayName} size="2xl" />
          </div>
          <div className="mt-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-display text-2xl font-bold text-velvet-50 tracking-tight text-center">
              {displayName}
            </h2>
          </div>
        </CardContent>
      </Card>

      <StatCard
        label="Total Profit"
        delay="0.15s"
        className={profitBg}
      >
        <span className={`text-3xl font-bold tabular-nums sm:text-4xl ${profitColor}`}>
          {formatProfitLoss(stats.totalProfit, locale, DEFAULT_CURRENCY)}
        </span>
      </StatCard>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Nights Played" delay="0.2s">
          <span className="text-2xl font-bold tabular-nums text-velvet-50 sm:text-3xl">
            {stats.nightsPlayed}
          </span>
        </StatCard>

        <StatCard label="Win Rate" delay="0.25s">
          <span className={`text-2xl font-bold tabular-nums sm:text-3xl ${winRateColor}`}>
            {Math.round(stats.winRate * 100)}%
          </span>
        </StatCard>
      </div>
    </div>
  );
}

function StatCard({
  label,
  children,
  delay = "0s",
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  delay?: string;
  className?: string;
}) {
  return (
    <Card
      className={`stat-card-glow animate-fade-in ${className}`}
      style={{ animationDelay: delay }}
    >
      <CardContent className="flex flex-col items-center gap-2 py-5 px-3 text-center sm:gap-3 sm:py-6 sm:px-4">
        <div className="animate-count-up" style={{ animationDelay: delay }}>
          {children}
        </div>
        <span className="text-xs font-medium uppercase tracking-widest text-velvet-400">
          {label}
        </span>
      </CardContent>
    </Card>
  );
}