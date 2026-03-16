"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pokerNights, pokerNightParticipants, pokerNightResults } from "@/lib/db/schema";
import {
  calculateTotalInvested,
  calculateCashout,
  calculateProfitLoss,
} from "@/lib/utils/chips";
import { getUserMembership } from "@/lib/db/queries/groups";

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

  const results = participants
    .filter((p) => p.totalChipsEnd !== null)
    .map((p) => {
      const totalInvested = calculateTotalInvested(p.buyInCount, buyInAmount);
      const totalCashout = calculateCashout(p.totalChipsEnd!, chipValue);
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

  revalidatePath(`/groups/${night.groupId}/nights/${nightId}`);
  revalidatePath(`/groups/${night.groupId}`);
  return { success: true, resultsCount: results.length };
}
