interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-velvet-800 ${className}`}
      aria-hidden="true"
    />
  );
}
