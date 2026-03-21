"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";
import { type NightChipValues } from "@/lib/utils/chips";
import {
  addParticipant,
  removeParticipant,
  updateParticipant,
} from "@/lib/actions/nights";
import { ParticipantRow } from "@/components/nights/participant-row";

interface GroupMember {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

interface Participant {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  buyInCount: number;
  customBuyInAmount: number | null;
  totalChipsEnd: number | null;
  chipsBlackEnd: number | null;
  chipsWhiteEnd: number | null;
  chipsRedEnd: number | null;
  chipsGreenEnd: number | null;
  chipsBlueEnd: number | null;
}

interface NightParticipantsPanelProps {
  nightId: string;
  nightStatus: "scheduled" | "in_progress" | "completed" | "cancelled";
  buyInAmount: number;
  chipValue: number;
  chipValues: NightChipValues;
  chipQuantities?: NightChipValues;
  locale: string;
  members: GroupMember[];
  participants: Participant[];
}

export function NightParticipantsPanel({
  nightId,
  nightStatus,
  buyInAmount,
  chipValue,
  chipValues,
  chipQuantities,
  locale,
  members,
  participants,
}: NightParticipantsPanelProps) {
  const t = useTranslations("nights");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState("");

  const participantUserIds = useMemo(
    () => new Set(participants.map((participant) => participant.userId)),
    [participants]
  );
  const availableMembers = members.filter(
    (member) => !participantUserIds.has(member.userId)
  );
  const isEditable = nightStatus === "scheduled" || nightStatus === "in_progress";

  async function runWithProfile(
    callback: (profileId: string) => Promise<{ error?: unknown }>
  ) {
    if (!session?.user) return;
    const { profile } = await getOrCreateProfile({
      authUserId: session.user.id,
      displayName: session.user.name || session.user.email.split("@")[0],
      avatarUrl: session.user.image ?? undefined,
    });
    const result = await callback(profile.id);
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : tCommon("error"));
      return false;
    }
    return true;
  }

  function handleAddParticipant() {
    if (!targetUserId) return;
    startTransition(async () => {
      setError(null);
      const ok = await runWithProfile((profileId) =>
        addParticipant(nightId, targetUserId, profileId)
      );
      if (!ok) return;
      setTargetUserId("");
      router.refresh();
    });
  }

  function handleRemoveParticipant(participantId: string) {
    startTransition(async () => {
      setError(null);
      const ok = await runWithProfile((profileId) =>
        removeParticipant(participantId, profileId)
      );
      if (!ok) return;
      router.refresh();
    });
  }

  function handleUpdateBuyIn(participantId: string, count: number) {
    startTransition(async () => {
      setError(null);
      const ok = await runWithProfile(async () => {
        const formData = new FormData();
        formData.set("participantId", participantId);
        formData.set("buyInCount", String(count));
        return updateParticipant(formData);
      });
      if (!ok) return;
      router.refresh();
    });
  }

  function handleUpdateCustomBuyIn(participantId: string, amount: number | null) {
    startTransition(async () => {
      setError(null);
      const ok = await runWithProfile(async () => {
        const formData = new FormData();
        formData.set("participantId", participantId);
        if (amount !== null) {
          formData.set("customBuyInAmount", String(amount));
        } else {
          formData.set("clearCustomBuyIn", "true");
        }
        return updateParticipant(formData);
      });
      if (!ok) return;
      router.refresh();
    });
  }

  function handleUpdateChips(
    participantId: string,
    chipBreakdown: {
      black?: number;
      white?: number;
      red?: number;
      green?: number;
      blue?: number;
    }
  ) {
    startTransition(async () => {
      setError(null);
      const ok = await runWithProfile(async () => {
        const formData = new FormData();
        formData.set("participantId", participantId);
        if (chipBreakdown.black !== undefined)
          formData.set("chipsBlackEnd", String(chipBreakdown.black));
        if (chipBreakdown.white !== undefined)
          formData.set("chipsWhiteEnd", String(chipBreakdown.white));
        if (chipBreakdown.red !== undefined)
          formData.set("chipsRedEnd", String(chipBreakdown.red));
        if (chipBreakdown.green !== undefined)
          formData.set("chipsGreenEnd", String(chipBreakdown.green));
        if (chipBreakdown.blue !== undefined)
          formData.set("chipsBlueEnd", String(chipBreakdown.blue));
        return updateParticipant(formData);
      });
      if (!ok) return;
      router.refresh();
    });
  }

  return (
    <div className={isPending ? "space-y-3 opacity-70" : "space-y-3"}>
      {error && (
        <p className="rounded-lg border border-loss/30 bg-loss-muted/20 px-3 py-2 text-sm text-loss">
          {error}
        </p>
      )}

      {isEditable && availableMembers.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-velvet-700/60 bg-velvet-900/40 p-3 sm:flex-row sm:items-center">
          <select
            value={targetUserId}
            onChange={(event) => setTargetUserId(event.target.value)}
            className="focus-ring w-full min-h-11 rounded-md border border-velvet-700 bg-velvet-800 px-3 py-2 text-sm text-velvet-50 sm:min-h-10 sm:flex-1"
          >
            <option value="">{t("addParticipant")}</option>
            {availableMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.displayName}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            type="button"
            onClick={handleAddParticipant}
            disabled={!targetUserId || isPending}
            className="min-h-11 w-full sm:min-h-10 sm:w-auto"
          >
            {t("addParticipant")}
          </Button>
        </div>
      )}

      {participants.length === 0 ? (
        <p className="text-sm text-velvet-400">{t("addParticipantsToStart")}</p>
      ) : (
        <div className="space-y-1">
          {participants.map((participant) => (
            <div key={participant.id} className="rounded-lg border border-velvet-700/50 px-3">
              <ParticipantRow
                id={participant.id}
                displayName={participant.displayName}
                avatarUrl={participant.avatarUrl}
                buyInCount={participant.buyInCount}
                customBuyInAmount={participant.customBuyInAmount}
                totalChipsEnd={participant.totalChipsEnd}
                chipsBlackEnd={participant.chipsBlackEnd}
                chipsWhiteEnd={participant.chipsWhiteEnd}
                chipsRedEnd={participant.chipsRedEnd}
                chipsGreenEnd={participant.chipsGreenEnd}
                chipsBlueEnd={participant.chipsBlueEnd}
                buyInAmount={buyInAmount}
                chipValue={chipValue}
                chipValues={chipValues}
                nightStatus={nightStatus}
                locale={locale}
                currency="ARS"
                onUpdateBuyIn={isEditable ? handleUpdateBuyIn : undefined}
                onUpdateCustomBuyIn={isEditable ? handleUpdateCustomBuyIn : undefined}
                onUpdateChips={isEditable ? handleUpdateChips : undefined}
              />
              {isEditable && (
                <div className="pb-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    className="min-h-11 w-full sm:min-h-10 sm:w-auto"
                    onClick={() => handleRemoveParticipant(participant.id)}
                    disabled={isPending}
                  >
                    {tCommon("delete")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {chipQuantities && nightStatus === "in_progress" && participants.length > 0 && (
        <ChipTotalsSummary
          chipQuantities={chipQuantities}
          participants={participants}
        />
      )}
    </div>
  );
}

function ChipTotalsSummary({
  chipQuantities,
  participants,
}: {
  chipQuantities: NightChipValues;
  participants: Participant[];
}) {
  const t = useTranslations("nights");
  const totalBuyIns = participants.reduce((sum, p) => sum + p.buyInCount, 0);

  const colors: Array<{ key: keyof NightChipValues; label: string }> = [
    { key: "black", label: t("chipBlack") },
    { key: "white", label: t("chipWhite") },
    { key: "red", label: t("chipRed") },
    { key: "green", label: t("chipGreen") },
    { key: "blue", label: t("chipBlue") },
  ];

  const colorToField = {
    black: "chipsBlackEnd",
    white: "chipsWhiteEnd",
    red: "chipsRedEnd",
    green: "chipsGreenEnd",
    blue: "chipsBlueEnd",
  } as const;

  const allEntered = participants.every(
    (p) =>
      p.chipsBlackEnd !== null &&
      p.chipsWhiteEnd !== null &&
      p.chipsRedEnd !== null &&
      p.chipsGreenEnd !== null &&
      p.chipsBlueEnd !== null
  );

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-velvet-700/50 bg-velvet-900/40 px-3 py-2">
      {colors.map(({ key, label }) => {
        const expected = totalBuyIns * chipQuantities[key];
        const reported = participants.reduce(
          (sum, p) => sum + (p[colorToField[key]] ?? 0),
          0
        );
        const balanced = reported === expected;
        return (
          <span
            key={key}
            className={`text-xs tabular-nums ${
              !allEntered
                ? "text-velvet-500"
                : balanced
                  ? "text-profit"
                  : "text-loss"
            }`}
          >
            {label}: {reported}/{expected}
          </span>
        );
      })}
    </div>
  );
}
