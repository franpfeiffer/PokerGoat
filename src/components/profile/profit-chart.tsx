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
import { Card, CardContent } from "@/components/ui/card";

interface ProfitChartProps {
  data: { date: string; profitLoss: number; cumulative: number }[];
  locale?: string;
  currency?: string;
}

export function ProfitChart({
  data,
  locale = "es-ES",
  currency = "ARS",
}: ProfitChartProps) {
  const t = useTranslations("profile");

  if (data.length < 2) return null;

  const lineColor =
    data[data.length - 1].cumulative >= 0 ? "#22c55e" : "#ef4444";

  return (
    <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <CardContent className="px-3 py-5 sm:px-4 sm:py-6">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-velvet-400">
          {t("profitHistory")}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
          >
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
      </CardContent>
    </Card>
  );
}
