"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

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
      <div className="flex h-64 items-center justify-center text-velvet-400">
        {t("historicalNoData")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {players.map((p) => (
          <button
            key={p.id}
            onClick={() => toggle(p.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selectedIds.has(p.id)
                ? "border-gold/50 bg-gold/10 text-gold"
                : "border-velvet-700 bg-velvet-800 text-velvet-400 hover:text-velvet-200"
            }`}
          >
            {p.name}
          </button>
        ))}
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
