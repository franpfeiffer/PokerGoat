"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatProfitLoss } from "@/lib/utils/currency";
import { PaymentModal } from "./payment-modal";
import type { NightResult } from "@/lib/types";

interface NightLeaderboardProps {
  rows: NightResult[];
  moneyLocale: string;
}

export function NightLeaderboard({ rows, moneyLocale }: NightLeaderboardProps) {
  const t = useTranslations("leaderboard");
  const [selected, setSelected] = useState<NightResult | null>(null);

  return (
    <>
      <div className="space-y-2">
        {rows.map((row) => (
          <button
            key={row.userId}
            type="button"
            onClick={() => setSelected(row)}
            className="focus-ring group w-full flex items-center gap-3 rounded-lg border border-velvet-700/70 px-3 py-2 text-left transition-colors hover:border-velvet-600 hover:bg-velvet-800/40 active:scale-[0.99]"
          >
            <span className="w-7 shrink-0 text-sm tabular-nums text-velvet-400">
              #{row.rank}
            </span>
            <Avatar src={row.avatarUrl} name={row.displayName} size="sm" />
            <span className="flex-1 truncate text-sm text-velvet-100">
              {row.displayName}
            </span>
            {row.bankAlias && (
              <span className="shrink-0 hidden sm:inline-flex items-center gap-1 rounded-full border border-velvet-700/60 px-2 py-0.5 text-[10px] font-medium text-velvet-400 group-hover:border-gold-600/30 group-hover:text-gold-500/70 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                alias
              </span>
            )}
            <div className="shrink-0 text-right">
              <div className="text-xs text-velvet-400 tabular-nums">
                {formatCurrency(row.totalInvested, moneyLocale, "ARS")}
                {" → "}
                {formatCurrency(row.totalCashout, moneyLocale, "ARS")}
              </div>
              <div
                className={`text-sm font-semibold tabular-nums ${
                  row.profitLoss > 0
                    ? "text-profit"
                    : row.profitLoss < 0
                      ? "text-loss"
                      : "text-velvet-400"
                }`}
              >
                {formatProfitLoss(row.profitLoss, moneyLocale, "ARS")}
              </div>
            </div>
          </button>
        ))}
      </div>

      <PaymentModal
        open={selected !== null}
        onClose={() => setSelected(null)}
        player={
          selected
            ? {
                displayName: selected.displayName,
                avatarUrl: selected.avatarUrl,
                bankAlias: selected.bankAlias,
                totalCashout: selected.totalCashout,
              }
            : null
        }
      />
    </>
  );
}
