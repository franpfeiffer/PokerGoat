export const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7, 8, 9] as const;

const POSITION_BY_PLAYERS: Record<number, string[]> = {
  2: ["SB", "BB"],
  3: ["BTN", "SB", "BB"],
  4: ["CO", "BTN", "SB", "BB"],
  5: ["HJ", "CO", "BTN", "SB", "BB"],
  6: ["UTG", "HJ", "CO", "BTN", "SB", "BB"],
  7: ["UTG", "MP", "HJ", "CO", "BTN", "SB", "BB"],
  8: ["UTG", "UTG+1", "MP", "HJ", "CO", "BTN", "SB", "BB"],
  9: ["UTG", "UTG+1", "MP", "MP+1", "HJ", "CO", "BTN", "SB", "BB"],
};

export function getPositionsForPlayers(players: number): string[] {
  return POSITION_BY_PLAYERS[players] ?? POSITION_BY_PLAYERS[6];
}

export function normalizePlayers(players: number): number {
  const rounded = Math.round(players);
  if (rounded < PLAYER_COUNTS[0]) return PLAYER_COUNTS[0];
  if (rounded > PLAYER_COUNTS[PLAYER_COUNTS.length - 1]) {
    return PLAYER_COUNTS[PLAYER_COUNTS.length - 1];
  }
  return rounded;
}

export function isPositionValidForPlayers(players: number, position: string): boolean {
  return getPositionsForPlayers(players).includes(position);
}
