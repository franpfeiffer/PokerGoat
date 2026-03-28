export type RankId = "fish" | "crab" | "octopus" | "shark";

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
    id: "fish",
    icon: "🐟",
    minProfit: -Infinity,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "crab",
    icon: "🦀",
    minProfit: 1000,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  {
    id: "octopus",
    icon: "🐙",
    minProfit: 5000,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    id: "shark",
    icon: "🦈",
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
  const start = current.minProfit === -Infinity ? 0 : current.minProfit;
  const range = next.minProfit - start;
  const progress = totalProfit - start;
  return Math.min(Math.max(progress / range, 0), 1);
}

export { RANKS };
