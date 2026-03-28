import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gold-500 text-velvet-950 hover:bg-gold-400 active:bg-gold-600 active:scale-[0.98] shadow-sm shadow-gold-500/15 hover:shadow-gold-500/20",
  secondary:
    "border border-velvet-600/70 bg-velvet-800/70 text-velvet-200 hover:border-velvet-500/80 hover:bg-velvet-700/70 hover:text-velvet-100 active:scale-[0.98]",
  ghost:
    "text-velvet-400 hover:bg-velvet-800/50 hover:text-velvet-100 active:scale-[0.98]",
  danger:
    "bg-loss/8 text-loss border border-loss/20 hover:bg-loss/14 hover:border-loss/35 active:scale-[0.98]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-2.5 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className = "", disabled, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`focus-ring inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);
