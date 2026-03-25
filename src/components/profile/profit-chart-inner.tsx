"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils/currency";

interface ProfitChartInnerProps {
  data: { date: string; profitLoss: number; cumulative: number }[];
  locale?: string;
  currency?: string;
}

export default function ProfitChartInner({
  data,
  locale = "es-ES",
  currency = "ARS",
}: ProfitChartInnerProps) {
  const t = useTranslations("profile");

  // Si hay un solo punto, agregamos un punto inicial en 0 para que se vea la línea
  const chartData =
    data.length === 1
      ? [{ date: "", profitLoss: 0, cumulative: 0 }, ...data]
      : data;

  const lineColor =
    data[data.length - 1].cumulative >= 0 ? "#22c55e" : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#8888a0", fontSize: 11 }}
          axisLine={{ stroke: "#2a2a38" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#8888a0", fontSize: 11 }}
          axisLine={{ stroke: "#2a2a38" }}
          tickLine={false}
          tickFormatter={(val) => formatCurrency(val, locale, currency)}
          width={70}
        />
        <ReferenceLine y={0} stroke="#3a3a4a" strokeDasharray="4 4" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a24",
            border: "1px solid #2a2a38",
            borderRadius: "0.5rem",
            color: "#f0f0f5",
            fontSize: "0.8125rem",
          }}
          formatter={(value: number) => [
            formatCurrency(value, locale, currency),
            t("profitHistoryCumulative"),
          ]}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
