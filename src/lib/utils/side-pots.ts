export interface PlayerBet {
  name: string;
  amount: number;
  isAllIn: boolean;
}

export interface Pot {
  name: string;
  amount: number;
  eligiblePlayers: string[];
}

export function calculateSidePots(players: PlayerBet[]): Pot[] {
  if (players.length === 0) return [];

  // Sort by bet amount ascending
  const sorted = [...players].sort((a, b) => a.amount - b.amount);
  const pots: Pot[] = [];
  let previousLevel = 0;

  for (let i = 0; i < sorted.length; i++) {
    const currentAmount = sorted[i].amount;
    if (currentAmount <= previousLevel) continue;

    const contribution = currentAmount - previousLevel;
    // All players who bet at least this level contribute
    const eligiblePlayers = players
      .filter((p) => p.amount >= currentAmount)
      .map((p) => p.name);
    // Everyone who bet above previousLevel contributes to this pot
    const contributors = players.filter((p) => p.amount > previousLevel);
    const potAmount = contribution * contributors.length;

    const potName =
      pots.length === 0
        ? "Main Pot"
        : `Side Pot ${pots.length}`;

    pots.push({
      name: potName,
      amount: potAmount,
      eligiblePlayers,
    });

    previousLevel = currentAmount;
  }

  return pots;
}
