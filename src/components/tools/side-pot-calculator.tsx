"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateSidePots, type PlayerBet } from "@/lib/utils/side-pots";
import { formatCurrency } from "@/lib/utils/currency";

interface PlayerRow {
  id: string;
  name: string;
  amount: string;
  isAllIn: boolean;
}

export function SidePotCalculator({
  locale,
  currency,
}: {
  locale: string;
  currency: string;
}) {
  const t = useTranslations("sidePots");

  const [players, setPlayers] = useState<PlayerRow[]>([
    { id: "1", name: "Player 1", amount: "", isAllIn: false },
    { id: "2", name: "Player 2", amount: "", isAllIn: false },
    { id: "3", name: "Player 3", amount: "", isAllIn: false },
  ]);

  const addPlayer = () => {
    setPlayers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Player ${prev.length + 1}`,
        amount: "",
        isAllIn: false,
      },
    ]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePlayer = (id: string, field: keyof PlayerRow, value: string | boolean) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const bets: PlayerBet[] = useMemo(
    () =>
      players
        .filter((p) => p.amount && Number(p.amount) > 0)
        .map((p) => ({
          name: p.name || "?",
          amount: Number(p.amount),
          isAllIn: p.isAllIn,
        })),
    [players]
  );

  const pots = useMemo(() => calculateSidePots(bets), [bets]);
  const totalInPots = pots.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      {/* Player inputs */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-display text-lg font-semibold">
            {t("players")}
          </h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-1.5">
              <input
                value={player.name}
                onChange={(e) =>
                  updatePlayer(player.id, "name", e.target.value)
                }
                placeholder={t("playerName")}
                className="focus-ring min-h-11 min-w-0 flex-[2] rounded-lg border border-velvet-700 bg-velvet-800 px-2.5 py-2 text-sm text-velvet-50 placeholder:text-velvet-500 sm:min-h-10"
              />
              <input
                type="number"
                inputMode="decimal"
                value={player.amount}
                onChange={(e) =>
                  updatePlayer(player.id, "amount", e.target.value)
                }
                placeholder={t("betAmount")}
                className="focus-ring min-h-11 min-w-0 flex-1 rounded-lg border border-velvet-700 bg-velvet-800 px-2.5 py-2 text-sm text-velvet-50 placeholder:text-velvet-500 sm:min-h-10"
                min="0"
              />
              <button
                type="button"
                onClick={() =>
                  updatePlayer(player.id, "isAllIn", !player.isAllIn)
                }
                className={`shrink-0 rounded-lg border min-h-11 min-w-11 px-2 text-[11px] font-semibold transition-colors sm:min-h-10 sm:px-3 ${
                  player.isAllIn
                    ? "border-loss/40 bg-loss/10 text-loss"
                    : "border-velvet-700 bg-velvet-800 text-velvet-500 active:text-velvet-200"
                }`}
              >
                All in
              </button>
              {players.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePlayer(player.id)}
                  className="shrink-0 min-h-11 min-w-[28px] rounded-lg text-velvet-500 active:text-loss sm:min-h-10"
                  aria-label={t("remove")}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={addPlayer}
            className="min-h-11 w-full sm:min-h-10 sm:w-auto"
          >
            {t("addPlayer")}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {pots.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {t("pots")}
              </h2>
              <span className="text-sm font-semibold tabular-nums text-gold-400">
                {t("total")}: {formatCurrency(totalInPots, locale, currency)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pots.map((pot, i) => (
              <div
                key={i}
                className={`rounded-lg border px-3 py-2.5 ${
                  i === 0
                    ? "border-gold-500/20 bg-gold-500/5"
                    : "border-velvet-700 bg-velvet-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-velvet-100">
                    {pot.name}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-gold-300">
                    {formatCurrency(pot.amount, locale, currency)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-velvet-400">
                  {t("eligible")}: {pot.eligiblePlayers.join(", ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
