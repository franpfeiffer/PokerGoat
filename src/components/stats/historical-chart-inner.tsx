"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

interface ChartData {
  date: string;
  profitLoss: number;
  cumulative: number;
}

interface HistoricalChartInnerProps {
  data: ChartData[];
  locale?: string;
  currency?: string;
}

export default function HistoricalChartInner({
  data,
  locale = "es-ES",
  currency = "USD",
}: HistoricalChartInnerProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-velvet-400">
        Sin datos hist\u00f3ricos
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
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
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a24",
            border: "1px solid #2a2a38",
            borderRadius: "0.5rem",
            color: "#f0f0f5",
            fontSize: "0.875rem",
          }}
          formatter={(value: number) => [
            formatCurrency(value, locale, currency),
            "Acumulado",
          ]}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#d4a847"
          strokeWidth={2}
          dot={{ fill: "#d4a847", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: "#e8c45a" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
