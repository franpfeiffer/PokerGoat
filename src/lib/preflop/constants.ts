import type {
  HandFrequencies,
  PreflopDecisionKey,
  PreflopGridCell,
} from "@/lib/preflop/types";

export const HAND_RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;

export const EFFECTIVE_STACKS_BB = [20, 30, 40, 60, 100] as const;

export const DECISION_PRIORITY: PreflopDecisionKey[] = [
  "raise",
  "call",
  "marginal",
  "fold",
];

export function getHandLabel(rowIdx: number, colIdx: number): string {
  const rowRank = HAND_RANKS[rowIdx];
  const colRank = HAND_RANKS[colIdx];

  if (rowIdx === colIdx) {
    return `${rowRank}${colRank}`;
  }

  if (rowIdx < colIdx) {
    return `${rowRank}${colRank}s`;
  }

  return `${colRank}${rowRank}o`;
}

export function buildHandMatrix(): string[][] {
  return HAND_RANKS.map((_, rowIdx) =>
    HAND_RANKS.map((__, colIdx) => getHandLabel(rowIdx, colIdx))
  );
}

export function normalizeFrequencies(
  frequencies: HandFrequencies | undefined
): HandFrequencies {
  if (!frequencies) {
    return { fold: 1 };
  }

  const normalized = Object.fromEntries(
    Object.entries(frequencies).map(([key, value]) => [key, clamp01(value)])
  ) as HandFrequencies;

  const total = Object.values(normalized).reduce((sum, value) => sum + (value ?? 0), 0);
  if (total <= 0) {
    return { fold: 1 };
  }

  const divided = Object.fromEntries(
    Object.entries(normalized).map(([key, value]) => [key, (value ?? 0) / total])
  ) as HandFrequencies;

  return divided;
}

export function getDominantDecision(frequencies: HandFrequencies): PreflopDecisionKey {
  const normalized = normalizeFrequencies(frequencies);
  let dominant: PreflopDecisionKey = "fold";
  let best = -1;

  for (const decision of DECISION_PRIORITY) {
    const value = normalized[decision] ?? 0;
    if (value > best) {
      best = value;
      dominant = decision;
    }
  }

  return dominant;
}

export function toGridCell(hand: string, frequencies: HandFrequencies | undefined): PreflopGridCell {
  const normalized = normalizeFrequencies(frequencies);
  return {
    hand,
    frequencies: normalized,
    dominantAction: getDominantDecision(normalized),
  };
}

function clamp01(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
