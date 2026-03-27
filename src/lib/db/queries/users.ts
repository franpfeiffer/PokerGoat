import { unstable_cache } from "next/cache";
import { eq, sql, gte, and, asc, desc } from "drizzle-orm";
import { db } from "..";
import { userProfiles, pokerNightResults, pokerNights, groupMembers } from "../schema";

const CACHE_TTL = 60;

export async function getUserByAuthId(authUserId: string) {
  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.authUserId, authUserId))
    .limit(1);
  return user ?? null;
}

export async function getUserById(id: string) {
  const getCached = unstable_cache(
    async () => {
      const [user] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, id))
        .limit(1);
      return user ?? null;
    },
    [`user-profile-${id}`],
    { revalidate: CACHE_TTL, tags: [`user-${id}`] }
  );
  return getCached();
}

export async function createUserProfile(data: {
  authUserId: string;
  displayName: string;
  avatarUrl?: string;
  locale?: string;
}) {
  const [user] = await db.insert(userProfiles).values(data).returning();
  return user;
}

export async function getUserStats(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const [stats] = await db
        .select({
          nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
          totalProfit: sql<number>`coalesce(sum(${pokerNightResults.profitLoss}), 0)::numeric`,
          wins: sql<number>`count(case when ${pokerNightResults.profitLoss} > 0 then 1 end)::int`,
        })
        .from(pokerNightResults)
        .where(eq(pokerNightResults.userId, userId));

      const nightsPlayed = stats?.nightsPlayed ?? 0;
      const wins = stats?.wins ?? 0;

      return {
        nightsPlayed,
        totalProfit: Number(stats?.totalProfit ?? 0),
        winRate: nightsPlayed > 0 ? wins / nightsPlayed : 0,
      };
    },
    [`user-stats-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export async function getDashboardStats(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

      const [allTime] = await db
        .select({
          nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
          totalProfit: sql<number>`coalesce(sum(${pokerNightResults.profitLoss}), 0)::numeric`,
          wins: sql<number>`count(case when ${pokerNightResults.profitLoss} > 0 then 1 end)::int`,
        })
        .from(pokerNightResults)
        .where(eq(pokerNightResults.userId, userId));

      const [recent] = await db
        .select({
          nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
          totalProfit: sql<number>`coalesce(sum(${pokerNightResults.profitLoss}), 0)::numeric`,
          wins: sql<number>`count(case when ${pokerNightResults.profitLoss} > 0 then 1 end)::int`,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(
          and(
            eq(pokerNightResults.userId, userId),
            gte(pokerNights.date, dateStr)
          )
        );

      const nightsPlayed = allTime?.nightsPlayed ?? 0;
      const wins = allTime?.wins ?? 0;
      const recentNights = recent?.nightsPlayed ?? 0;
      const recentWins = recent?.wins ?? 0;

      return {
        allTime: {
          nightsPlayed,
          totalProfit: Number(allTime?.totalProfit ?? 0),
          winRate: nightsPlayed > 0 ? wins / nightsPlayed : 0,
        },
        last30Days: {
          nightsPlayed: recentNights,
          totalProfit: Number(recent?.totalProfit ?? 0),
          winRate: recentNights > 0 ? recentWins / recentNights : 0,
        },
      };
    },
    [`dashboard-stats-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export async function getUserStreak(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          profitLoss: pokerNightResults.profitLoss,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(eq(pokerNightResults.userId, userId))
        .orderBy(asc(pokerNights.date));

      if (rows.length === 0) return { type: "none" as const, count: 0 };

      const results = rows.map((r) => Number(r.profitLoss) > 0);
      const last = results[results.length - 1];
      let count = 0;
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i] === last) count++;
        else break;
      }

      return {
        type: last ? ("winning" as const) : ("losing" as const),
        count,
      };
    },
    [`user-streak-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export async function getUserProfitHistory(userId: string) {
  const getCached = unstable_cache(
    async () => {
      const rows = await db
        .select({
          date: pokerNights.date,
          profitLoss: pokerNightResults.profitLoss,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(eq(pokerNightResults.userId, userId))
        .orderBy(asc(pokerNights.date));

      let cumulative = 0;
      return rows.map((row) => {
        const pl = Number(row.profitLoss);
        cumulative += pl;
        return {
          date: row.date,
          profitLoss: pl,
          cumulative: Number(cumulative.toFixed(2)),
        };
      });
    },
    [`user-profit-history-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export interface GroupComparisonStats {
  groupName: string;
  groupId: string;
  userRank: number;
  totalPlayers: number;
  userWinRate: number;
  avgWinRate: number;
  userRoi: number;
  avgRoi: number;
  userAvgProfit: number;
  avgGroupProfit: number;
}

export async function getUserGroupComparison(userId: string): Promise<GroupComparisonStats | null> {
  const getCached = unstable_cache(
    async () => {
      const { groups } = await import("../schema");

      // Find the group where the user has played the most nights (single query)
      const nightsByGroup = await db
        .select({
          groupId: pokerNights.groupId,
          nightCount: sql<number>`count(${pokerNightResults.id})::int`,
        })
        .from(pokerNightResults)
        .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
        .where(eq(pokerNightResults.userId, userId))
        .groupBy(pokerNights.groupId)
        .orderBy(desc(sql`count(${pokerNightResults.id})`))
        .limit(1);

      if (nightsByGroup.length === 0) return null;

      const groupId = nightsByGroup[0].groupId;

      // Fetch group name and all player stats in parallel
      const [groupResult, rows] = await Promise.all([
        db
          .select({ name: groups.name })
          .from(groups)
          .where(eq(groups.id, groupId))
          .limit(1),
        db
          .select({
            userId: pokerNightResults.userId,
            nightsPlayed: sql<number>`count(${pokerNightResults.id})::int`,
            totalProfit: sql<number>`sum(${pokerNightResults.profitLoss})::numeric`,
            totalInvested: sql<number>`sum(${pokerNightResults.totalInvested})::numeric`,
            wins: sql<number>`count(case when ${pokerNightResults.profitLoss} > 0 then 1 end)::int`,
          })
          .from(pokerNightResults)
          .innerJoin(pokerNights, eq(pokerNightResults.nightId, pokerNights.id))
          .where(eq(pokerNights.groupId, groupId))
          .groupBy(pokerNightResults.userId)
          .orderBy(sql`sum(${pokerNightResults.profitLoss}) desc`),
      ]);

      const [group] = groupResult;
      if (!group) return null;

      if (rows.length < 2) return null;

      const playerStats = rows.map((r) => {
        const nights = Number(r.nightsPlayed);
        const profit = Number(r.totalProfit);
        const invested = Number(r.totalInvested);
        const wins = Number(r.wins);
        return {
          userId: r.userId,
          winRate: nights > 0 ? wins / nights : 0,
          roi: invested > 0 ? (profit / invested) * 100 : 0,
          avgProfit: nights > 0 ? profit / nights : 0,
        };
      });

      const userStat = playerStats.find((p) => p.userId === userId);
      if (!userStat) return null;

      const userRank = rows.findIndex((r) => r.userId === userId) + 1;
      const totalPlayers = rows.length;

      const avgWinRate = playerStats.reduce((s, p) => s + p.winRate, 0) / totalPlayers;
      const avgRoi = playerStats.reduce((s, p) => s + p.roi, 0) / totalPlayers;
      const avgGroupProfit = playerStats.reduce((s, p) => s + p.avgProfit, 0) / totalPlayers;

      return {
        groupName: group.name,
        groupId,
        userRank,
        totalPlayers,
        userWinRate: userStat.winRate,
        avgWinRate,
        userRoi: userStat.roi,
        avgRoi,
        userAvgProfit: userStat.avgProfit,
        avgGroupProfit,
      };
    },
    [`user-group-comparison-${userId}`],
    { revalidate: CACHE_TTL, tags: [`user-${userId}`] }
  );

  return getCached();
}

export async function updateUserProfile(
  id: string,
  data: Partial<{
    displayName: string;
    avatarUrl: string;
    locale: string;
    bankAlias: string | null;
  }>
) {
  const [user] = await db
    .update(userProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(userProfiles.id, id))
    .returning();
  return user;
}
