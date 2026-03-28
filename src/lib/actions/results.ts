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
import { getUserAchievementData, getUserStreak, getUserPersonalRecords } from "@/lib/db/queries/users";
import { insertActivity } from "@/lib/db/queries/activity";
import { pushNotify } from "@/lib/push/send";
import { computeAchievements, getUnlockedAchievements } from "@/lib/achievements";
import { getRank } from "@/lib/rank";
import { revalidateLocalized } from "@/lib/utils/revalidate";
import { revalidateTag } from "next/cache";
import { formatCurrency } from "@/lib/utils/currency";

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

  // Post-completion: check achievements, rank ups, and personal records for each participant
  // Fire and forget — don't block result saving
  Promise.allSettled(
    results.map(async (result) => {
      const userId = result.userId;

      const [achievementData, streak, prevRecords] = await Promise.all([
        getUserAchievementData(userId),
        getUserStreak(userId),
        getUserPersonalRecords(userId),
      ]);

      const input = { ...achievementData, streak };

      // Achievements: find newly unlocked ones by comparing before/after this night
      // We compute with previous stats (subtract this night's contribution)
      const prevNightsPlayed = achievementData.nightsPlayed - 1;
      const prevProfit = achievementData.totalProfit - Number(result.profitLoss);
      const prevWins = Math.max(0, Math.round(achievementData.winRate * achievementData.nightsPlayed) - (Number(result.profitLoss) > 0 ? 1 : 0));
      const prevWinRate = prevNightsPlayed > 0 ? prevWins / prevNightsPlayed : 0;
      const prevStreak = streak.count > 1
        ? streak
        : { type: "none" as const, count: 0 };
      const prevInput = {
        ...achievementData,
        nightsPlayed: prevNightsPlayed,
        totalProfit: prevProfit,
        winRate: prevWinRate,
        streak: prevStreak,
      };

      const nowUnlocked = new Set(getUnlockedAchievements(input).map((a) => a.id));
      const wasUnlocked = new Set(getUnlockedAchievements(prevInput).map((a) => a.id));
      const allAchievements = computeAchievements(input);

      for (const achievement of allAchievements) {
        if (nowUnlocked.has(achievement.id) && !wasUnlocked.has(achievement.id)) {
          // New achievement unlocked
          const achievementNames: Record<string, string> = {
            first_blood: "First Blood", veteran: "Veteran", centurion: "Centurion",
            shark: "Shark", fish: "Fish", consistent: "Consistent",
            high_roller: "High Roller", comeback_kid: "Comeback Kid",
            hot_streak: "On Fire", ice_cold: "Ice Cold", mvp_star: "MVP",
            mvp_legend: "MVP Legend", profit_club: "Profit Club", goat: "G.O.A.T.",
            bubble_boy: "Bubble Boy", broke: "Broke", all_in: "All In",
            dominator: "Dominator", deep_pockets: "Deep Pockets", redemption: "Redemption",
          };
          const name = achievementNames[achievement.id] ?? achievement.id;

          await Promise.all([
            insertActivity({
              groupId: night.groupId,
              type: "achievement_unlocked",
              actorId: userId,
              metadata: { achievementId: achievement.id, achievementName: name, achievementIcon: achievement.icon },
            }),
            pushNotify.achievementUnlocked(userId, `${achievement.icon} ${name}`),
          ]).catch(() => {});
        }
      }

      // Rank up check
      const prevRank = getRank(prevProfit);
      const newRank = getRank(achievementData.totalProfit);
      if (newRank.id !== prevRank.id) {
        await insertActivity({
          groupId: night.groupId,
          type: "rank_up",
          actorId: userId,
          metadata: { rankId: newRank.id, rankName: newRank.id, rankIcon: newRank.icon },
        }).catch(() => {});
      }

      // Personal record check — biggest win
      const thisProfitLoss = Number(result.profitLoss);
      if (thisProfitLoss > 0 && thisProfitLoss > (prevRecords.biggestWin ?? 0) && prevNightsPlayed > 0) {
        await insertActivity({
          groupId: night.groupId,
          type: "personal_record",
          actorId: userId,
          targetId: nightId,
          metadata: {
            recordType: "biggestWin",
            value: formatCurrency(thisProfitLoss, "es-AR", "ARS"),
          },
        }).catch(() => {});
      }
    })
  );

  revalidateLocalized(`/groups/${night.groupId}/nights/${nightId}`);
  revalidateLocalized(`/groups/${night.groupId}`);
  revalidateTag(`night-${nightId}`, "max");
  revalidateTag(`group-${night.groupId}`, "max");
  results.forEach((r) => revalidateTag(`user-${r.userId}`, "max"));
  return { success: true, resultsCount: results.length };
}
