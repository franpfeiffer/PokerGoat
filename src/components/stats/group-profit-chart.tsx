"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

const COLORS = [
  "#d4a847",
  "#34d375",
  "#f04848",
  "#6e8efb",
  "#e87cda",
  "#4dd4c0",
  "#f5a623",
  "#b07df0",
];

const Chart = dynamic(() => import("./group-profit-chart-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
});

interface ProfitPoint {
  date: string;
  profitLoss: number;
  cumulative: number;
  userId: string;
  displayName: string;
}

interface GroupProfitChartProps {
  data: ProfitPoint[];
  locale?: string;
  currency?: string;
}

export function GroupProfitChart({
  data,
  locale = "es-ES",
  currency = "ARS",
}: GroupProfitChartProps) {
  const t = useTranslations("leaderboard");

  const players = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of data) {
      map.set(p.userId, p.displayName);
    }
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [data]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set(players.slice(0, 3).map((p) => p.id));
  });

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const chartData = useMemo(() => {
    const dates = [...new Set(data.map((d) => d.date))].sort();
    return dates.map((date) => {
      const point: Record<string, string | number> = { date };
      for (const id of selectedIds) {
        const entry = data.find((d) => d.date === date && d.userId === id);
        if (entry) {
          point[id] = entry.cumulative;
        }
      }
      return point;
    });
  }, [data, selectedIds]);

  const selectedPlayers = players.filter((p) => selectedIds.has(p.id));

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-velvet-500">
        {t("historicalNoData")}
      </div>
    );
  }

  const allSelected = selectedIds.size === players.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(players.map((p) => p.id)));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {players.map((p, i) => {
          const active = selectedIds.has(p.id);
          const color = COLORS[i % COLORS.length];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                active
                  ? "border-transparent bg-velvet-800 text-velvet-100"
                  : "border-velvet-700/40 bg-velvet-900 text-velvet-600 hover:text-velvet-400"
              }`}
              style={active ? { borderColor: `${color}40`, backgroundColor: `${color}18` } : {}}
            >
              <span
                className="h-2 w-2 rounded-full transition-opacity"
                style={{ backgroundColor: color, opacity: active ? 1 : 0.3 }}
              />
              <span style={active ? { color } : {}}>{p.name}</span>
            </button>
          );
        })}
        {players.length > 2 && (
          <button
            type="button"
            onClick={toggleAll}
            className="rounded-full border border-velvet-700/40 bg-velvet-900 px-2.5 py-1 text-xs text-velvet-500 transition-colors hover:text-velvet-300"
          >
            {allSelected ? t("hideAll") : t("showAll")}
          </button>
        )}
      </div>
      <Chart
        data={chartData}
        players={selectedPlayers}
        locale={locale}
        currency={currency}
      />
    </div>
  );
}
