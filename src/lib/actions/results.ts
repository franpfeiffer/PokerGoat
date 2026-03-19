"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pokerNights, pokerNightParticipants, pokerNightResults } from "@/lib/db/schema";
import {
  calculateTotalInvested,
  calculateCashout,
  calculateCashoutFromChipBreakdown,
  calculateProfitLoss,
  parseNightMetadata,
} from "@/lib/utils/chips";
import { getUserMembership } from "@/lib/db/queries/groups";
import { revalidateLocalized } from "@/lib/utils/revalidate";

export async function calculateAndSaveResults(
  nightId: string,
  userId: string
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
  const chipValues = parseNightMetadata(night.notes, chipValue).chipValues;

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
      const totalInvested = calculateTotalInvested(p.buyInCount, buyInAmount);
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

  revalidateLocalized(`/groups/${night.groupId}/nights/${nightId}`);
  revalidateLocalized(`/groups/${night.groupId}`);
  return { success: true, resultsCount: results.length };
}
