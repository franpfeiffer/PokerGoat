import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", className = "", ...props },
  ref
) {
  const base = "rounded-xl border border-velvet-700";
  const variants = {
    default: "bg-surface",
    elevated: "bg-surface-elevated",
  };

  return (
    <div
      ref={ref}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
});

export function CardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`border-b border-velvet-700 px-4 py-4 sm:px-5 ${className}`}
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
