export type RankId = "plankton" | "fish" | "shark" | "megalodon";

export interface Rank {
  id: RankId;
  icon: string;
  minProfit: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const RANKS: Rank[] = [
  {
    id: "plankton",
    icon: "🌿",
    minProfit: -Infinity,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "fish",
    icon: "🐟",
    minProfit: 0,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "shark",
    icon: "🦈",
    minProfit: 5000,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  {
    id: "megalodon",
    icon: "🦷",
    minProfit: 15000,
    color: "text-gold-400",
    bgColor: "bg-gold-500/10",
    borderColor: "border-gold-500/30",
  },
];

export function getRank(totalProfit: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (totalProfit >= rank.minProfit) {
      current = rank;
    }
  }
  return current;
}

export function getNextRank(totalProfit: number): Rank | null {
  const currentRank = getRank(totalProfit);
  const currentIndex = RANKS.findIndex((r) => r.id === currentRank.id);
  return RANKS[currentIndex + 1] ?? null;
}

export function getRankProgress(totalProfit: number): number {
  const current = getRank(totalProfit);
  const next = getNextRank(totalProfit);
  if (!next) return 1;
  const start = current.minProfit === -Infinity ? Math.min(totalProfit, 0) : current.minProfit;
  const range = next.minProfit - start;
  const progress = totalProfit - start;
  return Math.min(Math.max(progress / range, 0), 1);
}

export { RANKS };
