"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ScenarioSelector } from "@/components/preflop/scenario-selector";
import { RangeGrid } from "@/components/preflop/range-grid";
import { LegendPanel } from "@/components/preflop/legend-panel";
import { getAvailableActions, getDefaultPosition, loadScenarioRange } from "@/lib/preflop/data";
import { getPositionsForPlayers, isPositionValidForPlayers } from "@/lib/preflop/positions";
import type { PreflopRangeFile, PreflopScenarioAction } from "@/lib/preflop/types";

export function PreflopView() {
  const t = useTranslations("goatEye");
  const [players, setPlayers] = useState(6);
  const [position, setPosition] = useState("UTG");
  const [action, setAction] = useState<PreflopScenarioAction>("rfi");
  const [bigBlind, setBigBlind] = useState("");
  const [stack, setStack] = useState("");
  const [rangeData, setRangeData] = useState<PreflopRangeFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const positions = useMemo(() => getPositionsForPlayers(players), [players]);
  const actions = useMemo(() => getAvailableActions(position), [position]);
  const stackBB = useMemo(() => {
    const bbValue = Number(bigBlind);
    const stackValue = Number(stack);
    if (!Number.isFinite(bbValue) || !Number.isFinite(stackValue)) return 0;
    if (bbValue <= 0 || stackValue <= 0) return 0;
    return Number((stackValue / bbValue).toFixed(1));
  }, [bigBlind, stack]);

  useEffect(() => {
    if (stackBB <= 0) {
      setRangeData(null);
      setError(null);
      return;
    }

    if (!isPositionValidForPlayers(players, position)) {
      setPosition(getDefaultPosition(players));
      return;
    }

    if (!actions.includes(action)) {
      setAction(actions[0] ?? "rfi");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    loadScenarioRange({ players, position, action, stackBB })
      .then((data) => {
        if (!cancelled) {
          setRangeData(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("loadError"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [players, position, action, stackBB, actions, t]);

  const labels = {
    players: t("labels.players"),
    position: t("labels.position"),
    sequence: t("labels.sequence"),
    stack: t("labels.stack"),
    bbInput: t("labels.bbInput"),
    stackInput: t("labels.stackInput"),
    calculated: t("labels.calculated"),
    actionLabels: {
      rfi: t("actions.rfi"),
      vs_open: t("actions.vs_open"),
      vs_3bet: t("actions.vs_3bet"),
      vs_4bet: t("actions.vs_4bet"),
    } as const,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 py-2">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-velvet-50 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm text-velvet-300">{t("subtitle")}</p>
      </div>

      <ScenarioSelector
        players={players}
        position={position}
        action={action}
        bigBlind={bigBlind}
        stack={stack}
        stackBB={stackBB}
        positions={positions}
        actions={actions}
        labels={labels}
        onPlayersChange={setPlayers}
        onPositionChange={setPosition}
        onActionChange={setAction}
        onBigBlindChange={setBigBlind}
        onStackInputChange={setStack}
      />

      <LegendPanel
        labels={{
          title: t("legend.title"),
          raise: t("legend.raise"),
          call: t("legend.call"),
          marginal: t("legend.marginal"),
          fold: t("legend.fold"),
        }}
      />

      {error ? (
        <div className="rounded-xl border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-loss">
          {error}
        </div>
      ) : (
        <RangeGrid ranges={rangeData?.ranges ?? {}} isLoading={isLoading} />
      )}

      {rangeData?.meta.source && (
        <p className="text-xs text-velvet-400">
          {t("sourcePrefix")} {rangeData.meta.source}
        </p>
      )}
    </div>
  );
}
