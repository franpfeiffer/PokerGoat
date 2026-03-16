"use client";

import { formatCurrency } from "@/lib/utils/currency";
import { calculateTotalInvested } from "@/lib/utils/chips";

interface BuyInTrackerProps {
  buyInCount: number;
  buyInAmount: number;
  locale?: string;
  currency?: string;
}

export function BuyInTracker({
  buyInCount,
  buyInAmount,
  locale = "es-ES",
  currency = "ARS",
}: BuyInTrackerProps) {
  const total = calculateTotalInvested(buyInCount, buyInAmount);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-velvet-400">
        {buyInCount} &times; {formatCurrency(buyInAmount, locale, currency)}
      </span>
      <span className="text-sm font-semibold text-velvet-200 tabular-nums">
        = {formatCurrency(total, locale, currency)}
      </span>
    </div>
  );
}
