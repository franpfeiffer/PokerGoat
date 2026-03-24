"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
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
    <div className="space-y-4">
      {/* Player selector */}
      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-velvet-400">
              {t("playerA")}
            </label>
            <select
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="focus-ring min-h-11 rounded-lg border border-velvet-700 bg-velvet-800 px-3 py-2 text-sm text-velvet-50 appearance-none sm:min-h-10"
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
          <span className="hidden self-center pb-1 text-lg font-bold text-velvet-600 sm:block">
            vs
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-velvet-400">
              {t("playerB")}
            </label>
            <select
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="focus-ring min-h-11 rounded-lg border border-velvet-700 bg-velvet-800 px-3 py-2 text-sm text-velvet-50 appearance-none sm:min-h-10"
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

      {/* No shared nights */}
      {stats && stats.sharedNights === 0 && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm text-velvet-500">{t("noSharedNights")}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {stats && stats.sharedNights > 0 && (
        <>
          {/* Win/Draw/Win scoreboard */}
          <Card>
            <CardContent className="py-5">
              <div className="grid grid-cols-3 items-center text-center">
                <div>
                  <p className="text-xs font-medium text-velvet-400 truncate mb-1">
                    {nameA}
                  </p>
                  <p className="text-4xl font-bold tabular-nums text-gold-400">
                    {stats.winsA}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-velvet-500">
                    {t("wins")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-velvet-600 mb-1">vs</p>
                  <p className="text-4xl font-bold tabular-nums text-velvet-500">
                    {stats.draws}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-velvet-500">
                    {t("draws")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-velvet-400 truncate mb-1">
                    {nameB}
                  </p>
                  <p className="text-4xl font-bold tabular-nums text-gold-400">
                    {stats.winsB}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-velvet-500">
                    {t("wins")}
                  </p>
                </div>
              </div>

              {/* Profit / Shared nights / Profit */}
              <div className="mt-5 grid grid-cols-3 items-start gap-2 border-t border-velvet-700/40 pt-4 text-center">
                <div>
                  <ProfitBadge
                    amount={stats.totalA}
                    locale={locale}
                    currency={currency}
                  />
                  <p className="mt-0.5 text-[10px] text-velvet-500">
                    {t("totalProfit")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold tabular-nums text-velvet-200">
                    {stats.sharedNights}
                  </p>
                  <p className="mt-0.5 text-[10px] text-velvet-500">
                    {t("sharedNights")}
                  </p>
                </div>
                <div>
                  <ProfitBadge
                    amount={stats.totalB}
                    locale={locale}
                    currency={currency}
                  />
                  <p className="mt-0.5 text-[10px] text-velvet-500">
                    {t("totalProfit")}
                  </p>
                </div>
              </div>

              {/* Avg */}
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-velvet-700/40 pt-3 text-center">
                <div>
                  <p className="text-xs font-semibold tabular-nums text-velvet-200">
                    {formatCurrency(stats.avgA, locale, currency)}
                  </p>
                  <p className="text-[10px] text-velvet-500">{t("avgProfit")}</p>
                </div>
                <div />
                <div>
                  <p className="text-xs font-semibold tabular-nums text-velvet-200">
                    {formatCurrency(stats.avgB, locale, currency)}
                  </p>
                  <p className="text-[10px] text-velvet-500">{t("avgProfit")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Night by night */}
          <Card>
            <CardContent className="py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-velvet-400">
                {t("nightByNight")}
              </h3>
              <div className="space-y-1.5">
                {stats.results.map((r) => {
                  const aWon =
                    r.playerA && r.playerB && r.playerA.rank < r.playerB.rank;
                  const bWon =
                    r.playerA && r.playerB && r.playerB.rank < r.playerA.rank;
                  return (
                    <div
                      key={r.nightId}
                      className="flex items-center gap-2 rounded-lg border border-velvet-700/40 bg-velvet-800/30 px-3 py-2 text-sm"
                    >
                      <span
                        className={`flex-1 text-right tabular-nums ${aWon ? "font-bold text-profit" : "text-velvet-300"}`}
                      >
                        {r.playerA
                          ? formatCurrency(r.playerA.profitLoss, locale, currency)
                          : "—"}
                      </span>
                      <span className="w-20 text-center text-[11px] text-velvet-500 shrink-0">
                        {r.nightName ?? r.date}
                      </span>
                      <span
                        className={`flex-1 tabular-nums ${bWon ? "font-bold text-profit" : "text-velvet-300"}`}
                      >
                        {r.playerB
                          ? formatCurrency(r.playerB.profitLoss, locale, currency)
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
