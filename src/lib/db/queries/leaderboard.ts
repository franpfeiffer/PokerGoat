import { unstable_cache } from "next/cache";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";
import { db } from "..";
import { pokerNightResults, pokerNights, userProfiles } from "../schema";
import type { LeaderboardEntry, NightResult } from "@/lib/types";

const CACHE_TTL = 30;

export async function getNightLeaderboard(nightId: string): Promise<NightResult[]> {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          userId: pokerNightResults.userId,
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          totalInvested: pokerNightResults.totalInvested,
          totalCashout: pokerNightResults.totalCashout,
          profitLoss: pokerNightResults.profitLoss,
          rank: pokerNightResults.rank,
          buyInCount: sql<number>`1`,
        })
        .from(pokerNightResults)
        .innerJoin(userProfiles, eq(pokerNightResults.userId, userProfiles.id))
        .where(eq(pokerNightResults.nightId, nightId))
        .orderBy(pokerNightResults.rank);

      return rows.map((r) => ({
        ...r,
        totalInvested: Number(r.totalInvested),
        totalCashout: Number(r.totalCashout),
        profitLoss: Number(r.profitLoss),
      }));
    },
    [`night-leaderboard-${nightId}`],
    { revalidate: CACHE_TTL, tags: [`night-${nightId}`] }
  );

  return getCached();
}

export async function getGroupLeaderboard(
  groupId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<LeaderboardEntry[]> {
  const getCached = unstable_cache(
    async () => {
      const conditions = [eq(pokerNights.groupId, groupId)];
      if (dateFrom) conditions.push(gte(pokerNights.date, dateFrom));
      if (dateTo) conditions.push(lte(pokerNights.date, dateTo));

      const rows = await db
        .select({
          userId: pokerNightResults.userId,
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
          totalProfitLoss: sql<number>`sum(${pokerNightResults.profitLoss})::numeric`,
          biggestWin: sql<number>`max(${pokerNightResults.profitLoss})::numeric`,
          worstNight: sql<number>`min(${pokerNightResults.profitLoss})::numeric`,
          avgProfitLoss: sql<number>`avg(${pokerNightResults.profitLoss})::numeric`,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .innerJoin(userProfiles, eq(pokerNightResults.userId, userProfiles.id))
        .where(and(...conditions))
        .groupBy(pokerNightResults.userId, userProfiles.displayName, userProfiles.avatarUrl)
        .orderBy(desc(sql`sum(${pokerNightResults.profitLoss})`));

      return rows.map((r, i) => ({
        ...r,
        totalProfitLoss: Number(r.totalProfitLoss),
        biggestWin: Number(r.biggestWin),
        worstNight: Number(r.worstNight),
        avgProfitLoss: Number(r.avgProfitLoss),
        rank: i + 1,
      }));
    },
    [`group-leaderboard-${groupId}-${dateFrom ?? "all"}-${dateTo ?? "all"}`],
    { revalidate: CACHE_TTL, tags: [`group-${groupId}`] }
  );

  return getCached();
}