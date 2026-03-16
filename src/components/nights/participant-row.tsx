"use client";

import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatProfitLoss } from "@/lib/utils/currency";
import {
  calculateTotalInvested,
  calculateCashout,
  calculateCashoutFromChipBreakdown,
  calculateProfitLoss,
  type NightChipValues,
} from "@/lib/utils/chips";
import { getProfitLossType } from "@/lib/types";

interface ParticipantRowProps {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  buyInCount: number;
  totalChipsEnd: number | null;
  chipsBlackEnd: number | null;
  chipsWhiteEnd: number | null;
  chipsRedEnd: number | null;
  chipsGreenEnd: number | null;
  chipsBlueEnd: number | null;
  buyInAmount: number;
  chipValue: number;
  chipValues: NightChipValues;
  nightStatus: string;
  locale?: string;
  currency?: string;
  onUpdateBuyIn?: (participantId: string, count: number) => void;
  onUpdateChips?: (
    participantId: string,
    chipBreakdown: {
      black?: number;
      white?: number;
      red?: number;
      green?: number;
      blue?: number;
    }
  ) => void;
}

export function ParticipantRow({
  id,
  displayName,
  avatarUrl,
  buyInCount,
  totalChipsEnd,
  chipsBlackEnd,
  chipsWhiteEnd,
  chipsRedEnd,
  chipsGreenEnd,
  chipsBlueEnd,
  buyInAmount,
  chipValue,
  chipValues,
  nightStatus,
  locale = "es-ES",
  currency = "ARS",
  onUpdateBuyIn,
  onUpdateChips,
}: ParticipantRowProps) {
  const t = useTranslations("nights");
  const totalInvested = calculateTotalInvested(buyInCount, buyInAmount);
  const isActive = nightStatus === "in_progress" || nightStatus === "scheduled";

  let profitLoss: number | null = null;
  let plType: "profit" | "loss" | "even" = "even";
  const hasChipBreakdown =
    chipsBlackEnd !== null ||
    chipsWhiteEnd !== null ||
    chipsRedEnd !== null ||
    chipsGreenEnd !== null ||
    chipsBlueEnd !== null;

  if (hasChipBreakdown || totalChipsEnd !== null) {
    const cashout = hasChipBreakdown
      ? calculateCashoutFromChipBreakdown(
          {
            black: chipsBlackEnd ?? 0,
            white: chipsWhiteEnd ?? 0,
            red: chipsRedEnd ?? 0,
            green: chipsGreenEnd ?? 0,
            blue: chipsBlueEnd ?? 0,
          },
          chipValues
        )
      : calculateCashout(totalChipsEnd!, chipValue);
    profitLoss = calculateProfitLoss(cashout, totalInvested);
    plType = getProfitLossType(profitLoss);
  }

  const plColors = {
    profit: "text-profit",
    loss: "text-loss",
    even: "text-even",
  };

  return (
    <div className="space-y-3 border-b border-velvet-700/50 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar src={avatarUrl} name={displayName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-velvet-100">{displayName}</p>
          <p className="text-xs text-velvet-400 tabular-nums">
            {buyInCount}x {t("buyIn")} = {formatCurrency(totalInvested, locale, currency)}
          </p>
        </div>
        {profitLoss !== null && (
          <span
            className={`text-sm font-semibold tabular-nums ${plColors[plType]} animate-count-up`}
          >
            {formatProfitLoss(profitLoss, locale, currency)}
          </span>
        )}
      </div>

      {(isActive && onUpdateBuyIn) || (isActive && onUpdateChips) ? (
        <div className="space-y-2">
          {isActive && onUpdateBuyIn && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateBuyIn(id, Math.max(1, buyInCount - 1))}
                disabled={buyInCount <= 1}
                aria-label={t("decreaseBuyIn")}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-md border border-velvet-700 bg-velvet-800 text-base text-velvet-300 hover:bg-velvet-700 disabled:opacity-30 transition-colors sm:h-8 sm:w-8"
              >
                &minus;
              </button>
              <span className="min-w-8 text-center text-sm tabular-nums text-velvet-200">
                {buyInCount}
              </span>
              <button
                type="button"
                onClick={() => onUpdateBuyIn(id, buyInCount + 1)}
                aria-label={t("addRebuy")}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-md border border-velvet-700 bg-velvet-800 text-base text-velvet-300 hover:bg-velvet-700 transition-colors sm:h-8 sm:w-8"
              >
                +
              </button>
            </div>
          )}

          {isActive && onUpdateChips && (
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2">
                {(
                  [
                    ["black", chipsBlackEnd, t("chipBlack")],
                    ["white", chipsWhiteEnd, t("chipWhite")],
                    ["red", chipsRedEnd, t("chipRed")],
                    ["green", chipsGreenEnd, t("chipGreen")],
                    ["blue", chipsBlueEnd, t("chipBlue")],
                  ] as const
                ).map(([color, value, label]) => (
                  <div key={color} className="w-16">
                    <p className="mb-1 text-[10px] text-velvet-400">{label}</p>
                    <input
                      type="number"
                      min="0"
                      defaultValue={value ?? ""}
                      placeholder="0"
                      aria-label={`${label} ${t("finalChipsFor", { name: displayName })}`}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) onUpdateChips(id, { [color]: val });
                      }}
                      className="focus-ring h-10 w-full rounded-md border border-velvet-700 bg-velvet-800 px-2 py-2 text-right text-xs tabular-nums text-velvet-50 sm:h-8"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
