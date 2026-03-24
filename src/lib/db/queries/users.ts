import { unstable_cache } from "next/cache";
import { eq, sql, gte, and } from "drizzle-orm";
import { db } from "..";
import { userProfiles, pokerNightResults, pokerNights } from "../schema";

const CACHE_TTL = 30;

export async function getUserByAuthId(authUserId: string) {
  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.authUserId, authUserId))
    .limit(1);
  return user ?? null;
}

export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, id))
    .limit(1);
  return user ?? null;
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

export async function updateUserProfile(
  id: string,
  data: Partial<{
    displayName: string;
    avatarUrl: string;
    locale: string;
  }>
) {
  const [user] = await db
    .update(userProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(userProfiles.id, id))
    .returning();
  return user;
}
