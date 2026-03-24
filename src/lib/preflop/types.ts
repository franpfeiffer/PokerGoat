export type PreflopScenarioAction = "rfi" | "limp" | "vs_open" | "vs_3bet" | "vs_4bet";

export type PreflopDecisionKey = "raise" | "call" | "fold" | "marginal";

export type HandFrequencies = Partial<Record<PreflopDecisionKey, number>>;

export interface PreflopRangeFile {
  meta: {
    players: number;
    position: string;
    action: PreflopScenarioAction;
    stackBB: number;
    source?: string;
    note?: string;
  };
  ranges: Record<string, HandFrequencies>;
}

export interface PreflopScenario {
  players: number;
  position: string;
  action: PreflopScenarioAction;
  stackBB: number;
}

export interface PreflopGridCell {
  hand: string;
  frequencies: HandFrequencies;
  dominantAction: PreflopDecisionKey;
}
