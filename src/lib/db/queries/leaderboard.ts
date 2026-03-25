import { unstable_cache } from "next/cache";
import { eq, sql, and, gte, lte, desc, inArray, asc } from "drizzle-orm";
import { db } from "..";
import { pokerNightResults, pokerNights, userProfiles } from "../schema";
import type { LeaderboardEntry, NightResult } from "@/lib/types";

const CACHE_TTL = 30;

export interface ProfitHistoryPoint {
  date: string;
  profitLoss: number;
  cumulative: number;
  userId: string;
  displayName: string;
}

export async function getGroupProfitHistory(
  groupId: string
): Promise<ProfitHistoryPoint[]> {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          date: pokerNights.date,
          userId: pokerNightResults.userId,
          displayName: userProfiles.displayName,
          profitLoss: pokerNightResults.profitLoss,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .innerJoin(userProfiles, eq(pokerNightResults.userId, userProfiles.id))
        .where(eq(pokerNights.groupId, groupId))
        .orderBy(pokerNights.date);

      const cumulativeByUser: Record<string, number> = {};
      return rows.map((r) => {
        const pl = Number(r.profitLoss);
        cumulativeByUser[r.userId] = (cumulativeByUser[r.userId] ?? 0) + pl;
        return {
          date: r.date,
          userId: r.userId,
          displayName: r.displayName,
          profitLoss: pl,
          cumulative: cumulativeByUser[r.userId],
        };
      });
    },
    [`group-profit-history-${groupId}`],
    { revalidate: CACHE_TTL, tags: [`group-${groupId}`] }
  );

  return getCached();
}

export async function getGroupStreaks(
  groupId: string
): Promise<Record<string, { type: "winning" | "losing" | "none"; count: number }>> {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          userId: pokerNightResults.userId,
          profitLoss: pokerNightResults.profitLoss,
          date: pokerNights.date,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(eq(pokerNights.groupId, groupId))
        .orderBy(asc(pokerNights.date));

      const byUser: Record<string, boolean[]> = {};
      for (const row of rows) {
        if (!byUser[row.userId]) byUser[row.userId] = [];
        byUser[row.userId].push(Number(row.profitLoss) > 0);
      }

      const result: Record<string, { type: "winning" | "losing" | "none"; count: number }> = {};
      for (const [userId, results] of Object.entries(byUser)) {
        if (results.length === 0) {
          result[userId] = { type: "none", count: 0 };
          continue;
        }
        const last = results[results.length - 1];
        let count = 0;
        for (let i = results.length - 1; i >= 0; i--) {
          if (results[i] === last) count++;
          else break;
        }
        result[userId] = { type: last ? "winning" : "losing", count };
      }
      return result;
    },
    [`group-streaks-${groupId}`],
    { revalidate: CACHE_TTL, tags: [`group-${groupId}`] }
  );

  return getCached();
}

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

export interface HeadToHeadResult {
  date: string;
  nightId: string;
  nightName: string | null;
  playerA: { profitLoss: number; rank: number } | null;
  playerB: { profitLoss: number; rank: number } | null;
}

export interface HeadToHeadStats {
  sharedNights: number;
  winsA: number;
  winsB: number;
  draws: number;
  totalA: number;
  totalB: number;
  avgA: number;
  avgB: number;
  results: HeadToHeadResult[];
}

export async function getHeadToHead(
  groupId: string,
  userIdA: string,
  userIdB: string
): Promise<HeadToHeadStats> {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          nightId: pokerNights.id,
          nightName: pokerNights.name,
          date: pokerNights.date,
          userId: pokerNightResults.userId,
          profitLoss: pokerNightResults.profitLoss,
          rank: pokerNightResults.rank,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(
          and(
            eq(pokerNights.groupId, groupId),
            inArray(pokerNightResults.userId, [userIdA, userIdB]),
          )
        )
        .orderBy(pokerNights.date);

      const nightMap = new Map<string, HeadToHeadResult>();
      for (const row of rows) {
        let entry = nightMap.get(row.nightId);
        if (!entry) {
          entry = {
            date: row.date,
            nightId: row.nightId,
            nightName: row.nightName,
            playerA: null,
            playerB: null,
          };
          nightMap.set(row.nightId, entry);
        }
        const data = { profitLoss: Number(row.profitLoss), rank: row.rank };
        if (row.userId === userIdA) entry.playerA = data;
        else entry.playerB = data;
      }

      const shared = Array.from(nightMap.values()).filter(
        (r) => r.playerA && r.playerB
      );

      let winsA = 0, winsB = 0, draws = 0, totalA = 0, totalB = 0;
      for (const r of shared) {
        totalA += r.playerA!.profitLoss;
        totalB += r.playerB!.profitLoss;
        if (r.playerA!.rank < r.playerB!.rank) winsA++;
        else if (r.playerB!.rank < r.playerA!.rank) winsB++;
        else draws++;
      }

      return {
        sharedNights: shared.length,
        winsA,
        winsB,
        draws,
        totalA,
        totalB,
        avgA: shared.length > 0 ? totalA / shared.length : 0,
        avgB: shared.length > 0 ? totalB / shared.length : 0,
        results: shared,
      };
    },
    [`h2h-${groupId}-${userIdA}-${userIdB}`],
    { revalidate: CACHE_TTL, tags: [`group-${groupId}`] }
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
          totalInvested: sql<number>`sum(${pokerNightResults.totalInvested})::numeric`,
          winCount: sql<number>`count(*) filter (where ${pokerNightResults.profitLoss} > 0)::int`,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .innerJoin(userProfiles, eq(pokerNightResults.userId, userProfiles.id))
        .where(and(...conditions))
        .groupBy(pokerNightResults.userId, userProfiles.displayName, userProfiles.avatarUrl)
        .orderBy(desc(sql`sum(${pokerNightResults.profitLoss})`));

      return rows.map((r, i) => {
        const nightsPlayed = Number(r.nightsPlayed);
        const totalInvested = Number(r.totalInvested);
        const totalProfitLoss = Number(r.totalProfitLoss);
        const winCount = Number(r.winCount);
        return {
          ...r,
          totalProfitLoss,
          biggestWin: Number(r.biggestWin),
          worstNight: Number(r.worstNight),
          avgProfitLoss: Number(r.avgProfitLoss),
          totalInvested,
          winRate: nightsPlayed > 0 ? winCount / nightsPlayed : 0,
          roi: totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0,
          rank: i + 1,
        };
      });
    },
    [`group-leaderboard-${groupId}-${dateFrom ?? "all"}-${dateTo ?? "all"}`],
    { revalidate: CACHE_TTL, tags: [`group-${groupId}`] }
  );

  return getCached();
}