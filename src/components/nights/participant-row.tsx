"use client";

import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatProfitLoss } from "@/lib/utils/currency";
import {
  calculateTotalInvested,
  calculateCashout,
  calculateProfitLoss,
} from "@/lib/utils/chips";
import { getProfitLossType } from "@/lib/types";

interface ParticipantRowProps {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  buyInCount: number;
  totalChipsEnd: number | null;
  buyInAmount: number;
  chipValue: number;
  nightStatus: string;
  locale?: string;
  currency?: string;
  onUpdateBuyIn?: (participantId: string, count: number) => void;
  onUpdateChips?: (participantId: string, chips: number) => void;
}

export function ParticipantRow({
  id,
  displayName,
  avatarUrl,
  buyInCount,
  totalChipsEnd,
  buyInAmount,
  chipValue,
  nightStatus,
  locale = "es-ES",
  currency = "USD",
  onUpdateBuyIn,
  onUpdateChips,
}: ParticipantRowProps) {
  const totalInvested = calculateTotalInvested(buyInCount, buyInAmount);
  const isActive = nightStatus === "in_progress" || nightStatus === "scheduled";

  let profitLoss: number | null = null;
  let plType: "profit" | "loss" | "even" = "even";

  if (totalChipsEnd !== null) {
    const cashout = calculateCashout(totalChipsEnd, chipValue);
    profitLoss = calculateProfitLoss(cashout, totalInvested);
    plType = getProfitLossType(profitLoss);
  }

  const plColors = {
    profit: "text-profit",
    loss: "text-loss",
    even: "text-even",
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-velvet-700/50 last:border-0">
      <Avatar src={avatarUrl} name={displayName} size="sm" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-velvet-100 truncate">
          {displayName}
        </p>
        <p className="text-xs text-velvet-400 tabular-nums">
          {buyInCount}x buy-in = {formatCurrency(totalInvested, locale, currency)}
        </p>
      </div>

      {isActive && onUpdateBuyIn && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdateBuyIn(id, Math.max(1, buyInCount - 1))}
            disabled={buyInCount <= 1}
            aria-label="Reducir buy-in"
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-velvet-700 bg-velvet-800 text-sm text-velvet-300 hover:bg-velvet-700 disabled:opacity-30 transition-colors"
          >
            &minus;
          </button>
          <span className="w-8 text-center text-sm tabular-nums text-velvet-200">
            {buyInCount}
          </span>
          <button
            type="button"
            onClick={() => onUpdateBuyIn(id, buyInCount + 1)}
            aria-label="A\u00f1adir re-buy"
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-velvet-700 bg-velvet-800 text-sm text-velvet-300 hover:bg-velvet-700 transition-colors"
          >
            +
          </button>
        </div>
      )}

      {isActive && onUpdateChips && (
        <div className="w-20">
          <input
            type="number"
            min="0"
            defaultValue={totalChipsEnd ?? ""}
            placeholder="Fichas"
            aria-label={`Fichas finales de ${displayName}`}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) onUpdateChips(id, val);
            }}
            className="focus-ring w-full rounded-md border border-velvet-700 bg-velvet-800 px-2 py-1 text-right text-sm tabular-nums text-velvet-50"
          />
        </div>
      )}

      {profitLoss !== null && (
        <span
          className={`text-sm font-semibold tabular-nums ${plColors[plType]} animate-count-up`}
        >
          {formatProfitLoss(profitLoss, locale, currency)}
        </span>
      )}
    </div>
  );
}
