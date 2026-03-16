export type ProfitLoss = "profit" | "loss" | "even";

export function getProfitLossType(value: number): ProfitLoss {
  if (value > 0) return "profit";
  if (value < 0) return "loss";
  return "even";
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  nightsPlayed: number;
  totalProfitLoss: number;
  biggestWin: number;
  worstNight: number;
  avgProfitLoss: number;
  rank: number;
}

export interface NightResult {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalInvested: number;
  totalCashout: number;
  profitLoss: number;
  rank: number;
  buyInCount: number;
}
