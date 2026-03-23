"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfitBadge } from "@/components/leaderboard/profit-badge";
import { formatCurrency } from "@/lib/utils/currency";
import type { HeadToHeadStats } from "@/lib/db/queries/leaderboard";

interface Player {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface HeadToHeadComparisonProps {
  players: Player[];
  stats: HeadToHeadStats | null;
  initialA?: string;
  initialB?: string;
  groupId: string;
  locale: string;
  currency: string;
}

export function HeadToHeadComparison({
  players,
  stats,
  initialA,
  initialB,
  groupId,
  locale,
  currency,
}: HeadToHeadComparisonProps) {
  const t = useTranslations("headToHead");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [playerA, setPlayerA] = useState(initialA ?? "");
  const [playerB, setPlayerB] = useState(initialB ?? "");

  const handleCompare = () => {
    if (!playerA || !playerB || playerA === playerB) return;
    const params = new URLSearchParams(searchParams);
    params.set("a", playerA);
    params.set("b", playerB);
    router.push(`/groups/${groupId}/head-to-head?${params.toString()}`);
  };

  const nameA = players.find((p) => p.id === playerA)?.name ?? "";
  const nameB = players.find((p) => p.id === playerB)?.name ?? "";

  return (
    <div className="space-y-6">
      {/* Player selector */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium text-velvet-200">
              {t("playerA")}
            </label>
            <select
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="focus-ring rounded-lg border border-velvet-700 bg-velvet-800 px-3 py-2 text-sm text-velvet-50 appearance-none"
            >
              <option value="">{t("selectPlayers")}</option>
              {players
                .filter((p) => p.id !== playerB)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
          <span className="hidden text-center text-lg font-bold text-velvet-400 sm:block">
            vs
          </span>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium text-velvet-200">
              {t("playerB")}
            </label>
            <select
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="focus-ring rounded-lg border border-velvet-700 bg-velvet-800 px-3 py-2 text-sm text-velvet-50 appearance-none"
            >
              <option value="">{t("selectPlayers")}</option>
              {players
                .filter((p) => p.id !== playerA)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
          <Button
            size="sm"
            className="min-h-11 sm:min-h-10"
            onClick={handleCompare}
            disabled={!playerA || !playerB || playerA === playerB}
          >
            {t("compare")}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {stats && stats.sharedNights === 0 && (
        <Card>
          <CardContent className="flex h-40 items-center justify-center py-5">
            <p className="text-velvet-400">{t("noSharedNights")}</p>
          </CardContent>
        </Card>
      )}

      {stats && stats.sharedNights > 0 && (
        <>
          {/* Summary */}
          <Card>
            <CardContent className="py-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                {/* Player A */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-velvet-100 truncate">
                    {nameA}
                  </p>
                  <p className="text-3xl font-bold text-gold">{stats.winsA}</p>
                  <p className="text-xs text-velvet-400">{t("wins")}</p>
                </div>

                {/* Center stats */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-velvet-400">vs</p>
                  <p className="text-3xl font-bold text-velvet-400">
                    {stats.draws}
                  </p>
                  <p className="text-xs text-velvet-400">{t("draws")}</p>
                </div>

                {/* Player B */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-velvet-100 truncate">
                    {nameB}
                  </p>
                  <p className="text-3xl font-bold text-gold">{stats.winsB}</p>
                  <p className="text-xs text-velvet-400">{t("wins")}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-velvet-700 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <ProfitBadge
                      amount={stats.totalA}
                      locale={locale}
                      currency={currency}
                    />
                    <p className="mt-1 text-xs text-velvet-400">
                      {t("totalProfit")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-velvet-200">
                      {stats.sharedNights}
                    </p>
                    <p className="mt-1 text-xs text-velvet-400">
                      {t("sharedNights")}
                    </p>
                  </div>
                  <div>
                    <ProfitBadge
                      amount={stats.totalB}
                      locale={locale}
                      currency={currency}
                    />
                    <p className="mt-1 text-xs text-velvet-400">
                      {t("totalProfit")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-velvet-700 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-semibold text-velvet-200">
                      {formatCurrency(stats.avgA, locale, currency)}
                    </p>
                    <p className="mt-1 text-xs text-velvet-400">
                      {t("avgProfit")}
                    </p>
                  </div>
                  <div />
                  <div>
                    <p className="text-sm font-semibold text-velvet-200">
                      {formatCurrency(stats.avgB, locale, currency)}
                    </p>
                    <p className="mt-1 text-xs text-velvet-400">
                      {t("avgProfit")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Night by night */}
          <Card>
            <CardContent className="py-5">
              <h3 className="mb-4 font-display text-sm font-semibold text-velvet-200">
                {t("nightByNight")}
              </h3>
              <div className="space-y-2">
                {stats.results.map((r) => {
                  const aWon =
                    r.playerA && r.playerB && r.playerA.rank < r.playerB.rank;
                  const bWon =
                    r.playerA && r.playerB && r.playerB.rank < r.playerA.rank;
                  return (
                    <div
                      key={r.nightId}
                      className="flex items-center gap-3 rounded-lg border border-velvet-700 bg-velvet-800/50 px-3 py-2 text-sm"
                    >
                      <span
                        className={`flex-1 text-right tabular-nums ${aWon ? "font-bold text-profit" : "text-velvet-200"}`}
                      >
                        {r.playerA
                          ? formatCurrency(
                              r.playerA.profitLoss,
                              locale,
                              currency,
                            )
                          : "—"}
                      </span>
                      <span className="w-24 text-center text-xs text-velvet-400 shrink-0">
                        {r.nightName ?? r.date}
                      </span>
                      <span
                        className={`flex-1 tabular-nums ${bWon ? "font-bold text-profit" : "text-velvet-200"}`}
                      >
                        {r.playerB
                          ? formatCurrency(
                              r.playerB.profitLoss,
                              locale,
                              currency,
                            )
                          : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
