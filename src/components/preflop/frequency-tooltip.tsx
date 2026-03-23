"use client";

import type { HandFrequencies } from "@/lib/preflop/types";

interface FrequencyTooltipProps {
  hand: string;
  frequencies: HandFrequencies;
}

const labels = {
  raise: "Raise",
  call: "Call",
  marginal: "Marginal",
  fold: "Fold",
} as const;

export function FrequencyTooltip({ hand, frequencies }: FrequencyTooltipProps) {
  const entries = Object.entries(labels)
    .map(([key, label]) => ({
      key,
      label,
      value: Math.round((frequencies[key as keyof HandFrequencies] ?? 0) * 100),
    }))
    .filter((entry) => entry.value > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-velvet-700/60 bg-velvet-900 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-velvet-400">Hand</span>
        <span className="font-semibold text-velvet-50">{hand}</span>
      </div>
      <div className="space-y-1.5">
        {entries.map((entry) => (
          <div key={entry.key} className="flex items-center justify-between text-sm">
            <span className="text-velvet-300">{entry.label}</span>
            <span className="tabular-nums font-medium text-velvet-100">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
