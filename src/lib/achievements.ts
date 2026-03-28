export type AchievementId =
  | "first_blood"
  | "veteran"
  | "centurion"
  | "shark"
  | "fish"
  | "consistent"
  | "high_roller"
  | "comeback_kid"
  | "hot_streak"
  | "ice_cold"
  | "mvp_star"
  | "mvp_legend"
  | "profit_club"
  | "goat";

export interface Achievement {
  id: AchievementId;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "legendary";
  unlocked: boolean;
}

export interface AchievementInput {
  nightsPlayed: number;
  totalProfit: number;
  winRate: number;
  streak: { type: "winning" | "losing" | "none"; count: number };
  biggestWin?: number;
  mvpCount?: number;
}

const DEFINITIONS: Array<{
  id: AchievementId;
  icon: string;
  tier: Achievement["tier"];
  check: (input: AchievementInput) => boolean;
}> = [
  {
    id: "first_blood",
    icon: "🃏",
    tier: "bronze",
    check: ({ nightsPlayed }) => nightsPlayed >= 1,
  },
  {
    id: "veteran",
    icon: "🎯",
    tier: "silver",
    check: ({ nightsPlayed }) => nightsPlayed >= 20,
  },
  {
    id: "centurion",
    icon: "💯",
    tier: "gold",
    check: ({ nightsPlayed }) => nightsPlayed >= 100,
  },
  {
    id: "shark",
    icon: "🦈",
    tier: "silver",
    check: ({ winRate, nightsPlayed }) => nightsPlayed >= 5 && winRate >= 0.6,
  },
  {
    id: "consistent",
    icon: "📈",
    tier: "bronze",
    check: ({ winRate, nightsPlayed }) => nightsPlayed >= 10 && winRate >= 0.5,
  },
  {
    id: "high_roller",
    icon: "💰",
    tier: "gold",
    check: ({ biggestWin = 0 }) => biggestWin >= 10000,
  },
  {
    id: "profit_club",
    icon: "🤑",
    tier: "silver",
    check: ({ totalProfit }) => totalProfit >= 5000,
  },
  {
    id: "goat",
    icon: "🐐",
    tier: "legendary",
    check: ({ totalProfit, winRate, nightsPlayed }) =>
      totalProfit >= 50000 && winRate >= 0.6 && nightsPlayed >= 50,
  },
  {
    id: "hot_streak",
    icon: "🔥",
    tier: "silver",
    check: ({ streak }) => streak.type === "winning" && streak.count >= 5,
  },
  {
    id: "ice_cold",
    icon: "❄️",
    tier: "bronze",
    check: ({ streak }) => streak.type === "losing" && streak.count >= 3,
  },
  {
    id: "mvp_star",
    icon: "⭐",
    tier: "bronze",
    check: ({ mvpCount = 0 }) => mvpCount >= 1,
  },
  {
    id: "mvp_legend",
    icon: "👑",
    tier: "gold",
    check: ({ mvpCount = 0 }) => mvpCount >= 10,
  },
  {
    id: "comeback_kid",
    icon: "⚡",
    tier: "silver",
    check: ({ streak, nightsPlayed }) =>
      streak.type === "winning" && streak.count >= 3 && nightsPlayed >= 5,
  },
  {
    id: "fish",
    icon: "🐟",
    tier: "bronze",
    check: ({ nightsPlayed, winRate }) => nightsPlayed >= 5 && winRate < 0.25,
  },
];

export function computeAchievements(input: AchievementInput): Achievement[] {
  return DEFINITIONS.map((def) => ({
    id: def.id,
    icon: def.icon,
    tier: def.tier,
    unlocked: def.check(input),
  }));
}

export function getUnlockedAchievements(input: AchievementInput): Achievement[] {
  return computeAchievements(input).filter((a) => a.unlocked);
}
