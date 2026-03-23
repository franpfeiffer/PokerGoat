"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency, formatProfitLoss } from "@/lib/utils/currency";
import {
  calculateCashout,
  calculateProfitLoss,
  calculateTotalInvested,
} from "@/lib/utils/chips";
import { getProfitLossType } from "@/lib/types";

interface ChipCalculatorProps {
  chipValue: number;
  buyInAmount: number;
  buyInCount: number;
  locale?: string;
  currency?: string;
}

export function ChipCalculator({
  chipValue,
  buyInAmount,
  buyInCount,
  locale = "es-ES",
  currency = "ARS",
}: ChipCalculatorProps) {
  const t = useTranslations("nights");
  const [chips, setChips] = useState("");
  const chipsValue = Number(chips);
  const safeChips = Number.isFinite(chipsValue) ? chipsValue : 0;

  const totalInvested = calculateTotalInvested(buyInCount, buyInAmount);
  const cashout = calculateCashout(safeChips, chipValue);
  const profitLoss = calculateProfitLoss(cashout, totalInvested);
  const plType = getProfitLossType(profitLoss);

  const plColors = {
    profit: "text-profit",
    loss: "text-loss",
    even: "text-even",
  };

  return (
    <div className="rounded-lg border border-velvet-700 bg-velvet-800/50 p-4 space-y-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="chip-calc"
          className="text-xs font-medium text-velvet-400"
        >
          {t("scoring.chips")}
        </label>
        <input
          id="chip-calc"
          type="number"
          min="0"
          value={chips}
          onChange={(e) => setChips(e.target.value)}
          className="focus-ring rounded-md border border-velvet-700 bg-velvet-900 px-3 py-2 text-right text-lg tabular-nums text-velvet-50"
          placeholder="0"
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-velvet-400">{t("chipValue")}</span>
        <span className="tabular-nums text-velvet-200">
          {formatCurrency(chipValue, locale, currency)}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-velvet-400">{t("scoring.invested")}</span>
        <span className="tabular-nums text-velvet-200">
          {formatCurrency(totalInvested, locale, currency)}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-velvet-400">{t("scoring.cashout")}</span>
        <span className="tabular-nums text-velvet-200">
          {formatCurrency(cashout, locale, currency)}
        </span>
      </div>

      <div className="border-t border-velvet-700 pt-2 flex justify-between">
        <span className="text-sm font-medium text-velvet-300">
          {t("scoring.profit")}
        </span>
        <span
          className={`text-lg font-bold tabular-nums ${plColors[plType]}`}
        >
          {formatProfitLoss(profitLoss, locale, currency)}
        </span>
      </div>
    </div>
  );
}
