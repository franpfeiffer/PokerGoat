"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
      <div className="flex h-64 items-center justify-center text-velvet-400">
        {t("historicalNoData")}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#8888a0", fontSize: 12 }}
          axisLine={{ stroke: "#2a2a38" }}
        />
        <YAxis
          tick={{ fill: "#8888a0", fontSize: 12 }}
          axisLine={{ stroke: "#2a2a38" }}
          tickFormatter={(val) => formatCurrency(val, locale, currency)}
        />
        <ReferenceLine y={0} stroke="#353545" strokeDasharray="3 3" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a24",
            border: "1px solid #2a2a38",
            borderRadius: "0.5rem",
            color: "#f0f0f5",
            fontSize: "0.875rem",
          }}
          formatter={(value: number, _name: string, props) => {
            const player = players.find((p) => p.id === props.dataKey);
            return [
              formatCurrency(value, locale, currency),
              player?.name ?? t("cumulative"),
            ];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "0.75rem", color: "#a0a0b8" }}
          formatter={(value) => {
            const player = players.find((p) => p.id === value);
            return player?.name ?? value;
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
            dot={{ fill: COLORS[i % COLORS.length], strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
