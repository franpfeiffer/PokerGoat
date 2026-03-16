interface StreakIndicatorProps {
  type: "winning" | "losing" | "none";
  count: number;
}

export function StreakIndicator({ type, count }: StreakIndicatorProps) {
  if (type === "none" || count === 0) return null;

  const styles = {
    winning: "bg-profit/10 text-profit border-profit/30",
    losing: "bg-loss/10 text-loss border-loss/30",
  };

  const labels = {
    winning: "racha ganadora",
    losing: "racha perdedora",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[type]}`}
    >
      <span aria-hidden="true">
        {type === "winning" ? "\u2191" : "\u2193"}
      </span>
      {count} {labels[type]}
    </span>
  );
}
