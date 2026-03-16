"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Chart = dynamic(
  () => import("./historical-chart-inner"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  }
);

interface HistoricalChartProps {
  data: {
    date: string;
    profitLoss: number;
    cumulative: number;
  }[];
  locale?: string;
  currency?: string;
}

export function HistoricalChart(props: HistoricalChartProps) {
  return <Chart {...props} />;
}
