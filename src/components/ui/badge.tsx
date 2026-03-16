import { type HTMLAttributes } from "react";

type BadgeVariant = "default" | "profit" | "loss" | "gold" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-velvet-800 text-velvet-200 border-velvet-700",
  profit: "bg-profit/10 text-profit border-profit/30",
  loss: "bg-loss/10 text-loss border-loss/30",
  gold: "bg-gold-500/10 text-gold-400 border-gold-500/30",
  muted: "bg-velvet-800/50 text-velvet-400 border-velvet-700/50",
};

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
