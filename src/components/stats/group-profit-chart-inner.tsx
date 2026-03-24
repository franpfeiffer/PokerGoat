"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils/currency";

const COLORS = [
  "#d4a847", // gold
  "#34d375", // profit green
  "#f04848", // loss red
  "#6e8efb", // blue
  "#e87cda", // pink
  "#4dd4c0", // teal
  "#f5a623", // orange
  "#b07df0", // purple
];

interface Player {
  id: string;
  name: string;
}

interface GroupProfitChartInnerProps {
  data: Record<string, string | number>[];
  players: Player[];
  locale?: string;
  currency?: string;
}

export default function GroupProfitChartInner({
  data,
  players,
  locale = "es-ES",
  currency = "ARS",
}: GroupProfitChartInnerProps) {
  const t = useTranslations("leaderboard");

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-velvet-500">
        {t("historicalNoData")}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-velvet-700/60 bg-velvet-900 p-2 sm:p-3">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "#555568", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#555568", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={65}
            tickFormatter={(val) => {
              if (Math.abs(val) >= 1000) {
                return `${(val / 1000).toFixed(1)}k`;
              }
              return String(val);
            }}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.06)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#12121a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.75rem",
              color: "#e8e8f0",
              fontSize: "0.8125rem",
              padding: "8px 12px",
            }}
            formatter={(value: number, _name: string, props) => {
              const player = players.find((p) => p.id === props.dataKey);
              return [
                formatCurrency(value, locale, currency),
                player?.name ?? t("cumulative"),
              ];
            }}
          />
          {players.map((player, i) => (
            <Line
              key={player.id}
              type="monotone"
              dataKey={player.id}
              name={player.id}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: COLORS[i % COLORS.length],
                strokeWidth: 2,
                stroke: "#12121a",
              }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {/* Inline legend */}
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 px-2 pb-1">
        {players.map((player, i) => (
          <div key={player.id} className="flex items-center gap-1.5 text-[11px] text-velvet-400">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {player.name}
          </div>
        ))}
      </div>
    </div>
  );
}
