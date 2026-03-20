"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";
import { startNight } from "@/lib/actions/nights";
import { calculateAndSaveResults } from "@/lib/actions/results";
import {
  type NightChipValues,
  calculateReconciliation,
  allParticipantsHaveChips,
  type ChipReconciliation,
} from "@/lib/utils/chips";

interface Participant {
  buyInCount: number;
  chipsBlackEnd: number | null;
  chipsWhiteEnd: number | null;
  chipsRedEnd: number | null;
  chipsGreenEnd: number | null;
  chipsBlueEnd: number | null;
}

interface NightStatusActionProps {
  groupId: string;
  nightId: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  chipQuantities?: NightChipValues;
  chipValues?: NightChipValues;
  participants?: Participant[];
}

const colorLabels: Record<keyof NightChipValues, string> = {
  black: "chipBlack",
  white: "chipWhite",
  red: "chipRed",
  green: "chipGreen",
  blue: "chipBlue",
};

export function NightStatusAction({
  groupId,
  nightId,
  status,
  chipQuantities,
  chipValues,
  participants,
}: NightStatusActionProps) {
  const t = useTranslations("nights");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false);
  const [reconciliation, setReconciliation] = useState<ChipReconciliation | null>(null);

  if (status !== "scheduled" && status !== "in_progress") {
    return null;
  }

  async function getProfileId() {
    if (!session?.user) return null;
    const { profile } = await getOrCreateProfile({
      authUserId: session.user.id,
      displayName: session.user.name || session.user.email.split("@")[0],
      avatarUrl: session.user.image ?? undefined,
    });
    return profile.id;
  }

  async function finishNight(force?: boolean) {
    const profileId = await getProfileId();
    if (!profileId) return;

    const result = await calculateAndSaveResults(nightId, profileId, force);

    if (result.error) {
      if (result.error === "reconciliation_all_must_enter") {
        setError(t("reconciliation.allMustEnterChips"));
      } else if (result.error === "reconciliation_failed") {
        setError(t("reconciliation.discrepancyFound"));
      } else {
        setError(typeof result.error === "string" ? result.error : tCommon("error"));
      }
      return;
    }

    router.push(`/groups/${groupId}/nights/${nightId}/results`);
  }

  function handleClick() {
    startTransition(async () => {
      setError(null);

      if (status === "scheduled") {
        const profileId = await getProfileId();
        if (!profileId) return;
        const result = await startNight(nightId, profileId);
        if (result.error) {
          setError(typeof result.error === "string" ? result.error : tCommon("error"));
          return;
        }
        router.refresh();
        return;
      }

      // status === "in_progress" — check reconciliation client-side first
      if (chipQuantities && chipValues && participants) {
        if (!allParticipantsHaveChips(participants)) {
          setError(t("reconciliation.allMustEnterChips"));
          return;
        }
        const recon = calculateReconciliation(chipQuantities, chipValues, participants);
        if (!recon.isBalanced) {
          setReconciliation(recon);
          setShowDiscrepancyDialog(true);
          return;
        }
      }

      await finishNight();
    });
  }

  function handleForceFinish() {
    setShowDiscrepancyDialog(false);
    startTransition(async () => {
      setError(null);
      await finishNight(true);
    });
  }

  return (
    <div className="w-full space-y-2 sm:w-auto">
      <Button
        onClick={handleClick}
        disabled={isPending}
        size="sm"
        className="min-h-11 w-full justify-center sm:min-h-10 sm:w-auto"
      >
        {status === "scheduled"
          ? isPending
            ? `${t("start")}…`
            : t("start")
          : isPending
            ? `${t("finish")}…`
            : t("finish")}
      </Button>
      {error && <p className="text-xs text-loss sm:text-right">{error}</p>}

      <Dialog
        open={showDiscrepancyDialog}
        onClose={() => setShowDiscrepancyDialog(false)}
        title={t("reconciliation.confirmDiscrepancy")}
      >
        {reconciliation && (
          <div className="space-y-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-velvet-700/50 text-xs text-velvet-400 uppercase tracking-wider">
                  <th className="py-2 text-left font-medium">&nbsp;</th>
                  <th className="py-2 text-right font-medium">{t("reconciliation.expected")}</th>
                  <th className="py-2 text-right font-medium">{t("reconciliation.reported")}</th>
                  <th className="py-2 text-right font-medium">{t("reconciliation.difference")}</th>
                </tr>
              </thead>
              <tbody>
                {reconciliation.perColor.map(({ color, expected, reported, difference }) => (
                  <tr key={color} className="border-b border-velvet-700/30">
                    <td className="py-2 font-medium text-velvet-200">{t(colorLabels[color])}</td>
                    <td className="py-2 text-right tabular-nums text-velvet-300">{expected}</td>
                    <td className="py-2 text-right tabular-nums text-velvet-300">{reported}</td>
                    <td className={`py-2 text-right tabular-nums font-semibold ${difference === 0 ? "text-profit" : "text-loss"}`}>
                      {difference === 0 ? "0" : difference > 0 ? `+${difference}` : String(difference)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-sm text-loss font-medium">
              {t("reconciliation.valueDifference")}:{" "}
              <span className="tabular-nums">
                ${Math.abs(reconciliation.valueDifference).toLocaleString()}
                {reconciliation.valueDifference > 0
                  ? ` (${t("reconciliation.extra")})`
                  : ` (${t("reconciliation.missing")})`}
              </span>
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDiscrepancyDialog(false)}
                className="min-h-11 sm:min-h-10"
              >
                {t("reconciliation.goBackAndFix")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleForceFinish}
                disabled={isPending}
                className="min-h-11 sm:min-h-10"
              >
                {isPending ? `${t("reconciliation.finishAnyway")}…` : t("reconciliation.finishAnyway")}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
