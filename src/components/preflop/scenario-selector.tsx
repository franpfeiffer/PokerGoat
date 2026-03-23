"use client";

import type { PreflopScenarioAction } from "@/lib/preflop/types";
import { PLAYER_COUNTS } from "@/lib/preflop/positions";
import type { ReactNode } from "react";

interface ScenarioSelectorProps {
  players: number;
  position: string;
  action: PreflopScenarioAction;
  bigBlind: string;
  stack: string;
  stackBB: number;
  positions: string[];
  actions: PreflopScenarioAction[];
  labels: {
    players: string;
    position: string;
    sequence: string;
    stack: string;
    bbInput: string;
    stackInput: string;
    calculated: string;
    actionLabels: Record<PreflopScenarioAction, string>;
  };
  onPlayersChange: (players: number) => void;
  onPositionChange: (position: string) => void;
  onActionChange: (action: PreflopScenarioAction) => void;
  onBigBlindChange: (bigBlind: string) => void;
  onStackInputChange: (stack: string) => void;
}

export function ScenarioSelector({
  players,
  position,
  action,
  bigBlind,
  stack,
  stackBB,
  positions,
  actions,
  labels,
  onPlayersChange,
  onPositionChange,
  onActionChange,
  onBigBlindChange,
  onStackInputChange,
}: ScenarioSelectorProps) {
  return (
    <section className="space-y-5 rounded-xl border border-velvet-700/60 bg-velvet-900 p-4 sm:p-5">
      <SelectorGroup title={labels.players}>
        {PLAYER_COUNTS.map((value) => (
          <PillButton
            key={value}
            active={players === value}
            onClick={() => onPlayersChange(value)}
            label={String(value)}
          />
        ))}
      </SelectorGroup>

      <SelectorGroup title={labels.position}>
        {positions.map((value) => (
          <PillButton
            key={value}
            active={position === value}
            onClick={() => onPositionChange(value)}
            label={value}
          />
        ))}
      </SelectorGroup>

      <SelectorGroup title={labels.sequence}>
        {actions.map((value) => (
          <PillButton
            key={value}
            active={action === value}
            onClick={() => onActionChange(value)}
            label={labels.actionLabels[value]}
          />
        ))}
      </SelectorGroup>

      <SelectorGroup title={labels.stack}>
        <div className="grid w-full gap-2 sm:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs text-velvet-300">{labels.bbInput}</span>
            <NumberInput value={bigBlind} onChange={onBigBlindChange} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-velvet-300">{labels.stackInput}</span>
            <NumberInput value={stack} onChange={onStackInputChange} />
          </label>
          <div className="rounded-md border border-velvet-700/70 bg-velvet-800 px-3 py-2">
            <p className="text-xs text-velvet-300">{labels.calculated}</p>
            <p className="tabular-nums text-sm font-semibold text-gold-400">
              {stackBB > 0 ? `${stackBB.toFixed(1)} BB` : "--"}
            </p>
          </div>
        </div>
      </SelectorGroup>
    </section>
  );
}

function SelectorGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-velvet-200">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PillButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring min-h-9 rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors sm:text-sm ${
        active
          ? "bg-gold-500 text-velvet-950"
          : "border border-velvet-700/70 bg-velvet-800 text-velvet-300 hover:bg-velvet-700 hover:text-velvet-50"
      }`}
    >
      {label}
    </button>
  );
}

function NumberInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="focus-ring w-full rounded-md border border-velvet-700/70 bg-velvet-800 px-3 py-2 text-sm text-velvet-100"
    />
  );
}
