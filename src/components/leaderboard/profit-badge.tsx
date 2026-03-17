import { formatProfitLoss } from "@/lib/utils/currency";
import { getProfitLossType } from "@/lib/types";

interface ProfitBadgeProps {
  amount: number;
  locale?: string;
  currency?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-0.5",
  lg: "text-base px-3 py-1",
};

export function ProfitBadge({
  amount,
  locale = "es-ES",
  currency = "ARS",
  size = "md",
}: ProfitBadgeProps) {
  const type = getProfitLossType(amount);

  const styles = {
    profit: "bg-profit/8 text-profit border-profit/20",
    loss: "bg-loss/8 text-loss border-loss/20",
    even: "bg-velvet-800/40 text-even border-velvet-700/40",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold tabular-nums ${styles[type]} ${sizeStyles[size]}`}
    >
      {formatProfitLoss(amount, locale, currency)}
    </span>
  );
}
