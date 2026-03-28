"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatProfitLoss } from "@/lib/utils/currency";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { ProfitChart } from "./profit-chart";
import { AchievementBadges } from "./achievement-badges";
import { RankBadge } from "./rank-badge";
import type { AchievementInput } from "@/lib/achievements";

interface PublicProfileContentProps {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bankAlias?: string | null;
  stats: {
    nightsPlayed: number;
    totalProfit: number;
    winRate: number;
  };
  profitHistory: { date: string; profitLoss: number; cumulative: number }[];
  achievementData?: AchievementInput | null;
}

export function PublicProfileContent({
  userId,
  displayName,
  avatarUrl,
  bankAlias,
  stats,
  profitHistory,
  achievementData,
}: PublicProfileContentProps) {
  const locale = useLocale();
  const t = useTranslations("profile");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!bankAlias) return;
    navigator.clipboard.writeText(bankAlias).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

          <div className="mt-3 w-full max-w-xs animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <RankBadge totalProfit={stats.totalProfit} locale={locale} />
          </div>

          {bankAlias && (
            <div className="mt-3 flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <span className="text-xs text-velvet-400 uppercase tracking-widest">{t("bankAliasLabel")}:</span>
              <span className="text-sm font-mono text-velvet-200 truncate max-w-[160px]">{bankAlias}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="focus-ring group rounded-full p-1.5 text-velvet-500 hover:text-gold-400 hover:bg-velvet-800/60 transition-colors"
                aria-label={t("bankAliasCopy")}
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-profit" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-hover:scale-110">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>
          )}
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

      {achievementData && <AchievementBadges input={achievementData} />}

      <ProfitChart data={profitHistory} locale={locale} currency="ARS" />
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