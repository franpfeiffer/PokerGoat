interface RankIndicatorProps {
  rank: number;
}

export function RankIndicator({ rank }: RankIndicatorProps) {
  if (rank === 1) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/20 text-gold-400">
        <span className="text-sm font-bold" aria-label="Primer puesto">
          1
        </span>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-velvet-300/10 text-velvet-300">
        <span className="text-sm font-bold" aria-label="Segundo puesto">
          2
        </span>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700/20 text-amber-600">
        <span className="text-sm font-bold" aria-label="Tercer puesto">
          3
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center text-velvet-400">
      <span className="text-sm tabular-nums">{rank}</span>
    </div>
  );
}
