import { unstable_cache } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { userProfiles, pokerNightResults } from "../schema";

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
