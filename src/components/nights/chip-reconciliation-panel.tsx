"use client";

import { useTranslations } from "next-intl";
import {
  type NightChipValues,
  calculateReconciliation,
  allParticipantsHaveChips,
} from "@/lib/utils/chips";

interface Participant {
  buyInCount: number;
  chipsBlackEnd: number | null;
  chipsWhiteEnd: number | null;
  chipsRedEnd: number | null;
  chipsGreenEnd: number | null;
  chipsBlueEnd: number | null;
}

interface ChipReconciliationPanelProps {
  chipQuantities: NightChipValues;
  chipValues: NightChipValues;
  participants: Participant[];
  locale: string;
}

const colorLabels: Record<keyof NightChipValues, string> = {
  black: "chipBlack",
  white: "chipWhite",
  red: "chipRed",
  green: "chipGreen",
  blue: "chipBlue",
};

export function ChipReconciliationPanel({
  chipQuantities,
  chipValues,
  participants,
  locale,
}: ChipReconciliationPanelProps) {
  const t = useTranslations("nights");

  const allEntered = allParticipantsHaveChips(participants);
  const entered = participants.filter(
    (p) =>
      p.chipsBlackEnd !== null &&
      p.chipsWhiteEnd !== null &&
      p.chipsRedEnd !== null &&
      p.chipsGreenEnd !== null &&
      p.chipsBlueEnd !== null
  ).length;

  if (!allEntered) {
    return (
      <p className="text-sm text-velvet-400">
        {t("reconciliation.waitingForPlayers", {
          current: entered,
          total: participants.length,
        })}
      </p>
    );
  }

  const reconciliation = calculateReconciliation(
    chipQuantities,
    chipValues,
    participants
  );

  const fmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-velvet-700/50 text-xs text-velvet-400 uppercase tracking-wider">
              <th className="py-2 text-left font-medium">&nbsp;</th>
              <th className="py-2 text-right font-medium">
                {t("reconciliation.expected")}
              </th>
              <th className="py-2 text-right font-medium">
                {t("reconciliation.reported")}
              </th>
              <th className="py-2 text-right font-medium">
                {t("reconciliation.difference")}
              </th>
            </tr>
          </thead>
          <tbody>
            {reconciliation.perColor.map(
              ({ color, expected, reported, difference }) => (
                <tr
                  key={color}
                  className="border-b border-velvet-700/30"
                >
                  <td className="py-2 font-medium text-velvet-200">
                    {t(colorLabels[color])}
                  </td>
                  <td className="py-2 text-right tabular-nums text-velvet-300">
                    {expected}
                  </td>
                  <td className="py-2 text-right tabular-nums text-velvet-300">
                    {reported}
                  </td>
                  <td
                    className={`py-2 text-right tabular-nums font-semibold ${
                      difference === 0
                        ? "text-profit"
                        : "text-loss"
                    }`}
                  >
                    {difference === 0
                      ? "0"
                      : difference > 0
                        ? `+${difference}`
                        : String(difference)}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div
        className={`rounded-lg px-3 py-2 text-sm font-medium ${
          reconciliation.isBalanced
            ? "border border-profit/30 bg-profit/10 text-profit"
            : "border border-loss/30 bg-loss-muted/20 text-loss"
        }`}
      >
        {reconciliation.isBalanced
          ? t("reconciliation.allBalanced")
          : `${t("reconciliation.discrepancyFound")}: ${t("reconciliation.valueDifference")} ${fmt.format(reconciliation.valueDifference)}`}
      </div>
    </div>
  );
}
