import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gold-500 text-velvet-950 hover:bg-gold-400 active:bg-gold-600 shadow-sm shadow-gold-500/10",
  secondary:
    "border border-velvet-600/80 bg-velvet-800/80 text-velvet-200 hover:border-velvet-500 hover:bg-velvet-700/80 hover:text-velvet-100",
  ghost:
    "text-velvet-300 hover:bg-velvet-800/60 hover:text-velvet-100",
  danger:
    "bg-loss/10 text-loss border border-loss/20 hover:bg-loss/15 hover:border-loss/30",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
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
        className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);
