"use client";

import { useTranslations } from "next-intl";
import { getRank, getNextRank, getRankProgress } from "@/lib/rank";
import { formatCurrency } from "@/lib/utils/currency";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { useState } from "react";

interface RankBadgeProps {
  totalProfit: number;
  locale: string;
  size?: "sm" | "md";
}

export function RankBadge({ totalProfit, locale, size = "md" }: RankBadgeProps) {
  const t = useTranslations("rank");
  const rank = getRank(totalProfit);
  const nextRank = getNextRank(totalProfit);
  const progress = getRankProgress(totalProfit);
  const [showTooltip, setShowTooltip] = useState(false);

  const moneyLocale = locale === "es" ? "es-AR" : "en-US";
  const rankName = t(rank.id);
  const nextRankName = nextRank ? t(nextRank.id) : null;

  const remaining = nextRank
    ? nextRank.minProfit - Math.max(totalProfit, 0)
    : 0;

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${rank.bgColor} ${rank.borderColor} ${rank.color}`}
      >
        <span>{rank.icon}</span>
        <span>{rankName}</span>
      </span>
    );
  }

  return (
    <div className="relative w-full max-w-xs">
      <button
        type="button"
        onClick={() => setShowTooltip((v) => !v)}
        onBlur={() => setShowTooltip(false)}
        className={`focus-ring flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-colors ${rank.bgColor} ${rank.borderColor} hover:brightness-110`}
      >
        <span className="text-xl leading-none">{rank.icon}</span>
        <div className="flex flex-1 flex-col items-start gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold leading-none ${rank.color}`}>
              {rankName}
            </span>
            {nextRank && nextRankName && (
              <span className="text-[10px] text-velvet-500 leading-none">
                → {nextRank.icon} {nextRankName}
              </span>
            )}
            {!nextRank && (
              <span className="text-[10px] text-gold-500/70 leading-none font-semibold">
                MAX
              </span>
            )}
          </div>
          {nextRank && (
            <div className="w-full">
              <div className="h-1 w-full rounded-full bg-velvet-800/80 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${rank.color.replace("text-", "bg-")}`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </button>

      {showTooltip && nextRank && nextRankName && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg border border-velvet-700/60 bg-velvet-800 px-3 py-2 text-center shadow-xl shadow-black/40 animate-fade-in whitespace-nowrap">
          <p className="text-xs text-velvet-300">
            {t("needForNext", {
              amount: formatCurrency(Math.max(remaining, 0), moneyLocale, DEFAULT_CURRENCY),
              rank: nextRankName,
            })}
          </p>
          <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 border-b border-r border-velvet-700/60 bg-velvet-800" />
        </div>
      )}
    </div>
  );
}
