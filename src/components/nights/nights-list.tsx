"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { NightCard } from "./night-card";

type NightStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

interface Night {
  id: string;
  name: string | null;
  date: string;
  status: NightStatus;
}

interface NightsListProps {
  nights: Night[];
  groupId: string;
  locale: string;
}

const FILTERS: Array<{ key: NightStatus | "all"; labelKey: string }> = [
  { key: "all", labelKey: "filterAll" },
  { key: "in_progress", labelKey: "filterInProgress" },
  { key: "scheduled", labelKey: "filterScheduled" },
  { key: "completed", labelKey: "filterCompleted" },
];

export function NightsList({ nights, groupId, locale }: NightsListProps) {
  const t = useTranslations("nights");
  const [filter, setFilter] = useState<NightStatus | "all">("all");

  const filtered = filter === "all" ? nights : nights.filter((n) => n.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {FILTERS.map(({ key, labelKey }) => {
          const count = key === "all" ? nights.length : nights.filter((n) => n.status === key).length;
          if (key !== "all" && count === 0) return null;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === key
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "border border-velvet-700/60 text-velvet-400 hover:text-velvet-200 hover:border-velvet-600"
              }`}
            >
              {t(labelKey)}
              {count > 0 && (
                <span className={`ml-1.5 tabular-nums ${filter === key ? "text-gold-500/70" : "text-velvet-600"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-velvet-500">{t("noNightsFilter")}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((night) => (
            <NightCard
              key={night.id}
              id={night.id}
              groupId={groupId}
              name={night.name}
              date={night.date}
              status={night.status}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
