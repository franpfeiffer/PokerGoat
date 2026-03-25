"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { pokerNights, pokerNightParticipants, pokerNightResults, userProfiles } from "@/lib/db/schema";
import {
  calculateTotalInvested,
  calculateCashout,
  calculateCashoutFromChipBreakdown,
  calculateProfitLoss,
  parseNightMetadata,
  calculateReconciliation,
  allParticipantsHaveChips,
} from "@/lib/utils/chips";
import { getUserMembership } from "@/lib/db/queries/groups";
import { insertActivity } from "@/lib/db/queries/activity";
import { pushNotify } from "@/lib/push/send";
import { revalidateLocalized } from "@/lib/utils/revalidate";
import { revalidateTag } from "next/cache";

export async function calculateAndSaveResults(
  nightId: string,
  userId: string,
  forceFinish?: boolean
) {
  const [night] = await db
    .select()
    .from(pokerNights)
    .where(eq(pokerNights.id, nightId))
    .limit(1);

  if (!night) return { error: "Noche no encontrada" };

  const membership = await getUserMembership(night.groupId, userId);
  if (!membership || membership.role === "member") {
    return { error: "No tienes permisos" };
  }

  const participants = await db
    .select()
    .from(pokerNightParticipants)
    .where(eq(pokerNightParticipants.nightId, nightId));

  const buyInAmount = Number(night.buyInAmount);
  const chipValue = Number(night.chipValue);
  const metadata = parseNightMetadata(night.notes, chipValue);
  const chipValues = metadata.chipValues;

  if (metadata.chipQuantities) {
    if (!allParticipantsHaveChips(participants)) {
      return { error: "reconciliation_all_must_enter" };
    }
    const reconciliation = calculateReconciliation(
      metadata.chipQuantities,
      chipValues,
      participants
    );
    if (!reconciliation.isBalanced && !forceFinish) {
      return { error: "reconciliation_failed", reconciliation };
    }
  }

  const results = participants
    .filter(
      (p) =>
        p.totalChipsEnd !== null ||
        p.chipsBlackEnd !== null ||
        p.chipsWhiteEnd !== null ||
        p.chipsRedEnd !== null ||
        p.chipsGreenEnd !== null ||
        p.chipsBlueEnd !== null
    )
    .map((p) => {
      const rebuyTotal = Number(p.rebuyTotal ?? 0);
      const totalInvested = calculateTotalInvested(buyInAmount, rebuyTotal);
      const hasChipBreakdown =
        p.chipsBlackEnd !== null ||
        p.chipsWhiteEnd !== null ||
        p.chipsRedEnd !== null ||
        p.chipsGreenEnd !== null ||
        p.chipsBlueEnd !== null;
      const totalCashout = hasChipBreakdown
        ? calculateCashoutFromChipBreakdown(
            {
              black: p.chipsBlackEnd ?? 0,
              white: p.chipsWhiteEnd ?? 0,
              red: p.chipsRedEnd ?? 0,
              green: p.chipsGreenEnd ?? 0,
              blue: p.chipsBlueEnd ?? 0,
            },
            chipValues
          )
        : calculateCashout(p.totalChipsEnd!, chipValue);
      const profitLoss = calculateProfitLoss(totalCashout, totalInvested);
      return {
        nightId,
        userId: p.userId,
        participantId: p.id,
        totalInvested: String(totalInvested),
        totalCashout: String(totalCashout),
        profitLoss: String(profitLoss),
        profitLossNum: profitLoss,
        rank: 0,
      };
    })
    .sort((a, b) => b.profitLossNum - a.profitLossNum)
    .map((r, i) => ({
      nightId: r.nightId,
      userId: r.userId,
      participantId: r.participantId,
      totalInvested: r.totalInvested,
      totalCashout: r.totalCashout,
      profitLoss: r.profitLoss,
      rank: i + 1,
    }));

  if (results.length === 0) {
    return { error: "No hay resultados que calcular" };
  }

  await db
    .delete(pokerNightResults)
    .where(eq(pokerNightResults.nightId, nightId));

  await db.insert(pokerNightResults).values(results);

  await db
    .update(pokerNights)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(pokerNights.id, nightId));

  // Obtener displayNames para notificaciones
  const userIds = results.map((r) => r.userId);
  const profiles = await db
    .select({ id: userProfiles.id, displayName: userProfiles.displayName })
    .from(userProfiles)
    .where(inArray(userProfiles.id, userIds));
  const nameById = Object.fromEntries(profiles.map((p) => [p.id, p.displayName]));

  // Registrar evento: ganador de la noche
  const winner = results[0];
  if (winner) {
    const winnerName = nameById[winner.userId] ?? "Alguien";
    const nightName = night.name ?? "Noche de poker";

    await insertActivity({
      groupId: night.groupId,
      type: "night_completed",
      actorId: winner.userId,
      targetId: nightId,
      metadata: {
        nightName: night.name,
        profitLoss: Number(winner.profitLoss),
        playersCount: results.length,
      },
    }).catch(() => {});

    pushNotify
      .resultsPublished(night.groupId, nightName, nightId, winnerName)
      .catch(() => {});
  }

  revalidateLocalized(`/groups/${night.groupId}/nights/${nightId}`);
  revalidateLocalized(`/groups/${night.groupId}`);
  revalidateTag(`night-${nightId}`, "max");
  revalidateTag(`group-${night.groupId}`, "max");
  results.forEach((r) => revalidateTag(`user-${r.userId}`, "max"));
  return { success: true, resultsCount: results.length };
}
