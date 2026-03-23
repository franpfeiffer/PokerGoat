"use client";

import { useMemo, useState } from "react";
import { buildHandMatrix, toGridCell } from "@/lib/preflop/constants";
import type { HandFrequencies } from "@/lib/preflop/types";
import { FrequencyTooltip } from "@/components/preflop/frequency-tooltip";

interface RangeGridProps {
  ranges: Record<string, HandFrequencies>;
  isLoading?: boolean;
}

const COLOR_BY_ACTION = {
  raise: "bg-gold-500 text-velvet-950",
  call: "bg-profit text-velvet-950",
  marginal: "bg-gold-300 text-velvet-950",
  fold: "bg-velvet-800 text-velvet-400",
} as const;

export function RangeGrid({ ranges, isLoading = false }: RangeGridProps) {
  const matrix = useMemo(() => buildHandMatrix(), []);
  const [activeHand, setActiveHand] = useState<string | null>(null);

  const selectedHand = activeHand ?? matrix[0]?.[0] ?? "AA";
  const selectedCell = toGridCell(selectedHand, ranges[selectedHand]);

  return (
    <section className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-velvet-700/60 bg-velvet-900 p-2 sm:p-3">
        <div
          className="grid min-w-[640px] gap-1"
          style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
        >
          {matrix.flat().map((hand) => {
            const cell = toGridCell(hand, ranges[hand]);
            const hasMix = Object.values(cell.frequencies).filter((value) => (value ?? 0) > 0).length > 1;
            return (
              <button
                key={hand}
                type="button"
                onMouseEnter={() => setActiveHand(hand)}
                onFocus={() => setActiveHand(hand)}
                onClick={() => setActiveHand(hand)}
                className={`focus-ring relative aspect-square min-w-0 rounded-[6px] border border-velvet-700/60 px-1 text-[11px] font-semibold transition-transform hover:scale-[1.02] ${
                  COLOR_BY_ACTION[cell.dominantAction]
                } ${activeHand === hand ? "ring-2 ring-gold-400/70 ring-offset-1 ring-offset-velvet-950" : ""}`}
                aria-label={`Hand ${hand}`}
              >
                <span className="relative z-10">{hand}</span>
                {hasMix && <ActionMixBar frequencies={cell.frequencies} />}
              </button>
            );
          })}
        </div>
        {isLoading && (
          <div className="mt-3 text-xs uppercase tracking-[0.2em] text-velvet-400">
            Loading scenario...
          </div>
        )}
      </div>
      <FrequencyTooltip hand={selectedCell.hand} frequencies={selectedCell.frequencies} />
    </section>
  );
}

function ActionMixBar({ frequencies }: { frequencies: HandFrequencies }) {
  const segments = [
    { key: "raise", className: "bg-gold-500", value: frequencies.raise ?? 0 },
    { key: "call", className: "bg-profit", value: frequencies.call ?? 0 },
    { key: "marginal", className: "bg-gold-300", value: frequencies.marginal ?? 0 },
    { key: "fold", className: "bg-velvet-700", value: frequencies.fold ?? 0 },
  ].filter((segment) => segment.value > 0);

  if (segments.length <= 1) {
    return null;
  }

  return (
    <span aria-hidden className="absolute inset-x-0 bottom-0 z-0 flex h-1 overflow-hidden rounded-b-[5px]">
      {segments.map((segment) => (
        <span
          key={segment.key}
          className={segment.className}
          style={{ width: `${Math.max(5, segment.value * 100)}%` }}
        />
      ))}
    </span>
  );
}
