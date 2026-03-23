import type {
  HandFrequencies,
  PreflopRangeFile,
  PreflopScenario,
  PreflopScenarioAction,
} from "@/lib/preflop/types";
import { getPositionsForPlayers } from "@/lib/preflop/positions";

const actionTemplates: Record<PreflopScenarioAction, string> = {
  rfi: "rfi_late_100bb.json",
  vs_open: "vs_open_100bb.json",
  vs_3bet: "vs_3bet_100bb.json",
  vs_4bet: "vs_4bet_100bb.json",
};

const templateCache = new Map<string, Promise<PreflopRangeFile>>();

export async function loadScenarioRange(scenario: PreflopScenario): Promise<PreflopRangeFile> {
  const templateName = resolveTemplateName(scenario);
  const template = await loadTemplate(templateName);

  return {
    meta: {
      players: scenario.players,
      position: scenario.position,
      action: scenario.action,
      stackBB: scenario.stackBB,
      source: template.meta.source,
      note: `Derived from ${template.meta.position} ${template.meta.action} template.`,
    },
    ranges: adaptRanges(template.ranges, scenario),
  };
}

export function getAvailableActions(position: string): PreflopScenarioAction[] {
  if (position === "BB") {
    return ["vs_open", "vs_3bet", "vs_4bet"];
  }

  if (position === "SB") {
    return ["rfi", "vs_open", "vs_3bet", "vs_4bet"];
  }

  return ["rfi", "vs_open", "vs_3bet", "vs_4bet"];
}

export function getDefaultPosition(players: number): string {
  const positions = getPositionsForPlayers(players);
  return positions[0] ?? "UTG";
}

async function loadTemplate(fileName: string): Promise<PreflopRangeFile> {
  const cacheKey = `/data/preflop/templates/${fileName}`;
  const cached = templateCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const request = fetch(cacheKey).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Unable to load preflop template: ${fileName}`);
    }
    return (await response.json()) as PreflopRangeFile;
  });

  templateCache.set(cacheKey, request);
  return request;
}

function resolveTemplateName(scenario: PreflopScenario): string {
  if (scenario.action !== "rfi") {
    return actionTemplates[scenario.action];
  }

  const positions = getPositionsForPlayers(scenario.players);
  const idx = positions.indexOf(scenario.position);
  const size = positions.length;
  const lateCutoff = Math.floor(size * 0.6);
  const midCutoff = Math.floor(size * 0.3);

  if (idx >= lateCutoff) {
    return "rfi_late_100bb.json";
  }

  if (idx >= midCutoff) {
    return "rfi_middle_100bb.json";
  }

  return "rfi_early_100bb.json";
}

function adaptRanges(
  baseRanges: Record<string, HandFrequencies>,
  scenario: PreflopScenario
): Record<string, HandFrequencies> {
  const stackDelta = getStackDelta(scenario.stackBB);
  const playerDelta = getPlayerDelta(scenario.players);

  return Object.fromEntries(
    Object.entries(baseRanges).map(([hand, frequencies]) => [
      hand,
      adjustFrequencies(frequencies, stackDelta + playerDelta),
    ])
  );
}

function adjustFrequencies(frequencies: HandFrequencies, delta: number): HandFrequencies {
  const raise = clamp01((frequencies.raise ?? 0) + delta);
  const call = clamp01((frequencies.call ?? 0) + delta * 0.4);
  const marginal = clamp01((frequencies.marginal ?? 0) - delta * 0.7);
  const fold = clamp01((frequencies.fold ?? 0) - delta);

  const total = raise + call + marginal + fold;
  if (total <= 0) {
    return { fold: 1 };
  }

  return {
    raise: raise / total,
    call: call / total,
    marginal: marginal / total,
    fold: fold / total,
  };
}

function getStackDelta(stackBB: number): number {
  if (stackBB <= 30) return -0.08;
  if (stackBB <= 40) return -0.04;
  if (stackBB >= 100) return 0;
  return -0.02;
}

function getPlayerDelta(players: number): number {
  if (players <= 3) return 0.08;
  if (players <= 5) return 0.03;
  if (players >= 9) return -0.06;
  if (players >= 7) return -0.03;
  return 0;
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
