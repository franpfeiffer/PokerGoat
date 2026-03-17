interface RankIndicatorProps {
  rank: number;
}

export function RankIndicator({ rank }: RankIndicatorProps) {
  if (rank === 1) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400">
        <span className="text-xs font-bold" aria-label="Primer puesto">
          1
        </span>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-velvet-400/20 bg-velvet-400/8 text-velvet-300">
        <span className="text-xs font-bold" aria-label="Segundo puesto">
          2
        </span>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-600/20 bg-amber-700/10 text-amber-500">
        <span className="text-xs font-bold" aria-label="Tercer puesto">
          3
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center text-velvet-500">
      <span className="text-xs tabular-nums">{rank}</span>
    </div>
  );
}
