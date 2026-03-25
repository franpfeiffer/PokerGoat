"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ChartInner = dynamic(() => import("./profit-chart-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-[200px] w-full rounded-lg" />,
});

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

  if (data.length < 1) return null;

  return (
    <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <CardContent className="px-3 py-5 sm:px-4 sm:py-6">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-velvet-400">
          {t("profitHistory")}
        </p>
        <ChartInner data={data} locale={locale} currency={currency} />
      </CardContent>
    </Card>
  );
}
