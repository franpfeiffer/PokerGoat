import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", className = "", ...props },
  ref
) {
  const base = "relative overflow-hidden rounded-xl border border-velvet-700/50";
  const variants = {
    default: "bg-velvet-900",
    elevated: "bg-velvet-800",
  };

  return (
    <div ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {/* Subtle top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-velvet-700/80 to-transparent pointer-events-none" />
      {props.children}
    </div>
  );
});

export function CardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-b border-velvet-700/40 px-4 py-3.5 sm:px-5 ${className}`}
      {...props}
    />
  );
}

export function CardContent({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-4 py-4 sm:px-5 ${className}`} {...props} />;
}
