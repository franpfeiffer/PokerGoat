import { type HTMLAttributes } from "react";

type BadgeVariant = "default" | "profit" | "loss" | "gold" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-velvet-800/70 text-velvet-200 border-velvet-700/50",
  profit: "bg-profit/[0.08] text-profit border-profit/20",
  loss: "bg-loss/[0.08] text-loss border-loss/20",
  gold: "bg-gold-500/[0.08] text-gold-400 border-gold-500/20",
  muted: "bg-velvet-800/30 text-velvet-500 border-velvet-700/30",
};

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
